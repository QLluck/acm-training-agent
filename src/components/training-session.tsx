"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Code2,
  FileText,
  Lightbulb,
  LockKeyhole,
  Pause,
  Play,
  Save,
  Sparkles,
  SquarePen,
  Target,
} from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DemoBadge } from "@/components/ui";
import { students, skillShortLabels } from "@/data/students";
import { useDemo, demoActions } from "@/lib/demo-store";
import {
  evaluateTrainingSession,
  formatDuration,
  generateTrainingPlan,
} from "@/lib/training";
import type { Problem, SessionDraft, SkillKey } from "@/types/training";

const initialDraft: SessionDraft = {
  code: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    // 先写下你的状态定义或关键观察\n    \n    return 0;\n}\n",
  note: "",
  hintLevel: 0,
  seconds: 0,
};
const hintTitles = ["问题引导", "方向提示", "结构提示", "复盘解析"];

export function TrainingSession({ problem }: { problem: Problem }) {
  const state = useDemo();
  const student = students.find((s) => s.id === state.studentId)!;
  const key = `${student.id}:${problem.id}`;
  const draft = state.drafts[key] ?? initialDraft;
  const result = state.results[key];
  const [paused, setPaused] = useState(false);
  const [confirmReview, setConfirmReview] = useState(false);
  const [notice, setNotice] = useState("");
  const plan = generateTrainingPlan(
    student,
    Object.values(state.results),
    state.round,
  );
  const item = plan.find((p) => p.problem.id === problem.id);
  const nextItem = plan.find(
    (p) => p.problem.id !== problem.id && p.status !== "已完成",
  );
  const finished = !!result;

  useEffect(() => {
    if (paused || finished) return;
    let previous = Date.now();
    const onVisibilityChange = () => {
      previous = Date.now();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - previous) / 1000);
      if (elapsed > 0) {
        previous += elapsed * 1000;
        if (!document.hidden) demoActions.tickDraft(key, elapsed, initialDraft);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [key, paused, finished]);

  function patch(partial: Partial<SessionDraft>) {
    demoActions.patchDraft(key, partial, initialDraft);
  }
  function requestHint(level: number) {
    if (level > draft.hintLevel + 1 || level > 3 || finished) return;
    patch({ hintLevel: Math.max(draft.hintLevel, level) });
    setNotice(`已展开 Hint ${level}，先根据提示继续独立思考。`);
  }
  function finish(outcome: "ac" | "unfinished") {
    demoActions.saveResult(
      evaluateTrainingSession({
        studentId: student.id,
        problem,
        outcome,
        seconds: draft.seconds,
        hintLevel: draft.hintLevel,
        note: draft.note,
      }),
    );
    setNotice("训练复盘已生成，能力画像已更新。");
  }

  return (
    <div className="session-page">
      <div className="session-breadcrumb">
        <Link href="/student">
          <ArrowLeft size={16} />
          返回我的训练
        </Link>
        <span>{student.name} · 独立训练室</span>
        <DemoBadge />
      </div>
      <div className="session-heading">
        <div>
          <span className="eyebrow">
            TRAINING SESSION / {String(problem.id).padStart(2, "0")}
          </span>
          <h1>
            {problem.title}
            <span className="rating-tag">{problem.rating}</span>
          </h1>
          <p>{problem.platform} · 原创简化题面 · 难度为模拟估计</p>
        </div>
        <div className={`timer ${paused ? "paused" : ""}`}>
          <Clock3 size={19} />
          <strong aria-label="已训练时间">
            {formatDuration(draft.seconds)}
          </strong>
          <button
            className="icon-button"
            aria-label={paused ? "继续计时" : "暂停计时"}
            onClick={() => setPaused(!paused)}
            disabled={finished}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <small>
            {finished ? "训练已结束" : paused ? "已暂停" : "训练进行中"}
          </small>
        </div>
      </div>
      <div className="session-grid">
        <section className="card problem-panel">
          <div className="panel-header">
            <FileText size={17} />
            <h2>题目描述</h2>
            <span>{problem.minutes} min</span>
          </div>
          <div className="panel-body">
            <div className="tag-row">
              {problem.tags.map((tag) => (
                <span className="tag purple-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="session-purpose">
              <Target size={16} />
              <div>
                <strong>本题训练目标</strong>
                <p>{problem.objective}</p>
              </div>
            </div>
            <p className="statement">{problem.statement}</p>
            <h3>输入格式</h3>
            <p>{problem.input}</p>
            <h3>输出格式</h3>
            <p>{problem.output}</p>
            <div className="sample-block">
              <div>
                <span>样例输入</span>
                <pre>{problem.sample.input}</pre>
              </div>
              <div>
                <span>样例输出</span>
                <pre>{problem.sample.output}</pre>
              </div>
            </div>
            <p className="sample-explanation">{problem.sample.explanation}</p>
            <details className="reason-details" open>
              <summary>
                <Sparkles size={14} />
                为什么为你推荐
                <ChevronDown size={14} />
              </summary>
              <p>
                {item?.reason ??
                  `使用这道题检验${problem.tags.join("、")}的掌握程度，再根据训练结果调整计划。`}
              </p>
            </details>
          </div>
        </section>
        <section className="card editor-panel">
          <div className="panel-header">
            <Code2 size={17} />
            <h2>独立思考与实现</h2>
            <span>C++17</span>
          </div>
          <div className="editor-filename">
            <span>
              <i className="dot violet" />
              main.cpp
            </span>
            <span>本地草稿</span>
          </div>
          <div className="code-editor">
            <div className="line-numbers" aria-hidden="true">
              {draft.code.split("\n").map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <label className="sr-only" htmlFor="code-editor">
              C++ 代码草稿
            </label>
            <textarea
              id="code-editor"
              spellCheck={false}
              value={draft.code}
              onChange={(e) => patch({ code: e.target.value })}
              maxLength={50000}
              aria-describedby="editor-help"
            />
          </div>
          <div className="editor-status" id="editor-help">
            <span>
              <Save size={12} />
              自动保存草稿
            </span>
            <span>模拟编辑器 · 不编译、不判题</span>
          </div>
          <div className="notes-area">
            <label htmlFor="training-note">
              <SquarePen size={16} />
              训练笔记<span>{draft.note.length}/2000</span>
            </label>
            <textarea
              id="training-note"
              value={draft.note}
              onChange={(e) => patch({ note: e.target.value })}
              maxLength={2000}
              placeholder="我卡在了哪里？关键观察是什么？下次如何独立想到？"
            />
            <button
              className="button secondary small-button"
              onClick={() => {
                patch({ note: draft.note });
                if (result)
                  demoActions.saveResult({ ...result, note: draft.note });
                setNotice("训练笔记已保存。");
              }}
            >
              <Save size={14} />
              保存笔记
            </button>
          </div>
        </section>
        <aside className="card coach-panel">
          <div className="panel-header">
            <span className="ai-icon">
              <Sparkles size={17} />
            </span>
            <h2>AI Coach</h2>
            <span className="tag purple-tag">模拟</span>
          </div>
          <div className="panel-body">
            <div className="coach-intro">
              <span className="coach-speech-mark">“</span>
              <p>
                我会陪你找到方向，
                <br />
                <strong>把思考的空间留给你。</strong>
              </p>
            </div>
            <p className="hint-principle">
              AI 的目标是帮助队员学会思考，而不是帮助队员 AC 一道题。
            </p>
            <button
              className="button primary full-width"
              disabled={draft.hintLevel >= 3 || finished}
              onClick={() => requestHint(draft.hintLevel + 1)}
            >
              <Lightbulb size={17} />
              {draft.hintLevel >= 3 ? "已展开所有独立训练提示" : "我卡住了"}
            </button>
            <div className="hint-levels">
              {[1, 2, 3].map((level) => (
                <button
                  className={`hint-level ${draft.hintLevel >= level ? "unlocked" : ""}`}
                  key={level}
                  disabled={level > draft.hintLevel + 1 || finished}
                  onClick={() => requestHint(level)}
                >
                  {draft.hintLevel >= level ? (
                    <Check size={14} />
                  ) : level > draft.hintLevel + 1 ? (
                    <LockKeyhole size={13} />
                  ) : (
                    <Lightbulb size={14} />
                  )}
                  <span>
                    Hint {level}
                    <small>{hintTitles[level - 1]}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="hint-messages" aria-live="polite">
              {draft.hintLevel === 0 ? (
                <div className="hint-empty">
                  <span>01</span>
                  <p>
                    先尝试写出你的观察。
                    <br />
                    准备好后，再向我求助。
                  </p>
                </div>
              ) : (
                problem.hints.slice(0, draft.hintLevel).map((hint, i) => (
                  <div className="hint-message" key={hint}>
                    <strong>
                      <Sparkles size={13} />
                      Hint {i + 1} · {hintTitles[i]}
                    </strong>
                    <p>{hint}</p>
                  </div>
                ))
              )}
            </div>
            <div className="review-gate">
              <span>
                <LockKeyhole size={14} />
                Hint 4 · 复盘模式
              </span>
              <p>确定结束独立思考后，才会展示完整解析。</p>
              <button
                className="button secondary full-width small-button"
                disabled={draft.hintLevel === 4 || finished}
                onClick={() => setConfirmReview(true)}
              >
                {draft.hintLevel === 4
                  ? "已进入复盘模式"
                  : "结束独立思考并复盘"}
              </button>
            </div>
          </div>
        </aside>
      </div>
      <div className="session-actions card">
        <div>
          <ShieldNote />
          <span>计时仅记录本页可见时段；标记结果是模拟操作，不执行代码。</span>
        </div>
        <div className="button-row">
          <button
            className="button secondary"
            disabled={finished}
            onClick={() => finish("unfinished")}
          >
            标记未完成
          </button>
          <button
            className="button success-button"
            disabled={finished}
            onClick={() => finish("ac")}
          >
            <CheckCheck size={18} />
            {result?.outcome === "ac" ? "已标记 AC" : "标记 AC"}
          </button>
        </div>
      </div>
      {notice && (
        <div className="inline-notice" role="status">
          {notice}
        </div>
      )}
      {result && (
        <section className="card review-card" aria-label="训练复盘">
          <div className="section-title">
            <div>
              <span className="eyebrow">SESSION REVIEW</span>
              <h2>
                {result.outcome === "ac"
                  ? "完成一题，也收获一次成长。"
                  : "卡住的地方，就是下一次训练的起点。"}
              </h2>
            </div>
            <span className="tag purple-tag">模拟评估</span>
          </div>
          <div className="review-metrics">
            <div>
              <span>实际耗时</span>
              <strong>{formatDuration(result.seconds)}</strong>
            </div>
            <div>
              <span>最高 Hint 等级</span>
              <strong>
                {result.hintLevel === 0
                  ? "独立完成"
                  : `Hint ${result.hintLevel}`}
              </strong>
            </div>
            <div>
              <span>能力画像变化</span>
              <strong>
                {Object.entries(result.skillDelta)
                  .map(
                    ([key, delta]) =>
                      `${skillShortLabels[key as SkillKey]} +${delta}`,
                  )
                  .join(" · ")}
              </strong>
            </div>
          </div>
          <p>{result.analysis}</p>
          <div className="next-step">
            <Sparkles size={17} />
            <span>{result.nextStep}</span>
          </div>
          <p className="muted-text">
            能力增量是演示规则，依据自报结果与提示等级计算，不代表真实能力测量。
          </p>
          <div className="button-row">
            {result.outcome === "unfinished" && (
              <button
                className="button secondary"
                onClick={() => {
                  demoActions.resumeUnfinished(key);
                  setPaused(false);
                  setNotice("已恢复补题，保留之前的草稿、笔记和 Hint 记录。");
                }}
              >
                继续补题
              </button>
            )}
            <Link
              href="/student"
              className="button primary"
              onClick={() => demoActions.nextRound()}
            >
              更新画像并查看下一轮 <ArrowRight size={16} />
            </Link>
            {nextItem && (
              <Link
                href={`/student/session/${nextItem.problem.id}`}
                className="button secondary"
              >
                继续：{nextItem.problem.title}
              </Link>
            )}
            <Link href="/coach" className="text-link">
              查看教练视角 <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      )}
      {confirmReview && (
        <ConfirmDialog
          title="结束独立思考，进入复盘？"
          description="接下来会展示较完整的思路与复杂度分析。本次训练将记录为 Hint 4，完成后仍建议独立重做一次。"
          confirmText="结束独立思考，展示解析"
          onCancel={() => setConfirmReview(false)}
          onConfirm={() => {
            patch({ hintLevel: 4 });
            setConfirmReview(false);
            setNotice("已进入复盘模式，完整解析已展开。请结合自己的卡点阅读。");
          }}
        />
      )}
    </div>
  );
}

function ShieldNote() {
  return <span className="live-dot" />;
}
