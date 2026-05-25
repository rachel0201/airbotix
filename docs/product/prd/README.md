# 产品需求文档 (PRD)

本目录包含 Airbotix 在售与规划产品的 PRD，组织上对齐 `CLAUDE.md` 中的 repo 拓扑。已下线产品的 PRD 已移到 `_archived/`。

## 当前活跃 PRD

### 平台主线（Layer 2 — Kids AI Platform）
- [`kids-ai-platform-prd.md`](./kids-ai-platform-prd.md) — 平台总 PRD v0.4（6-11 岁创作平台 + 12+ Line B 双线；2026-05-25 增 D-WAL-01 自动续充 / D-WAL-02 充值反欺诈上限 / D-USE-01 家长侧用量统计 / **D-CODE-01 Line B Web Code Studio 定为 V0 主入口**四条决策）
- [`kids-opencode-client-prd.md`](./kids-opencode-client-prd.md) — Kids OpenCode **桌面**客户端架构 PRD v0.3（A→C 分阶段；2026-05-25 起 repositioned 为 V1+ power-user 模式，BYO API key；V0 Line B 主入口已移到 `learn-code-studio-prd.md` web 版）
- [`kids-opencode-spec.md`](./kids-opencode-spec.md) — Kids OpenCode 技术 spec v0.2（pre-pivot，部分章节被 `kids-opencode-client-prd.md` 取代，标记 stale）

### Cloud 子产品（Airbotix-AI org）— Kid surface (`app.airbotix.ai/learn/*`)
- [`airbotix-app-learn-prd.md`](./airbotix-app-learn-prd.md) — `/learn/*` SPA 总 PRD v0.4（kid 登录、路由 shell、topic 与 studio 框架；2026-05-25 v0.4 反转 v0.2 "❌ AI Coding" 例外条款，新增 `/learn/create/code` + `/learn/code/:projectId` 路由）
- [`learn-classroom-prd.md`](./learn-classroom-prd.md) — `/learn/classroom/*` Class Wall + 班级动态 v0.1（kid 发帖、反应、同学作品流）
- [`learn-missions-prd.md`](./learn-missions-prd.md) — `/learn/missions/*` 任务页 v0.1（mission 卡片流、完成态、Stars 触发）
- [`learn-projects-prd.md`](./learn-projects-prd.md) — `/learn/projects/*` "我的作品" v0.1（项目列表、作品详情、Share to Wall 入口）
- [`learn-code-studio-prd.md`](./learn-code-studio-prd.md) — `/learn/create/code` + `/learn/code/*` Code Studio v0.1（Hosted-first Line B Web；Mission widget 嵌入模式 + 独立 Studio 模式；`code-sessions` 模块 + 虚拟 FS `tools`；桌面端 `kids-opencode` 改 V1+ power-user）
- [`class-wall-moderation-prd.md`](./class-wall-moderation-prd.md) — Class Wall UGC 审核 v0.1（年龄分级 pre/post-publish、3 报告自动隐藏 D-WALL5、举报者匿名 D-WALL3、安全披露绕道至 incidents 管道 D-WALL6）

### Cloud 子产品 — Parent surface (`app.airbotix.ai/portal/*`)
- [`parent-portal-prd.md`](./parent-portal-prd.md) — `/portal/*` parent surface v0.2（2026-05-25 增 §4.4.1 自动续充 / §4.4.2 充值反欺诈上限 / §4.9 AI 用量统计页）

### Cloud 子产品 — Operator console (`teacher.airbotix.ai`)
- [`teacher-console-prd.md`](./teacher-console-prd.md) — teacher + admin + super-admin 三角色一体的运营 console v0.1（路由级 RBAC、live mode、approval queue、family/wallet ops）
- [`super-admin-prd.md`](./super-admin-prd.md) — `/admin/system/*` super-admin-only 深 spec v0.3（TOTP step-up、impersonation、system config、models registry、audit isolation、5 子页 analytics — overview/business/financial/LLM/safety、Course Pack publish step-up D-SA4；取代 `_archived/super-admin-mangement-system-prd.md`）
- [`teacher-employment-prd.md`](./teacher-employment-prd.md) — 合同教师生命周期 v0.1（WWCC 验证硬阻止 D-EMP2、班级交付 → 工资计算 D-EMP1、Airwallex Beneficiary 月度批量出账、双人审批 D-EMP3、append-only 时薪历史 D-EMP4、6 张新表）

