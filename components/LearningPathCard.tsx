import Link from "next/link";
import type { LearningTopic } from "@/lib/types";
import Card from "./Card";
import DifficultyTag from "./DifficultyTag";

/**
 * LearningPathCard：學習路線中的單一主題卡片。
 * 顯示學習目標、適合程度、難度、前置知識與論文用途。
 */
export default function LearningPathCard({ topic }: { topic: LearningTopic }) {
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900">{topic.title}</h3>
        <DifficultyTag value={topic.difficulty} />
      </div>

      <p className="mb-3 text-sm leading-relaxed text-slate-600">
        <span className="font-semibold text-slate-700">學習目標：</span>
        {topic.goal}
      </p>

      <dl className="mb-3 grid grid-cols-1 gap-1 text-xs text-slate-500">
        <div>
          <dt className="inline font-semibold text-slate-600">適合程度：</dt>
          <dd className="inline"> {topic.audience}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-slate-600">前置知識：</dt>
          <dd className="inline"> {topic.prerequisites.join("、")}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-slate-600">論文用途：</dt>
          <dd className="inline"> {topic.paperUsage}</dd>
        </div>
      </dl>

      {topic.methodId && (
        <Link
          href={`/methods/${topic.methodId}`}
          className="mt-auto text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          看方法教學 →
        </Link>
      )}
    </Card>
  );
}
