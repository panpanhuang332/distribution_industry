import Link from "next/link";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { learningPaths } from "@/data/learningPaths";

/** 三個主要學習入口 */
const entries = [
  {
    href: "/research-map",
    emoji: "🧭",
    title: "我有研究問題，但不知道用什麼統計",
    desc: "用「研究問題地圖」依你的研究意圖找到對應的統計方法。",
    cta: "前往研究問題地圖",
  },
  {
    href: "/survey",
    emoji: "📋",
    title: "我要做問卷研究",
    desc: "從構面設計、信效度到假設檢定，掌握問卷研究的完整流程。",
    cta: "前往問卷研究模組",
  },
  {
    href: "/templates",
    emoji: "📝",
    title: "我要看懂論文統計結果",
    desc: "對照統計輸出與論文句型，學會把結果寫成論文段落。",
    cta: "前往寫作模板",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero 區 */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge color="accent">論文統計任務導向學習系統</Badge>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              從研究問題到
              <span className="text-brand-600">論文數據分析</span>
              的自學系統
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              沒系統學過統計也沒關係。這裡用「任務導向」帶你一步步理解研究問題、
              選對統計方法、整理資料、跑出分析，並把結果寫成論文。
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/learning-path"
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                開始建立我的統計路線 →
              </Link>
              <Link
                href="/recommend"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                用小工具推薦方法
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 網站用途說明 */}
      <Container className="py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title">這個網站適合誰？</h2>
          <p className="section-sub">
            大學生、二技生、研究新手與自學者——你需要為問卷研究、探索性研究、專題或論文
            打好統計基礎，但又不想被一堆公式勸退。我們把統計拆成「為了完成研究任務」而學。
          </p>
        </div>
      </Container>

      {/* 三個學習入口 */}
      <Container className="pb-12">
        <h2 className="section-title text-center">你現在的狀況是？</h2>
        <p className="section-sub mb-8 text-center">選一個最接近你的入口開始。</p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {entries.map((e) => (
            <Link key={e.href} href={e.href} className="block h-full">
              <Card hover className="flex h-full flex-col text-center">
                <div className="mb-3 text-4xl">{e.emoji}</div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{e.title}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
                  {e.desc}
                </p>
                <span className="text-sm font-semibold text-brand-600">{e.cta} →</span>
              </Card>
            </Link>
          ))}
        </div>
      </Container>

      {/* 學習路線概覽 */}
      <section className="bg-white py-14">
        <Container>
          <h2 className="section-title text-center">學習路線概覽</h2>
          <p className="section-sub mb-8 text-center">
            三層式設計，從基礎打底到進階建模，依你的研究需求循序前進。
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {learningPaths.map((path, idx) => (
              <Card key={path.level} className="flex h-full flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {idx + 1}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{path.level}層</h3>
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
                  {path.summary}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {path.topics.slice(0, 4).map((t) => (
                    <Badge key={t.id} color="gray">
                      {t.title}
                    </Badge>
                  ))}
                  <Badge color="brand">等 {path.topics.length} 個主題</Badge>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/learning-path"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              開始建立我的統計路線 →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
