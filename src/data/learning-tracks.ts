import type { LearningTrack } from "@/types/account";

export const learningTracks: {
  id: LearningTrack;
  title: string;
  subtitle: string;
  description: string;
  goal: string;
  topics: string[];
  problemIds: number[];
}[] = [
  {
    id: "practice",
    title: "日常算法",
    subtitle: "把思考练成习惯",
    description: "利用每天的一小段时间，循序渐进练习与复盘。",
    goal: "建立稳定的解题习惯",
    topics: ["基础算法", "逻辑思维", "专题突破"],
    problemIds: [2, 1, 9, 4, 8],
  },
  {
    id: "contest",
    title: "算法竞赛",
    subtitle: "向下一场比赛进阶",
    description: "从个人专题到 ACM / ICPC 集训，打通独立思考与比赛迁移。",
    goal: "提高独立解题与赛场表现",
    topics: ["动态规划", "图论", "模拟赛"],
    problemIds: [2, 1, 3, 8, 5],
  },
  {
    id: "interview",
    title: "求职面试",
    subtitle: "写得出，也讲得清",
    description: "练习常见题型、复杂度分析与思路表达，准备下一次技术面试。",
    goal: "清楚解释思路与复杂度",
    topics: ["数组", "数据结构", "表达与边界"],
    problemIds: [2, 11, 9, 8, 4],
  },
  {
    id: "postgrad",
    title: "考研 408",
    subtitle: "让知识点真正落地",
    description: "围绕数据结构中的算法设计题练习，连接手算过程与代码实现。",
    goal: "掌握数据结构算法设计题",
    topics: ["数据结构", "图的遍历", "算法分析"],
    problemIds: [2, 9, 4, 8, 3],
  },
  {
    id: "beginner",
    title: "编程入门",
    subtitle: "从第一题开始积累",
    description: "从输入输出、循环与数组出发，逐步建立解决问题的信心。",
    goal: "独立完成基础编程题",
    topics: ["输入输出", "循环与数组", "调试习惯"],
    problemIds: [2, 4, 9, 6, 7],
  },
  {
    id: "teaching",
    title: "课堂与培训",
    subtitle: "让每位学生都有下一步",
    description: "老师安排分层练习，学生按自己的节奏完成，课堂与课后自然连接。",
    goal: "将课堂知识迁移到独立练习",
    topics: ["分层作业", "学情观察", "课后巩固"],
    problemIds: [2, 9, 6, 7, 11],
  },
];
export function getLearningTrack(id: LearningTrack) {
  return learningTracks.find((track) => track.id === id)!;
}
