import type { Metadata } from "next";
import { AccountCenter } from "@/components/account-center";

export const metadata: Metadata = { title: "个人中心" };
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <AccountCenter tab={tab ?? "overview"} />;
}
