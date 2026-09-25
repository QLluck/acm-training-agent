"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCheck,
  Clock3,
  Download,
  FileText,
  LaptopMinimal,
  LockKeyhole,
  Settings2,
  SlidersHorizontal,
  Target,
  Trash2,
  UserRound,
} from "lucide-react";
import { AccountAvatar, TrackPicker } from "@/components/learning-controls";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeading, SectionTitle } from "@/components/ui";
import {
  accountActions,
  personalStudentId,
  useAccount,
} from "@/lib/account-store";
import { demoActions, useDemo } from "@/lib/demo-store";
import { buildPersonalExport } from "@/lib/learning";
import { getLearningTrack } from "@/data/learning-tracks";
import { problems } from "@/data/problems";
import type { AccountProfile } from "@/types/account";

const tabs = [
  { id: "overview", title: "我的概览", icon: UserRound },
  { id: "profile", title: "个人资料", icon: FileText },
  { id: "preferences", title: "学习偏好", icon: SlidersHorizontal },
  { id: "library", title: "收藏与笔记", icon: Bookmark },
  { id: "data", title: "账户与数据", icon: Settings2 },
];
const roleLabels = {
  learner: "个人学习者",
  student: "在校学生",
  teacher: "老师 / 培训讲师",
};

export function AccountCenter({ tab }: { tab: string }) {
  const account = useAccount();
  const { profile } = account;
  const state = useDemo();
  const [notice, setNotice] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const selectedTab = tabs.some((t) => t.id === tab) ? tab : "overview";
  const own = Object.values(state.results).filter(
    (r) => r.studentId === personalStudentId,
  );
  const notes = problems
    .map((p) => ({
      problem: p,
      note:
        state.drafts[`${personalStudentId}:${p.id}`]?.note ||
        own.find((r) => r.problemId === p.id)?.note ||
        "",
    }))
    .filter((n) => n.note.trim());
  const saved = problems.filter((p) => account.bookmarks.includes(p.id));
  const track = getLearningTrack(profile.track);
  const startPersonal = () => demoActions.selectStudent(personalStudentId);
  function exportData() {
    const data = {
      product: "练序 CodePath · 个人记录",
      profile,
      bookmarks: account.bookmarks,
      ...buildPersonalExport(
        personalStudentId,
        Object.values(state.results),
        state.drafts,
      ),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "codepath-my-learning.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("已导出你的资料、练习记录、收藏和笔记。");
  }
  return (
    <div className="account-page">
      <PageHeading
        eyebrow="A SPACE THAT IS YOURS"
        title="我的个人中心"
        description="你的目标、记录和每一点进步，都在这里。"
        action={
          <Link
            href="/student"
            onClick={startPersonal}
            className="button primary"
          >
            继续练习 <ArrowRight size={16} />
          </Link>
        }
      />
      <section className="account-cover card">
        <AccountAvatar avatar={profile.avatar} size="large" />
        <div className="account-identity">
          <div>
            <h2>{profile.nickname}</h2>
            <span className="tag">体验账户</span>
          </div>
          <p>{profile.bio || "写一句话，送给正在学习的自己。"}</p>
          <span>
            {roleLabels[profile.role]}
            <i />
            ID · CP-0001
          </span>
        </div>
        <div className="account-cover-goal">
          <Target size={19} />
          <div>
            <span>正在向这个方向前进</span>
            <strong>
              {track.title} · 每天 {profile.dailyMinutes} 分钟
            </strong>
          </div>
        </div>
      </section>
      <nav className="account-tabs" aria-label="个人中心分类">
        {tabs.map(({ id, title, icon: Icon }) => (
          <Link
            key={id}
            href={`/account?tab=${id}`}
            className={selectedTab === id ? "active" : ""}
            aria-current={selectedTab === id ? "page" : undefined}
          >
            <Icon size={16} />
            {title}
          </Link>
        ))}
      </nav>
      {notice && (
        <div className="inline-notice" role="status">
          <Check size={16} />
          {notice}
          <button
            type="button"
            className="icon-button"
            aria-label="关闭提示"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
      {selectedTab === "overview" && (
        <div className="account-overview">
          <div className="account-stat-grid">
            {[
              {
                icon: CheckCheck,
                value: own.filter((r) => r.outcome === "ac").length,
                label: "已完成练习",
                unit: "题",
              },
              {
                icon: Clock3,
                value: Math.floor(
                  own.reduce((sum, r) => sum + r.seconds, 0) / 60,
                ),
                label: "累计专注",
                unit: "分钟",
              },
              {
                icon: Bookmark,
                value: saved.length,
                label: "我的收藏",
                unit: "题",
              },
              {
                icon: FileText,
                value: notes.length,
                label: "个人笔记",
                unit: "篇",
              },
            ].map(({ icon: Icon, value, label, unit }) => (
              <div className="card account-stat" key={label}>
                <Icon size={21} />
                <span>{label}</span>
                <strong>
                  {value}
                  <small>{unit}</small>
                </strong>
              </div>
            ))}
          </div>
          <div className="account-columns">
            <section className="card account-section">
              <SectionTitle
                title="属于你的学习节奏"
                subtitle="当前目标会同步到首页与练习计划"
                aside={
                  <Link href="/account?tab=preferences" className="text-link">
                    调整 <ArrowUpRight size={15} />
                  </Link>
                }
              />
              <div className="account-goal">
                <span className="goal-icon">
                  <Target size={27} />
                </span>
                <div>
                  <h3>{track.title}</h3>
                  <p>{track.goal}</p>
                </div>
              </div>
              <div className="preference-summary">
                <span>
                  每日投入<strong>{profile.dailyMinutes} 分钟</strong>
                </span>
                <span>
                  练习语言<strong>{profile.language}</strong>
                </span>
                <span>
                  进度展示
                  <strong>
                    {profile.shareProgress ? "已分享给教学空间" : "仅自己可见"}
                  </strong>
                </span>
              </div>
              <Link
                href="/student"
                onClick={startPersonal}
                className="button secondary full-width"
              >
                打开我的练习计划 <ArrowRight size={16} />
              </Link>
            </section>
            <section className="card account-section">
              <SectionTitle
                title="最近的练习"
                subtitle="这次体验里的每一小步"
                aside={
                  <Link href="/account?tab=library" className="text-link">
                    我的笔记 <ArrowUpRight size={15} />
                  </Link>
                }
              />
              {own.length ? (
                <div className="account-history">
                  {[...own]
                    .reverse()
                    .slice(0, 4)
                    .map((r) => (
                      <Link
                        key={r.problemId}
                        href={`/student/session/${r.problemId}`}
                        onClick={startPersonal}
                      >
                        <span className="history-check">
                          <CheckCheck size={18} />
                        </span>
                        <div>
                          <strong>
                            {problems.find((p) => p.id === r.problemId)?.title}
                          </strong>
                          <small>
                            {r.outcome === "ac" ? "已完成" : "待继续"} ·{" "}
                            {r.hintLevel ? `Hint ${r.hintLevel}` : "独立思考"} ·{" "}
                            {Math.ceil(r.seconds / 60)} 分钟
                          </small>
                        </div>
                        <ArrowUpRight size={16} />
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="empty-state compact-empty">
                  <CodeIllustration />
                  <h3>第一段成长记录，等你来写。</h3>
                  <p>完成一道练习，或记下一个新发现。</p>
                  <Link
                    href="/student/session/2"
                    onClick={startPersonal}
                    className="text-link"
                  >
                    从一道热身题开始 <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
      {selectedTab === "profile" && (
        <section className="card account-section">
          <SectionTitle
            title="让这个空间更像你"
            subtitle="一个昵称，一句话介绍，就足够开始。"
          />
          <ProfileForm
            key={JSON.stringify(profile)}
            profile={profile}
            onSave={(next) => {
              accountActions.updateProfile(next);
              setNotice("个人资料已保存，学习空间已同步更新。");
            }}
          />
        </section>
      )}
      {selectedTab === "preferences" && (
        <div className="account-preferences">
          <section className="card account-section">
            <SectionTitle
              title="我的学习方向"
              subtitle="选择一个当前目标，之后随时可以切换"
            />
            <TrackPicker compact />
          </section>
          <section className="card account-section">
            <SectionTitle
              title="按自己的节奏来"
              subtitle="设置会自动保存，下次打开仍然生效"
            />
            <div className="preference-row">
              <div>
                <h3>每天留给练习的时间</h3>
                <p>这是一个轻量目标，不必为了打卡赶进度。</p>
              </div>
              <div
                className="time-options"
                role="group"
                aria-label="每日学习时长"
              >
                {[15, 30, 45, 60, 90].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={profile.dailyMinutes === n ? "selected" : ""}
                    aria-pressed={profile.dailyMinutes === n}
                    onClick={() =>
                      accountActions.updateProfile({ dailyMinutes: n })
                    }
                  >
                    {n} min
                  </button>
                ))}
              </div>
            </div>
            <div className="preference-row">
              <div>
                <label htmlFor="preferred-language">默认练习语言</label>
                <p>新的练习会使用此语言；已有草稿保持原来的语言。</p>
              </div>
              <select
                id="preferred-language"
                name="language"
                value={profile.language}
                onChange={(e) =>
                  accountActions.updateProfile({
                    language: e.target.value as AccountProfile["language"],
                  })
                }
              >
                {["C++17", "Python 3", "Java 17"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <Toggle
              label="轻量交互动效"
              description="卡片悬停时轻轻浮起，也可以选择更安静的界面。"
              checked={profile.gentleMotion}
              onChange={(value) =>
                accountActions.updateProfile({ gentleMotion: value })
              }
            />
          </section>
        </div>
      )}
      {selectedTab === "library" && (
        <div className="account-columns library-columns">
          <section className="card account-section">
            <SectionTitle
              title={`我的收藏 · ${saved.length}`}
              subtitle="把想再练一次的题，留给下一次"
            />
            {saved.length ? (
              saved.map((p) => (
                <div className="saved-problem" key={p.id}>
                  <span className="bookmark-mark">
                    <Bookmark size={18} />
                  </span>
                  <div>
                    <Link
                      href={`/student/session/${p.id}`}
                      onClick={startPersonal}
                    >
                      {p.title}
                    </Link>
                    <small>{p.tags.join(" · ")}</small>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`取消收藏：${p.title}`}
                    onClick={() => accountActions.toggleBookmark(p.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state compact-empty">
                <Bookmark size={29} />
                <h3>遇到好题，随手留下。</h3>
                <p>在学习空间或训练页点击收藏，就能在这里找到。</p>
                <Link
                  href="/student"
                  onClick={startPersonal}
                  className="text-link"
                >
                  看看今天的题单 <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </section>
          <section className="card account-section">
            <SectionTitle
              title={`个人笔记 · ${notes.length}`}
              subtitle="写给自己的思考，不随学习进度分享"
              aside={
                <span className="private-label">
                  <LockKeyhole size={13} />
                  仅自己可见
                </span>
              }
            />
            {notes.length ? (
              notes.map(({ problem, note }) => (
                <article className="personal-note" key={problem.id}>
                  <h3>{problem.title}</h3>
                  <p>{note}</p>
                  <Link
                    href={`/student/session/${problem.id}`}
                    onClick={startPersonal}
                    className="text-link"
                  >
                    回到这道题 <ArrowUpRight size={14} />
                  </Link>
                </article>
              ))
            ) : (
              <div className="empty-state compact-empty">
                <FileText size={29} />
                <h3>写下“为什么”，也写下“原来如此”。</h3>
                <p>练习中的笔记会自动收纳在这里。</p>
              </div>
            )}
          </section>
        </div>
      )}
      {selectedTab === "data" && (
        <div className="account-data">
          <section className="card account-section">
            <SectionTitle
              title="由你决定，展示多少"
              subtitle="先照顾自己的学习，再选择是否与老师一起进步"
            />
            <Toggle
              label="向教学空间分享学习进度"
              description="分享完成情况与能力画像；代码草稿和个人笔记始终不包含在内。"
              checked={profile.shareProgress}
              onChange={(value) => {
                accountActions.updateProfile({ shareProgress: value });
                setNotice(
                  value
                    ? "已分享学习进度，可以在教学工作台看到更新。"
                    : "已停止分享，教学工作台不再展示你的个人进度。",
                );
              }}
            />
            <div className="data-note">
              <LockKeyhole size={15} />
              <span>个人笔记、收藏和资料编辑都在自己的空间完成。</span>
            </div>
          </section>
          <section className="card account-section">
            <SectionTitle
              title="账户与学习记录"
              subtitle="当前为体验账户，资料与记录保存在当前浏览器"
            />
            <div className="device-row">
              <span className="device-icon">
                <LaptopMinimal size={24} />
              </span>
              <div>
                <strong>当前浏览器</strong>
                <p>正在使用 · 无需绑定手机或邮箱</p>
              </div>
              <span className="tag green-tag">本机体验</span>
            </div>
            <div className="preference-row">
              <div>
                <h3>带走我的学习记录</h3>
                <p>下载个人资料、收藏、笔记与练习记录的 JSON 文件。</p>
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={exportData}
              >
                <Download size={16} />
                导出我的数据
              </button>
            </div>
            <div className="preference-row">
              <div>
                <h3>重新整理学习记录</h3>
                <p>清除自己的练习、草稿、收藏和笔记，保留资料与偏好。</p>
              </div>
              <button
                type="button"
                className="button danger-outline"
                onClick={() => setConfirmClear(true)}
              >
                <Trash2 size={16} />
                清除我的学习数据
              </button>
            </div>
          </section>
        </div>
      )}
      {confirmClear && (
        <ConfirmDialog
          title="清除自己的学习记录？"
          description="这会删除当前浏览器里你的练习结果、代码草稿、个人笔记和收藏。操作无法撤销。"
          cancelText="保留记录"
          confirmText="确认清除学习数据"
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            demoActions.clearStudentRecords(personalStudentId);
            accountActions.clearBookmarks();
            setConfirmClear(false);
            setNotice("你的学习记录已清除，个人资料与偏好仍然保留。");
          }}
        />
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="toggle-control">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <span className="toggle-track" aria-hidden="true" />
      </span>
    </label>
  );
}

function ProfileForm({
  profile,
  onSave,
}: {
  profile: AccountProfile;
  onSave: (profile: Partial<AccountProfile>) => void;
}) {
  const [avatar, setAvatar] = useState(profile.avatar);
  const [error, setError] = useState("");
  return (
    <form
      className="profile-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const nickname = String(data.get("nickname") ?? "").trim();
        if (!nickname) {
          setError("请填写一个昵称，最多 24 个字。");
          form.querySelector<HTMLInputElement>("#nickname")?.focus();
          return;
        }
        onSave({
          nickname,
          bio: String(data.get("bio") ?? "").trim(),
          role: data.get("role") as AccountProfile["role"],
          avatar,
        });
      }}
    >
      <div className="avatar-editor">
        <AccountAvatar avatar={avatar} size="large" />
        <div>
          <h3>选一个喜欢的头像</h3>
          <p>用一个小图案，代表今天的自己。</p>
          <div className="avatar-options" role="group" aria-label="选择头像">
            {(["code", "coffee", "sprout", "orbit"] as const).map(
              (value, i) => (
                <button
                  key={value}
                  type="button"
                  aria-label={
                    ["代码头像", "咖啡头像", "新芽头像", "轨道头像"][i]
                  }
                  aria-pressed={avatar === value}
                  className={avatar === value ? "selected" : ""}
                  onClick={() => setAvatar(value)}
                >
                  <AccountAvatar avatar={value} size="small" />
                </button>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="nickname">怎么称呼你</label>
          <input
            id="nickname"
            name="nickname"
            defaultValue={profile.nickname}
            maxLength={24}
            required
            autoComplete="nickname"
            aria-invalid={!!error}
            aria-describedby={error ? "nickname-error" : undefined}
            placeholder="例如：小林…"
          />
          {error && (
            <span className="field-error" id="nickname-error" role="alert">
              {error}
            </span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="account-role">我目前的身份</label>
          <select id="account-role" name="role" defaultValue={profile.role}>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field full-field">
          <label htmlFor="bio">
            一句话介绍自己 <small>可选 · 120 字以内</small>
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio}
            maxLength={120}
            rows={3}
            placeholder="最近在学什么，想达成什么目标…"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="form-footer">
        <span>
          <LockKeyhole size={13} />
          只需你愿意填写的信息
        </span>
        <button className="button primary" type="submit">
          <Check size={16} />
          保存个人资料
        </button>
      </div>
    </form>
  );
}

function CodeIllustration() {
  return (
    <span className="empty-code" aria-hidden="true">
      &lt; / &gt;
    </span>
  );
}
