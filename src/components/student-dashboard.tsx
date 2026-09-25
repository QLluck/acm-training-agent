"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Play,
  ArrowUpRight,
  CheckCheck,
  Clock3,
  Flame,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { RadarChart, TrendChart } from "@/components/charts";
import {
  AiNote,
  DemoBadge,
  PageHeading,
  Progress,
  SectionTitle,
} from "@/components/ui";
import { defaultStudent, students, skillShortLabels } from "@/data/students";
import { useDemo, demoActions } from "@/lib/demo-store";
import { calculateSkillProfile, diagnoseStudent } from "@/lib/training";
import { TrackPicker } from "@/components/learning-controls";
import {
  accountActions,
  personalStudentId,
  useAccount,
} from "@/lib/account-store";
import { getLearningTrack } from "@/data/learning-tracks";
import { generateLearningPlan } from "@/lib/learning";
import { skillKeys } from "@/types/training";

export function StudentDashboard() {
  const state = useDemo();
  const account = useAccount();
  const track = getLearningTrack(account.profile.track);
  const [feedback, setFeedback] = useState("");
  const baseStudent =
    students.find((s) => s.id === state.studentId) ?? defaultStudent;
  const student = {
    ...baseStudent,
    name:
      baseStudent.id === personalStudentId
        ? account.profile.nickname
        : baseStudent.name,
    target: track.goal,
  };
  const results = Object.values(state.results);
  const ownResults = results.filter((r) => r.studentId === student.id);
  const profile = calculateSkillProfile(student, results);
  const diagnosis = diagnoseStudent(student, profile);
  const plan = generateLearningPlan(
    student,
    results,
    state.round,
    account.profile.track,
  );
  const completed = plan.filter((p) => p.status === "已完成").length;
  const nextItem = plan.find((p) => p.status !== "已完成") ?? plan[0];
  return (
    <div className="student-page">
      <PageHeading
        eyebrow="ONE PROBLEM AT A TIME"
        title={`${student.name}，从下一题开始。`}
        description={`${track.title} · ${track.goal}。一次不必很多，想明白一题就很好。`}
        action={<DemoBadge />}
      />
      <TrackPicker compact />
      <section className="practice-launch card">
        <span className="launch-icon">
          <Play size={23} />
        </span>
        <div>
          <span className="eyebrow">YOUR NEXT STEP</span>
          <h2>{nextItem.problem.title}</h2>
          <p>
            {nextItem.problem.tags.join(" · ")} · 预计{" "}
            {nextItem.problem.minutes} 分钟
          </p>
        </div>
        <Link
          href={`/student/session/${nextItem.problem.id}`}
          className="button primary"
        >
          {nextItem.status === "待补题" ? "继续上次练习" : "开始这一题"}
          <ArrowRight size={17} />
        </Link>
      </section>
      <section className="student-profile card">
        <div className="student-identity">
          <span className="avatar large">{student.name[0]}</span>
          <div>
            <label className="sr-only" htmlFor="student-selector">
              切换模拟学员
            </label>
            <select
              id="student-selector"
              value={student.id}
              onChange={(e) => {
                demoActions.selectStudent(e.target.value);
                setFeedback("");
              }}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id === personalStudentId
                    ? account.profile.nickname
                    : s.name}{" "}
                  · {s.level}
                </option>
              ))}
            </select>
            <p>
              <Target size={14} />
              目标：{student.target}
            </p>
          </div>
        </div>
        <div className="profile-stat">
          <span>
            {account.profile.track === "contest"
              ? "Codeforces Rating"
              : "当前方向"}
          </span>
          <strong className="purple">
            {account.profile.track === "contest" ? (
              student.cfRating
            ) : (
              <span className="profile-direction">{track.title}</span>
            )}
            <small>{account.profile.track === "contest" ? "模拟" : ""}</small>
          </strong>
        </div>
        <div className="profile-stat">
          <span>
            <Flame size={14} />
            连续训练
          </span>
          <strong>
            {student.streak}
            <small>天</small>
          </strong>
        </div>
        <div className="profile-stat">
          <span>本周完成率 · 历史快照</span>
          <strong>
            {student.completionRate}
            <small>%</small>
          </strong>
        </div>
        <div className="profile-stat">
          <span>本次演示训练</span>
          <strong>
            {ownResults.length}
            <small>次</small>
          </strong>
        </div>
      </section>
      <section className="card plan-card">
        <SectionTitle
          title={
            state.round
              ? `第 ${state.round + 1} 轮 · 个性化训练计划`
              : "今日训练计划"
          }
          subtitle={`1 道热身 · 2 道核心 · 1 道综合 · 1 道挑战 · 预计 ${plan.reduce((s, p) => s + p.problem.minutes, 0)} 分钟`}
          aside={
            <button
              className="button secondary small-button"
              onClick={() => {
                demoActions.nextRound();
                setFeedback(
                  "已根据当前能力画像和训练记录生成下一轮计划；已完成题会标为复习参考。",
                );
              }}
            >
              <RefreshCw size={15} />
              生成下一轮
            </button>
          }
        />
        <div className="plan-progress">
          <Progress value={completed * 20} label="本轮训练完成率" />
          <span>{completed} / 5 已完成</span>
        </div>
        {feedback && (
          <div role="status" className="inline-notice">
            {feedback}
          </div>
        )}
        <div className="problem-list">
          {plan.map(({ problem, stage, reason, status }, i) => (
            <article className="problem-row" key={problem.id}>
              <div
                className={`problem-index ${status === "已完成" ? "done" : ""}`}
              >
                {status === "已完成" ? (
                  <CheckCheck size={19} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </div>
              <div className="problem-main">
                <div className="problem-title-line">
                  <span className={`stage-tag stage-${stage}`}>{stage}</span>
                  <h3>{problem.title}</h3>
                  <span className="rating-tag">{problem.rating}</span>
                </div>
                <div className="problem-meta">
                  <span>{problem.platform}</span>
                  <span className="meta-divider">/</span>
                  {problem.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                  <span>
                    <Clock3 size={12} />
                    {problem.minutes} min
                  </span>
                </div>
                <p className="recommendation">
                  <Sparkles size={13} />
                  <span>
                    <b>为什么推荐：</b>
                    {reason}
                  </span>
                </p>
                <p className="training-objective">
                  训练目标：{problem.objective}
                </p>
              </div>
              <div className="problem-action">
                <button
                  type="button"
                  className={`icon-button bookmark-button ${account.bookmarks.includes(problem.id) ? "bookmarked" : ""}`}
                  aria-label={`${account.bookmarks.includes(problem.id) ? "取消收藏" : "收藏"}：${problem.title}`}
                  aria-pressed={account.bookmarks.includes(problem.id)}
                  onClick={() => accountActions.toggleBookmark(problem.id)}
                >
                  <Bookmark
                    size={16}
                    fill={
                      account.bookmarks.includes(problem.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
                <span
                  className={`status-tag ${status === "已完成" ? "success" : status === "待补题" ? "warning" : ""}`}
                >
                  <i />
                  {status}
                </span>
                <Link
                  href={`/student/session/${problem.id}`}
                  className={`button ${i === 0 ? "primary" : "secondary"} small-button`}
                >
                  {status === "待训练" ? "开始训练" : "查看训练"}
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      {state.extraStudentId === student.id && (
        <div className="coach-assignment card">
          <Target size={22} />
          <div>
            <strong>老师为你安排了单独加练</strong>
            <p>明天用 30 分钟独立重做一题薄弱专题，记录状态推导与边界检查。</p>
          </div>
        </div>
      )}
      <div className="student-insights-grid">
        <section className="card skill-card">
          <SectionTitle
            title="我的能力画像"
            subtitle="能力值 / 100 · 最近 30 天"
            aside={<span className="tag">动态更新</span>}
          />
          <RadarChart current={profile} previous={student.previousSkills} />
          <div className="skill-summary">
            <div>
              <span>优先补强</span>
              <strong className="amber">
                {skillShortLabels[diagnosis.weakest]}{" "}
                <small>{profile[diagnosis.weakest]}</small>
              </strong>
            </div>
            <div>
              <span>最稳定维度</span>
              <strong className="green">
                {skillShortLabels[diagnosis.stable]}{" "}
                <small>{profile[diagnosis.stable]}</small>
              </strong>
            </div>
          </div>
          <details className="chart-details">
            <summary>查看六维能力与 30 天变化</summary>
            <div className="skill-details-grid">
              {skillKeys.map((key) => (
                <div key={key}>
                  <span>{skillShortLabels[key]}</span>
                  <strong>
                    {profile[key]}{" "}
                    <small>+{profile[key] - student.previousSkills[key]}</small>
                  </strong>
                </div>
              ))}
            </div>
          </details>
        </section>
        <div className="student-right-insights">
          <AiNote title="今天，把重点放在真正的短板上">
            <p>{diagnosis.text}</p>
            <div className="diagnosis-tags">
              <span>能力画像</span>
              <span>近期训练轨迹</span>
              <span>训练策略</span>
            </div>
          </AiNote>
          <section className="card trend-card">
            <SectionTitle
              title="看得见的进步"
              subtitle="最近 8 周 · 综合训练指数"
              aside={
                <span className="trend-change">
                  <TrendingUp size={15} />+
                  {student.trend.at(-1)! - student.trend[0]} pts
                </span>
              }
            />
            <TrendChart values={student.trend} />
          </section>
        </div>
      </div>
      <div className="bottom-advice">
        <Sparkles size={20} />
        <div>
          <strong>AI 训练建议</strong>
          <p>
            {profile.dp < 60
              ? `暂时不要继续增加 DP 难度。先提高 ${Math.max(1000, Math.floor(student.cfRating / 100) * 100 - 100)}–${Math.max(1000, Math.floor(student.cfRating / 100) * 100 - 100) + 200} 难度题的独立完成率，再进入更高难度。`
              : `优先补强${skillShortLabels[diagnosis.weakest]}，完成一次无提示变式练习后再增加难度。`}
            每次训练结束，花 3 分钟写下“我为什么卡住”。
          </p>
        </div>
        <Link href="/innovation" aria-label="了解学习方法">
          <ArrowRight size={20} />
        </Link>
      </div>
      {ownResults.length > 0 && (
        <section className="card history-card">
          <SectionTitle
            title="本次演示 · 训练记录"
            subtitle="本地保存；本周历史快照与本次记录分别展示"
          />
          <div className="history-list">
            {ownResults.map((r) => (
              <div key={r.problemId}>
                <CheckCheck size={17} />
                <strong>题目 #{r.problemId}</strong>
                <span>
                  {r.outcome === "ac" ? "已标记 AC" : "待补题"} · Hint{" "}
                  {r.hintLevel}
                </span>
                <span>{r.nextStep}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
