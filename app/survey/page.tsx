import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Callout from "@/components/Callout";
import Badge from "@/components/Badge";
import { surveyFlow, dataCleaningChecklist, surveyMethods } from "@/data/survey";
import { getMethodById } from "@/data/methods";

export const metadata: Metadata = {
  title: "問卷研究模組",
  description: "問卷研究完整流程、資料處理清單與常用統計方法推薦。",
};

/**
 * 問卷研究模組頁
 * ------------------------------------------------------------------
 * 給做問卷研究的人：流程、資料清理清單、方法推薦。
 */
export default function SurveyPage() {
  return (
    <Container className="py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="section-title">問卷研究模組</h1>
        <p className="section-sub">
          問卷研究有一套相對固定的流程。照著走，你就能完成一份具信效度基礎的研究。
        </p>
      </header>

      {/* 1. 問卷研究流程 */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold text-slate-900">一、問卷研究流程</h2>
        <ol className="relative space-y-3 border-l-2 border-brand-200 pl-6">
          {surveyFlow.map((s, idx) => (
            <li key={s.step} className="relative">
              <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {idx + 1}
              </span>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-semibold text-slate-900">{s.step}</p>
                <p className="text-sm text-slate-600">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 2. 問卷資料處理清單 */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold text-slate-900">二、問卷資料處理清單</h2>
        <Callout type="tip" title="開始分析前先檢查">
          資料清理沒做好，後面的分析全部會被影響。建議照下表逐項確認。
        </Callout>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dataCleaningChecklist.map((c) => (
            <Card key={c.item}>
              <p className="mb-1 font-semibold text-slate-900">✓ {c.item}</p>
              <p className="text-sm text-slate-600">{c.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. 問卷統計方法推薦 */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">三、問卷統計方法推薦</h2>
        <p className="mb-4 text-sm text-slate-600">
          問卷研究最常用到以下方法，點擊可查看完整教學。
        </p>
        <div className="flex flex-wrap gap-3">
          {surveyMethods.map((s) => {
            const method = getMethodById(s.methodId);
            return (
              <Link
                key={s.methodId}
                href={`/methods/${s.methodId}`}
                className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="font-medium text-slate-800 group-hover:text-brand-700">
                  {s.label}
                </span>
                {method && <Badge color="gray">{method.level}</Badge>}
                <span className="text-brand-600">→</span>
              </Link>
            );
          })}
        </div>
      </section>
    </Container>
  );
}
