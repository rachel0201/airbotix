# Airbotix 项目文档

欢迎来到 Airbotix 项目文档！这里包含了完整的技术文档、API 文档、产品需求和开发资源。

## 📚 文档结构

> 图例：正常条目 = 文件/目录已存在；`← ⚠️ 待创建` = 目录规划中但尚未落地，后续按需补充。

```
docs/
├── README.md                         # 本文件 - 文档概览
├── ai/                               # AI 助手文档
│   ├── README.md
│   ├── install-kids-hosting.md       # Kids 本地托管安装指南
│   ├── context/                      # AI 上下文文件
│   │   ├── coding-standards.md
│   │   ├── project-overview.md
│   │   └── tech-stack.md
│   ├── prompts/                      ← ⚠️ 待创建（提示词模板库）
│   ├── guidelines/                   ← ⚠️ 待创建（AI 使用指南）
│   └── examples/                     ← ⚠️ 待创建（示例与模板）
├── backend/                          # 后端文档
│   ├── README.md                     ← ⚠️ 待创建（后端文档概览）
│   ├── api/
│   │   ├── README.md
│   │   └── teacher-auth-api.md
│   ├── database/
│   │   └── README.md
│   ├── auth/                         ← ⚠️ 待创建（JWT / OTP / TOTP 认证）
│   ├── services/                     ← ⚠️ 待创建（业务服务文档）
│   └── middleware/                   ← ⚠️ 待创建（中间件文档）
├── frontend/                         # 前端文档
│   ├── README.md
│   ├── components/                   ← ⚠️ 待创建（组件文档）
│   ├── pages/                        ← ⚠️ 待创建（页面文档）
│   ├── hooks/                        ← ⚠️ 待创建（自定义 Hooks）
│   ├── services/                     ← ⚠️ 待创建（前端服务文档）
│   ├── types/                        ← ⚠️ 待创建（TypeScript 类型文档）
│   └── utils/                        ← ⚠️ 待创建（工具函数文档）
├── infrastructure/                   # 基础设施文档
│   ├── README.md
│   ├── install-endpoint.md           # 端点安装部署指南
│   ├── deployment/                   ← ⚠️ 待创建（S3 + CloudFront / EC2 部署）
│   ├── monitoring/                   ← ⚠️ 待创建（系统监控与日志）
│   ├── security/                     ← ⚠️ 待创建（安全策略配置）
│   └── ci-cd/                        ← ⚠️ 待创建（GitHub Actions CI/CD）
├── legal/                            # 法律合规文档
│   ├── compliance-statement.md
│   ├── parental-consent.md
│   ├── privacy-policy.md
│   └── terms-of-service.md
└── product/                          # 产品文档（详见 product/README.md）
    ├── README.md
    ├── compliance/
    │   └── minors-compliance.md      # C1–C15 未成年人合规清单
    ├── prd/                          # 活跃 PRD（24 份 + _archived/）
    │   └── README.md                 # PRD 总索引
    ├── research/                     # 竞品与技术调研
    │   └── README.md
    └── specs/
        ├── README.md                 ← ⚠️ 待创建（规格概览）
        ├── mvp_docs.md
        ├── mvp/                      ← ⚠️ 待创建
        ├── features/                 ← ⚠️ 待创建
        └── integrations/             ← ⚠️ 待创建
```

## 🚀 快速导航

### 前端开发
- [前端文档概览](./frontend/README.md)
- [组件库文档](./frontend/components/README.md) ← ⚠️ 待创建
- [页面文档](./frontend/pages/README.md) ← ⚠️ 待创建
- [Hooks 文档](./frontend/hooks/README.md) ← ⚠️ 待创建
- [服务文档](./frontend/services/README.md) ← ⚠️ 待创建

### 后端开发
- [后端文档概览](./backend/README.md) ← ⚠️ 待创建
- [API 文档](./backend/api/README.md)
- [数据库文档](./backend/database/README.md)
- [认证系统](./backend/auth/README.md) ← ⚠️ 待创建
- [业务服务](./backend/services/README.md) ← ⚠️ 待创建

### 产品管理
- [产品文档概览](./product/README.md)
- [产品需求文档](./product/prd/README.md)
- [未成年人合规](./product/compliance/minors-compliance.md)
- [竞品与技术调研](./product/research/README.md)
- [功能规格](./product/specs/README.md) ← ⚠️ 待创建
- [用户故事](./product/user-stories/README.md) ← ⚠️ 待创建
- [验收标准](./product/acceptance-criteria/README.md) ← ⚠️ 待创建

