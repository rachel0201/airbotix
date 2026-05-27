# Product Documentation

## 概述

产品文档包含所有与产品需求、功能规格、竞品调研、合规策略相关的业务文档。

## 📁 目录结构

> 图例：正常条目 = 文件/目录已存在；`← ⚠️ 待创建` = 规划中但尚未落地，后续按需补充。

```
product/
├── README.md                        # 本文件 - 产品文档概览
├── compliance/                      # 合规文档
│   └── minors-compliance.md         # C1–C15 未成年人合规清单（AU 法规对齐）
├── prd/                             # 产品需求文档（24 份活跃 PRD）
│   ├── README.md                    # PRD 总索引（分类导航）
│   │
│   │── 平台主线 ──────────────────────────────────────────────
│   ├── kids-ai-platform-prd.md      # 平台总 PRD（6–11 创作 + 12+ Line B）
│   ├── kids-opencode-client-prd.md  # 桌面客户端 PRD（V1+ power-user）
│   ├── kids-opencode-spec.md        # 桌面客户端技术 spec（部分 stale）
│   │
│   │── Kid surface (app.airbotix.ai/learn/*) ─────────────────
│   ├── airbotix-app-learn-prd.md    # /learn/* SPA 总 PRD
│   ├── learn-classroom-prd.md       # /learn/classroom/* Class Wall
│   ├── learn-missions-prd.md        # /learn/missions/* 任务页
│   ├── learn-projects-prd.md        # /learn/projects/* 我的作品
│   ├── learn-code-studio-prd.md     # /learn/create/code Code Studio（Line B Web）
│   ├── class-wall-moderation-prd.md # UGC 审核
│   │
│   │── Parent surface (app.airbotix.ai/portal/*) ──────────────
│   ├── parent-portal-prd.md         # /portal/* 家长端
│   │
│   │── Operator console (teacher.airbotix.ai) ─────────────────
│   ├── teacher-console-prd.md       # Teacher + Admin + Super-Admin console
│   ├── super-admin-prd.md           # /admin/system/* 深规格
│   ├── teacher-employment-prd.md    # 合同教师生命周期
│   │
│   │── B2B (teacher.airbotix.ai/school/*) ─────────────────────
│   ├── institution-prd.md           # 学校/机构层（V1 = 首份签约触发）
│   │
│   │── 合规 / 安全 / 跨切面 ──────────────────────────────────
│   ├── incidents-and-mandatory-reporting-prd.md
│   ├── safety-age-policy-prd.md     # SafetyPolicy 基础（其余 safety PRD 的根）
│   ├── safety-prompt-firewall-prd.md
│   ├── safety-response-moderation-prd.md
│   ├── safety-pii-protection-prd.md
│   │
│   │── Platform infrastructure ─────────────────────────────────
│   ├── platform-backend-api-spec.md # NestJS API + Prisma schema
│   ├── auth-system-prd.md           # JWT + OTP + PIN + TOTP
│   ├── audit-event-schema-prd.md    # 跨产品审计事件 schema
│   │
│   │── Course Pack ────────────────────────────────────────────
│   ├── coursepack-ai-pet-lab-prd.md # AI Pet Lab v1（V0 启动课 / PRD 模板）
│   │
│   │── Marketing & infra ──────────────────────────────────────
│   ├── marketing-site-refresh-prd.md
│   ├── deeprouter-prd.md            # LLM gateway PRD（sibling repo）
│   ├── deeprouter-coupling-plan.md  # Airbotix ↔ DeepRouter 耦合策略
│   │
│   └── _archived/                   # 已下线历史 PRD（仅供追溯，不再维护）
│       ├── super-admin-mangement-system-prd.md
│       ├── super-admin-workshop-management-system-prd.md
│       └── teacher-auth-system-prd.md
│
├── research/                        # 竞品与技术调研
│   ├── README.md
│   ├── building-blocks-reference.md
│   ├── cognimates-reference.md
│   ├── day-of-ai-reference.md
│   ├── livecodes-spike.md
│   └── taxinomitis-reference.md
│
└── specs/                           # 功能规格说明
    ├── README.md                    ← ⚠️ 待创建（规格概览）
    ├── mvp_docs.md
    ├── mvp/                         ← ⚠️ 待创建
    ├── features/                    ← ⚠️ 待创建
    └── integrations/                ← ⚠️ 待创建
```

