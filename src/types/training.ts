export const skillKeys = [
  "dp",
  "graph",
  "math",
  "greedy",
  "dataStructure",
  "implementation",
] as const;
export type SkillKey = (typeof skillKeys)[number];
export type Skills = Record<SkillKey, number>;

export interface Student {
  id: string;
  name: string;
  cfRating: number;
  level: string;
  target: string;
  weeklyHours: number;
  completionRate: number;
  firstAcRate: number;
  hintLevelAverage: number;
  streak: number;
  skills: Skills;
  previousSkills: Skills;
  weaknesses: string[];
  trend: number[];
  recentDpSuccessRate: number;
  submissions: number;
  daysInactive: number;
  averageDifficulty: number;
  earlyStuckRate: number;
}

export interface Problem {
  id: number;
  title: string;
  platform: string;
  rating: number;
  skills: SkillKey[];
  tags: string[];
  minutes: number;
  objective: string;
  statement: string;
  input: string;
  output: string;
  sample: { input: string; output: string; explanation: string };
  hints: [string, string, string, string];
}

export type TrainingStage = "热身" | "核心" | "综合" | "挑战";
export interface PlanItem {
  problem: Problem;
  stage: TrainingStage;
  reason: string;
  status: "待训练" | "已完成" | "待补题";
}

export interface SessionResult {
  studentId: string;
  problemId: number;
  outcome: "ac" | "unfinished";
  seconds: number;
  hintLevel: number;
  note: string;
  finishedAt: string;
  skillDelta: Partial<Skills>;
  analysis: string;
  nextStep: string;
}

export interface SessionDraft {
  language?: "C++17" | "Python 3" | "Java 17";
  code: string;
  note: string;
  hintLevel: number;
  seconds: number;
}

export interface CoachDecision {
  id: string;
  kind: "accept" | "difficulty" | "topic" | "individual";
  text: string;
}

export interface DemoState {
  version: 1;
  studentId: string;
  results: Record<string, SessionResult>;
  drafts: Record<string, SessionDraft>;
  round: number;
  decisions: CoachDecision[];
  difficulty: number;
  topic: string;
  extraStudentId: string;
}
