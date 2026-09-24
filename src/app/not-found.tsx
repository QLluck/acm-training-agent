import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="empty-state card">
      <SearchX size={42} />
      <h1>没有找到这个页面</h1>
      <p>这道题可能不在当前演示题单中，请返回训练工作台。</p>
      <Link href="/student" className="button primary">
        返回我的训练
      </Link>
    </div>
  );
}
