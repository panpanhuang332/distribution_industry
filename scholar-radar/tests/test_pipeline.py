"""端到端流程測試（用 FixtureTransport，完全離線）。"""
import json
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scholar_radar.config import load_config
from scholar_radar.pipeline import run_fetch_and_score
from scholar_radar.store import PaperStore
from scholar_radar.transport import FixtureTransport
from scholar_radar.models import Paper

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures"
# 固定「今天」讓視窗涵蓋 fixture 中的 2026-06 論文
FIXED_TODAY = date(2026, 7, 2)
FIXTURE_ISSNS = ["1094-6705", "0022-2429", "0148-2963"]  # JSR, JM, JBR


class TestPipeline(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        # 複製 config 但把 sqlite / papers.json 指到暫存目錄
        self.config = load_config(ROOT / "config.yaml")
        self.config._data["storage"]["sqlite_path"] = str(Path(self.tmp.name) / "t.db")
        self.config._data["storage"]["papers_json_path"] = str(Path(self.tmp.name) / "papers.json")
        self.transport = FixtureTransport(FIXTURES)

    def tearDown(self):
        self.tmp.cleanup()

    def test_three_journals_offline(self):
        summary = run_fetch_and_score(
            self.config, self.transport, issns=FIXTURE_ISSNS, today=FIXED_TODAY,
        )
        # 3 本期刊；book-review 被過濾；DOI 大小寫重複被去重
        self.assertEqual(summary["journals_scanned"], 3)
        # fetched 計數包含被過濾前？fetch_journal_papers 已過濾 type，故不含 book-review
        # JSR: 2 (排除 book-review) ; JM: 2 ; JBR: 3
        self.assertEqual(summary["total_fetched"], 2 + 2 + 3)
        # 去重後新增：JSR 2 + JM 2 + JBR 3 - 1(dup) = 6
        self.assertEqual(summary["new_this_run"], 6)

        payload = json.loads(Path(self.config.papers_json_path).read_text(encoding="utf-8"))
        papers = payload["papers"]
        self.assertEqual(len(papers), 6)
        # 依分數由高到低排序
        scores = [p["score"] for p in papers]
        self.assertEqual(scores, sorted(scores, reverse=True))
        # 最高分應是命中多個高權重關鍵字的文章（service quality / fake reviews / scale development）
        self.assertGreater(papers[0]["score"], 5)
        # 財務工程那篇應為最低（負分或 0）
        self.assertLessEqual(papers[-1]["score"], 0)

    def test_idempotent_second_run_adds_nothing(self):
        run_fetch_and_score(self.config, self.transport, issns=FIXTURE_ISSNS, today=FIXED_TODAY)
        summary2 = run_fetch_and_score(self.config, self.transport, issns=FIXTURE_ISSNS, today=FIXED_TODAY)
        self.assertEqual(summary2["new_this_run"], 0)

    def test_dry_run_writes_nothing(self):
        summary = run_fetch_and_score(
            self.config, self.transport, issns=FIXTURE_ISSNS, dry_run=True, today=FIXED_TODAY,
        )
        self.assertGreater(summary["new_this_run"], 0)
        self.assertFalse(Path(self.config.papers_json_path).exists())


class TestStoreFuzzyDedup(unittest.TestCase):
    def test_fuzzy_title_dedup_without_doi(self):
        tmp = tempfile.TemporaryDirectory()
        try:
            store = PaperStore(Path(tmp.name) / "s.db", title_dedup_threshold=0.92)
            p1 = Paper(dedup_key="title:aaa", doi=None, title="Service Quality in Retail", issn="X")
            p2 = Paper(dedup_key="title:bbb", doi=None, title="Service Quality in Retail.", issn="X")
            new1 = store.upsert_new([p1], now_iso="2026-07-02T00:00:00Z")
            new2 = store.upsert_new([p2], now_iso="2026-07-02T00:00:00Z")
            self.assertEqual(len(new1), 1)
            self.assertEqual(len(new2), 0)  # 標題幾乎相同 -> 視為重複
            store.close()
        finally:
            tmp.cleanup()


if __name__ == "__main__":
    unittest.main()
