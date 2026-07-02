"""統一的 logging 設定。所有模組共用，方便一致的輸出格式。"""
from __future__ import annotations

import logging
import sys


def get_logger(name: str, verbose: bool = False) -> logging.Logger:
    """取得已設定好 handler 的 logger（重複呼叫不會重複掛 handler）。"""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stderr)
        handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        logger.addHandler(handler)
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)
    return logger
