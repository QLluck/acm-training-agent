import { notFound } from "next/navigation";
import { problems } from "@/data/problems";
import { TrainingSession } from "@/components/training-session";

export function generateStaticParams() {
  return problems.map((p) => ({ id: String(p.id) }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: problems.find((p) => String(p.id) === id)?.title ?? "训练题目",
  };
}
export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = problems.find((p) => String(p.id) === id);
  if (!problem) notFound();
  return <TrainingSession problem={problem} />;
}
