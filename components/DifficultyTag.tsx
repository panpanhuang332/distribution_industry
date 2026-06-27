import type { Difficulty, Level } from "@/lib/types";

/**
 * DifficultyTag：難度或層級標籤，用顏色直觀區分。
 * 同時支援 Difficulty（入門/中等/困難）與 Level（基礎/進階/高級）。
 */
const styles: Record<string, string> = {
  入門: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  中等: "bg-amber-50 text-amber-700 ring-amber-200",
  困難: "bg-rose-50 text-rose-700 ring-rose-200",
  基礎: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  進階: "bg-amber-50 text-amber-700 ring-amber-200",
  高級: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function DifficultyTag({ value }: { value: Difficulty | Level }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        styles[value] ?? "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {value}
    </span>
  );
}
