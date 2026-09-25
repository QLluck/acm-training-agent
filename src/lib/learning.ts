import { getLearningTrack } from "@/data/learning-tracks";
import { problems } from "@/data/problems";
import { generateTrainingPlan } from "@/lib/training";
import type { LearningTrack } from "@/types/account";
import type { PlanItem, SessionResult, Student } from "@/types/training";

export function generateLearningPlan(
  student: Student,
  results: SessionResult[],
  round: number,
  track: LearningTrack,
): PlanItem[] {
  if (track === "contest") return generateTrainingPlan(student, results, round);
  const selected = getLearningTrack(track);
  const stages: PlanItem["stage"][] = ["热身", "核心", "核心", "综合", "挑战"];
  const own = results.filter((result) => result.studentId === student.id);
  let ids = [...selected.problemIds];
  if (round > 0)
    ids = ids.sort(
      (a, b) =>
        Number(own.some((r) => r.problemId === a && r.outcome === "ac")) -
        Number(own.some((r) => r.problemId === b && r.outcome === "ac")),
    );
  return ids.map((id, index) => {
    const problem = problems.find((p) => p.id === id)!;
    const result = own.find((r) => r.problemId === id);
    return {
      problem,
      stage: stages[index],
      status:
        result?.outcome === "ac" ? "已完成" : result ? "待补题" : "待训练",
      reason: `${selected.title} · ${selected.goal}。用「${problem.tags[0]}」${track === "interview" ? "练习讲解思路、边界与复杂度。" : track === "postgrad" ? "连接手算推导与算法实现；此路线演示 408 的算法设计部分。" : track === "beginner" ? "练习拆分步骤，先跑通样例，再解释每一步。" : track === "teaching" ? "巩固课堂知识，检查能否独立完成同类问题。" : "完成一次有目标的练习，写下关键观察。"}`,
    };
  });
}

export function buildPersonalExport(
  studentId: string,
  results: SessionResult[],
  drafts: Record<string, { code: string; note: string; seconds: number }>,
) {
  return {
    exportedAt: new Date().toISOString(),
    results: results.filter((r) => r.studentId === studentId),
    drafts: Object.fromEntries(
      Object.entries(drafts).filter(([key]) => key.startsWith(`${studentId}:`)),
    ),
  };
}
