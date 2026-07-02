"""興趣評分：純函數，方便測試與回饋層重跑不漂移。

規則（先求有）：
  - 對每個關鍵字，若出現在標題 -> 權重 * title_multiplier；
    否則若出現在摘要或 subject -> 權重 * 1。
  - 每個關鍵字最多計一次（presence-based，不因出現多次而累加）。
  - score = 命中權重總和（含負權重）。matched_keywords 記錄命中詞供透明化。
比對採「詞邊界」的子字串比對（避免 'trust' 命中 'industrial'）。
"""
from __future__ import annotations

import re
from typing import Any

from .models import Paper


def _compile_keyword(kw: str) -> re.Pattern:
    # 詞邊界比對；關鍵字含空白/連字號時照原樣（跨空白）比對。
    escaped = re.escape(kw.lower())
    return re.compile(rf"(?<![a-z0-9]){escaped}(?![a-z0-9])", re.IGNORECASE)


def build_matchers(interest_model: dict[str, Any]) -> list[tuple[str, float, re.Pattern]]:
    keywords: dict[str, float] = interest_model.get("keywords", {})
    return [(kw, float(w), _compile_keyword(kw)) for kw, w in keywords.items()]


def score_text(
    title: str,
    body: str,
    matchers: list[tuple[str, float, re.Pattern]],
    title_multiplier: float = 1.5,
) -> tuple[float, list[str]]:
    title_l = (title or "").lower()
    body_l = (body or "").lower()
    total = 0.0
    matched: list[str] = []
    for kw, weight, pattern in matchers:
        if pattern.search(title_l):
            total += weight * title_multiplier
            matched.append(kw)
        elif pattern.search(body_l):
            total += weight
            matched.append(kw)
    return round(total, 3), matched


def score_paper(paper: Paper, interest_model: dict[str, Any], matchers=None) -> Paper:
    if matchers is None:
        matchers = build_matchers(interest_model)
    title_mult = float(interest_model.get("title_multiplier", 1.5))
    body = " ".join([paper.abstract or "", " ".join(paper.subjects or [])])
    score, matched = score_text(paper.title, body, matchers, title_mult)
    paper.score = score
    paper.matched_keywords = matched
    return paper


def score_papers(papers: list[Paper], interest_model: dict[str, Any]) -> list[Paper]:
    matchers = build_matchers(interest_model)
    for paper in papers:
        score_paper(paper, interest_model, matchers)
    return papers
