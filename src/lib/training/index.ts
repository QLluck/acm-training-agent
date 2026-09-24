import { problems } from "@/data/problems";
import { skillShortLabels } from "@/data/students";
import {
  skillKeys,
  type PlanItem,
  type Problem,
  type SessionResult,
  type Skills,
  type Student,
} from "@/types/training";

export function calculateSkillProfile(
  student: Student,
  results: SessionResult[] = [],
): Skills {
  const profile = { ...student.skills };
  for (const result of results.filter((r) => r.studentId === student.id)) {
    for (const key of skillKeys)
      profile[key] = Math.max(
        0,
        Math.min(100, profile[key] + (result.skillDelta[key] ?? 0)),
      );
  }
  return profile;
}

export function diagnoseStudent(student: Student, profile: Skills) {
  const ranked = [...skillKeys].sort((a, b) => profile[a] - profile[b]);
  const weakest = ranked[0];
  const stable = [...skillKeys].sort(
    (a, b) =>
      Math.abs(profile[a] - student.previousSkills[a]) -
      Math.abs(profile[b] - student.previousSkills[b]),
  )[0];
  const lower = Math.max(1000, Math.floor(student.cfRating / 100) * 100 - 100);
  const upper = lower + 200;
  return {
    weakest,
    stable,
    text: `当前优先补强${skillShortLabels[weakest]}（${profile[weakest]}/100）。${weakest === "dp" ? `${profile.implementation >= 75 ? "代码实现较稳定，重点练习从题意抽象状态" : "先练习基础状态推导与边界检查"}，并提高 ${lower}–${upper} 难度的独立完成率。` : `建议先完成对应基础题，再用一道综合题检验迁移能力；当前参考难度为 ${lower}–${upper}。`}`,
  };
}

export function matchesDpPolicy(student: Student, profile: Skills) {
  return (
    profile.dp < 60 &&
    student.cfRating >= 1300 &&
    student.recentDpSuccessRate < 50
  );
}

export function generateTrainingPlan(
  student: Student,
  results: SessionResult[] = [],
  round = 0,
): PlanItem[] {
  const profile = calculateSkillProfile(student, results);
  const weakest = [...skillKeys].sort((a, b) => profile[a] - profile[b])[0];
  const history = results.filter((r) => r.studentId === student.id);
  const done = new Set(
    history.filter((r) => r.outcome === "ac").map((r) => r.problemId),
  );
  let ids = [2, 1, 3, 8, 5];
  if (round > 0 && matchesDpPolicy(student, profile)) ids = [6, 7, 1, 11, 12];
  else if (student.id !== "yuan" || round > 0) {
    const pool = [...problems].sort((a, b) => {
      const score = (p: Problem) =>
        (p.skills.includes(weakest) ? -500 : 0) +
        Math.abs(p.rating - student.cfRating) +
        (done.has(p.id) ? 2000 : 0);
      return score(a) - score(b);
    });
    ids = pool
      .slice(0, 5)
      .sort((a, b) => a.rating - b.rating)
      .map((p) => p.id);
  }
  const stages: PlanItem["stage"][] = ["热身", "核心", "核心", "综合", "挑战"];
  return ids.map((id, index) => {
    const problem = problems.find((p) => p.id === id)!;
    const result = history.find((r) => r.problemId === id);
    const isPolicy = round > 0 && matchesDpPolicy(student, profile);
    return {
      problem,
      stage: stages[index],
      reason: isPolicy
        ? `命中教练 DP 补强策略：DP ${profile.dp}<60，Rating ${student.cfRating}≥1300，近期 DP 成功率 ${student.recentDpSuccessRate}%<50%。${done.has(id) ? "已完成的题用于间隔复习。" : "先基础、再状态设计，最后检验综合迁移。"}`
        : index === 0
          ? `以 ${problem.rating} 难度热身，检查${problem.tags[0]}的独立完成稳定性。`
          : problem.skills.includes(weakest)
            ? `${skillShortLabels[weakest]}是当前短板（${profile[weakest]}/100），用${problem.tags[0]}训练补齐关键环节。`
            : `将${problem.tags[0]}与当前知识连接，${index === 4 ? "适度挑战能力上界，允许分级求助。" : "检查掌握程度能否迁移到综合场景。"}`,
      status:
        result?.outcome === "ac" ? "已完成" : result ? "待补题" : "待训练",
    };
  });
}

