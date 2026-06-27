import type { Config } from "tailwindcss";

/**
 * Tailwind 設定
 * - content：掃描 app 與 components 內的 class
 * - 自訂品牌色（學術風：靛藍主色 + 暖色強調），方便整站一致
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd2ff",
          300: "#8eb4ff",
          400: "#598bff",
          500: "#3563eb", // 主色
          600: "#2449c9",
          700: "#1f3aa3",
          800: "#1f3382",
          900: "#1f2f6b",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      fontFamily: {
        sans: [
          '"PingFang TC"',
          '"Microsoft JhengHei"',
          '"Noto Sans TC"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.06)",
      },
      maxWidth: {
        content: "1140px",
      },
    },
  },
  plugins: [],
};

export default config;
