# Airbotix 技术栈详解

## 前端技术栈

### 核心框架
- **React 18**: 用户界面库，使用函数组件和 Hooks
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 快速的前端构建工具，支持热重载

### 样式和 UI
- **TailwindCSS**: 实用优先的 CSS 框架
- **自定义设计系统**: 基于 TailwindCSS 的组件库
- **Lucide React**: 图标库

### 状态管理
- **React Context**: 全局状态管理
- **useReducer**: 复杂状态逻辑管理
- **useState**: 本地状态管理

### 路由和导航
- **React Router v6**: 客户端路由
- **React Router DOM**: 浏览器路由支持

### HTTP 客户端
- **Axios**: Promise 基础的 HTTP 客户端
- **请求拦截器**: 自动添加认证头
- **响应拦截器**: 统一错误处理

### 表单管理
- **React Hook Form**: 高性能表单库
- **Zod**: 表单验证库

### 测试框架
- **Jest**: JavaScript 测试框架
- **React Testing Library**: React 组件测试
- **Cypress**: 端到端测试

## 后端技术栈

### 核心框架
- **Node.js 20**: JavaScript 运行时
- **NestJS**: Web 应用框架（不用 Express 裸用）
- **TypeScript**: 类型安全的开发

### 数据库
- **Neon Serverless Postgres (aws-ap-southeast-2)**: 主数据库
- **Prisma**: ORM + migration 工具
- **注**：旧版本文档曾写 MongoDB / Supabase — 已于 2026-05-14 改为 Neon + Prisma，不要被旧引用误导

### 认证和安全
- **JWT**: JSON Web Token 认证
- **bcrypt**: 密码哈希
- **express-rate-limit**: API 限流
- **helmet**: 安全头设置

### 邮件服务
- **Nodemailer**: 邮件发送库
- **SendGrid**: 邮件服务提供商

### 文件存储
- **AWS S3 (ap-southeast-2 Sydney)**: 唯一对象存储方案。Virtual FS、孩子作品集、导出文件等全部走 S3 Sydney 桶

### 缓存
- **Redis**: 内存数据库
- **node-cache**: 内存缓存

### 日志和监控
- **Winston**: 日志库
- **Morgan**: HTTP 请求日志
- **Sentry**: 错误追踪

### 测试框架
- **Jest**: 单元测试
- **Supertest**: HTTP 断言库
- **MongoDB Memory Server**: 内存数据库测试

## 开发工具

### 代码质量
- **ESLint**: JavaScript 代码检查
- **Prettier**: 代码格式化
- **Husky**: Git hooks
- **lint-staged**: 暂存文件检查

### 构建和打包
- **Vite**: 前端构建工具
- **Docker**: 容器化
- **Docker Compose**: 多容器应用

### 版本控制
- **Git**: 版本控制系统
- **GitHub**: 代码托管平台
- **GitHub Actions**: CI/CD 流水线

### 包管理
- **npm**: Node.js 包管理器
- **package-lock.json**: 依赖锁定文件

## 部署和运维

### 容器化
- **Docker**: 应用容器化
- **Dockerfile**: 容器构建文件
- **docker-compose.yml**: 多服务编排

### 云服务
- **AWS**: 云服务平台
- **阿里云**: 国内云服务
- **CloudFlare**: CDN 和安全服务

### 监控和日志
- **ELK Stack**: 日志聚合和分析
- **Prometheus**: 指标监控
- **Grafana**: 监控仪表板

### CI/CD
- **GitHub Actions**: 持续集成和部署
- **自动化测试**: 代码提交触发测试
- **自动化部署**: 测试通过后自动部署

## 开发环境配置

### 前端开发环境
```json
{
  "node": ">=18.0.0",
  "npm": ">=8.0.0",
  "vite": "^4.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0"
}
```

### 后端开发环境
```json
{
  "node": ">=18.0.0",
  "npm": ">=8.0.0",
  "express": "^4.18.0",
  "mongoose": "^7.0.0",
  "typescript": "^5.0.0"
}
```

### 数据库要求
- **MongoDB**: >= 5.0
- **Redis**: >= 6.0 (可选)

## 性能优化

### 前端优化
- **代码分割**: 按需加载组件
- **懒加载**: 路由和组件懒加载
- **图片优化**: WebP 格式和懒加载
- **缓存策略**: 静态资源缓存

### 后端优化
- **数据库索引**: 优化查询性能
- **连接池**: 数据库连接复用
- **缓存**: Redis 缓存热点数据
- **压缩**: Gzip 压缩响应

### 网络优化
- **CDN**: 静态资源分发
- **HTTP/2**: 多路复用
- **压缩**: 响应压缩
- **缓存**: 浏览器缓存策略

## 安全考虑

### 前端安全
- **XSS 防护**: 输入验证和转义
- **CSRF 防护**: CSRF Token
- **内容安全策略**: CSP 头设置
- **HTTPS**: 强制 HTTPS 传输

### 后端安全
- **输入验证**: 严格的数据验证
- **SQL 注入防护**: 参数化查询
- **认证授权**: JWT + RBAC
- **限流**: API 请求频率限制

### 数据安全
- **加密存储**: 敏感数据加密
- **传输加密**: TLS/SSL 传输
- **访问控制**: 基于角色的权限
- **审计日志**: 操作记录和追踪

---

**维护团队**: Airbotix 开发团队  
**最后更新**: 2025-01-15
