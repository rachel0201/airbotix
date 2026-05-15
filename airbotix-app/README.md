# airbotix-app → Airbotix-AI/airbotix-app

> **此目录是 pointer，不是实际代码位置。**
> - GitHub: `Airbotix-AI/airbotix-app` (PUBLIC) — 2026-05-15 由 `creative-web` 改名 + 扩 scope
> - 本地 clone: `~/Documents/sites/kidsinai/airbotix-app/` (clone 目录沿用 `kidsinai/` 历史命名)

**统一云端 SPA**，承载所有 airbotix.ai 登录后的体验：
- `/portal/*` — 家长 portal（注册、Family Account、多孩子管理、Stars 钱包、审批、agent audit replay、设置）
- `/learn/*` — 孩子学习区（AI 图像 / 音乐 / 视频 / 配音故事 / 6-11 入门 coding / 班级墙 / 作品集）

同一个 React SPA，通过 auth context + role 区分家长 vs 孩子视图。Family Account 跨产品线唯一。

## Why 一个 SPA 同时承载家长和孩子？

- 共用 auth context、共用设计系统、共用导航壳
- 部署单元统一（一个 S3 bucket + 一个 CloudFront）
- 路由清晰可分（`/portal/*` vs `/learn/*`），不会 UI 混乱
- 老师后台是不同 audience（管理工具向），所以拆 `teacher-console` 独立

## 实际位置

```bash
cd ~/Documents/sites/kidsinai/airbotix-app/
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| State | React Context + TanStack Query |
| Styling | TailwindCSS（复用 `airbotix` marketing site 的 DESIGN.md 设计令牌） |
| Forms | React Hook Form + Zod |
| Realtime | WebSocket (browser native) → platform-backend Gateway |
| Auth | platform-backend `/auth` (JWT + OTP) |
| Deploy | **AWS S3 + CloudFront** (Sydney ap-southeast-2)，SPA fallback 404 → /index.html |
| Domain | `app.airbotix.ai` |

## 关键路由

```
Public（无登录）
  /                          → 重定向到 /portal/login（或 marketing airbotix.ai）

Portal（家长登录后）
  /portal/login
  /portal/register           ← 家长注册 + Family Account 创建
  /portal/family             ← 多孩子 CRUD（empty / 1 个 / 多个 / 排序 / 切换）
  /portal/family/:kidId      ← 单孩子设置（昵称、年龄、班级、消费上限）
  /portal/wallet             ← Stars 余额 + Airwallex 充值 + 消费明细
  /portal/approvals          ← 待审批列表
  /portal/audit              ← Agent 行为回放（Line B 关键家长信任点）
  /portal/settings

Learn（孩子登录后；班级码或家长账号下切换到孩子身份）
  /learn                     ← Mission + 进行中 + 我的作品（首页）
  /learn/image
  /learn/music
  /learn/video
  /learn/story
  /learn/coding-101          ← 6-11 入门 coding（web 内）
  /learn/classroom           ← 班级墙
  /learn/studio              ← 自由创作

Cross
  /download/kids-opencode    ← 12+ 引导下载本地工具（kids-opencode 由另一个 AI 负责）
```

## Constraints

- **6-11 孩子 UI 风格**：大字体、图标主导、最小化文本、零外部跳转 — 在 `/learn/*` 路由强制
- **家长 UI 风格**：和 airbotix.ai 营销站完全一致（成年人 audience，DESIGN.md 完整应用）
- 所有 AI 调用走 `platform-backend`，**不要在前端塞任何 API key 或直连 LLM/DeepRouter**
- 合规（minors-compliance.md C7/C8）：孩子作品默认私有，公开需家长批准
- AU 用户数据：S3 + CloudFront 配置必须保 origin 在 ap-southeast-2

## Related docs (in airbotix repo)

- `../docs/product/prd/kids-ai-platform-prd.md` §7 UX 流程 + §13.1 V0 范围
- `../docs/product/prd/parent-portal-prd.md`（**待写** — 详细 portal IA / wireframes）
- `../docs/product/compliance/minors-compliance.md`
- `../infra/README.md` S3 + CloudFront 部署细节
