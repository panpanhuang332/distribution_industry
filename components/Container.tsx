import type { ReactNode } from "react";

/**
 * Container：統一頁面最大寬度與左右留白，維持版面一致。
 */
export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-content px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
