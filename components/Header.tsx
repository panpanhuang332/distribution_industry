"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Container from "./Container";
import { navLinks } from "@/lib/nav";

/**
 * Header：頂部品牌列 + 響應式導覽。
 * 桌機顯示橫向 Navbar；手機收合為漢堡選單。
 */
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /** 判斷是否為目前頁面（首頁需精確比對） */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            統
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold text-slate-900">論文統計自學系統</span>
            <span className="hidden text-[11px] text-slate-400 sm:block">
              從研究問題到論文數據分析
            </span>
          </span>
        </Link>

        {/* 桌機導覽 */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
                isActive(link.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 手機漢堡按鈕 */}
        <button
          type="button"
          aria-label="開啟選單"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-md text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </Container>

      {/* 手機展開選單 */}
      {open && (
        <nav className="border-t border-slate-200 bg-white lg:hidden">
          <Container className="grid grid-cols-2 gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </nav>
      )}
    </header>
  );
}