export function evaluateTrainingSession(input: {
  studentId: string;
  problem: Problem;
  outcome: "ac" | "unfinished";
  seconds: number;
  hintLevel: number;
  note: string;
}): SessionResult {
  const hintLevel = Math.max(0, Math.min(4, Math.round(input.hintLevel)));
  const delta =
    input.outcome === "unfinished"
      ? 0
      : hintLevel === 0
        ? 4
        : hintLevel <= 2
          ? 2
          : 1;
  return {
    studentId: input.studentId,
    problemId: input.problem.id,
    outcome: input.outcome,
    seconds: Math.max(0, Math.round(input.seconds)),
    hintLevel,
    note: input.note.trim().slice(0, 2000),
    finishedAt: new Date().toISOString(),
    skillDelta: Object.fromEntries(
      input.problem.skills.map((key) => [key, delta]),
    ),
    analysis:
      input.outcome === "unfinished"
        ? "本次标记为待补题，能力分不扣减。请记录卡在读题、状态设计还是实现，再安排一次独立重做。"
        : hintLevel >= 3
          ? "本题在结构提示或复盘后完成，暂不视为独立掌握。建议明天不看提示重新推导。"
          : hintLevel > 0
            ? "完成了从方向提示到独立实现的过程；下一次尝试只使用问题引导。"
            : "本次独立完成。下一步用一题变式，检查是否真正掌握了可迁移的方法。",
    nextStep:
      input.outcome === "unfinished" || hintLevel >= 3
        ? `明日补题：重新推导「${input.problem.title}」，先写状态含义，再编码。`
        : `进入下一轮计划，优先练习${input.problem.tags[0]}的变式。`,
  };
}

export function recommendTeamFocus(
  team: Student[],
  results: SessionResult[] = [],
) {
  return skillKeys
    .map((key) => ({
      key,
      label: skillShortLabels[key],
      average: Math.round(
        team.reduce(
          (sum, s) => sum + calculateSkillProfile(s, results)[key],
          0,
        ) / team.length,
      ),
      below60: team.filter((s) => calculateSkillProfile(s, results)[key] < 60)
        .length,
    }))
    .sort((a, b) => a.average - b.average);
}

export function getWatchlist(team: Student[]) {
  return team.flatMap((student) => {
    const reason =
      student.daysInactive >= 5
        ? `连续 ${student.daysInactive} 天未训练，本周完成率仅 ${student.completionRate}%。建议先了解训练时间安排。`
        : student.hintLevelAverage >= 3
          ? `平均 Hint ${student.hintLevelAverage}，多次依赖结构提示。建议降低跨度并独立补题。`
          : student.cfRating - student.averageDifficulty >= 350
            ? `近期平均训练难度 ${student.averageDifficulty}，低于 Rating ${student.cfRating}。建议增加有效挑战。`
            : student.earlyStuckRate >= 40
              ? `模拟赛前 30 分钟卡题率 ${student.earlyStuckRate}%。建议练习读题与开局选题。`
              : "";
    return reason ? [{ student, reason }] : [];
  });
}

export function teamOverview(team: Student[], results: SessionResult[]) {
  const average = (key: "completionRate" | "firstAcRate" | "weeklyHours") =>
    team.reduce((sum, s) => sum + s[key], 0) / team.length;
  return {
    count: team.length,
    completion: Math.round(average("completionRate")),
    submissions:
      team.reduce((sum, s) => sum + s.submissions, 0) + results.length,
    firstAc: Math.round(average("firstAcRate")),
    hours: average("weeklyHours").toFixed(1),
    improved: team.filter((s) => s.trend.at(-1)! > s.trend.at(-2)!).length,
  };
}

export function formatDuration(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
