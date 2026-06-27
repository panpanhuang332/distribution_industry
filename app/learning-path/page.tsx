import type { Metadata } from "next";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import LearningPathCard from "@/components/LearningPathCard";
import { learningPaths } from "@/data/learningPaths";

export const metadata: Metadata = {
  title: "學習路線",
  description: "三層式統計學習路線：基礎、進階、高級，每個主題含學習目標、難度與論文用途。",
};

/** 每一層的視覺色彩 */
const levelColor: Record<string, "green" | "accent" | "purple"> = {
  基礎: "green",
  進階: "accent",
  高級: "purple",
};

/**
 * 學習路線頁
 * ------------------------------------------------------------------
 * 依基礎／進階／高級三層呈現所有主題，每個主題以卡片顯示完整資訊。
 */
export default function LearningPathPage() {
  return (
    <Container className="py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="section-title">學習路線</h1>
        <p className="section-sub">
          三層式設計，幫你規劃從零到能獨立完成論文分析的路徑。
          建議依序前進，但你也可以依研究需求挑選主題。
        </p>
      </header>

      <div className="space-y-12">
        {learningPaths.map((path, idx) => (
          <section key={path.level} id={path.level}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {idx + 1}
              </span>
              <h2 className="text-2xl font-bold text-slate-900">{path.level}層</h2>
              <Badge color={levelColor[path.level]}>{path.topics.length} 個主題</Badge>
            </div>
            <Card className="mb-5 bg-slate-50/80">
              <p className="text-sm leading-relaxed text-slate-600">{path.summary}</p>
            </Card>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {path.topics.map((topic) => (
                <LearningPathCard key={topic.id} topic={topic} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
