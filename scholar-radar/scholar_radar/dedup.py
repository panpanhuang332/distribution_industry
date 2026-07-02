"""去重相關的純函數：DOI/標題正規化與模糊比對。"""
from __future__ import annotations

import hashlib
import re
from difflib import SequenceMatcher
from typing import Optional

_DOI_PREFIX_RE = re.compile(r"^(https?://)?(dx\.)?doi\.org/", re.IGNORECASE)
_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")


def normalize_doi(doi: Optional[str]) -> Optional[str]:
    """去掉 doi.org 前綴、轉小寫。無 DOI 回傳 None。"""
    if not doi:
        return None
    d = doi.strip()
    d = _DOI_PREFIX_RE.sub("", d)
    d = d.strip().lower()
    return d or None


def normalize_title(title: str) -> str:
    """轉小寫、只留英數字（去標點/空白），供標題比對用。"""
    if not title:
        return ""
    return _NON_ALNUM_RE.sub("", title.lower())


def make_dedup_key(doi: Optional[str], title: str) -> str:
    """去重主鍵：有 DOI 用正規化 DOI；否則用標題 hash。

    標題 hash 加 'title:' 前綴，避免與 DOI 撞鍵。
    """
    ndoi = normalize_doi(doi)
    if ndoi:
        return ndoi
    ntitle = normalize_title(title)
    digest = hashlib.sha1(ntitle.encode("utf-8")).hexdigest()[:16]
    return f"title:{digest}"


def title_similarity(a: str, b: str) -> float:
    """兩標題正規化後的相似度（0~1）。"""
    na, nb = normalize_title(a), normalize_title(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 1.0
    return SequenceMatcher(None, na, nb).ratio()
