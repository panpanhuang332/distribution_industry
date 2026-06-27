import type { WritingTemplate } from "@/lib/types";
import Card from "./Card";

/**
 * TemplateBlock：論文寫作模板區塊。
 * 顯示使用情境、統計表重點、論文句型、範例段落與注意事項。
 */
export default function TemplateBlock({ template }: { template: WritingTemplate }) {
  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{template.title}</h3>
        <p className="text-sm text-slate-500">{template.scenario}</p>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-slate-700">統計表重點</p>
        <div className="flex flex-wrap gap-1.5">
          {template.tableFocus.map((t) => (
            <span
              key={t}
              className="rounded-md bg-brand-50 px-2 py-0.5 text-xs text-brand-700 ring-1 ring-inset ring-brand-200"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-slate-700">論文句型</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          {template.sentencePatterns.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-slate-700">範例段落</p>
        <blockquote className="rounded-lg border-l-4 border-brand-400 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
          {template.example}
        </blockquote>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-rose-700">注意事項</p>
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-600">
          {template.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
