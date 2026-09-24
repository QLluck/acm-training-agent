# 项目交付记录

依据 `CODEX_DEMO_PROMPT.md` 实现，验收日期：2026-09-24。

## 已实现

- Next.js 16.3.6 App Router + TypeScript + React 19.3.0 + Lucide + 本地 SVG 图表。
- 五个主页面：`/`、`/student`、`/student/session/1`、`/coach`、`/innovation`。另有 11 个题目训练路由、404 页面与 `/api/health`。
- 12 名队员、12 道原创模拟题、动态画像、5 题自适应计划、分级 Hint、训练笔记、模拟复盘、下一轮计划、团队热力图、教练决策、周计划导出。
- 所有数据及 AI 内容均为模拟；代码编辑器不执行代码。浏览器本地保存演示状态，顶部可重置。
- 多阶段 standalone Docker、非 root 运行、健康检查、重启策略、开发/生产 Compose、GHCR 多架构发布工作流。

## 实际执行的检查

| 检查 | 结果 |
| --- | --- |
| `npm run lint` | 通过，0 warnings |
| `npm run build` | 通过，18 个预渲染页面；健康检查为动态路由 |
| `npm run typecheck` | 通过 |
| `npm test` | 4 / 4 通过 |
| `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` | 8 / 8 通过 |
| 两套 `docker compose … config --quiet` | 通过 |
| `docker build -t acm-training-agent:test .` | 已实际构建成功 |
| 容器启动、`GET /api/health`、Docker HEALTHCHECK | 已通过，状态 healthy |
| Chrome 访问容器内五个主页面 | HTTP 200，无页面脚本错误 |

浏览器验收覆盖 Hint 顺序与复盘确认、代码/笔记刷新保存、结果回流到画像与热力图、队员数据隔离、教练四类决策及导出、策略阈值、404、无外部资源请求，以及 1440×900、1366×768、390×844 全部页面的横向溢出检查。

本机 Docker Hub 超时，实际通过 AWS Public ECR 的 Docker 官方 Node 镜像镜像源拉取基础镜像后完成构建。Playwright 使用已安装的 Chrome；本机代理导致的回环健康检查 502 已通过测试配置的 NO_PROXY 处理。

## 启动与部署

本地：`npm install` → `npm run dev`。生产：`npm run build` → `npm run start`。

Docker：`docker compose up -d --build`，访问 `http://localhost:3000`。

本次交付已实际通过 Compose 启动最终镜像 `acm-training-agent:latest`。服务容器为 `acm-training-agent-web-1`，端口 `0.0.0.0:3000`，最终状态 `healthy`。可直接访问 <http://localhost:3000>；停止演示使用 `docker compose down`。

学校服务器：先通过 main/tag 触发 GitHub Actions 发布镜像，将 Package 设置为 public，再运行：

```bash
ACM_AGENT_IMAGE=ghcr.io/<github-user>/acm-training-agent:latest \
docker compose -f docker-compose.prod.yml up -d
```

完整 Docker run、镜像更新、校园网排查、Nginx 代理和未来架构见 [README.md](README.md)。

## 待真实环境接入

本次 Demo 范围内功能已完成。GHCR 工作流尚未在远程 GitHub 执行，本次未推送代码或发布镜像；推送后需设置 Package 为 public。

下一步优先接入用户授权的 Codeforces 历史提交，验证能力画像和推荐理由，再接入账户、团队、真实 Hint 与训练效果实验。AI 辅助原创出题仅为按要求保留的未来概念。

## 实际修改文件

- `README.md`：完整重写使用与部署说明，保留原 AGPL-3.0 许可及署名。
- `CODEX_DEMO_PROMPT.md` 与 `LICENSE` 保持原有内容。

## 实际新增文件

- `.dockerignore`
- `.github/workflows/docker.yml`
- `.gitignore`
- `Dockerfile`
- `docker-compose.prod.yml`
- `docker-compose.yml`
- `eslint.config.mjs`
- `next-env.d.ts`
- `next.config.ts`
- `package-lock.json`
- `package.json`
- `playwright.config.ts`
- `public/icon.svg`
- `scripts/start-production.mjs`
- `scripts/verify-container.mjs`
- `src/app/api/health/route.ts`
- `src/app/coach/page.tsx`
- `src/app/globals.css`
- `src/app/innovation/page.tsx`
- `src/app/layout.tsx`
- `src/app/not-found.tsx`
- `src/app/page.tsx`
- `src/app/readability.css`
- `src/app/student/page.tsx`
- `src/app/student/session/[id]/page.tsx`
- `src/components/app-shell.tsx`
- `src/components/charts.tsx`
- `src/components/coach-dashboard.tsx`
- `src/components/confirm-dialog.tsx`
- `src/components/policy-demo.tsx`
- `src/components/student-dashboard.tsx`
- `src/components/training-session.tsx`
- `src/components/ui.tsx`
- `src/data/problems.ts`
- `src/data/students.ts`
- `src/data/weekly-plan.ts`
- `src/lib/demo-store.ts`
- `src/lib/training/index.ts`
- `src/types/training.ts`
- `tests/browser/demo.spec.ts`
- `tests/training.test.ts`
- `tsconfig.json`
- `DELIVERY.md`：本交付记录。
