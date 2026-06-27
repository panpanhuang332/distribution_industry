import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { cases } from "@/data/cases";
import { getMethodById } from "@/data/methods";

export const metadata: Metadata = {
  title: "案例資料庫",
  description: "模擬研究案例：完整呈現研究問題、變項、構面、適用方法與分析流程。",
};

/**
 * 案例資料庫頁
 * ------------------------------------------------------------------
 * 以模擬研究案例示範完整研究設計，幫助使用者把方法對應到真實研究。
 */
export default function CasesPage() {
  return (
    <Container className="py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="section-title">案例資料庫</h1>
        <p className="section-sub">
          看別人怎麼設計研究最快。以下案例皆為模擬，完整呈現從研究問題到分析流程的設計。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {cases.map((c) => (
          <Card key={c.id} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">{c.title}</h2>

            <div>
              <p className="mb-1 text-sm font-semibold text-slate-700">研究問題</p>
              <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-600">
                {c.researchQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="font-semibold text-slate-700">自變項</p>
                <p className="text-slate-600">{c.independentVars.join("、")}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">依變項</p>
                <p className="text-slate-600">{c.dependentVars.join("、")}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">控制變項</p>
                <p className="text-slate-600">{c.controlVars.join("、")}</p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-slate-700">問卷構面</p>
              <div className="flex flex-wrap gap-1.5">
                {c.constructs.map((con) => (
                  <Badge key={con} color="purple">
                    {con}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-slate-700">適合使用的統計方法</p>
              <div className="flex flex-wrap gap-1.5">
                {c.methods.map((mid) => {
                  const method = getMethodById(mid);
                  return method ? (
                    <Link key={mid} href={`/methods/${mid}`}>
                      <Badge color="brand">{method.name} →</Badge>
                    </Link>
                  ) : (
                    <Badge key={mid} color="gray">
                      {mid}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-slate-700">預期分析流程</p>
              <ol className="list-decimal space-y-0.5 pl-5 text-sm text-slate-600">
                {c.analysisFlow.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ol>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
