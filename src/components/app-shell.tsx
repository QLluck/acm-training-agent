"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Code2,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Menu,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { demoActions } from "@/lib/demo-store";
import { ConfirmDialog } from "@/components/confirm-dialog";

const navigation = [
  { href: "/", label: "产品概览", en: "Overview", icon: LayoutDashboard },
  { href: "/student", label: "我的训练", en: "Training", icon: GraduationCap },
  { href: "/coach", label: "教练工作台", en: "Team workspace", icon: Users },
  {
    href: "/innovation",
    label: "产品创新",
    en: "Innovation",
    icon: FlaskConical,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState("");
  const active = navigation.find((n) =>
    n.href === "/" ? path === "/" : path.startsWith(n.href),
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="关闭导航菜单"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <Link href="/" className="brand" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark">
            <Code2 size={25} />
          </span>
          <span>
            ACM<span className="brand-sub">TRAINING AGENT</span>
          </span>
        </Link>
        <div className="workspace">
          <span className="workspace-icon">
            <GraduationCap size={20} />
          </span>
          <div>
            <strong>ACM 集训队</strong>
            <span>训练决策实验室</span>
          </div>
          <span className="live-dot" />
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav aria-label="主导航">
          {navigation.map(({ href, label, en, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item ${active?.href === href ? "active" : ""}`}
              aria-current={active?.href === href ? "page" : undefined}
            >
              <Icon size={19} />
              <span>
                {label}
                <small>{en}</small>
              </span>
              {active?.href === href && <ChevronRight size={15} />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-callout">
          <Sparkles size={20} />
          <strong>每一道题，都有训练目的。</strong>
          <p>
            数据 × 能力画像 × 教练策略
            <br />
            让训练形成持续进步的闭环。
          </p>
          <Link href="/student">
            开始今日训练 <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <div>
            <span className="live-dot" />
            本地演示 · 无需 API Key
          </div>
          <span>
            <ShieldCheck size={14} /> Prototype v0.1
          </span>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-toggle"
              aria-label="打开导航菜单"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={14} />
            <strong>{active?.label ?? "页面未找到"}</strong>
            {path.includes("session") && (
              <>
                <ChevronRight size={14} />
                <span>训练室</span>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <span className="prototype-badge">DEMO / Prototype</span>
            <button
              className="icon-button"
              title="重置演示数据"
              aria-label="重置演示数据"
              onClick={() => setResetting(true)}
            >
              <RotateCcw size={17} />
            </button>
            <span className="topbar-divider" />
            <Link
              className="role-switch"
              aria-label={
                path.startsWith("/coach") ? "切换队员视角" : "切换教练视角"
              }
              href={path.startsWith("/coach") ? "/student" : "/coach"}
            >
              {path.startsWith("/coach") ? (
                <GraduationCap size={16} />
              ) : (
                <Users size={16} />
              )}
              <span>
                {path.startsWith("/coach") ? "切换队员视角" : "切换教练视角"}
              </span>
            </Link>
            <span className="avatar small">AC</span>
          </div>
        </header>
        <main id="main" className="main-content">
          {children}
        </main>
        <footer className="footer">
          <span>
            <Activity size={14} /> ACM Training Agent · 不再盲目刷题
          </span>
          <span>
            所有训练指标均为模拟数据 <span className="footer-separator">/</span>{" "}
            AGPL-3.0
          </span>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button
            className="icon-button"
            aria-label="关闭提示"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {resetting && (
        <ConfirmDialog
          title="重新开始演示？"
          description="清除当前浏览器保存的训练记录、代码草稿、笔记和教练决策，恢复初始模拟数据。"
          cancelText="取消"
          confirmText="确认重置"
          onCancel={() => setResetting(false)}
          onConfirm={() => {
            demoActions.reset();
            setResetting(false);
            setNotice("演示数据已重置，可以重新开始。");
          }}
        />
      )}
    </div>
  );
}
