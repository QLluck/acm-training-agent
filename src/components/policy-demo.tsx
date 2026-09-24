"use client";

import { useState } from "react";
import { ArrowRight, Check, GitBranch, SlidersHorizontal } from "lucide-react";
import { students } from "@/data/students";
import { matchesDpPolicy } from "@/lib/training";

export function PolicyDemo() {
  const [mastery, setMastery] = useState(52);
  const [rating, setRating] = useState(1548);
  const [success, setSuccess] = useState(42);
  const match = matchesDpPolicy(
    { ...students[0], cfRating: rating, recentDpSuccessRate: success },
    { ...students[0].skills, dp: mastery },
  );
  return (
    <div className="policy-demo">
      <div className="policy-controls">
        <div className="policy-title">
          <SlidersHorizontal size={18} />
          <strong>调整画像，看看策略如何响应</strong>
        </div>
        <label htmlFor="policy-dp">
          DP 掌握度<strong>{mastery}</strong>
        </label>
        <input
          id="policy-dp"
          type="range"
          min="0"
          max="100"
          value={mastery}
          onChange={(e) => setMastery(Number(e.target.value))}
        />
        <label htmlFor="policy-rating">
          Current Rating<strong>{rating}</strong>
        </label>
        <input
          id="policy-rating"
          type="range"
          min="800"
          max="2400"
          step="1"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
        <label htmlFor="policy-success">
          近期 DP 独立完成率<strong>{success}%</strong>
        </label>
        <input
          id="policy-success"
          type="range"
          min="0"
          max="100"
          value={success}
          onChange={(e) => setSuccess(Number(e.target.value))}
        />
        <p>预设规则示例；真实阈值需结合队内试点校准。</p>
      </div>
      <div className="policy-code">
        <span className="code-caption">
          <GitBranch size={15} />
          coach-policy / dp-foundation
        </span>
        <pre>
          <span className="code-purple">IF</span>
          {"\n  DP mastery < 60\n  "}
          <span className="code-purple">AND</span>
          {" Current Rating >= 1300\n  "}
          <span className="code-purple">AND</span>
          {" Recent DP success rate < 50%\n\n"}
          <span className="code-purple">THEN</span>
          {"\n  2 × 1400 DP 基础\n  2 × 1500 DP 状态设计\n  1 × 1600 综合题"}
        </pre>
        <div
          className={`policy-result ${match ? "matched" : ""}`}
          role="status"
        >
          {match ? <Check size={18} /> : <ArrowRight size={18} />}
          <div>
            <strong>
              {match
                ? "策略命中 · 先稳住基础，再增加跨度"
                : "当前画像未命中这条策略"}
            </strong>
            <p>
              {match
                ? "下一轮采用 5 题 DP 补强计划，每题保留推荐依据。"
                : "需按其他短板生成计划；不强行套用 DP 补强规则。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
