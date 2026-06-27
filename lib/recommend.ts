/**
 * 統計方法推薦小工具：規則引擎（純前端、無 AI）
 * ------------------------------------------------------------------
 * 依使用者回答的幾個問題，用簡單 if/else 規則推薦方法。
 * 規則刻意保持透明、可解釋，方便日後調整與擴充。
 */

/** 推薦工具的問題選項型別 */
export interface RecommendAnswers {
  /** 依變項類型 */
  dvType: "continuous" | "categorical" | "binary" | "";
  /** 自變項類型 */
  ivType: "categorical" | "continuous" | "mixed" | "";
  /** 研究目的 */
  goal: "difference" | "relationship" | "prediction" | "scale" | "";
  /** 比較組數 */
  groups: "one" | "two" | "three+" | "na" | "";
  /** 是否使用問卷量表 */
  survey: "yes" | "no" | "";
}

export interface Recommendation {
  /** 對應 methods.ts 的 id（若有詳細頁） */
  methodId?: string;
  /** 顯示名稱 */
  name: string;
  /** 推薦理由 */
  reason: string;
}

/**
 * 依答案推薦方法。回傳陣列（可能不只一個建議）。
 * 規則優先順序：量表檢驗 → 目的（差異／關係／預測）。
 */
export function recommendMethods(a: RecommendAnswers): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1) 若以驗證量表為目的，或使用問卷且目的是量表，優先推薦信度／因素分析
  if (a.goal === "scale") {
    recs.push({
      methodId: "reliability",
      name: "信度分析（Cronbach's α）",
      reason: "你的目的是檢驗量表，先確認各構面題目的內部一致性。",
    });
    recs.push({
      methodId: "efa",
      name: "探索性因素分析 EFA",
      reason: "若構面結構尚未確定，可用 EFA 找出題目背後的潛在構面。",
    });
    recs.push({
      methodId: "cfa",
      name: "確認性因素分析 CFA / SEM",
      reason: "若已有理論結構，可用 CFA／SEM 驗證量表與模型。",
    });
    return recs;
  }

  // 2) 差異比較
  if (a.goal === "difference") {
    if (a.dvType === "categorical" || a.dvType === "binary") {
      recs.push({
        methodId: "chisquare",
        name: "卡方檢定",
        reason: "依變項為類別變項、要比較類別間關聯或差異時使用。",
      });
    } else if (a.dvType === "continuous") {
      if (a.groups === "two") {
        recs.push({
          methodId: "ttest",
          name: "t 檢定",
          reason: "連續依變項、比較兩組平均數差異。",
        });
      } else if (a.groups === "three+") {
        recs.push({
          methodId: "anova",
          name: "單因子 ANOVA",
          reason: "連續依變項、比較三組以上平均數差異。",
        });
      } else {
        recs.push({
          methodId: "ttest",
          name: "t 檢定 / ANOVA",
          reason: "比較兩組用 t 檢定，三組以上用 ANOVA（請補選組數）。",
        });
      }
    }
  }

  // 3) 關係探討
  if (a.goal === "relationship") {
    if (
      (a.dvType === "categorical" || a.dvType === "binary") &&
      a.ivType === "categorical"
    ) {
      recs.push({
        methodId: "chisquare",
        name: "卡方檢定",
        reason: "兩個類別變項之間的關聯。",
      });
    } else {
      recs.push({
        methodId: "correlation",
        name: "相關分析",
        reason: "檢視兩個連續變項間關係的方向與強度。",
      });
    }
  }

  // 4) 預測影響
  if (a.goal === "prediction") {
    if (a.dvType === "continuous") {
      recs.push({
        methodId: "regression-multiple",
        name: "多元迴歸",
        reason: "用多個自變項預測一個連續依變項並比較影響力。",
      });
    } else if (a.dvType === "binary") {
      recs.push({
        name: "邏輯斯迴歸（Logistic Regression）",
        reason: "依變項為二分結果時，用邏輯斯迴歸做預測（本站待擴充）。",
      });
    } else {
      recs.push({
        methodId: "regression-multiple",
        name: "迴歸分析",
        reason: "預測連續結果用線性迴歸；二分結果用邏輯斯迴歸。",
      });
    }
  }

  // 5) 若使用問卷量表，補充信度提醒
  //    （目的為「驗證量表」的情況已在前面 return，這裡不會再進入）
  if (a.survey === "yes") {
    recs.push({
      methodId: "reliability",
      name: "信度分析（補充）",
      reason: "你使用了問卷量表，正式分析前建議先做信度（與效度）檢驗。",
    });
  }

  // 6) 若無法判斷，給通用建議
  if (recs.length === 0) {
    recs.push({
      methodId: "descriptive",
      name: "先從描述統計開始",
      reason: "目前資訊較少，建議先描述資料樣貌，或到「研究問題地圖」逐步釐清。",
    });
  }

  return recs;
}
