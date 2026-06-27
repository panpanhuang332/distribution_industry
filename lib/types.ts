/**
 * 全站共用型別定義
 * ------------------------------------------------------------------
 * 集中管理資料結構，方便日後擴充（例如改接後端 API 時可直接沿用）。
 */

/** 難度／學習層級 */
export type Level = "基礎" | "進階" | "高級";

/** 初學難度（給方法卡片用的星級概念） */
export type Difficulty = "入門" | "中等" | "困難";

/**
 * 統計方法資料結構
 * 對應規格書「十一、資料結構」中的 method 物件。
 */
export interface StatMethod {
  /** 唯一識別碼，用於路由 /methods/[id] */
  id: string;
  /** 方法名稱，例如「獨立樣本 t 檢定」 */
  name: string;
  /** 英文／縮寫，輔助辨識 */
  enName?: string;
  /** 學習層級 */
  level: Level;
  /** 初學難度 */
  difficulty: Difficulty;
  /** 一句話解釋 */
  description: string;
  /** 適合回答的研究問題 */
  researchQuestions: string[];
  /** 需要的變項類型 */
  variableTypes: string[];
  /** 使用前提（假設） */
  assumptions: string[];
  /** 常見輸出表格／統計量 */
  outputs: string[];
  /** 結果怎麼看（判讀重點） */
  interpretation: string[];
  /** 論文寫作範例句 */
  writingExample: string;
  /** 常見錯誤 */
  commonMistakes: string[];
  /** 適合使用的軟體 */
  tools: string[];
  /** 相關方法推薦（method id 陣列） */
  relatedMethods: string[];
}

/**
 * 研究問題地圖節點
 * 使用者依「我想做什麼」找到對應方法。
 */
export interface QuestionMapItem {
  id: string;
  /** 使用者口吻的研究意圖，例如「我想比較兩組是否有差異」 */
  intent: string;
  /** 補充說明 */
  scenario: string;
  /** 對應的方法 id（指向 methods.ts） */
  methodId: string;
  /** 分類標籤，方便篩選 */
  category: "差異比較" | "關係探討" | "預測影響" | "量表檢驗" | "類別關聯";
}

/** 學習路線中的單一主題 */
export interface LearningTopic {
  id: string;
  title: string;
  /** 學習目標 */
  goal: string;
  /** 適合程度 */
  audience: string;
  /** 預估難度 */
  difficulty: Difficulty;
  /** 前置知識 */
  prerequisites: string[];
  /** 對應的論文用途 */
  paperUsage: string;
  /** 若有對應的方法詳細頁，填入 method id */
  methodId?: string;
}

/** 一個學習層（基礎／進階／高級） */
export interface LearningPath {
  level: Level;
  /** 層級說明 */
  summary: string;
  topics: LearningTopic[];
}

/** 統計軟體比較 */
export interface ToolInfo {
  id: string;
  name: string;
  /** 適合誰 */
  bestFor: string;
  /** 適合做什麼分析 */
  goodAt: string[];
  pros: string[];
  cons: string[];
  /** 學習門檻 */
  learningCurve: Difficulty;
  /** 是否免費 */
  free: boolean;
  /** 推薦程度 1~5 */
  rating: number;
  /** 額外提醒（例如初學者建議） */
  note?: string;
}

/** 論文寫作模板 */
export interface WritingTemplate {
  id: string;
  title: string;
  /** 使用情境 */
  scenario: string;
  /** 統計表重點 */
  tableFocus: string[];
  /** 論文句型（可帶入空格） */
  sentencePatterns: string[];
  /** 範例段落 */
  example: string;
  /** 注意事項 */
  notes: string[];
}

/** 模擬研究案例 */
export interface CaseStudy {
  id: string;
  title: string;
  researchQuestions: string[];
  independentVars: string[];
  dependentVars: string[];
  controlVars: string[];
  /** 問卷構面 */
  constructs: string[];
  /** 適合使用的統計方法（method id 或名稱） */
  methods: string[];
  /** 預期分析流程 */
  analysisFlow: string[];
}
