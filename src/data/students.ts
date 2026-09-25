import type { Skills, Student } from "@/types/training";

export const skillLabels = {
  dp: "Dynamic Programming",
  graph: "Graph",
  math: "Math",
  greedy: "Greedy",
  dataStructure: "Data Structure",
  implementation: "Implementation",
};
export const skillShortLabels = {
  dp: "DP",
  graph: "图论",
  math: "数学",
  greedy: "贪心",
  dataStructure: "数据结构",
  implementation: "代码实现",
};

function skills(values: number[]): Skills {
  const [dp, graph, math, greedy, dataStructure, implementation] = values;
  return { dp, graph, math, greedy, dataStructure, implementation };
}

function member(
  id: string,
  name: string,
  rating: number,
  level: string,
  values: number[],
  extras: Partial<Student> = {},
): Student {
  const current = skills(values);
  return {
    id,
    name,
    cfRating: rating,
    level,
    target: "区域赛银牌",
    weeklyHours: 9.7,
    completionRate: 83,
    firstAcRate: 61,
    hintLevelAverage: 1.4,
    streak: 12,
    skills: current,
    previousSkills: skills(
      values.map((v, i) => Math.max(0, v - [4, 12, 3, 5, 7, 2][i])),
    ),
    weaknesses: ["计数 DP", "组合数学"],
    trend: [48, 50, 49, 54, 58, 57, 63, 67],
    recentDpSuccessRate: 42,
    submissions: 39,
    daysInactive: 0,
    averageDifficulty: rating - 70,
    earlyStuckRate: 18,
    ...extras,
  };
}

export const students: Student[] = [
  member("chen-xin", "陈欣", 1548, "进阶组", [52, 74, 58, 76, 69, 88]),
  member("lin", "林沐", 2184, "主力组", [90, 88, 85, 91, 86, 92], {
    weeklyHours: 14.5,
    completionRate: 96,
    firstAcRate: 82,
    hintLevelAverage: 0.4,
    streak: 26,
    recentDpSuccessRate: 86,
    weaknesses: ["高级数论"],
    trend: [76, 78, 80, 82, 83, 85, 87, 89],
    submissions: 61,
  }),
  member("chen", "陈予安", 1712, "进阶组", [85, 43, 68, 77, 72, 80], {
    weeklyHours: 11.2,
    completionRate: 88,
    weaknesses: ["图上状态设计"],
    recentDpSuccessRate: 78,
    submissions: 47,
  }),
  member("xu", "许知远", 1260, "新人组", [35, 42, 45, 56, 38, 65], {
    weeklyHours: 8.1,
    completionRate: 72,
    firstAcRate: 42,
    hintLevelAverage: 2.8,
    streak: 6,
    weaknesses: ["DP 入门", "边界处理"],
    trend: [25, 28, 33, 35, 39, 41, 45, 47],
    submissions: 36,
  }),
  member("zhou", "周可", 1496, "进阶组", [46, 62, 49, 61, 58, 89], {
    weeklyHours: 10.4,
    hintLevelAverage: 3.2,
    weaknesses: ["状态抽象", "组合数学"],
    firstAcRate: 48,
    submissions: 52,
  }),
  member("he", "何子墨", 1820, "主力组", [74, 81, 73, 82, 84, 87], {
    weeklyHours: 2.1,
    completionRate: 25,
    streak: 0,
    daysInactive: 5,
    weaknesses: ["训练连续性"],
    trend: [69, 72, 73, 75, 77, 76, 76, 75],
    submissions: 8,
  }),
  member("tang", "唐一诺", 1642, "进阶组", [64, 67, 52, 79, 70, 84], {
    weeklyHours: 12.5,
    completionRate: 100,
    averageDifficulty: 1150,
    weaknesses: ["训练难度偏低", "组合数学"],
    submissions: 74,
  }),
  member("su", "苏晚", 1926, "主力组", [87, 76, 90, 78, 69, 82], {
    weeklyHours: 13.1,
    completionRate: 92,
    firstAcRate: 75,
    hintLevelAverage: 0.8,
    recentDpSuccessRate: 81,
    weaknesses: ["高级数据结构"],
    submissions: 48,
  }),
  member("lu", "陆明", 1137, "新人组", [28, 35, 51, 45, 32, 53], {
    weeklyHours: 7.2,
    completionRate: 67,
    firstAcRate: 38,
    streak: 4,
    hintLevelAverage: 2.6,
    weaknesses: ["DP 入门", "代码实现"],
    trend: [20, 23, 25, 28, 31, 34, 37, 40],
    submissions: 27,
  }),
  member("shen", "沈清", 1583, "进阶组", [57, 79, 48, 70, 74, 81], {
    weeklyHours: 9.6,
    completionRate: 79,
    earlyStuckRate: 46,
    weaknesses: ["比赛开局策略", "计数 DP"],
    submissions: 41,
  }),
  member("jiang", "江屿", 2021, "主力组", [81, 91, 75, 86, 89, 90], {
    weeklyHours: 15.2,
    completionRate: 96,
    firstAcRate: 79,
    hintLevelAverage: 0.7,
    recentDpSuccessRate: 76,
    weaknesses: ["组合数学"],
    submissions: 57,
  }),
  member("wen", "温宁", 1388, "新人组", [48, 51, 71, 64, 45, 68], {
    weeklyHours: 8.4,
    completionRate: 75,
    firstAcRate: 53,
    streak: 8,
    weaknesses: ["计数 DP", "数据结构"],
    trend: [35, 37, 39, 42, 47, 49, 52, 56],
    submissions: 33,
  }),
];

// 首位学员作为本地体验账户；修改展示姓名或 ID 只需改动上方数据。
export const defaultStudent = students[0];
