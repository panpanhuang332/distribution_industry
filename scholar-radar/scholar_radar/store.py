"""SQLite 儲存與去重。

去重策略（兩層）：
  1. 主鍵：dedup_key（正規化 DOI，或無 DOI 時的標題 hash）。UNIQUE 約束擋掉完全重複。
  2. 輔助：同期刊內，用 difflib 標題相似度比對近期既有標題，>= 門檻視為同一篇
     （擋掉 DOI 前後不一致 / preprint 與正式版標題幾乎相同的情況）。

只有「新的」paper 會被 upsert 並回傳，供下游評分與推播判斷是否為新文。
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Iterable, Optional

from .dedup import title_similarity
from .logging_util import get_logger
from .models import Paper

logger = get_logger("scholar_radar.store")

SCHEMA = """
CREATE TABLE IF NOT EXISTS papers (
    dedup_key      TEXT PRIMARY KEY,
    doi            TEXT,
    title          TEXT NOT NULL,
    norm_title     TEXT NOT NULL,
    authors        TEXT,          -- JSON array
    journal        TEXT,
    issn           TEXT,
    published_date TEXT,
    index_date     TEXT,
    abstract       TEXT,
    url            TEXT,
    subjects       TEXT,          -- JSON array
    type           TEXT,
    source         TEXT,
    score          REAL DEFAULT 0,
    matched_keywords TEXT,        -- JSON array
    first_seen     TEXT,          -- ISO datetime，第一次抓到的時間
    UNIQUE(dedup_key)
);
CREATE INDEX IF NOT EXISTS idx_papers_issn ON papers(issn);
CREATE INDEX IF NOT EXISTS idx_papers_score ON papers(score);
"""


class PaperStore:
    def __init__(self, db_path: str | Path, title_dedup_threshold: float = 0.92):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.title_dedup_threshold = title_dedup_threshold
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    def close(self) -> None:
        self.conn.close()

    def __enter__(self) -> "PaperStore":
        return self

    def __exit__(self, *exc) -> None:
        self.close()

    # ------------------------------------------------------------------
    def exists(self, paper: Paper) -> bool:
        """該 paper 是否已存在（先查主鍵，再做同期刊標題模糊比對）。"""
        cur = self.conn.execute(
            "SELECT 1 FROM papers WHERE dedup_key = ? LIMIT 1", (paper.dedup_key,)
        )
        if cur.fetchone() is not None:
            return True
        return self._fuzzy_title_hit(paper)

    def _fuzzy_title_hit(self, paper: Paper) -> bool:
        # 只在同期刊範圍內比對，降低誤判與計算量。
        rows = self.conn.execute(
            "SELECT title FROM papers WHERE issn = ?", (paper.issn,)
        ).fetchall()
        for row in rows:
            if title_similarity(paper.title, row["title"]) >= self.title_dedup_threshold:
                logger.debug("標題模糊比對命中既有文章：%r", paper.title)
                return True
        return False

    def upsert_new(self, papers: Iterable[Paper], now_iso: str, dry_run: bool = False) -> list[Paper]:
        """寫入尚未存在的 paper，回傳實際新增的清單。

        同一批內若有互相重複（同 dedup_key 或標題極相似），只保留第一筆。
        dry_run 時只做判斷、不寫入。
        """
        new_papers: list[Paper] = []
        seen_keys: set[str] = set()
        seen_titles: list[tuple[str, str]] = []  # (issn, title)

        for paper in papers:
            if paper.dedup_key in seen_keys:
                continue
            if self._batch_title_dup(paper, seen_titles):
                continue
            if self.exists(paper):
                continue
            new_papers.append(paper)
            seen_keys.add(paper.dedup_key)
            seen_titles.append((paper.issn, paper.title))

        if not dry_run:
            for paper in new_papers:
                self._insert(paper, now_iso)
            self.conn.commit()

        return new_papers

    def _batch_title_dup(self, paper: Paper, seen_titles: list[tuple[str, str]]) -> bool:
        for issn, title in seen_titles:
            if issn == paper.issn and title_similarity(paper.title, title) >= self.title_dedup_threshold:
                return True
        return False

    def _insert(self, paper: Paper, now_iso: str) -> None:
        from .dedup import normalize_title

        self.conn.execute(
            """
            INSERT OR IGNORE INTO papers
                (dedup_key, doi, title, norm_title, authors, journal, issn,
                 published_date, index_date, abstract, url, subjects, type, source,
                 score, matched_keywords, first_seen)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                paper.dedup_key,
                paper.doi,
                paper.title,
                normalize_title(paper.title),
                json.dumps(paper.authors, ensure_ascii=False),
                paper.journal,
                paper.issn,
                paper.published_date,
                paper.index_date,
                paper.abstract,
                paper.url,
                json.dumps(paper.subjects, ensure_ascii=False),
                paper.type,
                paper.source,
                paper.score,
                json.dumps(paper.matched_keywords, ensure_ascii=False),
                now_iso,
            ),
        )

    def update_scores(self, papers: Iterable[Paper]) -> None:
        for paper in papers:
            self.conn.execute(
                "UPDATE papers SET score = ?, matched_keywords = ? WHERE dedup_key = ?",
                (
                    paper.score,
                    json.dumps(paper.matched_keywords, ensure_ascii=False),
                    paper.dedup_key,
                ),
            )
        self.conn.commit()

    def all_papers(self, since_date: Optional[str] = None) -> list[dict]:
        """回傳所有（或某發表日期之後）論文的 dict，供輸出 papers.json。"""
        if since_date:
            rows = self.conn.execute(
                "SELECT * FROM papers WHERE COALESCE(published_date, index_date, '') >= ? "
                "ORDER BY score DESC, published_date DESC",
                (since_date,),
            ).fetchall()
        else:
            rows = self.conn.execute(
                "SELECT * FROM papers ORDER BY score DESC, published_date DESC"
            ).fetchall()
        return [self._row_to_dict(r) for r in rows]

    @staticmethod
    def _row_to_dict(row: sqlite3.Row) -> dict:
        d = dict(row)
        for key in ("authors", "subjects", "matched_keywords"):
            try:
                d[key] = json.loads(d.get(key) or "[]")
            except (json.JSONDecodeError, TypeError):
                d[key] = []
        d.pop("norm_title", None)
        # 衍生欄位：摘要覆蓋率追蹤（Elsevier 期刊在 Crossref 常無摘要）。
        # first_seen 已是 papers 表欄位，直接隨 SELECT * 帶出，供 Phase 3 推播去重。
        d["has_abstract"] = bool((d.get("abstract") or "").strip())
        return d
