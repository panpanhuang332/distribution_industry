# scholar-radar 📡

個人化的**管理學/商學期刊文獻追蹤雷達**。自動抓取目標期刊新文 → 依研究興趣模型評分排序
→（後續階段）產出手機可瀏覽的私密網頁 → 勾選結果回流下游筆記系統。單人維護、零/低成本。

> 目前狀態：**Phase 1（MVP）完成，待驗收**。後續階段見下方 Roadmap。

---

## Phase 1 做了什麼

`fetch_and_score.py`：
1. 依 `config.yaml` 的 ISSN 清單，向 **Crossref** 抓取近 N 天（預設 30）各期刊新文。
2. 寫入 **SQLite** 並**去重**（DOI 為主鍵，標題模糊比對為輔）。
3. 用 `interest_model.json` 的關鍵字權重**評分**。
4. 產出 `data/papers.json`（整庫依分數排序，限定在抓取視窗發表日期內）。

## 快速開始

```bash
cd scholar-radar
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 真實抓取（需要外網），跑全部 13 本期刊
python fetch_and_score.py

# 只跑指定期刊、dry-run（不寫檔）、verbose
python fetch_and_score.py --issn 1094-6705 --issn 0022-2429 --dry-run -v

# 離線示範/驗收：用 tests/fixtures 當資料來源，完全不碰網路
python fetch_and_score.py --issn 1094-6705 --issn 0022-2429 --issn 0148-2963 --fixtures tests/fixtures
```

輸出 `data/papers.json` 結構：`{ "summary": {...}, "papers": [ {score, title, journal, doi, authors, abstract, url, matched_keywords, ...} ] }`，`papers` 已依 `score` 由高到低排序。

## 測試（離線）

```bash
python3 -m unittest discover -s tests
```

13 個測試涵蓋：DOI/標題正規化、去重（含同批 & DB 內模糊比對）、詞邊界評分、JATS 摘要清洗、
work→Paper 正規化，以及三本期刊的端到端流程（含冪等性、dry-run）。全程用 `FixtureTransport`，不需網路。

## 專案結構

```
scholar-radar/
├── config.yaml            # 集中設定：期刊清單、抓取視窗、filter 欄位、API email
├── interest_model.json    # 評分權重（純資料檔，Phase 4 由 train_interest.py 微調）
├── fetch_and_score.py     # Phase 1 CLI 進入點
├── requirements.txt
├── scholar_radar/         # 核心套件
│   ├── config.py          # 讀 config.yaml（相對路徑以 config 所在目錄解析）
│   ├── transport.py       # Transport 介面：HttpTransport（polite pool+退避）/ FixtureTransport
│   ├── crossref.py        # CrossrefClient（cursor 分頁）+ work→Paper 正規化
│   ├── dedup.py           # DOI/標題正規化、difflib 相似度（純函數）
│   ├── store.py           # SQLite 儲存與兩層去重
│   ├── scoring.py         # 興趣評分（純函數）
│   ├── pipeline.py        # 抓取→去重→評分→輸出 協調層
│   └── models.py          # Paper dataclass
├── tests/
│   ├── fixtures/          # 真實形狀的 Crossref 回應（3 本期刊）
│   └── test_*.py
└── data/                  # 執行產物（.db / papers.json，已 gitignore）
```

## 設計決策（重點說明）

### Crossref filter 參數
- 端點：`GET /journals/{issn}/works`，`filter=<欄位>:<YYYY-MM-DD>`，`cursor=*` 深分頁，`select=` 只取需要欄位，帶 `mailto` 進 polite pool。
- **預設用 `from-index-date`**（可在 `config.yaml` 改）。理由：雷達要抓「最近才出現」的文章；
  `from-created-date` 是 DOI 記錄建立日，補登的舊文可能被漏掉，而 `from-pub-date` 常有數月延遲。
  三者取捨已寫在 `config.yaml` 註解，方便你切換。
- 只保留 `journal-article`（過濾書評/勘誤/editorial），清單在 `crossref.allowed_types`。

### 去重策略（兩層）
1. **主鍵 `dedup_key`**：正規化 DOI（去 `doi.org/` 前綴、轉小寫）；無 DOI 時退回**正規化標題 hash**。
2. **輔助模糊比對**：同期刊範圍內，用 `difflib` 標題相似度 ≥ 門檻（預設 0.92）視為同一篇，
   擋掉 DOI 前後不一致、preprint 與正式版標題幾乎相同的情況。同批次內也會先自我去重。

### 評分
- 純函數（`scoring.py`），方便測試與 Phase 4 重跑不漂移。
- 關鍵字命中**標題**得 `權重 × title_multiplier`（預設 1.5），命中**摘要/subject** 得 `權重 × 1`；
  每關鍵字最多計一次。採**詞邊界**比對（`trust` 不會誤中 `industrial`）。支援負權重排除無關主題。

### 離線可測試性
- HTTP 抽象成 `Transport` 介面。真實抓取 `HttpTransport`（指數退避、尊重 `Retry-After`/429/5xx），
  測試/驗收用 `FixtureTransport` 把 ISSN 對應到本地 fixture。解析邏輯對真實形狀的 fixture 測試，不碰網路。

## 給維護者的待確認事項（Phase 2 前）

實作時我依規格做了以下預設，若與你想法不同請提出，Phase 2 會一併調整：

1. **filter 欄位**：預設 `from-index-date`。若你更在意「正式出版日」的一致性，可改 `from-online-pub-date`。
2. **抓取視窗**：預設 30 天。每日跑兩次時 30 天視窗有大量重疊，但靠去重保證冪等，不會重複推播。
3. **評分是否 clamp**：目前 `score` 為權重原始加總（不設上下限），命中越多分越高。
   規格中的 `clamp` 是針對 Phase 4 **權重**微調（`effective = clamp(base+delta, min, max)`），非針對總分——已如此區分。
4. **papers.json 範圍**：目前輸出「視窗內發表日期」的整庫論文（含歷史抓取），非僅本次新增，方便前端一次呈現。

## Roadmap

- [x] **Phase 1**：Crossref 抓取 + SQLite 去重 + 評分 + papers.json
- [ ] **Phase 2**：`enrich.py`（Unpaywall OA 標註）+ 靜態網頁展示層（localStorage 動作，預留跨裝置抽象）
- [ ] **Phase 3**：`notify_digest.py`（ntfy 推播）+ Semantic Scholar 作者追蹤/補摘要
- [ ] **Phase 4**：`train_interest.py`（投票回饋微調權重，預設 dry-run）+ `export_actions.py`（JSON/CSV 下游）
- [ ] **Phase 5（選用）**：Cloudflare Workers + D1 跨裝置同步

## 授權與參考
架構參考 [drpwchen/paper-radar](https://github.com/drpwchen/paper-radar)（MIT）。抓取層依本專案規格重寫（Crossref 而非 RSS/PubMed）。
