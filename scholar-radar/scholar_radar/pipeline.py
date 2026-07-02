"""抓取 -> 去重 -> 評分 -> 輸出 papers.json 的協調層。"""
from __future__ import annotations

import json
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from .config import Config
from .crossref import CrossrefClient, default_from_date
from .logging_util import get_logger
from .models import Paper
from .scoring import score_papers
from .store import PaperStore
from .transport import Transport

logger = get_logger("scholar_radar.pipeline")


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _drop_stale(papers: list[Paper], cutoff: Optional[date]) -> tuple[list[Paper], int]:
    """丟棄 published date 早於 cutoff 的項目（防出版社批次更新舊 metadata）。

    published_date 為 None 者保留（無法判斷，且通常 index_date 為近期）。
    回傳 (保留清單, 丟棄數)。
    """
    if cutoff is None:
        return papers, 0
    kept: list[Paper] = []
    dropped = 0
    for p in papers:
        if p.published_date:
            try:
                pub = date.fromisoformat(p.published_date)
            except ValueError:
                kept.append(p)
                continue
            if pub < cutoff:
                dropped += 1
                continue
        kept.append(p)
    return kept, dropped


def run_fetch_and_score(
    config: Config,
    transport: Transport,
    journals_limit: Optional[int] = None,
    issns: Optional[list[str]] = None,
    dry_run: bool = False,
    today: Optional[date] = None,
) -> dict:
    """執行完整流程，回傳統計摘要。

    journals_limit：只跑前 N 本期刊（驗收/測試方便）。
    issns：只跑指定 ISSN 的期刊（優先於 journals_limit）。
    dry_run：不寫入 SQLite、不寫 papers.json，只回報會發生什麼。
    """
    cr = config.crossref
    window_days = int(cr.get("window_days", 30))
    filter_field = cr.get("filter_field", "from-index-date")
    from_date = default_from_date(window_days, today=today)

    # 防噪音 cutoff：published date 早於此日期者丟棄
    max_age_days = int(cr.get("max_published_age_days", 730))
    cutoff: Optional[date] = None
    if max_age_days > 0:
        cutoff = (today or date.today()) - timedelta(days=max_age_days)

    client = CrossrefClient(
        transport=transport,
        rows_per_page=int(cr.get("rows_per_page", 100)),
        allowed_types=cr.get("allowed_types"),
    )

    interest_model = config.load_interest_model()
    journals = config.journals
    if issns:
        wanted = {s.strip() for s in issns}
        journals = [j for j in journals if j.issn in wanted]
    elif journals_limit:
        journals = journals[:journals_limit]

    logger.info(
        "抓取視窗：%s 起（%d 天，filter=%s），期刊 %d 本，dry_run=%s",
        from_date, window_days, filter_field, len(journals), dry_run,
    )

    store = PaperStore(config.sqlite_path, title_dedup_threshold=config.title_dedup_threshold)
    now_iso = _now_iso()
    total_fetched = 0
    total_dropped_stale = 0
    all_new: list[Paper] = []
    per_journal: list[dict] = []

    try:
        for j in journals:
            fetched = client.fetch_journal_papers(
                issn=j.issn, journal_name=j.name, from_date=from_date, filter_field=filter_field,
            )
            fetched, dropped = _drop_stale(fetched, cutoff)
            total_fetched += len(fetched)
            total_dropped_stale += dropped
            with_abstract = sum(1 for p in fetched if p.abstract.strip())
            new_papers = store.upsert_new(fetched, now_iso=now_iso, dry_run=dry_run)
            coverage = round(with_abstract / len(fetched), 3) if fetched else 0.0
            logger.info(
                "%s (%s)：抓到 %d 筆（丟棄過舊 %d），新增 %d 筆，摘要覆蓋率 %.0f%%",
                j.name, j.issn, len(fetched), dropped, len(new_papers), coverage * 100,
            )
            per_journal.append({
                "issn": j.issn,
                "name": j.name,
                "fetched": len(fetched),
                "dropped_stale": dropped,
                "new": len(new_papers),
                "with_abstract": with_abstract,
                "abstract_coverage": coverage,
            })
            all_new.extend(new_papers)

        # 評分（對本次新文評分；並寫回 DB 分數）
        score_papers(all_new, interest_model)
        if not dry_run and all_new:
            store.update_scores(all_new)

        # 輸出 papers.json：整庫（含歷史）依分數排序，限定在視窗發表日期內
        papers_out = store.all_papers(since_date=from_date)
        summary = {
            "generated_at": now_iso,
            "from_date": from_date,
            "window_days": window_days,
            "filter_field": filter_field,
            "journals_scanned": len(journals),
            "total_fetched": total_fetched,
            "total_dropped_stale": total_dropped_stale,
            "new_this_run": len(all_new),
            "papers_in_window": len(papers_out),
            "abstract_coverage_overall": round(
                sum(1 for p in papers_out if p.get("has_abstract")) / len(papers_out), 3
            ) if papers_out else 0.0,
            "per_journal": per_journal,
        }

        if not dry_run:
            _write_papers_json(config.papers_json_path, summary, papers_out)
            logger.info("已寫出 %s（%d 篇）", config.papers_json_path, len(papers_out))
        else:
            logger.info("[dry-run] 不寫檔。摘要：%s", json.dumps(summary, ensure_ascii=False))

        summary["top_preview"] = [
            {"score": p["score"], "title": p["title"], "journal": p["journal"]}
            for p in papers_out[:10]
        ]
        return summary
    finally:
        store.close()


def _write_papers_json(path: Path, summary: dict, papers: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"summary": summary, "papers": papers}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
