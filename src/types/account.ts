export type LearningTrack =
  | "practice"
  | "contest"
  | "interview"
  | "postgrad"
  | "beginner"
  | "teaching";
export type EditorLanguage = "C++17" | "Python 3" | "Java 17";
export interface AccountProfile {
  nickname: string;
  bio: string;
  role: "learner" | "student" | "teacher";
  avatar: "code" | "coffee" | "sprout" | "orbit";
  track: LearningTrack;
  dailyMinutes: number;
  language: EditorLanguage;
  shareProgress: boolean;
  gentleMotion: boolean;
}
export interface AccountState {
  version: 1;
  profile: AccountProfile;
  sidebarCollapsed: boolean;
  bookmarks: number[];
}
