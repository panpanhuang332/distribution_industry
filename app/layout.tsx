import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 全站 metadata（SEO 與分頁標題）
 */
export const metadata: Metadata = {
  title: {
    default: "論文統計自學系統｜從研究問題到論文數據分析",
    template: "%s｜論文統計自學系統",
  },
  description:
    "給大學生、研究新手與自學者的論文統計任務導向學習系統：依研究問題找方法、規劃學習路線、看懂統計結果、撰寫論文段落。",
};

/**
 * RootLayout：包裹所有頁面，提供 Header / 內容區 / Footer 的固定骨架。
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant-TW">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
