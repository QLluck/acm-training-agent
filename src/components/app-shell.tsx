"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Code2,
  Compass,
  GraduationCap,
  LockKeyhole,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { demoActions } from "@/lib/demo-store";
import {
  accountActions,
  personalStudentId,
  useAccount,
} from "@/lib/account-store";
import { getLearningTrack } from "@/data/learning-tracks";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AccountAvatar } from "@/components/learning-controls";

const navigation = [
  { href: "/", label: "学习空间", en: "Workspace", icon: Compass },
  { href: "/student", label: "开始练习", en: "Practice", icon: Code2 },
  { href: "/coach", label: "教学工作台", en: "Teaching", icon: GraduationCap },
  { href: "/account", label: "个人中心", en: "My account", icon: UserRound },
  {
    href: "/innovation",
    label: "学习方法",
    en: "How it works",
    icon: Sparkles,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { profile, sidebarCollapsed } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState("");
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const active = navigation.find((n) =>
    n.href === "/" ? path === "/" : path.startsWith(n.href),
  );
  useEffect(() => {
    if (!mobileOpen) return;
    const returnFocusTo = menuButton.current;
    sidebar.current?.querySelector<HTMLButtonElement>(".mobile-close")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
      if (event.key === "Tab") {
        const items = sidebar.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
        const visible = Array.from(items ?? []).filter(
          (item) => item.getClientRects().length,
        );
        if (event.shiftKey && document.activeElement === visible[0]) {
          event.preventDefault();
          visible.at(-1)?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === visible.at(-1)
        ) {
          event.preventDefault();
          visible[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      // React has removed inert before passive effect cleanup restores focus.
      returnFocusTo?.focus();
    };
  }, [mobileOpen]);
  return (
    <div
      className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${!profile.gentleMotion ? "still-interface" : ""}`}
    >
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="关闭导航菜单"
          onClick={() => {
            setMobileOpen(false);
          }}
        />
      )}
      <aside
        ref={sidebar}
        id="workspace-sidebar"
        className={`sidebar ${mobileOpen ? "open" : ""}`}
        aria-label="工作区导航"
      >
        <div className="sidebar-brand-row">
          <Link
            href="/"
            className="brand"
            aria-label="练序 · 学习空间"
            onClick={() => setMobileOpen(false)}
          >
            <span className="brand-mark">
              <Code2 size={25} />
            </span>
            <span className="brand-name">
              练序<span className="brand-sub">CODEPATH</span>
            </span>
          </Link>
          <button
            type="button"
            className="icon-button mobile-close"
            aria-label="收起导航菜单"
            onClick={() => {
              setMobileOpen(false);
            }}
          >
            <X size={19} />
          </button>
        </div>
        <div className="workspace">
          <span className="workspace-icon">
            <LockKeyhole size={17} />
          </span>
          <div>
            <strong>我的个人空间</strong>
            <span>{getLearningTrack(profile.track).title} · 自己的节奏</span>
          </div>
        </div>
        <div className="nav-caption">LEARN AT YOUR PACE</div>
        <nav aria-label="主导航">
          {navigation.map(({ href, label, en, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${active?.href === href ? "active" : ""}`}
              title={sidebarCollapsed ? label : undefined}
              aria-label={label}
              aria-current={active?.href === href ? "page" : undefined}
              onClick={() => {
                setMobileOpen(false);
                if (href === "/student")
                  demoActions.selectStudent(personalStudentId);
              }}
            >
              <Icon size={20} />
              <span className="nav-label">
                {label}
                <small>{en}</small>
              </span>
              {active?.href === href && <span className="nav-active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-callout">
          <span className="callout-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <strong>留一点时间，给自己的进步。</strong>
          <p>
            每天 {profile.dailyMinutes} 分钟。
            <br />
            今天，从一道题开始。
          </p>
          <Link
            href="/student"
            onClick={() => {
              demoActions.selectStudent(personalStudentId);
              setMobileOpen(false);
            }}
          >
            去练一题 <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <Link
            href="/account"
            className="sidebar-person"
            aria-label="打开个人中心"
            title={sidebarCollapsed ? "个人中心" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <AccountAvatar avatar={profile.avatar} />
            <span>
              <strong>{profile.nickname}</strong>
              <small>个人学习账户</small>
            </span>
            <ChevronRight size={15} />
          </Link>
          <button
            type="button"
            className="sidebar-collapse"
            aria-label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
            aria-expanded={!sidebarCollapsed}
            aria-controls="workspace-sidebar"
            title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
            onClick={accountActions.toggleSidebar}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
            <span>收起侧边栏</span>
          </button>
        </div>
      </aside>
      <div className="app-main" inert={mobileOpen || undefined}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              ref={menuButton}
              type="button"
              className="icon-button menu-toggle"
              aria-label="打开导航菜单"
              aria-expanded={mobileOpen}
              aria-controls="workspace-sidebar"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-root">我的空间</span>
            <ChevronRight size={14} />
            <strong>{active?.label ?? "页面未找到"}</strong>
            {path.includes("session") && (
              <>
                <ChevronRight size={14} />
                <span>专注练习</span>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <span className="prototype-badge">交互演示</span>
            <button
              type="button"
              className="icon-button"
              title="重置演示数据"
              aria-label="重置演示数据"
              onClick={() => setResetting(true)}
            >
              <RotateCcw size={16} />
            </button>
            <span className="topbar-divider" />
            <Link
              className="header-account"
              href="/account"
              aria-label="进入个人中心"
            >
              <AccountAvatar avatar={profile.avatar} size="small" />
              <span>{profile.nickname}</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </header>
        <main id="main" className="main-content">
          {children}
        </main>
        <footer className="footer">
          <span>
            <Code2 size={14} />
            练序 CodePath · 让每一次练习都有方向
          </span>
          <span>Demo · 示例内容与模拟评估</span>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button
            type="button"
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
          description="清除当前浏览器中的练习记录、资料、收藏和教学安排，恢复初始体验。"
          cancelText="保留数据"
          confirmText="确认重置"
          onCancel={() => setResetting(false)}
          onConfirm={() => {
            demoActions.reset();
            accountActions.reset();
            setResetting(false);
            setNotice("已恢复初始体验。");
          }}
        />
      )}
    </div>
  );
}
