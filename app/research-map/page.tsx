"use client";

import { useMemo, useState } from "react";
import Container from "@/components/Container";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import MethodCard from "@/components/MethodCard";
import { questionMap, getQuestionCategories } from "@/data/questionMap";
import { getMethodById } from "@/data/methods";

/**
 * 研究問題地圖頁
 * ------------------------------------------------------------------
 * 互動式選擇器：左側選擇研究意圖，右側顯示對應方法卡片。
 * 上方可用分類篩選不同類型的研究問題。
 */
export default function ResearchMapPage() {
  const categories = getQuestionCategories();
  const [category, setCategory] = useState<string>("全部");
  const [selectedId, setSelectedId] = useState<string>(questionMap[0].id);

  // 依分類篩選研究意圖
  const filtered = useMemo(
    () =>
      category === "全部"
        ? questionMap
        : questionMap.filter((q) => q.category === category),
    [category]
  );

  // 目前選到的意圖與對應方法
  const selected = questionMap.find((q) => q.id === selectedId) ?? filtered[0];
  const method = selected ? getMethodById(selected.methodId) : undefined;

  return (
    <Container className="py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="section-title">研究問題地圖</h1>
        <p className="section-sub">
          先別急著想用哪個統計。從「我想做什麼」出發，點選最接近你研究目的的問題，
          系統會帶出可能適合的統計方法與教學。
        </p>
      </header>

      {/* 分類篩選 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["全部", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              category === c
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 左側：研究意圖清單 */}
        <div className="space-y-2 lg:col-span-2">
          {filtered.map((q) => {
            const active = q.id === selectedId;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedId(q.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-brand-400 bg-brand-50 ring-1 ring-brand-300"
                    : "border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">{q.intent}</span>
                  <Badge color="accent">{q.category}</Badge>
                </div>
                <p className="text-xs text-slate-500">{q.scenario}</p>
              </button>
            );
          })}
        </div>

        {/* 右側：對應方法 */}
        <div className="lg:col-span-3">
          {method ? (
            <div className="space-y-4">
              <Card className="bg-brand-50/60">
                <p className="text-sm text-slate-500">你的研究意圖</p>
                <p className="text-lg font-bold text-slate-900">{selected?.intent}</p>
                <p className="mt-2 text-sm text-slate-600">
                  推薦方法：
                  <span className="font-semibold text-brand-700">{method.name}</span>
                </p>
              </Card>
              <MethodCard method={method} />
            </div>
          ) : (
            <Card>
              <p className="text-slate-500">請從左側選擇一個研究問題。</p>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}
