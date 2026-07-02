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

## 測試與驗收

### 離線單元/端到端測試（合成資料，非驗收）

```bash
python3 -m unittest discover -s tests
```

> ⚠️ 這些用的是 `tests/fixtures/` 的**合成 Crossref 資料**，只驗證程式邏輯（去重/評分/流程），
> **不等於**「對真實期刊跑通」的驗收。任何以 fixture 產生的排名/分數僅為功能示意，非驗收證據。

### Live 驗收（真實 Crossref，需可連外環境）

```bash
./smoke_test.sh                       # 預設 JSR / JM / JBR（含一本 Elsevier）
./smoke_test.sh 1094-6705 0022-2429   # 自訂 ISSN
MIN_PER_JOURNAL=1 ./smoke_test.sh      # 調整每期刊最低筆數門檻
```

**通過標準（PASS）**：
1. `fetch_and_score.py` 正常結束（exit 0），無未處理例外。
2. 每本期刊回傳 ≥ `MIN_PER_JOURNAL`（預設 1）。季刊（如 MISQ）30 天內可能為 0，屬正常，測這類期刊請設 `MIN_PER_JOURNAL=0`。
3. 去重有作用且入庫：`total_fetched ≥ new_this_run` 且首次跑 `new_this_run > 0`；重跑同參數 `new_this_run == 0`（冪等）。

腳本另會**報告各期刊摘要覆蓋率**（只報告、不硬性失敗，見下方評估）。

13 個測試涵蓋：DOI/標題正規化、去重（含同批 & DB 內模糊比對）、詞邊界評分、JATS 摘要清洗、
work→Paper 正規化，以及三本期刊的端到端流程（含冪等性、dry-run）。全程用 `FixtureTransport`，不需網路。

## 專案結構

```
scholar-radar/
├── config.yaml            # 集中設定：期刊清單、抓取視窗、filter 欄位、API email
├── interest_model.json    # 評分權重（純資料檔，Phase 4 由 train_interest.py 微調）
├── fetch_and_score.py     # Phase 1 CLI 進入點
├── smoke_test.sh          # live Crossref 驗收（需可連外）+ 覆蓋率報告
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

### 防噪音規則
- `crossref.max_published_age_days`（預設 730 天）：**published date** 早於「今天 − 此天數」的項目直接丟棄。
  避免出版社批次更新舊文 metadata 導致 index-date 變新、灌爆雷達。無 published date 者保留。設 0 可關閉。

### papers.json 每筆欄位（新增）
- `has_abstract`：布林值，Crossref 是否附摘要（Elsevier 期刊常為 `false`，供覆蓋率追蹤與 Phase 2.5 判斷）。
- `first_seen`：首次入庫 UTC 時間戳，**Phase 3 推播去重**依賴此欄位（現在加，免日後 migrate）。

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

## 已裁決事項（維護者，2026-07）

1. **filter 欄位** = `from-index-date`（核准）。**另加防噪音規則**：published date 早於 730 天（`config` 可調）者丟棄。
2. **clamp** 只約束 Phase 4 權重微調，總分不設限（核准）。前端若需正規化自行處理，評分核心保持原始加總。
3. **papers.json** 輸出整庫視窗（核准）。每筆加 `first_seen`（Phase 3 推播去重用）。
4. **30 天視窗 + 每日兩次**（核准），冪等靠去重。

## 摘要覆蓋率評估（Elsevier 風險）

**現況**：Crossref 的摘要覆蓋率因出版社而異。經驗上：
- **Elsevier**（JBR `0148-2963`、Tourism Management `0261-5177`、IJHM `0278-4319`）— 通常**不**向 Crossref 提供摘要，預期覆蓋率接近 **0%**。
- **SAGE / INFORMS / Wiley**（JM、JAMS、JSR、ISR、JRI）— 覆蓋率通常較高。

**對評分的影響**：無摘要時，僅「標題」能命中關鍵字。標題命中本就有 `title_multiplier` 加成，
故**排序仍可用**，但摘要專屬關鍵字（如只出現在摘要的 `structural equation modeling`）的召回會下降。

**我的建議**：跑 `smoke_test.sh` 看實際覆蓋率——
- 若三本 Elsevier 都 ~0%（極可能），且你重視這些期刊 → **把 Phase 3 的補摘要提前到 Phase 2.5**。
- 補摘要來源我**建議優先用 OpenAlex** 而非 Semantic Scholar：OpenAlex 無需 API key、
  對 Elsevier 覆蓋較好（以 inverted-index 提供摘要，可還原），且與現有 `Transport` 介面容易接。
  Semantic Scholar 留給 Phase 3 的「作者追蹤」。

決策權在你：跑完 smoke test 後告訴我是否要插入 Phase 2.5，我再據此排 Phase 2 的展示層是否預留 `abstract_source` 欄位。

## Roadmap

- [x] **Phase 1**：Crossref 抓取 + SQLite 去重 + 評分 + papers.json
- [ ] **Phase 2**：`enrich.py`（Unpaywall OA 標註）+ 靜態網頁展示層（localStorage 動作，預留跨裝置抽象）
- [ ] **Phase 2.5（條件性）**：若 Elsevier 摘要覆蓋率過低 → OpenAlex 補摘要
- [ ] **Phase 3**：`notify_digest.py`（ntfy 推播）+ Semantic Scholar 作者追蹤/補摘要
- [ ] **Phase 4**：`train_interest.py`（投票回饋微調權重，預設 dry-run）+ `export_actions.py`（JSON/CSV 下游）
- [ ] **Phase 5（選用）**：Cloudflare Workers + D1 跨裝置同步

## 授權與參考
架構參考 [drpwchen/paper-radar](https://github.com/drpwchen/paper-radar)（MIT）。抓取層依本專案規格重寫（Crossref 而非 RSS/PubMed）。
