# 产品需求文档 (PRD)

本目录包含 Airbotix 在售与规划产品的 PRD，组织上对齐 `CLAUDE.md` 中的 repo 拓扑。已下线产品的 PRD 已移到 `_archived/`。

## 当前活跃 PRD

### 平台主线（Layer 2 — Kids AI Platform）
- [`kids-ai-platform-prd.md`](./kids-ai-platform-prd.md) — 平台总 PRD v0.4（6-11 岁创作平台 + 12+ Kids OpenCode 双线）
- [`kids-opencode-client-prd.md`](./kids-opencode-client-prd.md) — Kids OpenCode 客户端架构 PRD v0.3（A→C 分阶段：V0a TUI 插件先上、V0b 自有 client 后接；opencode-as-kernel；含安装/onboarding）
- [`kids-opencode-spec.md`](./kids-opencode-spec.md) — Kids OpenCode 技术 spec v0.2（pre-pivot，部分章节被 `kids-opencode-client-prd.md` 取代，标记 stale）

### Cloud 子产品（Airbotix-AI org）
- [`airbotix-app-learn-prd.md`](./airbotix-app-learn-prd.md) — `app.airbotix.ai/learn/*` kid surface
- [`parent-portal-prd.md`](./parent-portal-prd.md) — `app.airbotix.ai/portal/*` parent surface
- [`teacher-console-prd.md`](./teacher-console-prd.md) — `teacher.airbotix.ai` teacher + admin + super-admin operational console
- [`platform-backend-api-spec.md`](./platform-backend-api-spec.md) — NestJS API + Prisma schema
- [`auth-system-prd.md`](./auth-system-prd.md) — JWT(15min) + Refresh(30d rotating) + Email OTP + Kid PIN + Class code + Super-admin TOTP（取代 `_archived/teacher-auth-system-prd.md`）

### Marketing 与基础设施
- [`marketing-site-refresh-prd.md`](./marketing-site-refresh-prd.md) — airbotix.ai 主站改版

### 跨产品依赖
- [`deeprouter-prd.md`](./deeprouter-prd.md) — LLM gateway PRD（独立产品，sibling repo `deeprouter-ai/deeprouter`）
- [`deeprouter-coupling-plan.md`](./deeprouter-coupling-plan.md) — Airbotix ↔ DeepRouter 耦合策略

## 已归档

`_archived/` 下保留下线产品的历史 PRD（教师认证、Supabase super-admin、工作坊管理后台等）。不再维护，仅供历史追溯。

## 编写约定

- 文件名：`<scope>-<topic>-prd.md`（kebab-case），版本号写在文档头部 `v0.x`，不进文件名
- 文档头部要有 metadata 块：状态、日期、作者、上游文档、平行文档
- 重大决策走 "决策记录表"（D-XX1, D-XX2…），便于跨 PRD 引用
- 跨 repo 的 handoff PRD（如 `kids-opencode-client-prd.md`）必须有"实施 owner"字段标明下游 session
- 修订历史在文档末尾，倒序，每条带版本号 + 日期 + 一句话说明
