import type { CaseStudy } from "@/lib/types";

/**
 * 模擬研究案例
 * ------------------------------------------------------------------
 * 提供完整的研究設計範例，幫助使用者把抽象方法對應到真實研究流程。
 */
export const cases: CaseStudy[] = [
  {
    id: "elearning-satisfaction",
    title: "數位學習滿意度研究",
    researchQuestions: [
      "系統易用性與課程品質是否影響數位學習滿意度？",
      "學習投入是否在其中扮演中介角色？",
    ],
    independentVars: ["系統易用性", "課程品質"],
    dependentVars: ["數位學習滿意度"],
    controlVars: ["年齡", "先前線上學習經驗"],
    constructs: ["系統易用性", "課程品質", "學習投入", "學習滿意度"],
    methods: ["reliability", "efa", "correlation", "regression-multiple", "mediation"],
    analysisFlow: [
      "資料清理與反向題轉碼",
      "信度分析（Cronbach's α）",
      "EFA 檢驗構面結構",
      "相關分析檢視變項關係",
      "多元迴歸檢驗預測效果",
      "Bootstrap 中介分析",
    ],
  },
  {
    id: "social-media-motivation",
    title: "社群媒體使用與學習動機研究",
    researchQuestions: [
      "社群媒體使用強度與學習動機是否有關？",
      "自我調節學習是否會調節兩者關係？",
    ],
    independentVars: ["社群媒體使用強度"],
    dependentVars: ["學習動機"],
    controlVars: ["性別", "年級"],
    constructs: ["社群媒體使用", "自我調節學習", "學習動機"],
    methods: ["reliability", "correlation", "regression-multiple", "moderation"],
    analysisFlow: [
      "資料清理與量表計分",
      "信度分析",
      "相關分析",
      "多元迴歸（含交互作用項）",
      "簡單斜率與調節效果檢驗",
    ],
  },
  {
    id: "purchase-intention",
    title: "消費者購買意願研究",
    researchQuestions: [
      "知覺價值與品牌信任如何影響購買意願？",
      "整體理論模型是否成立？",
    ],
    independentVars: ["知覺價值", "品牌信任"],
    dependentVars: ["購買意願"],
    controlVars: ["月收入", "購買經驗"],
    constructs: ["知覺價值", "品牌信任", "購買態度", "購買意願"],
    methods: ["reliability", "cfa", "sem"],
    analysisFlow: [
      "資料清理",
      "信度分析",
      "CFA 驗證測量模型（CR、AVE）",
      "SEM 檢驗結構路徑",
      "間接效果檢定",
    ],
  },
  {
    id: "workplace-stress",
    title: "職場壓力與工作滿意度研究",
    researchQuestions: [
      "工作壓力是否影響工作滿意度？",
      "不同部門的壓力程度是否有差異？",
    ],
    independentVars: ["工作壓力", "部門別"],
    dependentVars: ["工作滿意度"],
    controlVars: ["年資", "職級"],
    constructs: ["工作壓力", "情緒耗竭", "工作滿意度"],
    methods: ["descriptive", "reliability", "anova", "correlation", "regression-multiple", "mediation"],
    analysisFlow: [
      "描述統計與資料清理",
      "信度分析",
      "ANOVA 比較不同部門壓力",
      "相關分析",
      "多元迴歸",
      "情緒耗竭的中介分析",
    ],
  },
];
