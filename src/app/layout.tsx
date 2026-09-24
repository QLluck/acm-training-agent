import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
import "./readability.css";

export const metadata: Metadata = {
  title: {
    default: "ACM Training Agent · 不再盲目刷题",
    template: "%s | ACM Training Agent",
  },
  description:
    "面向高校 ACM / 算法竞赛集训队的 AI 个性化训练与教练辅助系统。无需 API Key 的交互式产品 Demo。",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
