"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Callout from "@/components/Callout";
import { recommendMethods, type RecommendAnswers } from "@/lib/recommend";

/**
 * 統計方法推薦小工具
 * ------------------------------------------------------------------
 * 使用者回答 5 個問題，前端規則引擎（lib/recommend.ts）即時推薦方法。
 * 不需 AI、不需後端，純規則判斷且可解釋。
 */

/** 每一題的設定：題目 + 選項 */
const questions: {
  key: keyof RecommendAnswers;
  label: string;
  options: { value: string; text: string }[];
}[] = [
  {
    key: "dvType",
    label: "1. 你的依變項（想解釋／預測的結果）是哪一種？",
    options: [
      { value: "continuous", text: "連續分數（如成績、滿意度分數）" },
      { value: "categorical", text: "類別（如科系、組別）" },
      { value: "binary", text: "二分結果（如有／沒有、通過／未通過）" },
    ],
  },
  {
    key: "ivType",
    label: "2. 你的自變項（用來解釋的變項）主要是哪一種？",
    options: [
      { value: "categorical", text: "類別（如性別、分組）" },
      { value: "continuous", text: "連續（如時間、分數）" },
      { value: "mixed", text: "兩者都有 / 不確定" },
    ],
  },
  {
    key: "goal",
    label: "3. 你最想做的是？",
    options: [
      { value: "difference", text: "比較差異（哪一組比較高）" },
      { value: "relationship", text: "檢查關係（兩者有沒有關聯）" },
      { value: "prediction", text: "預測結果（哪些因素有影響）" },
      { value: "scale", text: "驗證量表（構面 / 信效度）" },
    ],
  },
  {
    key: "groups",
    label: "4. 你有幾組要比較？（若非比較差異可選不適用）",
    options: [
      { value: "two", text: "兩組" },
      { value: "three+", text: "三組以上" },
      { value: "na", text: "不適用 / 沒有要比較" },
    ],
  },
  {
    key: "survey",
    label: "5. 你是否使用問卷量表（如 Likert 量表）？",
    options: [
      { value: "yes", text: "是" },
      { value: "no", text: "否" },
    ],
  },
];

const emptyAnswers: RecommendAnswers = {
  dvType: "",
  ivType: "",
  goal: "",
  groups: "",
  survey: "",
};

export default function RecommendPage() {
  const [answers, setAnswers] = useState<RecommendAnswers>(emptyAnswers);
  const [submitted, setSubmitted] = useState(false);

  // 是否已回答必要題目（目的為必填）
  const canSubmit = answers.goal !== "";

  const recommendations = submitted ? recommendMethods(answers) : [];

  const setAnswer = (key: keyof RecommendAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value as never }));
    setSubmitted(false);
  };

  const reset = () => {
    setAnswers(emptyAnswers);
    setSubmitted(false);
  };

  return (
    <Container className="py-10">
      <header className="mb-6 max-w-3xl">
        <h1 className="section-title">統計方法推薦小工具</h1>
        <p className="section-sub">
          回答幾個簡單問題，立刻得到方法建議。這是用簡單規則判斷的引導工具，
          最終仍請依研究設計與指導老師建議確認。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 問題區 */}
        <div className="space-y-5 lg:col-span-3">
          {questions.map((q) => (
            <Card key={q.key}>
              <p className="mb-3 font-semibold text-slate-900">{q.label}</p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const active = answers[q.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnswer(q.key, opt.value)}
                      className={`rounded-xl border px-3.5 py-2 text-sm transition ${
                        active
                          ? "border-brand-500 bg-brand-50 font-semibold text-brand-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-slate-50"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}

          <div className="flex gap-3">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => setSubmitted(true)}
              className="rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              看推薦方法 →
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              重設
            </button>
          </div>
          {!canSubmit && (
            <p className="text-sm text-slate-400">＊ 至少需回答第 3 題（你最想做什麼）。</p>
          )}
        </div>

        {/* 結果區 */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">推薦結果</h2>
            {!submitted ? (
              <Card className="bg-slate-50/80">
                <p className="text-sm text-slate-500">
                  回答左側問題後，點「看推薦方法」即可在這裡看到建議。
                </p>
              </Card>
            ) : (
              <>
                {recommendations.map((r, idx) => (
                  <Card key={idx} hover={Boolean(r.methodId)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900">{r.name}</p>
                      <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        建議 {idx + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{r.reason}</p>
                    {r.methodId && (
                      <Link
                        href={`/methods/${r.methodId}`}
                        className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        查看完整教學 →
                      </Link>
                    )}
                  </Card>
                ))}
                <Callout type="info">
                  推薦僅供引導。實際選擇仍需考量資料分配、樣本數與研究假設，
                  也可到{" "}
                  <Link href="/research-map" className="font-semibold underline">
                    研究問題地圖
                  </Link>{" "}
                  進一步釐清。
                </Callout>
              </>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
