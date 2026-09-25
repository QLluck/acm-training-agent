import assert from "node:assert/strict";
import test from "node:test";
import { students } from "../src/data/students";
import { problems } from "../src/data/problems";
import {
  calculateSkillProfile,
  evaluateTrainingSession,
  generateTrainingPlan,
  getWatchlist,
  matchesDpPolicy,
  recommendTeamFocus,
  teamOverview,
} from "../src/lib/training";

test("12 名队员的计划无重复、数据有效，诊断和演示题都完整", () => {
  assert.equal(students.length, 12);
  assert.equal(
    new Set(students.map((s) => s.id)).size,
    students.length,
    "学员 ID 必须唯一，避免账户记录串用",
  );
  for (const student of students) {
    const plan = generateTrainingPlan(student);
    assert.equal(plan.length, 5);
    assert.equal(new Set(plan.map((p) => p.problem.id)).size, 5);
    assert.ok(Object.values(student.skills).every((v) => v >= 0 && v <= 100));
    for (const item of plan) {
      assert.ok(item.reason.length > 10);
      assert.equal(item.problem.hints.length, 4);
      assert.ok(
        item.problem.objective &&
          item.problem.sample.input &&
          item.problem.sample.output,
      );
    }
  }
});

test("策略边界严格区分掌握度、Rating 和独立完成率", () => {
  const base = students[0];
  assert.ok(matchesDpPolicy(base, base.skills));
  assert.ok(!matchesDpPolicy(base, { ...base.skills, dp: 60 }));
  assert.ok(!matchesDpPolicy({ ...base, cfRating: 1299 }, base.skills));
  assert.ok(
    !matchesDpPolicy({ ...base, recentDpSuccessRate: 50 }, base.skills),
  );
  assert.ok(
    matchesDpPolicy(
      { ...base, cfRating: 1300, recentDpSuccessRate: 49 },
      { ...base.skills, dp: 59 },
    ),
  );
  const plan = generateTrainingPlan(base, [], 1);
  assert.deepEqual(
    plan.map((p) => p.problem.rating),
    [1400, 1400, 1500, 1500, 1600],
  );
});

test("独立完成增量高于看解析后的完成；未完成不扣分、不误判掌握", () => {
  const input = {
    studentId: students[0].id,
    problem: problems[0],
    outcome: "ac" as const,
    seconds: 1200,
    note: "用末步分类验证互斥性",
  };
  const independent = evaluateTrainingSession({ ...input, hintLevel: 0 });
  const review = evaluateTrainingSession({ ...input, hintLevel: 4 });
  const unfinished = evaluateTrainingSession({
    ...input,
    outcome: "unfinished",
    hintLevel: 2,
  });
  assert.ok(independent.skillDelta.dp! > review.skillDelta.dp!);
  assert.equal(unfinished.skillDelta.dp, 0);
  assert.match(review.analysis, /暂不视为独立掌握/);
  assert.match(unfinished.nextStep, /补题/);
});

test("结果只更新所属队员，画像不超过 100，状态回流到计划和团队", () => {
  const result = evaluateTrainingSession({
    studentId: students[0].id,
    problem: problems[0],
    outcome: "ac",
    seconds: 900,
    hintLevel: 1,
    note: "",
  });
  assert.equal(calculateSkillProfile(students[0], [result]).dp, 54);
  assert.deepEqual(
    calculateSkillProfile(students[1], [result]),
    students[1].skills,
  );
  assert.equal(
    calculateSkillProfile(
      { ...students[0], skills: { ...students[0].skills, dp: 99 } },
      [result],
    ).dp,
    100,
  );
  assert.equal(
    generateTrainingPlan(students[0], [result]).find((p) => p.problem.id === 1)
      ?.status,
    "已完成",
  );
  assert.equal(
    teamOverview(students, [result]).submissions,
    teamOverview(students, []).submissions + 1,
  );
  assert.equal(getWatchlist(students).length, 4);
  const focus = recommendTeamFocus(students, [result]);
  assert.ok(
    focus.every((f, i) => i === 0 || focus[i - 1].average <= f.average),
  );
});
