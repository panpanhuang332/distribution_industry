import type { StatMethod } from "@/lib/types";

/**
 * 統計方法資料庫
 * ------------------------------------------------------------------
 * 每一筆都是一個可獨立呈現於 /methods/[id] 的完整教學資料。
 * 想新增方法：在陣列加入一筆即可，路由與卡片會自動帶出。
 */
export const methods: StatMethod[] = [
  {
    id: "descriptive",
    name: "描述統計",
    enName: "Descriptive Statistics",
    level: "基礎",
    difficulty: "入門",
    description: "用平均數、標準差、次數等指標，先把資料整體樣貌描述清楚。",
    researchQuestions: [
      "我的樣本長什麼樣子？（性別、年齡分布）",
      "各變項的集中與分散情形如何？",
    ],
    variableTypes: ["類別變項（次數、百分比）", "連續變項（平均數、標準差）"],
    assumptions: ["幾乎無前提，是所有分析的第一步"],
    outputs: ["次數分配表", "平均數 (M)", "標準差 (SD)", "最小值／最大值", "偏態與峰度"],
    interpretation: [
      "先看樣本人數 N 是否足夠。",
      "連續變項看 M 與 SD；類別變項看次數與百分比。",
      "偏態／峰度可初步判斷是否接近常態分配。",
    ],
    writingExample:
      "本研究共回收有效問卷 320 份，受試者男性 152 人（47.5%）、女性 168 人（52.5%），平均年齡為 21.4 歲（SD = 2.1）。",
    commonMistakes: [
      "對類別變項計算平均數（例如把性別 1、2 平均）。",
      "只報告平均數卻不報告標準差。",
    ],
    tools: ["Excel", "SPSS", "Jamovi", "JASP", "R"],
    relatedMethods: ["reliability", "correlation"],
  },
  {
    id: "ttest",
    name: "t 檢定",
    enName: "t-test",
    level: "基礎",
    difficulty: "入門",
    description: "比較「兩組」平均數是否有顯著差異。",
    researchQuestions: [
      "男生與女生的學習成就是否不同？",
      "實驗組與控制組的後測分數是否有差異？",
    ],
    variableTypes: ["自變項：二分類別變項", "依變項：連續變項"],
    assumptions: [
      "依變項近似常態分配",
      "兩組變異數同質（Levene 檢定）",
      "觀察值彼此獨立（獨立樣本 t）",
    ],
    outputs: ["各組 M、SD", "t 值", "自由度 df", "p 值", "效果量 Cohen's d"],
    interpretation: [
      "先看 Levene 檢定決定讀哪一列。",
      "p < .05 表示兩組平均數有顯著差異。",
      "搭配 Cohen's d 判斷差異的實質大小。",
    ],
    writingExample:
      "獨立樣本 t 檢定結果顯示，實驗組（M = 82.3, SD = 6.1）顯著高於控制組（M = 75.8, SD = 7.4），t(118) = 4.21, p < .001, Cohen's d = 0.77，屬中大效果。",
    commonMistakes: [
      "三組以上仍用 t 檢定兩兩比較，膨脹型一錯誤。",
      "忽略變異數同質性假設。",
      "把配對資料當成獨立樣本分析。",
    ],
    tools: ["SPSS", "Jamovi", "JASP", "R", "Python"],
    relatedMethods: ["anova", "descriptive"],
  },
  {
    id: "anova",
    name: "單因子變異數分析 ANOVA",
    enName: "One-way ANOVA",
    level: "基礎",
    difficulty: "中等",
    description: "比較「三組以上」平均數是否有顯著差異。",
    researchQuestions: [
      "不同年級（大一、大二、大三）的壓力程度是否不同？",
      "三種教學法的成效是否有差異？",
    ],
    variableTypes: ["自變項：三類以上的類別變項", "依變項：連續變項"],
    assumptions: ["依變項常態分配", "各組變異數同質", "觀察值獨立"],
    outputs: ["F 值", "組間／組內自由度", "p 值", "事後比較 (Post-hoc)", "效果量 η²"],
    interpretation: [
      "F 檢定顯著只代表「至少有兩組不同」，需做事後比較找出是哪幾組。",
      "常用事後比較：Tukey HSD、Scheffé。",
      "η² 表示自變項可解釋依變項的變異比例。",
    ],
    writingExample:
      "單因子變異數分析顯示不同年級的壓力程度有顯著差異，F(2, 297) = 6.84, p = .001, η² = .044。Tukey 事後比較顯示大三（M = 3.81）顯著高於大一（M = 3.22）。",
    commonMistakes: [
      "F 顯著卻不做事後比較。",
      "忽略變異數同質性（不同質時可改用 Welch ANOVA）。",
    ],
    tools: ["SPSS", "Jamovi", "JASP", "R"],
    relatedMethods: ["ttest", "regression-multiple"],
  },
  {
    id: "chisquare",
    name: "卡方檢定",
    enName: "Chi-square Test",
    level: "基礎",
    difficulty: "入門",
    description: "檢驗兩個「類別變項」之間是否有關聯。",
    researchQuestions: [
      "性別與是否使用某 App 有關嗎？",
      "科系與通勤方式之間是否獨立？",
    ],
    variableTypes: ["兩個變項皆為類別變項"],
    assumptions: ["觀察值獨立", "期望次數大多 ≥ 5（否則考慮 Fisher 精確檢定）"],
    outputs: ["交叉表（觀察次數／期望次數）", "卡方值 χ²", "自由度 df", "p 值", "Cramér's V"],
    interpretation: [
      "p < .05 表示兩變項不獨立、存在關聯。",
      "卡方無法說明因果，只能說有「關聯」。",
      "Cramér's V 判斷關聯強度。",
    ],
    writingExample:
      "卡方獨立性檢定顯示性別與 App 使用情形有顯著關聯，χ²(1, N = 320) = 8.45, p = .004, Cramér's V = .16。",
    commonMistakes: [
      "把連續變項硬塞進卡方（應先合理分組或改用其他方法）。",
      "格子期望次數過小仍直接套用卡方。",
    ],
    tools: ["SPSS", "Jamovi", "JASP", "R"],
    relatedMethods: ["correlation", "descriptive"],
  },
  {
    id: "correlation",
    name: "相關分析",
    enName: "Correlation",
    level: "基礎",
    difficulty: "入門",
    description: "檢驗兩個連續變項之間關係的方向與強度。",
    researchQuestions: [
      "學習時間與成績之間有關係嗎？",
      "工作壓力越高，工作滿意度是否越低？",
    ],
    variableTypes: ["兩個連續變項（Pearson）", "順序變項可用 Spearman"],
    assumptions: ["線性關係", "雙變量常態（Pearson）", "無嚴重極端值"],
    outputs: ["相關係數 r", "p 值", "相關矩陣", "散佈圖"],
    interpretation: [
      "r 的正負代表方向，絕對值大小代表強度（.1 小、.3 中、.5 大）。",
      "相關不等於因果。",
      "務必搭配散佈圖檢查是否為線性。",
    ],
    writingExample:
      "Pearson 相關分析顯示學習時間與學業成績呈顯著正相關，r = .42, p < .001，顯示學習時間越多，成績傾向越高。",
    commonMistakes: [
      "由相關直接推論因果。",
      "忽略非線性關係或極端值的影響。",
    ],
    tools: ["Excel", "SPSS", "Jamovi", "JASP", "R", "Python"],
    relatedMethods: ["regression-simple", "regression-multiple"],
  },
  {
    id: "regression-simple",
    name: "簡單迴歸",
    enName: "Simple Linear Regression",
    level: "基礎",
    difficulty: "中等",
    description: "用一個自變項預測一個連續依變項。",
    researchQuestions: ["讀書時間能預測成績嗎？", "廣告投入能預測銷售額嗎？"],
    variableTypes: ["自變項：連續（或可數值化）", "依變項：連續變項"],
    assumptions: ["線性", "殘差常態", "等分散性", "觀察值獨立"],
    outputs: ["迴歸係數 B、β", "常數項", "R²", "F 檢定", "t 與 p 值"],
    interpretation: [
      "R² 表示自變項可解釋依變項的變異比例。",
      "β 為標準化係數，方便跨變項比較影響力。",
      "看 B 的正負與顯著性判斷影響方向。",
    ],
    writingExample:
      "簡單迴歸分析顯示學習時間能顯著正向預測學業成績，β = .42, t = 7.31, p < .001，R² = .18，可解釋成績 18% 的變異。",
    commonMistakes: ["把相關與迴歸混用", "未檢查殘差與極端值"],
    tools: ["Excel", "SPSS", "Jamovi", "JASP", "R"],
    relatedMethods: ["correlation", "regression-multiple"],
  },
  {
    id: "regression-multiple",
    name: "多元迴歸",
    enName: "Multiple Regression",
    level: "進階",
    difficulty: "中等",
    description: "用多個自變項同時預測一個連續依變項，並比較各自影響力。",
    researchQuestions: [
      "哪些因素會影響工作滿意度？",
      "在控制其他變項後，自我效能仍能預測學習成就嗎？",
    ],
    variableTypes: ["多個自變項（連續或虛擬變項）", "依變項：連續變項"],
    assumptions: ["線性", "殘差常態與等分散", "無嚴重多元共線性 (VIF)", "觀察值獨立"],
    outputs: ["各自變項 B、β、p", "R²、調整後 R²", "F 檢定", "VIF", "ΔR²（階層迴歸）"],
    interpretation: [
      "在「控制其他變項」下，看每個 β 的顯著性與方向。",
      "VIF > 10（或 5）需留意共線性。",
      "階層迴歸可看新增變項帶來的 ΔR²。",
    ],
    writingExample:
      "多元迴歸分析顯示，在控制性別與年齡後，自我效能（β = .38, p < .001）與學習投入（β = .25, p = .002）皆能顯著正向預測學業成就，整體模型 R² = .31, F(4, 295) = 33.2, p < .001。",
    commonMistakes: [
      "丟入過多變項導致共線性。",
      "用迴歸顯著就宣稱因果。",
      "忽略樣本數需求（每個自變項建議 ≥ 10~15 個樣本）。",
    ],
    tools: ["SPSS", "Jamovi", "JASP", "R", "Python"],
    relatedMethods: ["regression-simple", "mediation", "moderation"],
  },
  {
    id: "reliability",
    name: "信度分析",
    enName: "Reliability (Cronbach's α)",
    level: "進階",
    difficulty: "入門",
    description: "檢驗問卷量表「同一構面題目」是否內部一致、測得穩定。",
    researchQuestions: ["這個量表的題目是否量測同一個概念？", "量表是否可靠？"],
    variableTypes: ["同一構面下的多個 Likert 題項"],
    assumptions: ["題項屬同一構面", "題項為連續或可視為連續的順序資料"],
    outputs: ["Cronbach's α", "刪題後的 α", "校正後項目總分相關 (CITC)"],
    interpretation: [
      "α ≥ .70 大致可接受，≥ .80 良好。",
      "若「刪題後 α 提高」且該題 CITC 偏低（< .3），可考慮刪題。",
      "α 過高（> .95）可能題目重複。",
    ],
    writingExample:
      "各構面之 Cronbach's α 介於 .82 至 .91 之間，均高於 .70，顯示量表具良好的內部一致性信度。",
    commonMistakes: [
      "把不同構面的題目放在一起算 α。",
      "反向題未轉碼就計算信度。",
    ],
    tools: ["SPSS", "Jamovi", "JASP", "R"],
    relatedMethods: ["efa", "descriptive"],
  },
  {
    id: "efa",
    name: "探索性因素分析 EFA",
    enName: "Exploratory Factor Analysis",
    level: "進階",
    difficulty: "困難",
    description: "在未知結構下，找出問卷題目背後可分成哪些潛在構面。",
    researchQuestions: [
      "這 20 題量表背後可以歸納成幾個構面？",
      "哪些題目應該歸在同一個因素？",
    ],
    variableTypes: ["多個 Likert 題項（連續化處理）"],
    assumptions: [
      "樣本足夠（建議每題 5~10 人、總數 ≥ 200）",
      "KMO ≥ .60、Bartlett 球形檢定顯著",
      "變項間存在足夠相關",
    ],
    outputs: ["KMO 與 Bartlett 檢定", "特徵值與陡坡圖", "因素負荷量", "解釋變異量", "共同性"],
    interpretation: [
      "先看 KMO 與 Bartlett 判斷是否適合做因素分析。",
      "以特徵值 > 1 或陡坡圖決定因素數。",
      "因素負荷量 ≥ .50 較佳；雙負荷或負荷過低的題目考慮刪除。",
    ],
    writingExample:
      "KMO = .89、Bartlett 球形檢定達顯著（χ² = 2456.3, p < .001），適合進行因素分析。採主軸法搭配最大變異轉軸，萃取出三個因素，累積解釋變異量達 62.4%。",
    commonMistakes: [
      "樣本太小就做 EFA。",
      "保留負荷量過低或跨因素的題目。",
      "把 EFA 與 CFA 混用（探索 vs 驗證目的不同）。",
    ],
    tools: ["SPSS", "Jamovi", "JASP", "R"],
    relatedMethods: ["reliability", "cfa"],
  },
  {
    id: "mediation",
    name: "中介分析",
    enName: "Mediation Analysis",
    level: "進階",
    difficulty: "困難",
    description: "檢驗 X 是否「透過」中介變項 M 來影響 Y。",
    researchQuestions: [
      "工作壓力是否透過情緒耗竭影響離職意願？",
      "教學品質是否透過學習投入影響成績？",
    ],
    variableTypes: ["自變項 X、中介變項 M、依變項 Y（多為連續）"],
    assumptions: ["變項間具理論先後順序", "適當樣本數", "建議用 Bootstrap 估計間接效果"],
    outputs: ["a、b、c、c' 路徑係數", "間接效果與其信賴區間", "Sobel / Bootstrap 結果"],
    interpretation: [
      "間接效果 = a × b；其 Bootstrap 95% CI 不含 0 即為顯著。",
      "c'（控制 M 後的直接效果）變不顯著為完全中介，仍顯著為部分中介。",
      "現代研究偏好 Bootstrap，少用傳統 Baron & Kenny 四步驟。",
    ],
    writingExample:
      "Bootstrap（5,000 次）中介分析顯示，情緒耗竭在工作壓力與離職意願間具顯著中介效果，間接效果 = .21, 95% CI [.12, .31]，且直接效果仍顯著，屬部分中介。",
    commonMistakes: [
      "僅用橫斷面資料卻過度宣稱因果中介。",
      "只看 Sobel 不報告 Bootstrap 信賴區間。",
    ],
    tools: ["SPSS（PROCESS）", "R", "Mplus", "SmartPLS"],
    relatedMethods: ["regression-multiple", "moderation", "sem"],
  },
  {
    id: "moderation",
    name: "調節分析",
    enName: "Moderation Analysis",
    level: "進階",
    difficulty: "困難",
    description: "檢驗某個條件（調節變項 W）是否會改變 X 對 Y 的影響強度或方向。",
    researchQuestions: [
      "性別是否會改變壓力對績效的影響？",
      "社會支持是否會緩衝壓力對健康的負面效果？",
    ],
    variableTypes: ["自變項 X、調節變項 W、依變項 Y"],
    assumptions: ["連續變項建議中心化以降低共線性", "需建立 X×W 交互作用項"],
    outputs: ["交互作用項係數與 p", "ΔR²", "簡單斜率分析", "交互作用圖"],
    interpretation: [
      "看交互作用項 X×W 是否顯著；顯著代表有調節效果。",
      "以簡單斜率分析說明在高／低 W 下 X→Y 的差異。",
      "交互作用圖能直觀呈現調節型態。",
    ],
    writingExample:
      "迴歸結果顯示工作壓力與社會支持的交互作用顯著（β = -.18, p = .009, ΔR² = .03）；簡單斜率分析顯示在低社會支持下，壓力對身心健康的負向影響較強。",
    commonMistakes: [
      "未中心化導致共線性與解讀困難。",
      "交互作用不顯著仍硬解讀調節效果。",
    ],
    tools: ["SPSS（PROCESS）", "R", "Mplus"],
    relatedMethods: ["regression-multiple", "mediation"],
  },
  {
    id: "cfa",
    name: "確認性因素分析 CFA",
    enName: "Confirmatory Factor Analysis",
    level: "高級",
    difficulty: "困難",
    description: "在已有理論結構下，驗證題目與構面的對應是否成立。",
    researchQuestions: [
      "我預設的三構面量表結構在資料上成立嗎？",
      "量表是否具有良好的建構效度？",
    ],
    variableTypes: ["多個觀察題項對應到已假設的潛在構面"],
    assumptions: ["有明確理論模型", "樣本足夠（建議 ≥ 200）", "多元常態較佳"],
    outputs: [
      "標準化因素負荷量",
      "適配度指標（χ²/df、CFI、TLI、RMSEA、SRMR）",
      "組合信度 CR、平均變異萃取量 AVE",
    ],
    interpretation: [
      "適配度參考：CFI/TLI ≥ .90、RMSEA ≤ .08、SRMR ≤ .08。",
      "因素負荷量 ≥ .50、CR ≥ .70、AVE ≥ .50 支持收斂效度。",
      "AVE 平方根 > 構面間相關，支持區別效度。",
    ],
    writingExample:
      "CFA 結果顯示模型適配良好（χ²/df = 2.31, CFI = .95, TLI = .94, RMSEA = .056, SRMR = .043）。各構面 CR 介於 .82~.90、AVE 介於 .54~.67，顯示具良好的收斂效度。",
    commonMistakes: [
      "用同一份資料同時做 EFA 與 CFA。",
      "只報告 χ² 顯著就說模型不佳（大樣本時 χ² 易顯著）。",
    ],
    tools: ["AMOS", "Mplus", "R (lavaan)", "SmartPLS"],
    relatedMethods: ["efa", "sem"],
  },
  {
    id: "sem",
    name: "結構方程模型 SEM",
    enName: "Structural Equation Modeling",
    level: "高級",
    difficulty: "困難",
    description: "同時檢驗「測量模型」與「構面之間的因果路徑」整體理論模型。",
    researchQuestions: [
      "我的研究理論模型整體是否成立？",
      "多個構面之間的因果與中介路徑同時成立嗎？",
    ],
    variableTypes: ["多個潛在變項（由題項構成）與其間的路徑"],
    assumptions: ["以理論為基礎建模", "樣本充足", "先確認測量模型再看結構模型"],
    outputs: ["整體適配度指標", "標準化路徑係數與顯著性", "間接／總效果", "R²"],
    interpretation: [
      "先確認測量模型（CFA）適配與信效度，再解讀結構路徑。",
      "看各路徑係數的方向、大小與顯著性驗證假設。",
      "可同時處理多個中介與多個依變項。",
    ],
    writingExample:
      "結構方程模型整體適配良好（CFI = .94, RMSEA = .058）。路徑分析顯示知覺易用性正向影響使用態度（β = .46, p < .001），並透過使用態度間接影響使用意願（間接效果 = .27, 95% CI [.18, .37]）。",
    commonMistakes: [
      "樣本不足仍硬跑複雜模型。",
      "為追求適配度反覆修改模型卻缺乏理論依據。",
    ],
    tools: ["AMOS", "Mplus", "R (lavaan)", "SmartPLS"],
    relatedMethods: ["cfa", "mediation", "moderation"],
  },
];

/** 以 id 快速取得單一方法（詳細頁使用） */
export function getMethodById(id: string): StatMethod | undefined {
  return methods.find((m) => m.id === id);
}

/** 取得所有方法 id（給 generateStaticParams 使用） */
export function getAllMethodIds(): string[] {
  return methods.map((m) => m.id);
}
