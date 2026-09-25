import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { defaultStudent } from "../../src/data/students";

test("个人资料与学习偏好保存、跨页同步，新的练习使用所选语言", async ({
  page,
}) => {
  await page.goto("/account?tab=profile");
  await page.getByLabel("怎么称呼你").fill("林间代码");
  await page
    .getByLabel("一句话介绍自己", { exact: false })
    .fill("从今天开始，认真想明白一道题。");
  await page.getByLabel("我目前的身份").selectOption("teacher");
  await page.getByRole("button", { name: "新芽头像" }).click();
  await page.getByRole("button", { name: "保存个人资料" }).click();
  await expect(page.getByRole("status")).toContainText("个人资料已保存");
  await expect(page.locator(".account-cover")).toContainText("老师 / 培训讲师");
  await expect(page.locator(".header-account")).toContainText("林间代码");
  await page.reload();
  await expect(page.getByLabel("怎么称呼你")).toHaveValue("林间代码");
  await expect(page.getByRole("button", { name: "新芽头像" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("link", { name: "学习偏好", exact: true }).click();
  await page.getByRole("button", { name: "求职面试" }).click();
  await page.getByRole("button", { name: "45 min", exact: true }).click();
  await page.getByLabel("默认练习语言").selectOption("Python 3");
  await page.getByLabel("轻量交互动效").uncheck();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "林间代码",
  );
  await expect(page.getByRole("button", { name: /求职面试/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("link", { name: /每天 45 分钟/ })).toBeVisible();
  await expect(page.locator(".app-shell")).toHaveClass(/still-interface/);
  await page
    .getByRole("link", { name: "开始今天的练习", exact: false })
    .click();
  await expect(page.getByLabel("代码草稿")).toHaveValue(/def solve\(\)/);
  await page.getByLabel("代码草稿").fill("print('keep this draft')");
  await page.goto("/account?tab=preferences");
  await page.getByLabel("默认练习语言").selectOption("Java 17");
  await page.goto("/student/session/2");
  await expect(page.getByLabel("代码草稿")).toHaveValue(
    "print('keep this draft')",
  );
  await expect(page.locator(".editor-filename")).toContainText("main.py");
});

test("收藏、笔记、个人导出与确认清除形成完整账户操作，保留他人记录", async ({
  page,
}) => {
  await page.goto("/student");
  await page.getByLabel("切换模拟学员").selectOption("lin");
  await page.goto("/student/session/1");
  await page.getByLabel("训练笔记").fill("林沐自己的笔记");
  await page.getByRole("button", { name: "标记 AC", exact: true }).click();
  await page.goto("/");
  await page.getByRole("link", { name: /开始今天的练习/ }).click();
  await page.getByRole("button", { name: "收藏题目" }).click();
  await page.getByLabel("训练笔记").fill("个人观察：先检查边界，再写循环。");
  await page.getByLabel("代码草稿").fill("// my personal draft");
  await page.getByRole("button", { name: "标记 AC", exact: true }).click();
  await page.goto("/account?tab=library");
  await expect(
    page.getByRole("heading", { name: "我的收藏 · 1" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "个人笔记 · 1" }),
  ).toBeVisible();
  await expect(page.locator(".personal-note")).toContainText("先检查边界");
  await expect(
    page.getByText("林沐自己的笔记", { exact: true }),
  ).not.toBeVisible();
  await page.goto("/account?tab=data");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出我的数据" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("codepath-my-learning.json");
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported.results).toHaveLength(1);
  expect(exported.results[0].studentId).toBe(defaultStudent.id);
  expect(Object.keys(exported.drafts)).toEqual([`${defaultStudent.id}:2`]);
  expect(exported.bookmarks).toEqual([2]);
  expect(JSON.stringify(exported)).not.toContain("林沐自己的笔记");
  await page.getByRole("button", { name: "清除我的学习数据" }).click();
  await page.getByRole("button", { name: "保留记录" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "清除我的学习数据" }).click();
  await page.getByRole("button", { name: "确认清除学习数据" }).click();
  await page.goto("/account?tab=library");
  await expect(
    page.getByRole("heading", { name: "我的收藏 · 0" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "个人笔记 · 0" }),
  ).toBeVisible();
  await page.goto("/student");
  await page.getByLabel("切换模拟学员").selectOption("lin");
  await page.goto("/student/session/1");
  await expect(page.getByRole("button", { name: "已标记 AC" })).toBeDisabled();
  await expect(page.getByLabel("训练笔记")).toHaveValue("林沐自己的笔记");
});

test("桌面侧栏收缩状态持久化，手机仍可展开完整导航并使用键盘关闭", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "收起侧边栏" }).click();
  await expect(page.locator(".sidebar")).toHaveCSS("width", "82px");
  await page.reload();
  await expect(page.getByRole("button", { name: "展开侧边栏" })).toBeVisible();
  await expect(page.locator(".sidebar")).toHaveCSS("width", "82px");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "打开导航菜单" }).click();
  await expect(
    page.getByRole("link", { name: "个人中心", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "打开导航菜单" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "打开导航菜单" }).click();
  await page.getByRole("link", { name: "个人中心", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(
    page.getByRole("heading", { name: "我的个人中心" }),
  ).toBeVisible();
});

test("白色主界面与卡片，默认进度未分享，长昵称不挤出手机屏幕", async ({
  page,
}) => {
  await page.goto("/account?tab=profile");
  await page
    .getByLabel("怎么称呼你")
    .fill("abcdefghijklmnopqrstuvwxyz".slice(0, 24));
  await page.getByRole("button", { name: "保存个人资料" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/account",
    "/account?tab=profile",
    "/account?tab=data",
  ]) {
    await page.goto(route);
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      route,
    ).toBe(true);
  }
  await expect(page.getByLabel("向教学空间分享学习进度")).not.toBeChecked();
  await page.goto("/coach");
  await expect(page.locator(".private-student-row")).toContainText(
    "尚未分享进度",
  );
  await expect(page.locator(".private-student-row a")).toHaveCount(0);
  await expect(
    page
      .getByLabel("单独加练学员")
      .locator(`option[value="${defaultStudent.id}"]`),
  ).toHaveCount(0);
});

