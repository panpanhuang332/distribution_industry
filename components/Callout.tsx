import type { ReactNode } from "react";

type CalloutType = "tip" | "warn" | "info";

const config: Record<CalloutType, { ring: string; bg: string; label: string; icon: string }> = {
  tip: { ring: "border-emerald-200", bg: "bg-emerald-50", label: "重點提示", icon: "💡" },
  warn: { ring: "border-rose-200", bg: "bg-rose-50", label: "常見錯誤", icon: "⚠️" },
  info: { ring: "border-brand-200", bg: "bg-brand-50", label: "說明", icon: "ℹ️" },
};

/**
 * Callout：提示框，用於 highlight 重要概念或提醒。
 */
export default function Callout({
  children,
  type = "info",
  title,
}: {
  children: ReactNode;
  type?: CalloutType;
  title?: string;
}) {
  const c = config[type];
  return (
    <div className={`rounded-xl border ${c.ring} ${c.bg} p-4`}>
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span aria-hidden>{c.icon}</span>
        {title ?? c.label}
      </p>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}
