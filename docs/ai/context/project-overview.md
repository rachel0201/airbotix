# Airbotix 项目概览

## 项目简介

Airbotix 是一个专注于 AI 和机器人教育的平台，为 K-12 学生提供工作坊和课程，正在扩展为 Kids AI Platform。项目当前包含：

1. **主网站** (`/`)：面向学生和家长的公开网站（已上线，GitHub Pages）
2. **Kids AI Platform**（规划中）：`platform-backend` + `airbotix-app`（统一云端 SPA）+ `teacher-console`；`kids-opencode` 本地桌面工具（独立 repo，另一个 AI agent 维护）
3. **注**：原 `super-admin/` (Supabase) 和 `auth-backend/` (Express PoC) 已于 2026-05-14 删除，由 NestJS 自研后端 + Neon Postgres + AWS S3 Sydney 替代

## 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: TailwindCSS + 自定义设计系统
- **路由**: React Router v6
- **状态管理**: React Context + useReducer
- **HTTP 客户端**: Axios

### 后端技术栈
- **运行时**: Node.js 20
- **框架**: NestJS
- **语言**: TypeScript
- **数据库**: Neon Serverless Postgres + Prisma
- **对象存储**: AWS S3 (ap-southeast-2 Sydney)
- **认证**: JWT + Refresh Token + OTP (SendGrid email)
- **支付**: Airwallex
- **LLM gateway**: DeepRouter `/v1`

### 部署和运维
- **容器化**: Docker + Docker Compose (platform-backend on EC2)
- **云平台**: AWS Sydney (ap-southeast-2)
- **前端 hosting**: AWS S3 + CloudFront (Sydney) for `airbotix-app` + `teacher-console`; GitHub Pages for `airbotix` marketing
- **DNS**: Cloudflare DNS (airbotix.ai zone)
- **TLS**: ACM cert `*.airbotix.ai` in us-east-1 (CloudFront requirement)
- **监控**: Winston + CloudWatch (后期可上 Better Stack / Axiom)

## 项目结构

```
airbotix/
├── src/                    # 主网站源码
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # API 服务
│   ├── types/             # TypeScript 类型
│   └── utils/             # 工具函数
├── platform-backend/      # (规划中) NestJS API + Prisma + Neon
├── airbotix-app/          # (规划中) 统一云端 SPA - /portal/* + /learn/* (app.airbotix.ai)
├── kids-opencode/         # (out of scope - 另一个 AI 维护) 本地桌面工具
├── teacher-console/       # (规划中) 老师/管理后台 (teacher.airbotix.ai)
├── docs/                  # 项目文档
│   ├── frontend/          # 前端文档
│   ├── backend/           # 后端文档
│   ├── product/           # 产品文档
│   ├── infrastructure/    # 基础设施文档
│   └── ai/                # AI 助手文档
└── rules/                 # 开发规范
```

## 核心功能模块

### 1. 用户认证系统
- **功能**: 基于邮箱 + OTP 的无密码登录
- **用户角色**: 教师、管理员、超级管理员
- **安全**: JWT Token + 限流保护

### 2. 工作坊管理系统
- **功能**: 工作坊创建、编辑、发布、管理
- **内容**: 多媒体内容、课程大纲、学习目标
- **状态**: 草稿、已完成、已归档

### 3. 用户管理系统
- **功能**: 教师、学生、管理员信息管理
- **权限**: 基于角色的访问控制
- **数据**: 个人信息、角色分配、状态管理

### 4. 内容管理系统
- **功能**: 教学资源、媒体文件管理
- **存储**: 云存储集成
- **组织**: 分类、标签、搜索

## 开发规范

### 代码风格
- **语言**: TypeScript 严格模式
- **格式化**: Prettier + ESLint
- **命名**: 驼峰命名法
- **文件**: 一个文件一个主要功能

### 组件设计
- **原则**: 单一职责、可复用、可组合
- **结构**: 组件 + Hook + 类型定义
- **测试**: 单元测试 + 集成测试

### API 设计
- **风格**: RESTful API
- **版本**: 版本化管理
- **文档**: OpenAPI 规范
- **安全**: 认证 + 授权 + 限流

## 数据模型

### 用户模型
```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'teacher' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### 工作坊模型
```typescript
interface Workshop {
  id: string
  title: string
  overview: string
  duration: string
  targetAudience: string
  startDate: Date
  endDate: Date
  status: 'draft' | 'completed' | 'archived'
  highlights: string[]
  syllabus: Array<{
    day: number
    title: string
    objective: string
    activities: string[]
  }>
  materials: {
    hardware: string[]
    software: string[]
    onlineResources: string[]
  }
  assessment: Array<{
    item: string
    weight: string
    criteria?: string
  }>
  learningOutcomes: string[]
  media: {
    video: { src: string; poster?: string; caption?: string }
    photos: Array<{ src: string; alt?: string }>
  }
  seo: {
    title: string
    description: string
  }
  source: string
  createdAt: Date
  updatedAt: Date
}
```

## 开发流程

### 1. 功能开发
1. 阅读产品需求文档
2. 设计技术方案
3. 实现前端组件
4. 开发后端 API
5. 编写测试用例
6. 更新文档

### 2. 代码审查
1. 检查代码质量
2. 验证功能实现
3. 确保测试覆盖
4. 审查安全性

### 3. 部署发布
1. 运行自动化测试
2. 构建生产版本
3. 部署到目标环境
4. 验证功能正常

## 常见任务

### 添加新功能
1. 在 `docs/product/prd/` 创建需求文档
2. 在 `docs/frontend/` 或 `docs/backend/` 创建技术文档
3. 实现前端组件和后端 API
4. 编写测试用例
5. 更新相关文档

### 修复 Bug
1. 复现问题并定位根因
2. 编写修复代码
3. 添加回归测试
4. 验证修复效果
5. 更新相关文档

### 代码重构
1. 分析现有代码
2. 设计重构方案
3. 逐步重构实现
4. 保持功能不变
5. 更新相关文档

---

**维护团队**: Airbotix 开发团队  
**最后更新**: 2025-01-15
