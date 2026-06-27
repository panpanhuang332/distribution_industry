import type { ToolInfo } from "@/lib/types";
import Card from "./Card";
import Badge from "./Badge";
import DifficultyTag from "./DifficultyTag";

/** 把 1~5 的推薦程度轉成星星字串 */
function stars(n: number): string {
  return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
}

/**
 * ToolComparisonCard：統計軟體比較卡片。
 */
export default function ToolComparisonCard({ tool }: { tool: ToolInfo }) {
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900">{tool.name}</h3>
        <div className="flex flex-col items-end gap-1">
          <Badge color={tool.free ? "green" : "gray"}>
            {tool.free ? "免費" : "付費"}
          </Badge>
          <DifficultyTag value={tool.learningCurve} />
        </div>
      </div>

      <p className="mb-1 text-sm text-amber-500" title={`推薦程度 ${tool.rating}/5`}>
        {stars(tool.rating)}
      </p>

      <p className="mb-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-700">適合誰：</span>
        {tool.bestFor}
      </p>

      <div className="mb-3">
        <p className="mb-1 text-xs font-semibold text-slate-600">適合做的分析</p>
        <div className="flex flex-wrap gap-1.5">
          {tool.goodAt.map((g) => (
            <Badge key={g} color="brand">
              {g}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
        <div>
          <p className="mb-1 font-semibold text-emerald-700">優點</p>
          <ul className="list-disc space-y-0.5 pl-4 text-slate-600">
            {tool.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-semibold text-rose-700">缺點</p>
          <ul className="list-disc space-y-0.5 pl-4 text-slate-600">
            {tool.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {tool.note && (
        <p className="mt-auto rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
          💡 {tool.note}
        </p>
      )}
    </Card>
  );
}
