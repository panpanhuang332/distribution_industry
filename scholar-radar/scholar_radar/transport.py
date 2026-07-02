"""HTTP 傳輸抽象層。

把「發出 GET 請求拿到 JSON」這件事抽象成 Transport 介面，好處：
  1. 真實抓取用 HttpTransport（polite pool + 指數退避）。
  2. 離線測試用 FixtureTransport，把 ISSN 對應到本地 fixture JSON。
Crossref 的解析邏輯（crossref.py）只依賴這個介面，因此測試時完全不碰網路。
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Optional, Protocol

from .logging_util import get_logger

logger = get_logger("scholar_radar.transport")


class TransportError(RuntimeError):
    """所有重試都失敗後拋出。"""


class Transport(Protocol):
    def get_json(self, url: str, params: dict[str, Any]) -> dict[str, Any]:
        ...


class HttpTransport:
    """真實 HTTP 傳輸：帶 mailto polite pool、指數退避、尊重 429/503。"""

    def __init__(
        self,
        contact_email: str = "",
        max_retries: int = 5,
        backoff_base_seconds: float = 2.0,
        timeout_seconds: float = 30.0,
        sleep_fn=time.sleep,
    ):
        # requests 延後 import，讓不需要真實抓取的測試不必安裝它。
        import requests  # noqa: WPS433

        self._session = requests.Session()
        ua = "scholar-radar/0.1 (https://github.com/panpanhuang332/distribution_industry"
        if contact_email:
            ua += f"; mailto:{contact_email}"
        ua += ")"
        self._session.headers.update({"User-Agent": ua})
        self.contact_email = contact_email
        self.max_retries = max_retries
        self.backoff_base_seconds = backoff_base_seconds
        self.timeout_seconds = timeout_seconds
        self._sleep = sleep_fn

    def get_json(self, url: str, params: dict[str, Any]) -> dict[str, Any]:
        import requests  # noqa: WPS433

        params = dict(params)
        if self.contact_email and "mailto" not in params:
            params["mailto"] = self.contact_email

        last_err: Optional[Exception] = None
        for attempt in range(1, self.max_retries + 1):
            try:
                resp = self._session.get(url, params=params, timeout=self.timeout_seconds)
                if resp.status_code == 200:
                    return resp.json()
                # 429 / 5xx：可重試
                if resp.status_code in (429, 500, 502, 503, 504):
                    retry_after = _parse_retry_after(resp.headers.get("Retry-After"))
                    wait = retry_after if retry_after is not None else self._backoff(attempt)
                    logger.warning(
                        "GET %s -> %s（第 %d/%d 次），%.1fs 後重試",
                        url, resp.status_code, attempt, self.max_retries, wait,
                    )
                    self._sleep(wait)
                    last_err = TransportError(f"HTTP {resp.status_code}")
                    continue
                # 其他 4xx：不重試，直接失敗
                raise TransportError(f"HTTP {resp.status_code} for {url}: {resp.text[:200]}")
            except (requests.ConnectionError, requests.Timeout) as exc:
                wait = self._backoff(attempt)
                logger.warning(
                    "連線錯誤 %s（第 %d/%d 次），%.1fs 後重試：%s",
                    url, attempt, self.max_retries, wait, exc,
                )
                self._sleep(wait)
                last_err = exc
                continue

        raise TransportError(f"{url} 重試 {self.max_retries} 次仍失敗") from last_err

    def _backoff(self, attempt: int) -> float:
        return self.backoff_base_seconds * (2 ** (attempt - 1))


class FixtureTransport:
    """離線傳輸：把 ISSN 對應到本地 fixture 檔。

    fixture 目錄下檔名格式：crossref_{issn}.json，內容為完整的 Crossref 回應。
    若請求帶 cursor 分頁，這裡只回傳單頁 fixture（測試不需要多頁）。
    找不到對應 fixture 時回傳空的 work-list，模擬「該期刊近期無新文」。
    """

    def __init__(self, fixture_dir: str | Path):
        self.fixture_dir = Path(fixture_dir)

    def get_json(self, url: str, params: dict[str, Any]) -> dict[str, Any]:
        issn = _extract_issn(url)
        if issn:
            fixture = self.fixture_dir / f"crossref_{issn}.json"
            if fixture.exists():
                logger.debug("FixtureTransport 讀取 %s", fixture)
                with open(fixture, "r", encoding="utf-8") as f:
                    return json.load(f)
        logger.debug("FixtureTransport 無對應 fixture（issn=%s），回傳空清單", issn)
        return {"status": "ok", "message-type": "work-list", "message": {"items": []}}


def _extract_issn(url: str) -> Optional[str]:
    # .../journals/{issn}/works
    parts = url.rstrip("/").split("/")
    if "journals" in parts:
        idx = parts.index("journals")
        if idx + 1 < len(parts):
            return parts[idx + 1]
    return None


def _parse_retry_after(value: Optional[str]) -> Optional[float]:
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None
