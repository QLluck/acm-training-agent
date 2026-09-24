import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Check,
  CircleDot,
  Database,
  Fingerprint,
  GitBranch,
  GraduationCap,
  Layers3,
  ListChecks,
  Network,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Users,
  X,
} from "lucide-react";
import { RadarChart } from "@/components/charts";
import { students } from "@/data/students";

const comparisons = [
  ["所有人同一题单", "每个队员不同训练计划"],
  ["队员自己找题", "系统主动决定下一题"],
  ["主要看 Rating", "多维动态能力画像"],
  ["卡题直接看题解", "分级 Hint，保留独立思考"],
  ["教练人工统计", "自动 Team Dashboard"],
  ["训练经验靠个人", "Training Policy 可沉淀"],
  ["刷题数量导向", "训练目标和效果导向"],
];
const steps = [
  { icon: Database, title: "导入训练数据", text: "汇聚多平台训练轨迹" },
  { icon: Fingerprint, title: "建立能力画像", text: "六维能力，动态更新" },
  { icon: Target, title: "识别训练瓶颈", text: "找到真正需要补强的点" },
  { icon: ListChecks, title: "生成个性化计划", text: "每道题都有推荐原因" },
  { icon: BrainCircuit, title: "AI 陪练与复盘", text: "分级提示，保留思考" },
  {
    icon: ChartNoAxesCombined,
    title: "更新能力模型",
    text: "结果驱动下一轮训练",
  },
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="live-dot" /> BUILT FOR ACM TEAMS{" "}
            <span>DEMO / Prototype</span>
          </span>
          <h1>
            不再盲目刷题。
            <br />
            <span>
              让每一次训练，
              <br className="hero-break" />
              都有明确方向。
            </span>
          </h1>
          <p className="hero-subtitle">AI 为每一名竞赛队员设计真正需要的训练</p>
          <p className="hero-description">
            面向高校 ACM / 算法竞赛集训队的
            <br />
            AI 个性化训练与教练辅助系统
          </p>
          <div className="button-row">
            <Link className="button hero-primary" href="/student">
              查看队员端 <ArrowUpRight size={18} />
            </Link>
            <Link className="button hero-secondary" href="/coach">
              <Users size={17} />
              查看教练端
            </Link>
          </div>
          <div className="hero-footnote">
            <ShieldCheck size={14} />
            无需 API Key
            <span />
            本地模拟数据
            <span />
            完整训练闭环
          </div>
        </div>
        <div className="hero-visual">
          <div className="preview-window">
            <div className="preview-header">
              <span className="window-dots">
                <i />
                <i />
                <i />
              </span>
              <span>YOUR TRAINING, PERSONALIZED</span>
              <span className="preview-live">● LIVE DEMO</span>
            </div>
            <div className="preview-profile">
              <div className="avatar">袁</div>
              <div>
                <strong>袁某的训练画像</strong>
                <p>
                  Codeforces <b>1548</b> <span>· 进阶组</span>
                </p>
              </div>
              <span className="mini-trend">↗ 稳步进步</span>
            </div>
            <RadarChart
              current={students[0].skills}
              previous={students[0].previousSkills}
              compact
            />
            <div className="preview-diagnosis">
              <Sparkles size={18} />
              <div>
                <strong>发现训练瓶颈：DP 状态设计</strong>
                <p>实现能力 88 / 100 · DP 掌握度 52 / 100</p>
              </div>
            </div>
          </div>
          <div className="floating-plan">
            <span className="floating-icon">
              <ListChecks size={20} />
            </span>
            <div>
              <small>下一步，已经为你准备好</small>
              <strong>2 道状态设计 + 1 道综合训练</strong>
            </div>
            <span className="check-bubble">
              <Check size={15} />
            </span>
          </div>
        </div>
      </section>
      <div className="principle-strip">
        <span>TRAIN WITH PURPOSE</span>
        <p>
          题库解决「有题可刷」，我们解决{" "}
          <strong>「今天该刷什么、为什么刷、怎么刷」</strong>。
        </p>
        <ArrowDown size={18} />
      </div>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">01 / THE SHIFT</span>
            <h2>从统一题单，到每个人的成长路线</h2>
          </div>
          <p>题目不缺，缺的是训练决策。</p>
        </div>
        <div className="comparison-grid">
          <div className="comparison traditional">
            <div className="comparison-heading">
              <Layers3 size={22} />
              <div>
                <h3>传统训练方式</h3>
                <span>经验驱动，手动管理</span>
              </div>
            </div>
            {comparisons.map(([old]) => (
              <div className="comparison-row" key={old}>
                <X size={16} />
                <span>{old}</span>
              </div>
            ))}
          </div>
          <div className="comparison agent">
            <div className="comparison-heading">
              <Sparkles size={22} />
              <div>
                <h3>ACM Training Agent</h3>
                <span>数据 + 策略，驱动持续进步</span>
              </div>
              <span className="tag purple-tag">新的训练方式</span>
            </div>
            {comparisons.map(([, next]) => (
              <div className="comparison-row" key={next}>
                <Check size={17} />
                <span>{next}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pain-grid">
          <div>
            <span>01</span>
            <strong>水平不同，训练却相同</strong>
            <p>主力吃不饱，新人做不动，中游重复刷熟悉的题。</p>
          </div>
          <div>
            <span>02</span>
            <strong>数据散落，短板难以发现</strong>
            <p>CF、牛客、洛谷、AtCoder 与校内 OJ，缺少统一画像。</p>
          </div>
          <div>
            <span>03</span>
            <strong>教练很忙，AI 又给得太多</strong>
            <p>人工选题统计耗时，直接看完整答案又失去思考过程。</p>
          </div>
        </div>
      </section>

      <section className="home-section workflow-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">02 / THE TRAINING LOOP</span>
            <h2>不是一次推荐，而是一轮持续进化的训练</h2>
          </div>
          <span className="section-chip">
            <GitBranch size={15} />
            形成真正的训练闭环
          </span>
        </div>
        <div className="workflow-grid">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div className="workflow-step" key={title}>
              <span className="step-number">0{i + 1}</span>
              <span className="step-icon">
                <Icon size={23} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              {i < 5 && <ArrowRight className="step-arrow" size={17} />}
            </div>
          ))}
        </div>
        <div className="loop-return">
          ↳ 训练结果回流，更新画像与下一轮计划 <span>←</span>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">03 / BUILT FOR BOTH SIDES</span>
            <h2>队员有方向，教练有依据</h2>
          </div>
          <p>从个人的下一题，到全队的下一周。</p>
        </div>
        <div className="value-grid">
          <div className="value-card student-value">
            <span className="value-icon">
              <GraduationCap size={25} />
            </span>
            <span className="eyebrow">FOR STUDENTS</span>
            <h3>把时间花在真正需要的训练上</h3>
            <ul>
              <li>每天有明确题单，知道该刷什么</li>
              <li>能力画像持续更新，知道哪里薄弱</li>
              <li>卡题时逐级求助，保留独立思考</li>
              <li>每题都有训练目标，练完有可解释反馈</li>
            </ul>
            <Link href="/student">
              进入我的训练 <ArrowRight size={17} />
            </Link>
          </div>
          <div className="value-card coach-value">
            <span className="value-icon">
              <Users size={25} />
            </span>
            <span className="eyebrow">FOR COACHES</span>
            <h3>看见每个队员，也看清整个团队</h3>
            <ul>
              <li>AI 辅助选题，减少手工统计成本</li>
              <li>根据水平和短板制定分层训练</li>
              <li>Dashboard 汇集热力图与关注提醒</li>
              <li>教练经验逐步沉淀为 Training Policy</li>
            </ul>
            <Link href="/coach">
              打开教练工作台 <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">04 / WHY IT MATTERS</span>
            <h2>训练决策，是产品的核心</h2>
          </div>
          <Link className="text-link" href="/innovation">
            了解产品创新 <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: Timer,
              title: "训练效率",
              text: "从大量刷题，到针对当前瓶颈训练。",
            },
            {
              icon: Fingerprint,
              title: "动态个性化",
              text: "新人、进阶队员与主力，各有成长路线。",
            },
            {
              icon: CircleDot,
              title: "可解释推荐",
              text: "每道题都说明为什么推荐、预期练什么。",
            },
            {
              icon: Users,
              title: "教练增效",
              text: "用共同薄弱点与提醒辅助每周训练决策。",
            },
            {
              icon: Database,
              title: "长期能力模型",
              text: "持续积累训练轨迹，观察能力如何变化。",
            },
            {
              icon: Network,
              title: "教练经验资产化",
              text: "让优秀训练经验成为可复用、可验证的策略。",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div className="feature-card" key={title}>
              <Icon size={23} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="home-cta">
        <div>
          <span className="eyebrow">START A BETTER TRAINING DAY</span>
          <h2>下一道题，带着目的出发。</h2>
          <p>从一份能力画像开始，体验完整的训练决策闭环。</p>
        </div>
        <Link className="button primary" href="/student">
          体验今日训练 <Route size={18} />
        </Link>
      </section>
    </div>
  );
}