test("旧默认姓名和记录迁移，其他学员及个人偏好保持独立", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "codepath:account:v1",
      JSON.stringify({
        version: 1,
        profile: {
          nickname: "袁某",
          bio: "用最小样例理解问题",
          role: "learner",
          avatar: "sprout",
          track: "practice",
          dailyMinutes: 45,
          language: "Python 3",
          shareProgress: true,
          gentleMotion: false,
        },
        sidebarCollapsed: false,
        bookmarks: [2],
      }),
    );
    localStorage.setItem(
      "acm-training-agent:v1",
      JSON.stringify({
        version: 1,
        studentId: "yuan",
        round: 0,
        decisions: [
          {
            id: "old-decision",
            kind: "individual",
            text: "为袁某安排 30 分钟专项练习",
          },
        ],
        difficulty: 0,
        topic: "",
        extraStudentId: "",
        results: {
          "yuan:1": {
            studentId: "yuan",
            problemId: 1,
            outcome: "unfinished",
            seconds: 42,
            hintLevel: 1,
            note: "原个人账户的笔记",
            skillDelta: { dp: 0 },
            analysis: "待继续练习",
            nextStep: "继续补题",
            finishedAt: "2026-09-25T01:00:00.000Z",
          },
        },
        drafts: {
          "yuan:1": {
            code: "// old personal draft",
            note: "原个人账户的笔记",
            seconds: 42,
            hintLevel: 1,
            language: "C++17",
          },
          "chen:1": {
            code: "// another student",
            note: "陈予安的独立笔记",
            seconds: 9,
            hintLevel: 0,
            language: "C++17",
          },
        },
      }),
    );
  });
  await page.goto("/student/session/1");
  await expect(page.locator(".header-account")).toContainText(
    defaultStudent.name,
  );
  const profile = await page.evaluate(
    () => JSON.parse(localStorage.getItem("codepath:account:v1")!).profile,
  );
  expect(profile.nickname).toBe(defaultStudent.name);
  expect(profile.dailyMinutes).toBe(45);
  expect(profile.avatar).toBe("sprout");
  await expect(page.locator(".session-breadcrumb")).toContainText(
    defaultStudent.name,
  );
  await expect(page.getByLabel("代码草稿")).toHaveValue(
    "// old personal draft",
  );
  await expect(page.getByLabel("训练笔记")).toHaveValue("原个人账户的笔记");
  await expect(page.getByRole("region", { name: "训练复盘" })).toBeVisible();
  await page.getByRole("link", { name: "返回我的训练", exact: true }).click();
  await expect(page.getByLabel("切换模拟学员")).toHaveValue(defaultStudent.id);
  await page.getByLabel("切换模拟学员").selectOption("chen");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("陈予安");
  await page
    .locator(".problem-row")
    .filter({ hasText: "恰好到达的路径" })
    .getByRole("link")
    .click();
  await expect(page.getByLabel("训练笔记")).toHaveValue("陈予安的独立笔记");
  await expect(
    page.getByRole("region", { name: "训练复盘" }),
  ).not.toBeVisible();
});