### 基础设施
- [基础设施文档概览](./infrastructure/README.md)
- [端点安装指南](./infrastructure/install-endpoint.md)
- [部署文档](./infrastructure/deployment/README.md) ← ⚠️ 待创建
- [监控文档](./infrastructure/monitoring/README.md) ← ⚠️ 待创建
- [安全文档](./infrastructure/security/README.md) ← ⚠️ 待创建
- [CI/CD 文档](./infrastructure/ci-cd/README.md) ← ⚠️ 待创建

### 法律合规
- [合规声明](./legal/compliance-statement.md)
- [家长同意书](./legal/parental-consent.md)
- [隐私政策](./legal/privacy-policy.md)
- [服务条款](./legal/terms-of-service.md)

### AI 助手
- [AI 助手文档概览](./ai/README.md)
- [项目上下文](./ai/context/project-overview.md)
- [技术栈详解](./ai/context/tech-stack.md)
- [编码标准](./ai/context/coding-standards.md)
- [Kids 本地托管安装](./ai/install-kids-hosting.md)

## 🎯 项目目标

Airbotix 项目旨在：

1. **展示教育项目**: 突出我们的 AI 和机器人工作坊，面向 K-12 学生
2. **建立信任**: 展示推荐、媒体报道和教育成果
3. **支持预订**: 提供便捷的工作坊预订和咨询功能
4. **支持增长**: 扩展以支持多个项目和国际扩张
5. **社区参与**: 促进学生、教育工作者和家庭之间的联系

## 🛠️ 技术栈

> 以下为锁定技术栈（2026-05-14 确认，详见 `CLAUDE.md`）。

### 前端技术（各端统一）
- **框架**: React 18 + TypeScript + Vite
- **样式**: TailwindCSS + Airbotix K-12 设计系统
- **路由**: React Router v6

### 后端技术
- **框架**: NestJS + TypeScript
- **ORM**: Prisma
- **数据库**: Neon Serverless Postgres（`aws-ap-southeast-2`）
- **认证**: JWT(15min) + Refresh Token(30d rotating) + Email OTP + Kid PIN + TOTP（自建，无 Supabase）
- **邮件**: SendGrid
- **对象存储**: AWS S3（ap-southeast-2 Sydney）
- **实时通信**: WebSocket（NestJS Gateway）

### 部署与运维
- **营销站**: GitHub Pages（`airbotix.ai`）
- **前端 SPA**: AWS S3 + CloudFront（Sydney，`app.airbotix.ai` / `teacher.airbotix.ai`）
- **后端 API**: AWS EC2 t3.small + Docker Compose + nginx + Let's Encrypt（`api.airbotix.ai`）
- **DNS / DDoS**: Cloudflare DNS
- **支付**: Airwallex（AUD 本地 + 跨境 FX，**非** Stripe）
- **LLM 网关**: DeepRouter `/v1`（sibling repo，OpenAI 兼容）

> ❌ 禁止引入：Supabase、Stripe、Fly.io、Vercel、Cloudflare Pages

## 📖 如何使用文档

### 新团队成员
1. 从 [项目上下文](./ai/context/project-overview.md) 开始了解项目
2. 阅读 [技术栈详解](./ai/context/tech-stack.md) 了解技术选型
3. 查看 [编码标准](./ai/context/coding-standards.md) 了解开发规范
4. 根据角色选择相应的技术文档

### 开发贡献
1. 查看 [开发规范](../rules/README.md) 了解代码标准
2. 阅读相关技术文档了解实现细节
3. 遵循 Conventional Commits 进行代码提交（`../rules/git-workflow.md` ← ⚠️ 待创建）
4. 编写测试用例确保代码质量

### AI 助手使用
1. 查看 [AI 助手文档概览](./ai/README.md) 了解使用方法
2. 参考 [项目上下文](./ai/context/project-overview.md) 提供项目背景
3. 使用 [编码标准](./ai/context/coding-standards.md) 确保代码质量
4. 遵循 [技术栈详解](./ai/context/tech-stack.md) 选择合适的技术方案

## 🔄 文档维护

这是一个持续更新的文档资源，请：

- **保持更新** - 功能变更时及时更新文档
- **保持清晰** - 为新加入的开发者编写清晰的文档
- **包含示例** - 提供代码示例和实际案例
- **获取反馈** - 请团队成员审查文档变更

---

**最后更新**: 2026-05-27  
**维护团队**: Airbotix 开发团队
