"""資料模型：Paper（正規化後的一篇論文）。"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Optional


@dataclass
class Paper:
    """單一 Crossref work 正規化後的表示。

    dedup_key 是去重主鍵：有 DOI 用正規化 DOI，否則退回正規化標題 hash。
    """

    dedup_key: str
    doi: Optional[str]
    title: str
    authors: list[str] = field(default_factory=list)
    journal: str = ""
    issn: str = ""
    published_date: Optional[str] = None  # ISO 日期字串 YYYY-MM-DD（best effort）
    index_date: Optional[str] = None
    abstract: str = ""
    url: str = ""
    subjects: list[str] = field(default_factory=list)
    type: str = ""
    source: str = "crossref"

    # 評分階段填入
    score: float = 0.0
    matched_keywords: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
