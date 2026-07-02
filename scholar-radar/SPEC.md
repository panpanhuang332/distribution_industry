# scholar-radar 開發規格書（原始需求存檔）

> 本檔為專案初始規格的存檔。實作進度與設計決策見 README.md。

## 專案目標
建立個人化的管理學/商學期刊文獻追蹤雷達：自動抓取目標期刊新文 → 依研究興趣模型評分排序
→ 產出私密網頁供手機瀏覽勾選 → 勾選結果可回流至下游筆記系統。單人維護、零/低成本部署。

## 研究背景（interest_model 初始權重來源）
服務品質（SERVQUAL/PZB）、期望管理、數位資訊污染與假評論、量表發展、休閒剝奪、保險償付能力揭露。

## 目標期刊
見 config.yaml 的 journals 清單（13 本，依 ISSN 抓取）。

## 分階段交付
1. Phase 1（MVP）：fetch_and_score.py + Crossref 抓取 + SQLite 去重 + 關鍵字評分 + papers.json。（已完成）
2. Phase 2：enrich.py（Unpaywall OA）+ 靜態網頁展示層（localStorage）。
3. Phase 3：notify_digest.py（ntfy）+ Semantic Scholar 作者追蹤。
4. Phase 4：train_interest.py 回饋迴圈 + export_actions.py 下游接口。
5. Phase 5（選用）：Cloudflare D1 跨裝置同步。

## 技術約束
- Python 3.11+，相依只用 requests、feedparser、pyyaml、標準庫 sqlite3
- Crossref polite pool（帶 mailto），遵守 rate limit，指數退避
- 所有 API 呼叫需可離線測試：fetcher 介面 + fixture JSON
- config.yaml 集中管理；前端零框架、零 build step
- 每個模組附 --dry-run 與清楚 logging

## 明確不做
- 不爬出版社網站、不繞過付費牆
- 不做多使用者、不做帳號系統
- 不引入前端框架或 Node build chain

參考架構：https://github.com/drpwchen/paper-radar （MIT License）
