"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Crosshair,
  Download,
  Info,
  LockKeyhole,
  Plus,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  AiNote,
  DemoBadge,
  Metric,
  PageHeading,
  SectionTitle,
} from "@/components/ui";
import { students, skillShortLabels } from "@/data/students";
import { weeklyPlan } from "@/data/weekly-plan";
import { useDemo, demoActions } from "@/lib/demo-store";
import {
  calculateSkillProfile,
  getWatchlist,
  recommendTeamFocus,
  teamOverview,
} from "@/lib/training";
import { useAccount, personalStudentId } from "@/lib/account-store";
import { skillKeys } from "@/types/training";

export function CoachDashboard() {
  const state = useDemo();
  const { profile: accountProfile } = useAccount();
  const classroomStudents = students.map((s) =>
    s.id === personalStudentId ? { ...s, name: accountProfile.nickname } : s,
  );
  const visibleStudents = classroomStudents.filter(
    (s) => s.id !== personalStudentId || accountProfile.shareProgress,
  );
  const results = Object.values(state.results).filter(
    (r) => r.studentId !== personalStudentId || accountProfile.shareProgress,
  );
  const overview = teamOverview(visibleStudents, results);
  const focus = recommendTeamFocus(visibleStudents, results);
  const watchlist = getWatchlist(visibleStudents);
  const [level, setLevel] = useState("全部学员");
  const [notice, setNotice] = useState("");
  const [topic, setTopic] = useState("图上状态设计");
  const [extraStudent, setExtraStudent] = useState("zhou");
  const [difficulty, setDifficulty] = useState("-100");
  const team = classroomStudents.filter(
    (s) => level === "全部学员" || s.level === level,
  );
  const accepted = state.decisions.some((d) => d.kind === "accept");

  function exportPlan() {
    const content = [
      "练序 CodePath · 模拟教学计划",
      `目标难度调整：${state.difficulty >= 0 ? "+" : ""}${state.difficulty}`,
      ...weeklyPlan.map(
        (p) => `${p.day}：${p.title}（${p.minutes} 分钟）\n原因：${p.reason}`,
      ),
      state.topic ? `全班追加专题：${state.topic}` : "",
      state.extraStudentId
        ? `单独加练：${students.find((s) => s.id === state.extraStudentId)?.name}`
        : "",
      "决策记录：",
      ...state.decisions.map((d) => d.text),
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "acm-weekly-plan-demo.txt";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("模拟周计划已导出。");
  }

  return (
    <>
      <PageHeading
        eyebrow="TEACHING / LEARNING TOGETHER"
        title="看见每个学生的下一步。"
        description="编程训练示例班 · 分层练习与课后巩固 · 模拟数据"
        action={
          <div className="heading-actions">
            <DemoBadge />
            <button
              className="button secondary small-button"
              onClick={exportPlan}
            >
              <Download size={15} />
              导出周计划
            </button>
          </div>
        }
      />
      <div className="metrics-grid">
        <Metric
          label="学员人数"
          value={students.length}
          unit="人"
          detail={`${visibleStudents.length} 位已共享学习进度`}
          icon={<Users size={17} />}
        />
        <Metric
          label="本周训练完成率"
          value={overview.completion}
          unit="%"
          detail="历史周计划快照"
          icon={<Check size={17} />}
        />
        <Metric
          label="本周提交数"
          value={overview.submissions}
          detail={`含本次演示 ${results.length} 条结果`}
          icon={<Crosshair size={17} />}
        />
        <Metric
          label="平均首次 AC 率"
          value={overview.firstAc}
          unit="%"
          detail="历史提交统计"
          icon={<TrendingUp size={17} />}
        />
        <Metric
          label="人均训练时长"
          value={overview.hours}
          unit="h"
          detail="历史周训练统计"
          icon={<Clock3 size={17} />}
        />
        <Metric
          label="本周进步人数"
          value={overview.improved}
          unit="人"
          detail="本周指数高于上周"
          icon={<ArrowUpRight size={17} />}
        />
      </div>
      <AiNote title="本周老师简报">
        <p>
          全班优先补强 <strong>{focus[0].label}</strong> 与{" "}
          <strong>{focus[1].label}</strong>，分别有 {focus[0].below60} 人、
          {focus[1].below60} 人能力值低于 60。建议先补齐组合计数，再练计数
          DP；同时关注 {watchlist.length} 名学员的训练节奏。
        </p>
      </AiNote>
      <div className="coach-analysis-grid">
        <section className="card heatmap-card">
          <SectionTitle
            title="全班能力热力图"
            subtitle="每行是一名学员，每列是一项能力 · 点击姓名查看个人画像"
            aside={
              <label className="filter-select">
                <span className="sr-only">筛选学员层级</span>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  {["全部学员", "新人组", "进阶组", "主力组"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            }
          />
          <div className="heatmap-scroll">
            <table className="heatmap">
              <caption className="sr-only">
                模拟学员的六维能力值，0 到 100。颜色越深表示能力值越高。
              </caption>
              <thead>
                <tr>
                  <th scope="col">学员 / 参考等级</th>
                  {["DP", "Graph", "Math", "Greedy", "DS", "Impl."].map(
                    (label) => (
                      <th scope="col" key={label}>
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {team.map((student) => {
                  const profile = calculateSkillProfile(student, results);
                  if (
                    student.id === personalStudentId &&
                    !accountProfile.shareProgress
                  )
                    return (
                      <tr key={student.id} className="private-student-row">
                        <th scope="row">
                          <span>
                            <LockKeyhole size={14} />
                            个人账户<small>尚未分享进度</small>
                          </span>
                        </th>
                        {skillKeys.map((key) => (
                          <td key={key}>
                            <span
                              className="heat-cell masked-cell"
                              aria-label="未共享"
                            >
                              —
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  return (
                    <tr key={student.id}>
                      <th scope="row">
                        <Link
                          href="/student"
                          onClick={() => demoActions.selectStudent(student.id)}
                        >
                          <span
                            className={`avatar tiny level-${student.level}`}
                          >
                            {student.name[0]}
                          </span>
                          <span>
                            {student.name}
                            <small>{student.cfRating}</small>
                          </span>
                          <ChevronRight size={12} />
                        </Link>
                      </th>
                      {skillKeys.map((key) => (
                        <td key={key}>
                          <span
                            className={`heat-cell heat-${profile[key] < 40 ? 1 : profile[key] < 55 ? 2 : profile[key] < 70 ? 3 : profile[key] < 85 ? 4 : 5}`}
                            title={`${student.name} · ${skillShortLabels[key]} ${profile[key]}/100`}
                          >
                            {profile[key]}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="heatmap-legend">
            <span>当前展示 {team.length} / 12 名学员</span>
            <div>
              待补强 <i className="heat-1" />
              <i className="heat-2" />
              <i className="heat-3" />
              <i className="heat-4" />
              <i className="heat-5" /> 熟练
            </div>
          </div>
        </section>
        <div className="coach-side-analysis">
          <section className="card weakness-card">
            <SectionTitle
              title="共同薄弱点"
              subtitle="按已共享进度的学员均值排序"
              aside={<Crosshair size={18} className="purple" />}
            />
            <div className="weakness-bars">
              {focus.slice(0, 3).map((f, i) => (
                <div key={f.key}>
                  <div>
                    <span>
                      <b>0{i + 1}</b>
                      {f.key === "dp"
                        ? "计数 DP"
                        : f.key === "math"
                          ? "组合数学"
                          : f.key === "graph"
                            ? "图上状态设计"
                            : f.label}
                    </span>
                    <strong>
                      {f.average}
                      <small>/100</small>
                    </strong>
                  </div>
                  <div className="weakness-track">
                    <span style={{ width: `${f.average}%` }} />
                  </div>
                  <p>{f.below60} 名学员低于 60 · 建议分层补强</p>
                </div>
              ))}
            </div>
            <div className="info-note">
              <Info size={14} />
              <span>能力均值用于定位专题，具体题目仍根据个人画像安排。</span>
            </div>
          </section>
          <section className="card watchlist-card">
            <SectionTitle
              title="需要关注的学员"
              subtitle="从数据中发现需要介入的时刻"
              aside={<span className="count-badge">{watchlist.length}</span>}
            />
            <div className="watchlist">
              {watchlist.map(({ student, reason }) => (
                <Link
                  href="/student"
                  onClick={() => demoActions.selectStudent(student.id)}
                  key={student.id}
                >
                  <span className="avatar small">{student.name[0]}</span>
                  <div>
                    <strong>
                      {student.name}
                      <small>{student.level}</small>
                    </strong>
                    <p>{reason}</p>
                  </div>
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
      <section className="card weekly-plan">
        <SectionTitle
          title="下一周，建议这样练"
          subtitle="先补基础 → 专项迁移 → 模拟赛验证 → 复盘回流"
          aside={
            <span className={`tag ${accepted ? "green-tag" : "purple-tag"}`}>
              <CalendarDays size={14} />
              {accepted ? "老师已接受" : "AI 建议 · 待老师决策"}
            </span>
          }
        />
        <div className="weekly-grid">
          {weeklyPlan.map((p) => (
            <article key={p.day} className={`weekly-day ${p.color}`}>
              <div className="day-header">
                <strong>{p.day}</strong>
                <span>{p.date}</span>
              </div>
              <span className="day-type">{p.type}</span>
              <h3>{p.title}</h3>
              <p>{p.reason}</p>
              <div className="weekly-footer">
                <Clock3 size={13} />
                {p.minutes} min
              </div>
            </article>
          ))}
        </div>
        {(state.topic || state.difficulty !== 0 || state.extraStudentId) && (
          <div className="plan-adjustments">
            <strong>
              <SlidersHorizontal size={16} />
              老师调整已应用
            </strong>
            {state.difficulty !== 0 && (
              <span>
                题目目标难度整体 {state.difficulty > 0 ? "+" : ""}
                {state.difficulty}（Rating 档位）
              </span>
            )}
            {state.topic && <span>周五追加专题：{state.topic} · 45 min</span>}
            {state.extraStudentId && (
              <span>
                {students.find((s) => s.id === state.extraStudentId)?.name}
                ：明日单独补强 · 30 min
              </span>
            )}
          </div>
        )}
      </section>
      <section className="card decision-panel">
        <SectionTitle
          title="训练安排，由老师做最后决策"
          subtitle="每一次调整都可追踪；演示决策保存在当前浏览器"
          aside={<span className="tag">COACH IN CONTROL</span>}
        />
        <div className="decision-grid">
          <div>
            <span className="decision-icon">
              <Check size={20} />
            </span>
            <h3>接受建议计划</h3>
            <p>确认上述安排作为下周的训练计划。</p>
            <button
              className="button primary full-width"
              disabled={accepted}
              onClick={() => {
                demoActions.decide("accept", "已接受 AI 建议的下周训练计划");
                setNotice("已接受建议，周计划状态已更新。");
              }}
            >
              {accepted ? "已接受建议" : "接受建议"}
            </button>
          </div>
          <div>
            <span className="decision-icon">
              <SlidersHorizontal size={20} />
            </span>
            <h3>调整训练难度</h3>
            <label className="sr-only" htmlFor="difficulty">
              难度调整档位
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="-100">降低 100 · 稳定独立完成率</option>
              <option value="0">保持基准难度</option>
              <option value="100">提高 100 · 增加挑战</option>
            </select>
            <button
              className="button secondary full-width"
              onClick={() => {
                demoActions.decide(
                  "difficulty",
                  `难度调整为基准 ${Number(difficulty) >= 0 ? "+" : ""}${difficulty}`,
                  { difficulty: Number(difficulty) },
                );
                setNotice("目标难度已调整，周计划已更新。");
              }}
            >
              调整难度
            </button>
          </div>
          <div>
            <span className="decision-icon">
              <Plus size={20} />
            </span>
            <h3>给全班增加专题</h3>
            <label className="sr-only" htmlFor="team-topic">
              全班专题
            </label>
            <select
              id="team-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {["图上状态设计", "组合数学", "计数 DP", "边界与实现"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
            <button
              className="button secondary full-width"
              onClick={() => {
                demoActions.decide(
                  "topic",
                  `周五为全班追加「${topic}」专题 45 分钟`,
                  { topic },
                );
                setNotice(`全班专题「${topic}」已加入周五安排。`);
              }}
            >
              给全班增加专题
            </button>
          </div>
          <div>
            <span className="decision-icon">
              <Users size={20} />
            </span>
            <h3>安排个人加练</h3>
            <label className="sr-only" htmlFor="extra-student">
              单独加练学员
            </label>
            <select
              id="extra-student"
              value={extraStudent}
              onChange={(e) => setExtraStudent(e.target.value)}
            >
              {visibleStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.weaknesses[0]}
                </option>
              ))}
            </select>
            <button
              className="button secondary full-width"
              onClick={() => {
                demoActions.decide(
                  "individual",
                  `为${students.find((s) => s.id === extraStudent)?.name}安排明日 30 分钟独立补题`,
                  { extraStudentId: extraStudent },
                );
                setNotice("已安排个人加练，可在该学员的训练页查看。");
              }}
            >
              为某学员单独加练
            </button>
          </div>
        </div>
        {notice && (
          <div className="inline-notice" role="status">
            {notice}
          </div>
        )}
        {state.decisions.length > 0 && (
          <div className="decision-history">
            <strong>最近决策</strong>
            {state.decisions.slice(0, 4).map((d) => (
              <p key={d.id}>
                <Check size={14} />
                {d.text}
              </p>
            ))}
          </div>
        )}
      </section>
      <div className="bottom-advice">
        <Sparkles size={20} />
        <div>
          <strong>老师经验，值得被积累</strong>
          <p>
            把你对难度、节奏和专题的判断沉淀成 Training
            Policy，让每轮计划都有依据。
          </p>
        </div>
        <Link className="text-link" href="/innovation">
          了解 Training Policy <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );
}
