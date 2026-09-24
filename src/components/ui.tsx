import type { ReactNode } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {aside}
    </div>
  );
}

export function Metric({
  label,
  value,
  unit,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  detail: string;
  icon?: ReactNode;
}) {
  return (
    <div className="metric card">
      <div className="metric-label">
        {label}
        {icon}
      </div>
      <div className="metric-value">
        {value}
        <span>{unit}</span>
      </div>
      <div className="metric-detail">
        <ArrowUpRight size={14} />
        {detail}
      </div>
    </div>
  );
}

export function AiNote({
  title = "AI 训练诊断",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="ai-note">
      <span className="ai-icon">
        <Sparkles size={19} />
      </span>
      <div>
        <strong>
          {title}
          <span className="tiny-tag">预设模拟</span>
        </strong>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="badge demo-badge">
      <span />
      DEMO DATA · 模拟数据
    </span>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
