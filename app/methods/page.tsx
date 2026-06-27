"use client";

import { useState } from "react";
import Container from "@/components/Container";
import MethodCard from "@/components/MethodCard";
import { methods } from "@/data/methods";
import type { Level } from "@/lib/types";

const levels: ("全部" | Level)[] = ["全部", "基礎", "進階", "高級"];

/**
 * 統計方法總覽頁
 * ------------------------------------------------------------------
 * 列出所有方法卡片，可依層級篩選。點卡片進入 /methods/[id] 詳細頁。
 */
export default function MethodsPage() {
  const [level, setLevel] = useState<"全部" | Level>("全部");

  const filtered =
    level === "全部" ? methods : methods.filter((m) => m.level === level);

  return (
    <Container className="py-10">
      <header className="mb-6 max-w-3xl">
        <h1 className="section-title">統計方法總覽</h1>
        <p className="section-sub">
          每個方法都有完整教學：適用情境、變項類型、判讀重點、論文範例句與常見錯誤。
        </p>
      </header>

      {/* 層級篩選 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {levels.map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => setLevel(lv)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              level === lv
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {lv}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <MethodCard key={m.id} method={m} />
        ))}
      </div>
    </Container>
  );
}
