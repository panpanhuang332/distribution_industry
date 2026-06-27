import type { ReactNode } from "react";

/**
 * Card：通用卡片容器，整站卡片式設計的基礎。
 * hover 為 true 時加上滑鼠移入的浮起效果（用於可點擊卡片）。
 */
export default function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-card ${
        hover ? "transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
