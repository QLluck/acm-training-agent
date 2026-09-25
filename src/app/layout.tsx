import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
import "./workspace.css";

export const metadata: Metadata = {
  title: {
    default: "练序 CodePath · 让每一次练习都有方向",
    template: "%s | 练序 CodePath",
  },
  description:
    "面向编程学习、算法竞赛、考研 408、求职面试与课堂教学的个人练习空间。交互式产品 Demo。",
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
