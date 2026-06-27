/**
 * 全站導覽連結設定
 * ------------------------------------------------------------------
 * 獨立成普通模組（非 "use client"），讓 Server 與 Client 元件都能安全匯入。
 * 新增頁面時在此加入一筆即可，Header 與 Footer 會自動帶出。
 */
export const navLinks = [
  { href: "/", label: "首頁" },
  { href: "/research-map", label: "研究問題地圖" },
  { href: "/learning-path", label: "學習路線" },
  { href: "/methods", label: "統計方法" },
  { href: "/survey", label: "問卷研究" },
  { href: "/tools", label: "軟體工具" },
  { href: "/templates", label: "寫作模板" },
  { href: "/cases", label: "案例庫" },
  { href: "/recommend", label: "方法推薦" },
] as const;
