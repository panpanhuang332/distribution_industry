import type { Metadata } from "next";
import Container from "@/components/Container";
import Callout from "@/components/Callout";
import ToolComparisonCard from "@/components/ToolComparisonCard";
import { tools } from "@/data/tools";

export const metadata: Metadata = {
  title: "軟體工具比較",
  description: "比較 SPSS、Jamovi、JASP、R、Python、AMOS、Mplus、SmartPLS、G*Power 等統計軟體。",
};

/**
 * 軟體工具頁
 * ------------------------------------------------------------------
 * 比較常用統計軟體，並給出新手選擇建議。
 */
export default function ToolsPage() {
  return (
    <Container className="py-10">
      <header className="mb-6 max-w-3xl">
        <h1 className="section-title">軟體工具比較</h1>
        <p className="section-sub">
          沒有「最好」的軟體，只有「最適合你現在需求」的軟體。先看下方建議再挑選。
        </p>
      </header>

      <Callout type="info" title="怎麼選？快速建議">
        <ul className="list-disc space-y-1 pl-5">
          <li>初學者：從 <strong>Jamovi</strong> 或 <strong>JASP</strong> 開始，免費又好上手。</li>
          <li>問卷論文：<strong>SPSS</strong> 最常見；做 SEM 可搭配 <strong>AMOS</strong>。</li>
          <li>長期研究能力：建議學 <strong>R</strong>，可重現、能力天花板最高。</li>
          <li>資料科學與機器學習：選 <strong>Python</strong>。</li>
          <li>估計樣本數與統計力：用 <strong>G*Power</strong>。</li>
        </ul>
      </Callout>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolComparisonCard key={t.id} tool={t} />
        ))}
      </div>
    </Container>
  );
}