### Cloud 子产品 — B2B (`teacher.airbotix.ai/school/*`)
- [`institution-prd.md`](./institution-prd.md) — B2B 学校/机构层 PRD v0.2：Institution 数据模型、`school_admin` 新角色、CSV bulk onboarding、Google Workspace SSO（kid PIN fallback）、Hybrid 家庭钱包 + 机构 Stars 池 + 年终 reclaim、Data Controller 委托给学校（合规 C16–C18）、**Course procurement（Entitlement）+ Curriculum Bundle 设计**（AU DT F-10 对齐 + 学校自组课程包）。V0 deferred，**V1 = 首份签约触发**

### Cross-cutting — 合规 / 安全 / 跨切面
- [`incidents-and-mandatory-reporting-prd.md`](./incidents-and-mandatory-reporting-prd.md) — 端到端事件 + 法定报告 v0.1（kid panic 按钮 D-INC3、admin triage、Designated Officer 流程、NDB 72h+30d 时钟 D-INC4、`IncidentEvent` append-only D-INC5、evidence bundle S3 合约、AU Online Safety Act + Mandatory Notifiers 合规）
- [`safety-age-policy-prd.md`](./safety-age-policy-prd.md) — **安全策略基础** v0.1（`SafetyPolicy` Prisma 模型 + 4 档 early/core_a/early_b/late_b 矩阵：topic 黑名单/白名单/分类器阈值/PII 模式/sustained-pattern 阈值/Stars 上限；super-admin 编辑 + TOTP step-up + 版本化不可变 D-SP3；其余 3 份 safety PRD 的依赖根 D-SP1）
- [`safety-prompt-firewall-prd.md`](./safety-prompt-firewall-prd.md) — **输入侧防火墙** v0.1（5 段流水线 regex / PII / topic classifier / injection guard / kid-safe sysprompt，500ms p95 预算，fail-closed D-PF1，sustained-pattern M/N 升级路径，Code Studio 特例，redacted 家长可视 D-PF4）
- [`safety-response-moderation-prd.md`](./safety-response-moderation-prd.md) — **输出侧审核** v0.1（按 modality text/image/audio/video/code 分流水线，PII/secret 在文本/代码侧 redact 而不 reject D-RM5，rejected 输出 30 天 quarantine 桶 D-RM4，DeepRouter 主链路 + OpenAI Moderation 兜底，full refund + 反滥用阈值）
- [`safety-pii-protection-prd.md`](./safety-pii-protection-prd.md) — **PII 跨切面保护** v0.1（16 类闭合 taxonomy，三层检测 family dict / regex / NER，三检查点 input / output / artifact save，WARN-vs-BLOCK 决策树 + 出现次数升级，parent contact 永远 BLOCK D-PI3，code 沙箱数据例外 D-PI6，家长侧 sanitized + categorized 不见原文 D-PI4）

### Cloud 子产品 — Platform infrastructure
- [`platform-backend-api-spec.md`](./platform-backend-api-spec.md) — NestJS API + Prisma schema（v0.2, 2026-05-25 Wallet 增 auto-topup + topup-cap 字段，新增 `PaymentMethod` / `AutoTopupAttempt` / `UsageDaily` 模型 + §5.4 / §5.10 / §5.13 端点）
- [`auth-system-prd.md`](./auth-system-prd.md) — JWT(15min) + Refresh(30d rotating) + Email OTP + Kid PIN + Class code + Super-admin TOTP v0.1（取代 `_archived/teacher-auth-system-prd.md`）
- [`audit-event-schema-prd.md`](./audit-event-schema-prd.md) — 跨产品审计事件 schema v0.1（envelope、retention、append-only 约束、actor 维度；pre-impl 讨论稿）

### Course Pack 内容 PRD（admin-authored 课程内容；样板 + 后续课依此模板写）
- [`coursepack-ai-pet-lab-prd.md`](./coursepack-ai-pet-lab-prd.md) — **AI Pet Lab v1**（8–10 岁 / 4 missions / 14⭐ / 完整 YAML + AU DT F-10 对齐 + 教师 runbook + 发布流程）— V0 启动课，也是后续所有 Course Pack PRD 的模板

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