> 以下目录在原规划中存在，尚未落地：
> - `user-stories/` ← ⚠️ 待创建（teacher / admin / student / parent 用户故事）
> - `acceptance-criteria/` ← ⚠️ 待创建（functional / performance / security 验收标准）

## 🎯 文档类型

### PRD (Product Requirements Document)
- **目的**: 定义产品功能和业务需求
- **受众**: 产品经理、开发团队、设计师
- **内容**: 功能描述、用户流程、技术需求、决策记录（D-XX1…）

### 竞品 & 技术调研
- **目的**: 评估竞品、验证技术方案可行性
- **受众**: 产品团队、架构师
- **内容**: 竞品分析、技术 spike 报告

### 合规文档
- **目的**: 追踪 AU 法规（Privacy Act / Online Safety Act / Mandatory Notifiers）合规状态
- **受众**: 产品、法务、工程
- **内容**: 合规清单（C1–C18）、风险评估

### 功能规格说明（specs/）
- **目的**: 详细描述功能实现规格
- **受众**: 开发团队、测试团队
- **内容**: 接口定义、数据模型、业务规则

## 📚 核心概念

### 用户角色定义
- **Kid（6–11 岁）**: /learn/* 创作平台（AI Pet Lab、Code Studio、Class Wall）
- **Kid Line B（12+ 岁）**: /learn/create/code Code Studio（Web hosted-first；V1+ 桌面 kids-opencode）
- **Parent / 监护人**: /portal/* 家庭钱包、用量统计、设置
- **Teacher**: teacher.airbotix.ai 班级管理、课程分配、实时监控
- **School Admin**: /school/* B2B 学校管理（V1 = 首份机构签约触发）
- **Super Admin**: /admin/system/* 系统配置、模型注册表、审计

### 平台模块（platform-backend）
- **Auth**: JWT + Refresh + OTP + Kid PIN + Class Code + TOTP
- **Family / Wallet**: 家庭账户、Airwallex 充值、自动续充、用量统计
- **Course Pack**: 课程内容、Mission、Stars 激励
- **Class / Teacher Employment**: 班级管理、合同教师薪酬
- **Safety Pipeline**: Prompt Firewall → Response Moderation → PII Protection
- **Audit**: append-only 审计事件（`AuditEvent` 表）
- **Incident**: 端到端事件 + 法定报告（AU Online Safety Act）

### LLM 流量
- 所有 LLM 请求必须经 **DeepRouter `/v1`**（OpenAI-compatible），不得直接调用上游模型

## 📖 相关文档

- [PRD 总索引](./prd/README.md)
- [未成年人合规清单](./compliance/minors-compliance.md)
- [竞品与技术调研](./research/README.md)
- [功能规格](./specs/README.md) ← ⚠️ 待创建
- [用户故事](./user-stories/README.md) ← ⚠️ 待创建
- [验收标准](./acceptance-criteria/README.md) ← ⚠️ 待创建

## 🤖 AI 助手提示

当 AI 助手需要了解产品相关功能时，请参考：

1. **平台全貌**: `prd/kids-ai-platform-prd.md`（总 PRD，优先阅读）
2. **具体子产品**: 对应子 PRD（见上方目录树）
3. **API + 数据模型**: `prd/platform-backend-api-spec.md`
4. **安全 / 合规**: `safety-*-prd.md` 系列 + `compliance/minors-compliance.md`
5. **竞品参考**: `research/` 目录下各 reference 文件

---

**维护团队**: Airbotix 产品团队  
**最后更新**: 2026-05-27
