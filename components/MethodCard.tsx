import Link from "next/link";
import type { StatMethod } from "@/lib/types";
import Card from "./Card";
import Badge from "./Badge";
import DifficultyTag from "./DifficultyTag";

/**
 * MethodCard：統計方法卡片。
 * 顯示名稱、適用情境、變項類型、常用軟體、初學難度，可點擊進入詳細頁。
 */
export default function MethodCard({ method }: { method: StatMethod }) {
  return (
    <Link href={`/methods/${method.id}`} className="block h-full">
      <Card hover className="flex h-full flex-col">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{method.name}</h3>
            {method.enName && (
              <p className="text-xs text-slate-400">{method.enName}</p>
            )}
          </div>
          <DifficultyTag value={method.difficulty} />
        </div>

        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          {method.description}
        </p>

        <div className="mb-3 space-y-2 text-xs text-slate-500">
          <p>
            <span className="font-semibold text-slate-600">適用情境：</span>
            {method.researchQuestions[0]}
          </p>
          <p>
            <span className="font-semibold text-slate-600">需要變項：</span>
            {method.variableTypes.join("、")}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          <Badge color="brand">{method.level}</Badge>
          {method.tools.slice(0, 3).map((t) => (
            <Badge key={t} color="gray">
              {t}
            </Badge>
          ))}
          <span className="ml-auto text-sm font-semibold text-brand-600">
            查看教學 →
          </span>
        </div>
      </Card>
    </Link>
  );
}
