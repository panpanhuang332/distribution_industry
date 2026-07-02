"""去重與評分的單元測試（純函數，不碰網路）。"""
import json
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scholar_radar.dedup import make_dedup_key, normalize_doi, normalize_title, title_similarity
from scholar_radar.scoring import build_matchers, score_text
from scholar_radar.crossref import clean_abstract, work_to_paper


class TestDedup(unittest.TestCase):
    def test_normalize_doi_strips_prefix_and_lowercases(self):
        self.assertEqual(normalize_doi("https://doi.org/10.1/ABC"), "10.1/abc")
        self.assertEqual(normalize_doi("10.1/AbC"), "10.1/abc")
        self.assertIsNone(normalize_doi(None))
        self.assertIsNone(normalize_doi(""))

    def test_dedup_key_prefers_doi(self):
        self.assertEqual(make_dedup_key("10.1/X", "Some Title"), "10.1/x")

    def test_dedup_key_falls_back_to_title_hash(self):
        k1 = make_dedup_key(None, "Hello World!")
        k2 = make_dedup_key(None, "hello  world")
        self.assertTrue(k1.startswith("title:"))
        self.assertEqual(k1, k2)  # 正規化後相同

    def test_title_similarity(self):
        self.assertEqual(title_similarity("A B C", "abc"), 1.0)
        self.assertGreater(title_similarity("Service Quality Model", "Service Quality Models"), 0.9)
        self.assertLess(title_similarity("Apple", "Orange"), 0.5)


class TestScoring(unittest.TestCase):
    def setUp(self):
        model_path = Path(__file__).resolve().parents[1] / "interest_model.json"
        self.model = json.loads(model_path.read_text(encoding="utf-8"))
        self.matchers = build_matchers(self.model)

    def test_title_hit_gets_multiplier(self):
        score, matched = score_text(
            "Service Quality and SERVQUAL", "", self.matchers,
            title_multiplier=self.model["title_multiplier"],
        )
        # service quality(5) + servqual(5) 都在標題 -> *1.5
        self.assertIn("service quality", matched)
        self.assertIn("servqual", matched)
        self.assertAlmostEqual(score, (5 + 5) * 1.5)

    def test_negative_keyword_lowers_score(self):
        score, matched = score_text(
            "Dynamic Pricing", "supply chain optimization and inventory optimization", self.matchers,
            title_multiplier=self.model["title_multiplier"],
        )
        self.assertLess(score, 0)

    def test_word_boundary_no_false_positive(self):
        # 'trust' 不應命中 'industrial' / 'entrust'
        score, matched = score_text("The industrial sector", "we entrusted the task", self.matchers, 1.5)
        self.assertNotIn("trust", matched)


class TestCleanAbstract(unittest.TestCase):
    def test_strips_jats_and_unescapes(self):
        raw = "<jats:p>Hello &amp; <jats:italic>world</jats:italic></jats:p>"
        self.assertEqual(clean_abstract(raw), "Hello & world")


class TestWorkToPaper(unittest.TestCase):
    def test_parses_fields(self):
        work = {
            "DOI": "10.1/x", "title": ["T"], "container-title": ["J"],
            "ISSN": ["1234-5678"],
            "author": [{"given": "A", "family": "B"}],
            "published-online": {"date-parts": [[2026, 6, 15]]},
            "indexed": {"date-parts": [[2026, 6, 16]]},
            "abstract": "<jats:p>x</jats:p>", "type": "journal-article",
        }
        p = work_to_paper(work)
        self.assertEqual(p.doi, "10.1/x")
        self.assertEqual(p.authors, ["A B"])
        self.assertEqual(p.published_date, "2026-06-15")
        self.assertEqual(p.index_date, "2026-06-16")


if __name__ == "__main__":
    unittest.main()
