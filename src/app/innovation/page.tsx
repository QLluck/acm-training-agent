import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CircleDot,
  Database,
  Fingerprint,
  GitBranch,
  Lightbulb,
  Network,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PolicyDemo } from "@/components/policy-demo";
import { DemoBadge, PageHeading, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "产品创新与未来路线" };
const flywheel = [
  "更多真实队员",
  "更多训练轨迹",
  "更准确的能力判断",
  "更好的训练策略",
  "更好的训练效果",
  "吸引更多队伍使用",
];
const setterSteps = [
  "人类提出题目创新点",
  "AI 扩展题意与变形",
  "检索相似题",
  "生成初版标程",
  "生成暴力解",
  "随机对拍",
  "构造边界数据",
  "生成 Validator / Checker",
  "难度初步评估",
  "人类出题人最终审核",
];

export default function InnovationPage() {
  return (
    <div className="innovation-page">
      <PageHeading
        eyebrow="BEYOND A PROBLEM SET"
        title="让训练决策，有据可循。"
        description="训练数据 + 能力画像 + 教练训练策略 + AI Agent 工作流"
        action={<DemoBadge />}
      />
      <section className="innovation-hero">
        <span className="innovation-icon">
          <BrainCircuit size={36} />
        </span>
        <div>
          <span className="eyebrow">THE CORE OF ACM TRAINING AGENT</span>
          <h2>真正的核心，是知道下一步怎么练。</h2>
          <p>
            面向高校 ACM / 算法竞赛集训队的 AI 个性化训练与教练辅助系统。
            <br />
            不再盲目刷题，让每一道题都有训练目的。
          </p>
        </div>
        <span className="innovation-orbit" aria-hidden="true">
          <CircleDot size={120} strokeWidth={0.8} />
        </span>
      </section>
      <div className="positioning-grid">
        {[
          {
            icon: Database,
            title: "不是新的题库",
            text: "CF、牛客、洛谷、AtCoder 提供题目，我们利用训练记录决定今天该刷什么。",
          },
          {
            icon: Sparkles,
            title: "不是 ChatGPT 套壳",
            text: "推荐受画像和教练策略约束；大模型是可替换的能力组件，不是核心资产。",
          },
          {
            icon: Fingerprint,
            title: "不是普通刷题统计",
            text: "从做了多少题，进一步判断为什么卡题、能力如何变化、下一步如何验证。",
          },
        ].map(({ icon: Icon, title, text }) => (
          <section className="card" key={title}>
            <Icon size={25} />
            <h3>{title}</h3>
            <p>{text}</p>
          </section>
        ))}
      </div>
      <section className="card innovation-section">
        <SectionTitle
          title="把教练经验，变成可执行的 Training Policy"
          subtitle="可解释、可调整、可验证 · AI 在教练策略约束下做个性化决策"
          aside={
            <span className="tag purple-tag">
              <GitBranch size={14} />
              交互演示
            </span>
          }
        />
        <PolicyDemo />
        <div className="policy-routes">
          <span>未来可以持续沉淀</span>
          {[
            "训练规则",
            "难度调整",
            "新人培养路线",
            "区域赛训练路线",
            "专题训练策略",
            "比赛复盘策略",
          ].map((v) => (
            <span className="tag" key={v}>
              {v}
            </span>
          ))}
        </div>
      </section>
      <section className="card innovation-section">
        <SectionTitle
          title="每一轮训练，都让长期能力模型更完整"
          subtitle="护城河 / 数据飞轮 · 以下是待真实试点验证的产品假设"
          aside={<Network size={21} className="purple" />}
        />
        <div className="flywheel">
          {flywheel.map((title, i) => (
            <div key={title}>
              <span>0{i + 1}</span>
              <strong>{title}</strong>
              {i < flywheel.length - 1 && <ArrowRight size={18} />}
            </div>
          ))}
        </div>
        <div className="asset-statement">
          <ShieldCheck size={22} />
          <p>
            真正的长期资产是 <strong>训练数据、教练策略和训练效果验证</strong>
            ，而不是某一个大模型。
          </p>
        </div>
        <div className="validation-grid">
          <div>
            <h3>有真实训练场景</h3>
            <p>
              项目发起人来自高校 ACM
              集训队，具备队员、教练和持续训练反馈场景。Demo
              未宣称已有平台用户或合作高校。
            </p>
          </div>
          <div>
            <h3>需要真实效果验证</h3>
            <p>
              下一阶段对比独立完成率、迁移题表现、Hint
              依赖程度与教练选题耗时，结合周期与难度做对照。
            </p>
          </div>
        </div>
      </section>
      <section className="card innovation-section roadmap-section">
        <SectionTitle
          title="从可交互原型，走向真实集训平台"
          subtitle="先验证训练逻辑，再逐步接入真实数据与能力"
          aside={<span className="tag">PRODUCT ROADMAP</span>}
        />
        <div className="roadmap-grid">
          <article className="roadmap-item current">
            <span className="roadmap-dot">
              <Check size={14} />
            </span>
            <span className="eyebrow">NOW / 当前原型</span>
            <h3>完整训练闭环</h3>
            <p>模拟能力画像、可解释题单、分级 Hint、训练复盘与教练工作台。</p>
            <span className="tag green-tag">本次 Demo 已实现</span>
          </article>
          <article className="roadmap-item">
            <span className="roadmap-dot">02</span>
            <span className="eyebrow">NEXT / 真实试点</span>
            <h3>真实数据与训练验证</h3>
            <p>
              优先接入 Codeforces
              提交记录，建立账户与团队，加入教练策略配置及可控的 LLM Hint。
            </p>
            <span className="tag">规划中</span>
          </article>
          <article className="roadmap-item">
            <span className="roadmap-dot">03</span>
            <span className="eyebrow">LATER / 能力扩展</span>
            <h3>跨 OJ 的长期能力模型</h3>
            <p>
              逐步接入牛客、洛谷、AtCoder 与校内
              OJ，在授权和数据可用前提下汇聚训练轨迹。
            </p>
            <span className="tag">未来规划</span>
          </article>
        </div>
        <div className="setter-concept">
          <div className="setter-heading">
            <Lightbulb size={23} />
            <div>
              <h3>未来探索：AI 辅助原创出题</h3>
              <p>
                ACM 队员 / 教练提出创新想法，AI
                辅助完成工程化出题流程。当前仅概念展示。
              </p>
            </div>
            <span className="tag">FUTURE CONCEPT</span>
          </div>
          <div className="setter-flow">
            {setterSteps.map((step, i) => (
              <div key={step}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {step}
                {i < setterSteps.length - 1 && <ArrowRight size={13} />}
              </div>
            ))}
          </div>
          <p className="setter-note">
            <ShieldCheck size={15} />
            题目创新与最终审核始终由人类出题人负责；AI
            生成的题目不能未经验证直接投入比赛。
          </p>
        </div>
      </section>
      <section className="innovation-cta">
        <Users size={30} />
        <div>
          <h2>让教练的经验，陪伴每一名队员。</h2>
          <p>从今天的训练，到下一场比赛，把每一步进步连接起来。</p>
        </div>
        <Link className="button primary" href="/coach">
          体验教练工作台 <ArrowUpRight size={17} />
        </Link>
        <Link className="text-link" href="/student">
          <Route size={16} />
          体验训练闭环
        </Link>
      </section>
    </div>
  );
}
