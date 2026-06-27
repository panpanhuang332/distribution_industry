import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Callout from "@/components/Callout";
import DifficultyTag from "@/components/DifficultyTag";
import { methods, getMethodById, getAllMethodIds } from "@/data/methods";

/**
 * 統計方法詳細頁（可重複使用的模板）
 * ------------------------------------------------------------------
 * 動態路由 /methods/[id]。所有方法共用此模板，內容由 methods.ts 提供。
 * 使用 generateStaticParams 讓每個方法在 build 時預先產生靜態頁。
 */

export function generateStaticParams() {
  return getAllMethodIds().map((id) => ({ id }));
}

// Next.js 15 起，動態路由的 params 為 Promise，需 await 取值
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const method = getMethodById(id);
  if (!method) return { title: "找不到方法" };
  return {
    title: method.name,
    description: method.description,
  };
}

/** 小區塊：標題 + 條列清單，重複使用 */
function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-bold text-slate-900">{title}</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function MethodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const method = getMethodById(id);
  if (!method) notFound();

  // 找出相關方法的完整資料（過濾掉不存在的 id）
  const related = method.relatedMethods
    .map((id) => getMethodById(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <Container className="py-10">
      {/* 麵包屑 */}
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/methods" className="hover:text-brand-600">
          統計方法
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-600">{method.name}</span>
      </nav>

      {/* 標題區 */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-extrabold text-slate-900">{method.name}</h1>
          <Badge color="brand">{method.level}</Badge>
          <DifficultyTag value={method.difficulty} />
        </div>
        {method.enName && (
          <p className="mt-1 text-sm text-slate-400">{method.enName}</p>
        )}
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-700">
          {method.description}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 主要內容 */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-5">
            <ListSection title="適合回答什麼研究問題" items={method.researchQuestions} />
            <ListSection title="需要什麼類型的變項" items={method.variableTypes} />
            <ListSection title="使用前提（假設）" items={method.assumptions} />
          </Card>

          <Card className="space-y-5">
            <ListSection title="常見輸出表格 / 統計量" items={method.outputs} />
            <ListSection title="結果怎麼看" items={method.interpretation} />
          </Card>

          <Callout type="tip" title="論文寫作範例句">
            {method.writingExample}
          </Callout>

          <Callout type="warn" title="常見錯誤">
            <ul className="list-disc space-y-1 pl-5">
              {method.commonMistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </Callout>
        </div>

        {/* 側欄 */}
        <aside className="space-y-6">
          <Card>
            <h2 className="mb-2 text-base font-bold text-slate-900">適合使用的軟體</h2>
            <div className="flex flex-wrap gap-1.5">
              {method.tools.map((t) => (
                <Badge key={t} color="gray">
                  {t}
                </Badge>
              ))}
            </div>
            <Link
              href="/tools"
              className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              比較各軟體 →
            </Link>
          </Card>

          {related.length > 0 && (
            <Card>
              <h2 className="mb-2 text-base font-bold text-slate-900">相關方法推薦</h2>
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/methods/${r.id}`}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-sm transition hover:border-brand-200 hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-700">{r.name}</span>
                      <span className="text-brand-600">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="bg-brand-50/60">
            <p className="text-sm text-slate-600">
              不確定該用哪個方法？試試{" "}
              <Link href="/recommend" className="font-semibold text-brand-700 underline">
                統計方法推薦小工具
              </Link>
              。
            </p>
          </Card>
        </aside>
      </div>

      {/* 下方：其他方法快速導覽 */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold text-slate-900">看看其他方法</h2>
        <div className="flex flex-wrap gap-2">
          {methods
            .filter((m) => m.id !== method.id)
            .map((m) => (
              <Link
                key={m.id}
                href={`/methods/${m.id}`}
                className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 ring-1 ring-inset ring-slate-200 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {m.name}
              </Link>
            ))}
        </div>
      </section>
    </Container>
  );
}
