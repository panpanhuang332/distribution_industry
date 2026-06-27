/**
 * 問卷研究模組的內容資料
 * ------------------------------------------------------------------
 * 純文字／清單資料，供 /survey 頁面渲染。
 */

/** 問卷研究流程（依序） */
export const surveyFlow: { step: string; desc: string }[] = [
  { step: "研究問題", desc: "確立要回答的核心問題與研究目的。" },
  { step: "文獻回顧", desc: "整理理論與既有研究，找出構面與假設。" },
  { step: "構面設計", desc: "依理論定義各個潛在構面。" },
  { step: "題項設計", desc: "為每個構面撰寫具體題目（常用 Likert 量表）。" },
  { step: "預試", desc: "小樣本施測，做項目分析與初步信效度檢驗。" },
  { step: "正式施測", desc: "依抽樣計畫蒐集正式樣本。" },
  { step: "資料清理", desc: "處理遺漏值、無效問卷、反向題與極端值。" },
  { step: "信度效度分析", desc: "Cronbach's α、EFA／CFA 檢驗量表品質。" },
  { step: "假設檢定", desc: "用相關、迴歸、中介調節等檢驗研究假設。" },
  { step: "結果撰寫", desc: "把統計輸出轉成論文段落與表格。" },
];

/** 問卷資料處理清單 */
export const dataCleaningChecklist: { item: string; desc: string }[] = [
  { item: "遺漏值", desc: "檢查缺漏並決定刪除或補值策略。" },
  { item: "無效問卷", desc: "刪除作答時間異常、全部同一選項等無效卷。" },
  { item: "反向題", desc: "反向計分題務必先轉碼，再計算總分與信度。" },
  { item: "極端值", desc: "用盒鬚圖或標準分數檢查並處理離群值。" },
  { item: "題項編碼", desc: "為每個變項建立清楚一致的編碼規則。" },
  { item: "量表總分或平均分", desc: "依構面計算總分或平均分作為分析變項。" },
  { item: "人口統計變項整理", desc: "整理性別、年齡、年級等背景變項。" },
];

/** 問卷常用統計方法推薦（對應 methods.ts 的 id） */
export const surveyMethods: { methodId: string; label: string }[] = [
  { methodId: "reliability", label: "信度分析" },
  { methodId: "efa", label: "項目分析 / EFA" },
  { methodId: "correlation", label: "相關分析" },
  { methodId: "regression-multiple", label: "迴歸分析" },
  { methodId: "mediation", label: "中介分析" },
  { methodId: "moderation", label: "調節分析" },
];
