"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCheck,
  Clock3,
  Code2,
  Flame,
  GraduationCap,
  LockKeyhole,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import { TrackPicker } from "@/components/learning-controls";
import { Progress, SectionTitle } from "@/components/ui";
import { getLearningTrack } from "@/data/learning-tracks";
import { defaultStudent } from "@/data/students";
import {
  useAccount,
  personalStudentId,
  accountActions,
} from "@/lib/account-store";
import { demoActions, useDemo } from "@/lib/demo-store";
import { generateLearningPlan } from "@/lib/learning";

export function LearningHome() {
  const { profile, bookmarks } = useAccount();
  const state = useDemo();
  const track = getLearningTrack(profile.track);
  const ownResults = Object.values(state.results).filter(
    (r) => r.studentId === personalStudentId,
  );
  const plan = generateLearningPlan(
    defaultStudent,
    ownResults,
    state.round,
    profile.track,
  );
  const next = plan.find((p) => p.status !== "已完成") ?? plan[0];
  const done = plan.filter((p) => p.status === "已完成").length;
  const minutes = Math.floor(
    ownResults.reduce((sum, result) => sum + result.seconds, 0) / 60,
  );
  const startPersonal = () => demoActions.selectStudent(personalStudentId);
  return (
    <div className="learning-home">
      <div className="home-welcome">
        <div>
          <span className="eyebrow">A LITTLE PRACTICE, EVERY DAY</span>
          <h1>
            你好，{profile.nickname}{" "}
            <span className="welcome-wave" aria-hidden="true">
              ✳
            </span>
          </h1>
          <p>今天也为自己的进步，留一点时间。</p>
        </div>
        <Link href="/account?tab=preferences" className="button secondary">
          <Target size={16} />
          每天 {profile.dailyMinutes} 分钟
          <ArrowUpRight size={14} />
        </Link>
      </div>
      <section className="learning-hero card">
        <div className="learning-hero-copy">
          <span className="hero-kicker">
            <span className="live-dot" />
            你的下一步，已经准备好了
          </span>
          <h2>
            把想学会的，
            <br />
            变成<span>真正会的。</span>
          </h2>
          <p>
            从第一行代码，到下一场考试、面试或比赛。
            <br />
            按自己的目标练习，把每一次思考变成积累。
          </p>
          <div className="button-row">
            <Link
              href={`/student/session/${next.problem.id}`}
              onClick={startPersonal}
              className="button primary"
            >
              <Play size={16} fill="currentColor" />
              {ownResults.length ? "继续我的练习" : "开始今天的练习"}
              <ArrowRight size={17} />
            </Link>
            <Link href="/student" onClick={startPersonal} className="text-link">
              查看完整计划 <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-personal-meta">
            <span>
              <Clock3 size={14} />
              一次练习，一点进步
            </span>
            <span>
              <LockKeyhole size={13} />
              个人笔记 · 仅自己可见
            </span>
          </div>
        </div>
        <div className="practice-preview" aria-label="下一题预览">
          <div className="preview-topline">
            <span>
              <Code2 size={17} />
              TODAY&apos;S PICK
            </span>
            <span className="tag">{track.title}</span>
          </div>
          <div className="preview-number" aria-hidden="true">
            01<span>/ KEEP GOING</span>
          </div>
          <h3>{next.problem.title}</h3>
          <p>{next.problem.objective}</p>
          <div className="tag-row">
            {next.problem.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
            <span className="tag">
              <Clock3 size={12} />
              {next.problem.minutes} min
            </span>
          </div>
          <div className="preview-path">
            <span className="complete">
              <Check size={13} />
              理解问题
            </span>
            <i />
            <span>写下思路</span>
            <i />
            <span>动手实现</span>
          </div>
          <div className="preview-bottom">
            <span>
              <Sparkles size={14} />
              卡住时，一点提示就好。
            </span>
            <Link
              href={`/student/session/${next.problem.id}`}
              onClick={startPersonal}
              aria-label={`开始练习：${next.problem.title}`}
            >
              <ArrowUpRight size={21} />
            </Link>
          </div>
        </div>
      </section>
      <section className="direction-section">
        <SectionTitle
          title="你想向哪个方向进步？"
          subtitle="目标可以不同，练习都从适合自己的一题开始。"
          aside={<span className="section-chip">随时切换</span>}
        />
        <TrackPicker />
        <div className="direction-caption" role="status">
          <span>
            <Check size={14} />
            已选择 {track.title}
          </span>
          <p>{track.description}</p>
        </div>
      </section>
      <div className="home-practice-grid">
        <section className="card today-card">
          <SectionTitle
            title="今天，先完成这一小步"
            subtitle={`${track.title} · 根据目标安排的练习`}
            aside={
              <Link
                className="text-link"
                href="/student"
                onClick={startPersonal}
              >
                全部计划 <ArrowRight size={15} />
              </Link>
            }
          />
          <div className="daily-progress">
            <Progress value={done * 20} label="今日题单完成率" />
            <span>{done} / 5 已完成</span>
          </div>
          {plan.slice(0, 3).map(({ problem, status }, i) => (
            <div className="compact-problem" key={problem.id}>
              <span
                className={`problem-index ${status === "已完成" ? "done" : ""}`}
              >
                {status === "已完成" ? (
                  <CheckCheck size={18} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <div>
                <Link
                  href={`/student/session/${problem.id}`}
                  onClick={startPersonal}
                >
                  {problem.title}
                </Link>
                <span>
                  {problem.tags.join(" · ")}
                  <i />
                  {problem.minutes} 分钟
                </span>
              </div>
              <button
                type="button"
                className={`icon-button bookmark-button ${bookmarks.includes(problem.id) ? "bookmarked" : ""}`}
                aria-pressed={bookmarks.includes(problem.id)}
                aria-label={`${bookmarks.includes(problem.id) ? "取消收藏" : "收藏"}：${problem.title}`}
                onClick={() => accountActions.toggleBookmark(problem.id)}
              >
                <Bookmark
                  size={17}
                  fill={
                    bookmarks.includes(problem.id) ? "currentColor" : "none"
                  }
                />
              </button>
              <Link
                className="problem-go"
                href={`/student/session/${problem.id}`}
                onClick={startPersonal}
                aria-label={`练习 ${problem.title}`}
              >
                <ArrowUpRight size={17} />
              </Link>
            </div>
          ))}
        </section>
        <section className="card rhythm-card">
          <SectionTitle
            title="慢慢来，也一直在前进"
            subtitle="本次体验中的个人记录"
            aside={<Flame size={20} />}
          />
          <div className="rhythm-metrics">
            <div>
              <strong>
                {ownResults.filter((r) => r.outcome === "ac").length}
                <small>题</small>
              </strong>
              <span>已完成练习</span>
            </div>
            <div>
              <strong>
                {minutes}
                <small>min</small>
              </strong>
              <span>累计专注</span>
            </div>
          </div>
          <div className="rhythm-line">
            <span>下一次练习目标</span>
            <strong>{profile.dailyMinutes} 分钟</strong>
          </div>
          <div className="rhythm-quote">
            <span>“</span>
            <p>
              不必一次做到完美，
              <br />
              <strong>先让今天的自己动起来。</strong>
            </p>
          </div>
          <Link href="/account" className="text-link">
            查看我的成长记录 <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <section className="teacher-entry card">
        <span className="teacher-entry-icon">
          <GraduationCap size={26} />
        </span>
        <div>
          <span className="eyebrow">FOR EDUCATORS</span>
          <h2>老师的经验，也能陪伴每一位学习者。</h2>
          <p>课堂教学、教育培训或竞赛集训，都可以从一份分层练习开始。</p>
        </div>
        <Link href="/coach" className="button secondary">
          体验教学工作台 <ArrowUpRight size={17} />
        </Link>
      </section>

      <details className="home-methods">
        <summary>为什么这样安排练习？了解训练方法</summary>
        <div className="home-methods-body">
          <div className="comparison-grid">
            <section className="card">
              <h3>常见的练习困扰</h3>
              <ul>
                {[
                  "同一份题单，难度并不适合每个人",
                  "题目很多，却不知道下一题选什么",
                  "只看 Rating，容易忽略具体短板",
                  "卡住就看题解，缺少独立思考",
                  "老师手动统计，很难及时发现问题",
                  "教学经验零散，难以复用",
                  "刷题数量增加，训练效果却难验证",
                ].map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
            <section className="card">
              <h3>让每一道题都有训练目的</h3>
              <ul>
                {[
                  "学习目标与能力画像共同决定题单",
                  "直接给出下一步与推荐原因",
                  "六个维度，持续观察能力变化",
                  "四级 Hint，按思考进度逐步展开",
                  "教学工作台集中查看已分享的进度",
                  "Training Policy 把经验转成明确规则",
                  "用复盘与迁移练习验证真正掌握",
                ].map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
          </div>
          <div className="benefit-grid">
            {[
              {
                title: "把时间用在短板上",
                text: "带着具体训练目标开始，减少重复找题。",
              },
              {
                title: "适合自己的难度",
                text: "入门、面试、考试与竞赛拥有不同的练习方向。",
              },
              {
                title: "知道为什么练",
                text: "题单保留推荐原因、预计耗时与训练目标。",
              },
              {
                title: "让老师更快看见问题",
                text: "通过分层画像与周计划辅助安排课堂练习。",
              },
              {
                title: "保留长期学习轨迹",
                text: "记录思路、Hint 与复盘，观察能力变化。",
              },
              {
                title: "把经验变成方法",
                text: "可解释的训练规则可以继续调整和验证。",
              },
            ].map(({ title, text }) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <div className="flywheel">
            {[
              "导入训练数据",
              "建立能力画像",
              "识别当前瓶颈",
              "生成练习计划",
              "分级提示与复盘",
              "更新能力模型",
            ].map((step, i) => (
              <div key={step}>
                <span>0{i + 1}</span>
                <strong>{step}</strong>
                {i < 5 && <ArrowRight size={15} />}
              </div>
            ))}
          </div>
          <Link href="/innovation" className="text-link">
            查看完整学习方法与未来路线 <ArrowRight size={15} />
          </Link>
        </div>
      </details>
    </div>
  );
}
