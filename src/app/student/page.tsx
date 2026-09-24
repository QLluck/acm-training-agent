import type { Metadata } from "next";
import { StudentDashboard } from "@/components/student-dashboard";

export const metadata: Metadata = { title: "我的训练" };
export default function StudentPage() {
  return <StudentDashboard />;
}
