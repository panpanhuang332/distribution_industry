#!/usr/bin/env python3
"""fetch_and_score.py — scholar-radar Phase 1 進入點。

抓取目標期刊近期新文（Crossref）→ SQLite 去重 → 興趣模型評分 → 產出 papers.json。

範例：
  # 真實抓取（需要外網），跑全部期刊
  python fetch_and_score.py --config config.yaml

  # 只跑前 3 本期刊、dry-run（不寫檔）
  python fetch_and_score.py --config config.yaml --journals 3 --dry-run -v

  # 離線：用 fixtures 目錄當資料來源（無需外網，供驗收/測試）
  python fetch_and_score.py --config config.yaml --fixtures tests/fixtures
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# 讓腳本從專案根目錄直接執行時能 import scholar_radar 套件
sys.path.insert(0, str(Path(__file__).resolve().parent))

from scholar_radar.config import load_config
from scholar_radar.logging_util import get_logger
from scholar_radar.pipeline import run_fetch_and_score
from scholar_radar.transport import FixtureTransport, HttpTransport


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="scholar-radar：抓取期刊新文並評分")
    p.add_argument("--config", default=str(Path(__file__).parent / "config.yaml"), help="config.yaml 路徑")
    p.add_argument("--journals", type=int, default=None, help="只跑前 N 本期刊（驗收/測試）")
    p.add_argument("--issn", action="append", default=None, help="只跑指定 ISSN（可重複），優先於 --journals")
    p.add_argument("--fixtures", default=None, help="離線模式：fixture 目錄（改用 FixtureTransport）")
    p.add_argument("--dry-run", action="store_true", help="不寫 SQLite / papers.json，只回報摘要")
    p.add_argument("-v", "--verbose", action="store_true", help="verbose logging")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logger = get_logger("scholar_radar", verbose=args.verbose)

    config = load_config(args.config)

    if args.fixtures:
        transport = FixtureTransport(args.fixtures)
        logger.info("離線模式：使用 fixtures 目錄 %s", args.fixtures)
    else:
        cr = config.crossref
        transport = HttpTransport(
            contact_email=config.contact_email,
            max_retries=int(cr.get("max_retries", 5)),
            backoff_base_seconds=float(cr.get("backoff_base_seconds", 2.0)),
            timeout_seconds=float(cr.get("request_timeout_seconds", 30)),
        )

    summary = run_fetch_and_score(
        config=config,
        transport=transport,
        journals_limit=args.journals,
        issns=args.issn,
        dry_run=args.dry_run,
    )

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
