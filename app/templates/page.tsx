import type { Metadata } from "next";
import Container from "@/components/Container";
import Callout from "@/components/Callout";
import TemplateBlock from "@/components/TemplateBlock";
import { templates } from "@/data/templates";

export const metadata: Metadata = {
  title: "論文寫作模板",
  description: "把統計結果寫成論文段落：描述統計、信度、t 檢定、ANOVA、相關、迴歸、EFA 的句型與範例。",
};

/**
 * 論文寫作模板頁
 * ------------------------------------------------------------------
 * 提供「統計結果怎麼寫成論文段落」的句型與範例。
 */
export default function TemplatesPage() {
  return (
    <Container className="py-10">
      <header className="mb-6 max-w-3xl">
        <h1 className="section-title">論文寫作模板</h1>
        <p className="section-sub">
          跑完統計後最大的關卡，是把輸出表格寫成論文段落。以下提供句型與範例，照樣造句即可。
        </p>
      </header>

      <Callout type="warn" title="使用提醒">
        範例中的數字皆為示意，請務必替換成你自己的實際統計結果，並遵循系所或期刊的格式規範
        （如 APA 第 7 版）。
      </Callout>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {templates.map((t) => (
          <TemplateBlock key={t.id} template={t} />
        ))}
      </div>
    </Container>
  );
}
