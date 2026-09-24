import { expect, test } from "@playwright/test";

test("所有页面可访问，无外部资源依赖，无浏览器错误，健康检查正确", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (req) => {
    if (
      !req.url().startsWith("http://127.0.0.1:3100") &&
      !req.url().startsWith("data:")
    )
      external.push(req.url());
  });
  for (const route of [
    "/",
    "/student",
    "/student/session/1",
    "/coach",
    "/innovation",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  const health = await request.get("/api/health");
  expect(await health.json()).toEqual({
    status: "ok",
    service: "acm-training-agent",
  });
  expect((await request.get("/student/session/999")).status()).toBe(404);
});

test("提示必须按级解锁，复盘需要确认，训练结果持久化并更新画像", async ({
  page,
}) => {
  await page.goto("/student/session/1");
  await expect(page.getByRole("button", { name: /Hint 2/ })).toBeDisabled();
  await expect(
    page.getByText("Hint 4 · 复盘解析", { exact: false }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "我卡住了" }).click();
  await expect(
    page.getByText("Hint 1 · 问题引导", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Hint 2/ }).click();
  await page.getByRole("button", { name: /Hint 3/ }).click();
  await page.getByLabel("C++ 代码草稿").fill("// 独立思考草稿");
  await page
    .getByLabel("训练笔记")
    .fill("状态表示恰好到达第 i 级的方案数，检查 f[0]。");
  await page.reload();
  await expect(page.getByLabel("C++ 代码草稿")).toHaveValue("// 独立思考草稿");
  await expect(page.getByLabel("训练笔记")).toHaveValue(/检查 f\[0\]/);
  await page.getByRole("button", { name: "结束独立思考并复盘" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "继续独立思考" }).click();
  await expect(
    page.getByText("Hint 4 · 复盘解析", { exact: false }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "结束独立思考并复盘" }).click();
  await page.getByRole("button", { name: "结束独立思考，展示解析" }).click();
  await expect(
    page.getByText("Hint 4 · 复盘解析", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "标记 AC", exact: true }).click();
  await expect(page.getByRole("region", { name: "训练复盘" })).toContainText(
    "DP +1",
  );
  await page.reload();
  await expect(page.getByRole("button", { name: "已标记 AC" })).toBeDisabled();
  await page.getByRole("link", { name: "更新画像并查看下一轮" }).click();
  await expect(page.getByRole("heading", { name: /第 2 轮/ })).toBeVisible();
  await expect(page.locator(".skill-summary")).toContainText("53");
  await page.goto("/coach");
  await expect(page.locator(".heatmap tbody tr").first()).toContainText("53");
});

test("未完成保留补题状态；切换队员隔离数据", async ({ page }) => {
  await page.goto("/student/session/1");
  await page.getByRole("button", { name: "标记未完成" }).click();
  await expect(page.getByRole("region", { name: "训练复盘" })).toContainText(
    "能力分不扣减",
  );
  await page.getByRole("link", { name: "返回我的训练", exact: true }).click();
  await expect(
    page.locator(".problem-row").filter({ hasText: "恰好到达的路径" }),
  ).toContainText("待补题");
  await page.getByLabel("切换模拟队员").selectOption("lin");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("林沐");
  await page.goto("/student/session/1");
  await expect(
    page.getByRole("button", { name: "标记 AC", exact: true }),
  ).toBeEnabled();
});

test("教练筛选、决策、个人加练和导出都有可见结果", async ({ page }) => {
  await page.goto("/coach");
  await expect(page.locator(".heatmap tbody tr")).toHaveCount(12);
  await page.getByLabel("筛选队员层级").selectOption("新人组");
  await expect(page.locator(".heatmap tbody tr")).toHaveCount(3);
  await page.getByRole("button", { name: "接受建议", exact: true }).click();
  await expect(page.getByText("教练已接受", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "调整难度", exact: true }).click();
  await expect(page.locator(".plan-adjustments")).toContainText("-100");
  await page
    .getByRole("button", { name: "给全队增加专题", exact: true })
    .click();
  await expect(page.locator(".plan-adjustments")).toContainText("图上状态设计");
  await page.getByLabel("单独加练队员").selectOption("yuan");
  await page.getByRole("button", { name: "为某队员单独加练" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出周计划" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "acm-weekly-plan-demo.txt",
  );
  await page.goto("/student");
  await expect(page.getByText("教练为你安排了单独加练")).toBeVisible();
  await page.goto("/coach");
  await expect(page.getByText("教练已接受", { exact: true })).toBeVisible();
});

test("Training Policy 能响应阈值变化", async ({ page }) => {
  await page.goto("/innovation");
  await expect(page.getByRole("status")).toContainText("策略命中");
  await page.getByLabel("DP 掌握度").fill("60");
  await expect(page.getByRole("status")).toContainText("未命中");
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 390, height: 844 },
]) {
  test(`${viewport.width}×${viewport.height} 页面无横向溢出`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    for (const route of [
      "/",
      "/student",
      "/student/session/1",
      "/coach",
      "/innovation",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        route,
      ).toBe(true);
    }
    if (viewport.width < 760) {
      await page.getByRole("button", { name: "打开导航菜单" }).click();
      await page
        .getByRole("link", { name: "我的训练 Training", exact: true })
        .click();
      await expect(page).toHaveURL(/\/student$/);
    }
  });
}
