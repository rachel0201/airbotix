# teacher-console → Airbotix-AI/teacher-console

> **此目录是 pointer，不是实际代码位置。**
> - GitHub: `Airbotix-AI/teacher-console` (PRIVATE) — 2026-05-15 新建
> - 本地 clone: `~/Documents/sites/kidsinai/teacher-console/`（空 repo）

老师 / Airbotix 内部管理后台。独立 repo + 独立部署，audience 与 `airbotix-app`（家长 + 孩子）不同。

## 实际位置

```bash
cd ~/Documents/sites/kidsinai/teacher-console/
```

## Why 独立 repo（而不是 airbotix-app 一个 subroute）

- audience 完全不同（教育工作者 / 管理员 vs 家长 / 孩子）
- 部署独立（teacher.airbotix.ai 子域，可单独限制访问）
- 安全要求更高（接 super-admin 级权限，泄漏风险隔离）
- UI 风格偏管理工具（密度高、表格主导）vs airbotix-app 偏内容产品（卡片、视觉化）

## Scope (V0)

- **Class 管理**：创建班级、绑定 Course Pack、生成二维码 / 班级码、学生注册进度
- **课堂实时面板**：WebSocket 实时看 20-30 个孩子的 Mission 进度（来自 airbotix-app `/learn/*`）
- **课后摘要发送**：一键给家长发推送 + 邮件（含作品缩略图 + 评语 + CTA）
- **Curriculum / Course Pack**：内容查看（V0 不开 edit，由 Airbotix 教研产出）
- **Internal Admin**（仅 Airbotix 员工）：用户管理、订单查询、审计日志、Stars 调账、退款处理

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| State | TanStack Query |
| Styling | TailwindCSS（复用 DESIGN.md，但密度更高） |
| Realtime | WebSocket → platform-backend Gateway |
| Auth | platform-backend `/auth` (JWT + OTP)，**role-based access** (`teacher` / `admin` / `super_admin`) |
| Deploy | **AWS S3 + CloudFront** (Sydney ap-southeast-2) |
| Domain | `teacher.airbotix.ai` |

## 历史

旧 `super-admin/` 用 Supabase Auth + RLS，已于 2026-05-14 整体删除。`teacher-console` 是从零起的替代品，不复用任何旧代码。归档的 super-admin PRD 在 `docs/product/prd/_archived/`，仅供参考。

## Related docs (in airbotix repo)

- `../docs/product/prd/kids-ai-platform-prd.md` §13.1 老师端范围 + §7.1 注册流程（老师创建 Class 步骤）
- `../docs/product/prd/_archived/super-admin-mangement-system-prd.md`（归档）
- `../docs/product/prd/_archived/super-admin-workshop-management-system-prd.md`（归档）
- `../docs/product/prd/_archived/teacher-auth-system-prd.md`（归档）
- `../infra/README.md` S3 + CloudFront 部署细节
