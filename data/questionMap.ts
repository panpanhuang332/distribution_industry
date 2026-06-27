import type { QuestionMapItem } from "@/lib/types";

/**
 * 研究問題地圖
 * ------------------------------------------------------------------
 * 以「我想做什麼」的使用者意圖出發，對應到 methods.ts 中的方法。
 * category 用於頁面上的分類篩選。
 */
export const questionMap: QuestionMapItem[] = [
  {
    id: "q-compare-two",
    intent: "我想比較兩組是否有差異",
    scenario: "例如：男生 vs 女生、實驗組 vs 控制組的某個分數差異。",
    methodId: "ttest",
    category: "差異比較",
  },
  {
    id: "q-compare-multi",
    intent: "我想比較三組以上是否有差異",
    scenario: "例如：大一、大二、大三在某分數上的差異。",
    methodId: "anova",
    category: "差異比較",
  },
  {
    id: "q-relationship",
    intent: "我想知道兩個變項是否有關係",
    scenario: "例如：學習時間與成績之間的關聯方向與強度。",
    methodId: "correlation",
    category: "關係探討",
  },
  {
    id: "q-predict",
    intent: "我想知道哪些因素會影響某個結果",
    scenario: "例如：哪些因素能預測工作滿意度。",
    methodId: "regression-multiple",
    category: "預測影響",
  },
  {
    id: "q-category-relation",
    intent: "我想知道類別變項之間是否有關聯",
    scenario: "例如：性別與是否使用某 App 的關聯。",
    methodId: "chisquare",
    category: "類別關聯",
  },
  {
    id: "q-efa",
    intent: "我想知道問卷題目背後可分成哪些構面",
    scenario: "例如：20 題量表可歸納成幾個潛在構面。",
    methodId: "efa",
    category: "量表檢驗",
  },
  {
    id: "q-cfa-sem",
    intent: "我想檢驗一個理論模型是否成立",
    scenario: "例如：驗證假設的量表結構或整體研究模型。",
    methodId: "sem",
    category: "量表檢驗",
  },
  {
    id: "q-mediation",
    intent: "我想知道某個變項是否透過另一個變項產生影響",
    scenario: "例如：壓力是否透過情緒耗竭影響離職意願。",
    methodId: "mediation",
    category: "預測影響",
  },
  {
    id: "q-moderation",
    intent: "我想知道某個條件是否會改變 X 對 Y 的影響",
    scenario: "例如：社會支持是否會緩衝壓力對健康的影響。",
    methodId: "moderation",
    category: "預測影響",
  },
];

/** 取得地圖中出現過的所有分類 */
export function getQuestionCategories(): string[] {
  return Array.from(new Set(questionMap.map((q) => q.category)));
}
