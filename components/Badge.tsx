import type { ReactNode } from "react";

type BadgeColor = "brand" | "accent" | "green" | "gray" | "purple";

const colorMap: Record<BadgeColor, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  accent: "bg-accent-50 text-accent-600 ring-accent-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
};

/**
 * Badge：小標籤，用於標示層級、軟體、分類等。
 */
export default function Badge({
  children,
  color = "gray",
}: {
  children: ReactNode;
  color?: BadgeColor;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colorMap[color]}`}
    >
      {children}
    </span>
  );
}
