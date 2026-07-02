"""載入與存取 config.yaml。"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


@dataclass
class Journal:
    issn: str
    name: str


class Config:
    """薄封裝：讀 config.yaml，並提供解析好的路徑與欄位。

    所有相對路徑都相對於 config.yaml 所在目錄解析，讓腳本從任何 cwd 執行都正確。
    """

    def __init__(self, data: dict[str, Any], base_dir: Path):
        self._data = data
        self.base_dir = base_dir

    # --- 基本欄位 ---
    @property
    def contact_email(self) -> str:
        return self._data.get("contact_email", "").strip()

    @property
    def crossref(self) -> dict[str, Any]:
        return self._data.get("crossref", {})

    @property
    def journals(self) -> list[Journal]:
        return [
            Journal(issn=str(j["issn"]).strip(), name=str(j.get("name", "")).strip())
            for j in self._data.get("journals", [])
        ]

    @property
    def title_dedup_threshold(self) -> float:
        return float(self._data.get("storage", {}).get("title_dedup_threshold", 0.92))

    # --- 解析後的絕對路徑 ---
    def _resolve(self, rel: str) -> Path:
        p = Path(rel)
        return p if p.is_absolute() else (self.base_dir / p)

    @property
    def sqlite_path(self) -> Path:
        return self._resolve(self._data.get("storage", {}).get("sqlite_path", "data/scholar_radar.db"))

    @property
    def papers_json_path(self) -> Path:
        return self._resolve(self._data.get("storage", {}).get("papers_json_path", "data/papers.json"))

    @property
    def interest_model_path(self) -> Path:
        return self._resolve(self._data.get("interest_model_path", "interest_model.json"))

    def load_interest_model(self) -> dict[str, Any]:
        with open(self.interest_model_path, "r", encoding="utf-8") as f:
            return json.load(f)


def load_config(path: str | Path) -> Config:
    path = Path(path).resolve()
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return Config(data=data or {}, base_dir=path.parent)
