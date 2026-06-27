import Link from "next/link";
import Container from "./Container";
import { navLinks } from "@/lib/nav";

/**
 * Footer：頁尾，含網站說明、快速連結與免責聲明。
 */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <Container className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
        <div>
          <p className="text-sm font-bold text-slate-900">論文統計自學系統</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            從研究問題到論文數據分析的自學系統。給大學生、二技生、研究新手與自學者，
            以任務導向的方式學會選擇與運用統計方法。
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">快速連結</p>
          <ul className="grid grid-cols-2 gap-1 text-sm text-slate-500">
            {navLinks.slice(1).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">使用提醒</p>
          <p className="text-sm leading-relaxed text-slate-500">
            本站內容為教學用途之示意，實際分析請依研究設計、資料特性與指導老師建議調整。
            數據與範例皆為模擬，僅供學習參考。
          </p>
        </div>
      </Container>
      <div className="border-t border-slate-200 py-4">
        <Container>
          <p className="text-center text-xs text-slate-400">
            © {""}
            {/* 年份以靜態文字呈現，避免水合不一致 */}
            2026 論文統計自學系統 · MVP 版本
          </p>
        </Container>
      </div>
    </footer>
  );
}
