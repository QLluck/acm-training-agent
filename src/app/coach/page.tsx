import type { Metadata } from "next";
import { CoachDashboard } from "@/components/coach-dashboard";

export const metadata: Metadata = { title: "教练工作台" };
export default function CoachPage() {
  return <CoachDashboard />;
}
