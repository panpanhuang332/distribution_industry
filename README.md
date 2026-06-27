# 論文統計自學系統

> 從研究問題到論文數據分析的自學系統

一個給大學生、二技生、研究新手與自學者使用的「論文統計任務導向學習系統」。
不是一般統計百科，而是以「完成研究任務」為核心，帶使用者理解研究問題、選擇統計方法、
整理資料、跑分析、撰寫論文結果。

本專案為**前端為主的 MVP 原型**：所有資料先以本地 TypeScript array 模擬，
未串接後端資料庫，但架構已預留擴充空間（資料層、型別層與 UI 層分離）。

---

## 一、技術棧

| 項目 | 採用 |
| --- | --- |
| 框架 | Next.js 15（App Router） |
| 語言 | TypeScript |
| 樣式 | Tailwind CSS 3 |
| UI | 元件化、卡片式設計、桌機與手機 RWD |
| 資料 | 本地 `data/*.ts`（無後端） |
| 語言介面 | 繁體中文 |

---

## 二、安裝與啟動

需求：Node.js 18.18 以上（建議 20+）。

```bash
# 1. 安裝套件
npm install

# 2. 啟動開發伺服器（http://localhost:3000）
npm run dev

# 3. 建置正式版
npm run build

# 4. 啟動正式版
npm run start
```

---

## 三、專案資料夾結構

```
.
├─ app/                      # Next.js App Router 頁面
│  ├─ layout.tsx             # 全站骨架（Header / main / Footer）+ metadata
│  ├─ globals.css            # 全站基礎樣式 + Tailwind 入口
│  ├─ page.tsx               # 首頁 Home
│  ├─ research-map/page.tsx  # 研究問題地圖（互動式選擇器）
│  ├─ learning-path/page.tsx # 三層式學習路線
│  ├─ methods/
│  │  ├─ page.tsx            # 統計方法總覽（可依層級篩選）
│  │  └─ [id]/page.tsx       # 統計方法詳細頁（可重複使用模板）
│  ├─ survey/page.tsx        # 問卷研究模組
│  ├─ tools/page.tsx         # 軟體工具比較
│  ├─ templates/page.tsx     # 論文寫作模板
│  ├─ cases/page.tsx         # 案例資料庫
│  └─ recommend/page.tsx     # 統計方法推薦小工具（規則引擎）
│
├─ components/               # 共用 UI 元件
│  ├─ Header.tsx             # 頂部品牌列 + RWD 導覽（手機漢堡選單）
│  ├─ Footer.tsx             # 頁尾
│  ├─ Container.tsx          # 版面寬度容器
│  ├─ Card.tsx               # 通用卡片
│  ├─ Badge.tsx              # 小標籤
│  ├─ DifficultyTag.tsx      # 難度／層級標籤
│  ├─ Callout.tsx            # 提示框（重點 / 常見錯誤 / 說明）
│  ├─ MethodCard.tsx         # 統計方法卡片
│  ├─ LearningPathCard.tsx   # 學習主題卡片
│  ├─ ToolComparisonCard.tsx # 軟體比較卡片
│  └─ TemplateBlock.tsx      # 寫作模板區塊
│
├─ data/                     # 模擬資料（未來可替換為 API）
│  ├─ methods.ts             # 13 個統計方法完整資料 + 查詢函式
│  ├─ questionMap.ts         # 研究問題地圖節點
│  ├─ learningPaths.ts       # 三層式學習路線
│  ├─ tools.ts               # 統計軟體比較
│  ├─ templates.ts           # 論文寫作模板
│  ├─ cases.ts               # 模擬研究案例
│  └─ survey.ts              # 問卷研究模組內容
│
├─ lib/                      # 型別與邏輯
│  ├─ types.ts               # 全站共用 TypeScript 型別
│  ├─ nav.ts                 # 導覽連結設定（共用）
│  └─ recommend.ts           # 推薦小工具的規則引擎（純前端、無 AI）
│
├─ tailwind.config.ts        # Tailwind 設定（品牌色、字型）
├─ tsconfig.json             # TypeScript 設定（含 @/ 路徑別名）
├─ next.config.mjs
└─ package.json
```

> 備註：repo 內另有一個與本專案無關的舊檔 `index.html`（流通業課程教案），予以保留、未更動。

---

## 四、主要檔案用途說明

