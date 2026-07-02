"""Crossref REST API 客戶端與 work -> Paper 正規化。

端點：GET https://api.crossref.org/journals/{issn}/works
分頁：deep paging 用 cursor=*（回應的 message.next-cursor 帶下一頁）。
過濾：filter=<filter_field>:<YYYY-MM-DD>，例如 from-index-date:2026-06-01。
"""
from __future__ import annotations

import html
import re
from datetime import date, timedelta
from typing import Any, Iterator, Optional

from .logging_util import get_logger
from .models import Paper
from .transport import Transport
from .dedup import make_dedup_key

logger = get_logger("scholar_radar.crossref")

CROSSREF_BASE = "https://api.crossref.org"

# 只挑我們需要的欄位，減少傳輸量（Crossref select 參數）。
SELECT_FIELDS = ",".join([
    "DOI", "title", "author", "container-title", "ISSN", "type",
    "created", "indexed", "published-online", "published-print", "issued",
    "abstract", "URL", "subject",
])


class CrossrefClient:
    def __init__(
        self,
        transport: Transport,
        rows_per_page: int = 100,
        allowed_types: Optional[list[str]] = None,
    ):
        self.transport = transport
        self.rows_per_page = rows_per_page
        self.allowed_types = set(allowed_types) if allowed_types else None

    def iter_works(
        self,
        issn: str,
        from_date: str,
        filter_field: str = "from-index-date",
        max_pages: int = 50,
    ) -> Iterator[dict[str, Any]]:
        """以 cursor 分頁走訪某期刊某日期後的所有 works（原始 dict）。"""
        url = f"{CROSSREF_BASE}/journals/{issn}/works"
        cursor = "*"
        pages = 0
        while pages < max_pages:
            params = {
                "filter": f"{filter_field}:{from_date}",
                "rows": self.rows_per_page,
                "select": SELECT_FIELDS,
                "cursor": cursor,
            }
            payload = self.transport.get_json(url, params)
            message = payload.get("message", {})
            items = message.get("items", []) or []
            logger.debug("issn=%s 取得 %d 筆（page %d）", issn, len(items), pages + 1)
            for item in items:
                yield item
            next_cursor = message.get("next-cursor")
            # 沒有下一頁 cursor、或本頁已空 -> 結束
            if not next_cursor or not items:
                break
            cursor = next_cursor
            pages += 1

    def fetch_journal_papers(
        self,
        issn: str,
        journal_name: str,
        from_date: str,
        filter_field: str = "from-index-date",
    ) -> list[Paper]:
        papers: list[Paper] = []
        for work in self.iter_works(issn, from_date, filter_field):
            wtype = work.get("type", "")
            if self.allowed_types is not None and wtype not in self.allowed_types:
                continue
            papers.append(work_to_paper(work, fallback_journal=journal_name, fallback_issn=issn))
        return papers


# --------------------------------------------------------------------------
# 正規化輔助
# --------------------------------------------------------------------------

def work_to_paper(work: dict[str, Any], fallback_journal: str = "", fallback_issn: str = "") -> Paper:
    doi = (work.get("DOI") or "").strip() or None
    title = _first(work.get("title")) or "(無標題)"
    journal = _first(work.get("container-title")) or fallback_journal
    issn = _first(work.get("ISSN")) or fallback_issn
    authors = _parse_authors(work.get("author", []))
    abstract = clean_abstract(work.get("abstract", ""))
    subjects = list(work.get("subject", []) or [])
    url = (work.get("URL") or "").strip()
    if not url and doi:
        url = f"https://doi.org/{doi}"

    published = _best_date(work, ["published-online", "published-print", "issued", "created"])
    indexed = _date_from_parts(work.get("indexed")) or _date_from_parts(work.get("created"))

    return Paper(
        dedup_key=make_dedup_key(doi, title),
        doi=doi,
        title=title,
        authors=authors,
        journal=journal,
        issn=issn,
        published_date=published,
        index_date=indexed,
        abstract=abstract,
        url=url,
        subjects=subjects,
        type=work.get("type", ""),
        source="crossref",
    )


def _first(value: Any) -> str:
    if isinstance(value, list):
        return str(value[0]).strip() if value else ""
    if value is None:
        return ""
    return str(value).strip()


def _parse_authors(authors: list[dict[str, Any]]) -> list[str]:
    names: list[str] = []
    for a in authors or []:
        given = (a.get("given") or "").strip()
        family = (a.get("family") or "").strip()
        if family and given:
            names.append(f"{given} {family}")
        elif family:
            names.append(family)
        elif a.get("name"):
            names.append(str(a["name"]).strip())
    return names


def _date_from_parts(node: Optional[dict[str, Any]]) -> Optional[str]:
    """Crossref 的 date-parts -> ISO 字串。缺日/月時補 1。"""
    if not node:
        return None
    parts = node.get("date-parts") or []
    if not parts or not parts[0]:
        return None
    ymd = parts[0]
    year = ymd[0] if len(ymd) >= 1 else None
    if not year:
        return None
    month = ymd[1] if len(ymd) >= 2 else 1
    day = ymd[2] if len(ymd) >= 3 else 1
    try:
        return date(int(year), int(month), int(day)).isoformat()
    except (ValueError, TypeError):
        return None


def _best_date(work: dict[str, Any], keys: list[str]) -> Optional[str]:
    for key in keys:
        d = _date_from_parts(work.get(key))
        if d:
            return d
    return None


_JATS_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


def clean_abstract(raw: str) -> str:
    """去掉 Crossref 摘要常見的 JATS XML 標籤，壓平空白。"""
    if not raw:
        return ""
    text = _JATS_TAG_RE.sub(" ", raw)
    text = html.unescape(text)
    text = _WS_RE.sub(" ", text).strip()
    return text


def default_from_date(window_days: int, today: Optional[date] = None) -> str:
    today = today or date.today()
    return (today - timedelta(days=window_days)).isoformat()
