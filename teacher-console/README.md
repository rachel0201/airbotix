# teacher-console (location TBD)

> **此目录是 pointer，实际代码位置尚未确定（2026-05-15）。**

老师 / 内部管理后台。替代 2026-05-14 删除的 `super-admin/`（Supabase-based）。

## 候选位置

| 位置 | 论据 | 状态 |
|---|---|---|
| `~/Documents/sites/airbotix/teacher-console/` 内（airbotix repo 内真实代码） | teacher-console 服务 Airbotix-AI 的老师，是 Airbotix-AI back office 一部分 | 候选 |
| `~/Documents/sites/kidsinai/platform-backend/` 内的 web 子目录 | 与 platform-backend 共享 auth / data layer，部署一体 | 候选 |
| `~/Documents/sites/kidsinai/teacher-console/`（独立 repo） | 与 kids-web / kids-opencode 对称 | 候选 |

**决策时机**：等 platform-backend 起步、第一版 schema 落地后再定。在那之前，本目录仅作为 PRD 锚点存在。

## 历史

旧 `super-admin/` 用 Supabase Auth + RLS，已于 2026-05-14 整体删除。原因：
- Supabase 全栈被踢出技术栈（[[airbotix-tech-stack-2026-05-14]]）
- 旧 super-admin 没有真实业务数据（生产未承载真实用户），重做成本低于迁移成本

不要试图从 git 历史里恢复旧 super-admin 代码 — schema 设计逻辑会由 platform-backend Prisma schema 重做。

## Scope (V0)

- Class 管理（创建、绑定 Course Pack、二维码 / 班级码）
- 学生注册进度面板
- 课堂模式（WebSocket 实时进度，Line A + Line B 都接）
- 课后家长摘要发送
- 内部 admin：用户管理、课程管理、审计查询

## Tech Stack（待选定，初步建议）

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite + TS + Tailwind |
| Auth | JWT (复用 platform-backend `/auth` 端点) |
| Data | platform-backend REST + WebSocket |
| Hosting | Cloudflare Pages（独立 subdomain，如 `teacher.airbotix.ai`） |

## Related docs (in airbotix repo)

- `../docs/product/prd/kids-ai-platform-prd.md` §13.1 老师端范围
- `../docs/product/prd/_archived/super-admin-mangement-system-prd.md` （归档参考）
- `../docs/product/prd/_archived/super-admin-workshop-management-system-prd.md` （归档参考）
- `../docs/product/prd/_archived/teacher-auth-system-prd.md` （归档参考）