### 頁面（app/）
- **`app/page.tsx`**：首頁。網站標題標語、用途說明、三大學習入口、學習路線概覽、CTA 按鈕。
- **`app/research-map/page.tsx`**：研究問題地圖。左側選研究意圖、右側即時帶出對應方法卡片，可分類篩選。
- **`app/learning-path/page.tsx`**：基礎／進階／高級三層，每個主題含學習目標、適合程度、難度、前置知識、論文用途。
- **`app/methods/page.tsx`**：方法總覽，可依層級篩選。
- **`app/methods/[id]/page.tsx`**：**可重複使用的方法詳細頁模板**，所有方法共用，含一句話解釋、適用研究問題、前提、變項、輸出、判讀、論文範例句、常見錯誤、軟體、相關方法。以 `generateStaticParams` 預先靜態產生 13 頁。
- **`app/survey/page.tsx`**：問卷研究流程、資料處理清單、方法推薦。
- **`app/tools/page.tsx`**：10 種軟體比較與新手選擇建議。
- **`app/templates/page.tsx`**：7 種統計結果的論文句型與範例段落。
- **`app/cases/page.tsx`**：4 個模擬研究案例，含變項、構面、方法與分析流程。
- **`app/recommend/page.tsx`**：回答 5 題即時推薦方法。

### 邏輯（lib/）
- **`lib/types.ts`**：集中定義所有資料結構型別，是擴充時的單一事實來源。
- **`lib/recommend.ts`**：推薦工具的規則引擎。刻意以透明的 `if/else` 撰寫，方便調整規則。
- **`lib/nav.ts`**：導覽列設定，Header 與 Footer 共用。

### 資料（data/）
所有內容皆集中在 `data/`，**修改內容只需改資料檔，不需動版面與元件**。
每筆統計方法資料結構如下（`lib/types.ts` 的 `StatMethod`）：

```ts
{
  id, name, enName, level,          // 識別與層級
  difficulty, description,           // 難度與一句話解釋
  researchQuestions, variableTypes,  // 適用問題、變項類型
  assumptions, outputs,              // 前提、輸出
  interpretation, writingExample,    // 判讀、論文範例句
  commonMistakes, tools,             // 常見錯誤、軟體
  relatedMethods                     // 相關方法（id 陣列）
}
```

---

## 五、已完成的 MVP 範圍

依規格「十二、請先完成 MVP」：

- ✅ 首頁
- ✅ 研究問題地圖（互動式，9 種研究意圖）
- ✅ 學習路線頁（基礎 9 + 進階 9 + 高級 6 個主題）
- ✅ 統計方法詳細頁（13 個方法，共用模板）
- ✅ 軟體工具頁（10 種軟體）
- ✅ 論文寫作模板頁（7 種模板）
- ✅ 統計方法推薦小工具（規則引擎）
- ✅ 額外完成：問卷研究模組、案例資料庫

暫未實作（依規格）：登入、資料庫、會員、付款、AI 問答、後台。

---

## 六、後續可擴充方向

1. **接後端 / CMS**：`data/*.ts` 的每個匯出都可改為 `fetch` API 回傳，型別 (`lib/types.ts`) 不需更動。
2. **擴充方法**：在 `data/methods.ts` 陣列新增一筆，總覽卡片與 `/methods/[id]` 詳細頁會自動產生。
3. **推薦引擎升級**：`lib/recommend.ts` 規則可擴充（如加入決策樹、邏輯斯迴歸判斷、樣本數提示），或日後改接 AI。
4. **互動練習**：可加入模擬資料集與「線上試跑」、隨堂測驗。
5. **使用者功能**：學習進度追蹤、收藏、筆記（需登入與後端）。
6. **i18n**：抽出文案即可支援多語系。
7. **無障礙與 SEO**：補強 ARIA、結構化資料與每頁 OG 圖。

---

## 七、安全性備註

- 已將 Next.js 升級至 15 的最新修補版以排除已知公告。
- `npm audit` 尚餘 2 筆 *moderate* 提示，來自 **Next.js 內部自帶（vendored）的 postcss**，
  目前無法在不降版 Next 的情況下單獨修補，待 Next 官方更新其內附版本即可解除。對本靜態原型影響極小。

---

## 八、可執行確認

```
npm run build  →  ✓ 成功，靜態產生 25 個頁面（含 13 個方法詳細頁）
npm run start  →  全部路由回應 200，內容正常渲染
```
