import assert from "node:assert/strict";
import test from "node:test";
import { learningTracks } from "../src/data/learning-tracks";
import { problems } from "../src/data/problems";
import { students } from "../src/data/students";
import { buildPersonalExport, generateLearningPlan } from "../src/lib/learning";
import { evaluateTrainingSession } from "../src/lib/training";

test("六种方向均有五道有效练习、方向依据和独立的完成状态", () => {
  const result = evaluateTrainingSession({
    studentId: students[0].id,
    problem: problems[1],
    outcome: "ac",
    seconds: 600,
    hintLevel: 0,
    note: "自己的思路",
  });
  const plans = learningTracks.map((track) => {
    const plan = generateLearningPlan(students[0], [result], 0, track.id);
    assert.equal(plan.length, 5);
    assert.equal(new Set(plan.map((p) => p.problem.id)).size, 5);
    assert.ok(
      plan.every((p) => p.reason.length > 15 && p.problem.hints.length === 4),
    );
    if (track.id !== "contest")
      assert.ok(plan.every((p) => p.reason.includes(track.title)));
    return plan.map((p) => p.problem.id).join(",");
  });
  assert.ok(new Set(plans).size >= 5);
  const next = generateLearningPlan(students[0], [result], 1, "practice");
  assert.equal(next.at(-1)?.problem.id, 2);
  assert.equal(next.at(-1)?.status, "已完成");
  assert.ok(
    generateLearningPlan(students[1], [result], 0, "practice").every(
      (p) => p.status === "待训练",
    ),
  );
});

test("个人数据导出严格保留所属结果与草稿，不包含其他模拟学员", () => {
  const own = evaluateTrainingSession({
    studentId: students[0].id,
    problem: problems[0],
    outcome: "ac",
    seconds: 100,
    hintLevel: 1,
    note: "个人笔记",
  });
  const other = { ...own, studentId: "lin", note: "他人笔记" };
  const draft = { code: "private code", note: "自己的草稿", seconds: 100 };
  const exported = buildPersonalExport(students[0].id, [other, own], {
    [`${students[0].id}:1`]: draft,
    "lin:1": { ...draft, code: "other code" },
    [`${students[0].id}2:1`]: draft,
  });
  assert.deepEqual(exported.results, [own]);
  assert.deepEqual(exported.drafts, { [`${students[0].id}:1`]: draft });
  assert.ok(!JSON.stringify(exported).includes("other code"));
  assert.ok(!JSON.stringify(exported).includes("他人笔记"));
});
