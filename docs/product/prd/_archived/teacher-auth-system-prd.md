# Airbotix 教师登录注册系统 PRD

## 产品概述

### 我们要构建什么
为 Airbotix 网站提供基于邮箱 + 6 位验证码（OTP）的无密码登录/注册系统，确保教师可通过邮箱安全进入 Airbotix 网站内部系统。

### 当前问题
- 缺乏统一的教师身份认证系统
- 没有安全的登录机制保护内部资源
- 教师无法便捷地访问工作台和教学资源
- 缺乏用户角色管理和权限控制

### 成功目标
- 教师可通过邮箱验证码快速登录
- 自动创建新教师账号（首次登录）
- 安全的无密码认证机制
- 完整的用户会话管理
- 为后续权限管理奠定基础

---

## 核心用户流程

### 新教师首次登录流程：
1. **输入邮箱** → 系统验证邮箱格式
2. **请求验证码** → 系统生成 6 位 OTP 并发送邮件
3. **输入验证码** → 系统校验 OTP 有效性
4. **自动创建账号** → 系统创建教师用户记录
5. **返回 Token** → 前端保存认证信息
6. **跳转工作台** → 进入教师专用界面

### 日常登录流程：
1. **输入邮箱** → 系统识别现有用户
2. **请求验证码** → 发送新的 OTP
3. **输入验证码** → 验证身份
4. **返回 Token** → 更新会话信息
5. **进入系统** → 访问教师功能

### 登出流程：
1. **点击登出** → 清除本地 Token
2. **调用 API** → 服务端使 Token 失效
3. **跳转登录页** → 返回登录界面

---

## 功能模块

### 模块 1: 邮箱验证系统

**核心功能**：安全的邮箱验证和 OTP 管理

**特性**：
- 邮箱格式验证（前端 + 后端）
- 6 位数字 OTP 生成（有效期 10 分钟）
- 邮件发送服务集成
- OTP 哈希存储（不保存明文）
- 重发验证码功能（限流保护）

**技术实现**：
- 使用 `crypto.randomInt()` 生成 6 位随机数
- bcrypt 哈希存储 OTP
- Redis 或数据库存储 OTP 记录（带 TTL）
- 邮件服务：SendGrid / AWS SES / 阿里云邮件

### 模块 2: 用户认证系统

**核心功能**：JWT Token 管理和用户会话控制

**特性**：
- JWT Access Token（1 小时有效期）
- JWT Refresh Token（30 天有效期）
- Token 刷新机制
- 用户信息获取接口
- 登出和 Token 失效

**安全要求**：
- Token 存储在 HTTP-only + Secure Cookie
- 支持 Token 黑名单机制
- 防止 Token 重放攻击
- 跨域安全配置

### 模块 3: 用户管理系统

**核心功能**：教师用户信息管理和角色分配

**用户数据字段**：
- 基本信息：邮箱、姓名、头像
- 角色信息：教师角色、权限级别
- 状态信息：账号状态、最后登录时间
- 元数据：创建时间、更新时间

**角色设计**：
- **Teacher**：基础教师权限
- **Admin**：管理员权限（后续扩展）
- **Super Admin**：超级管理员权限（后续扩展）

---

## 数据设计

### MongoDB 集合设计

#### 1. users 集合
```javascript
{
  _id: ObjectId,
  email: String, // 唯一索引
  name: String,
  avatar: String, // 头像 URL
  role: String, // 'teacher' | 'admin' | 'super_admin'
  status: String, // 'active' | 'inactive' | 'suspended'
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. email_otps 集合
```javascript
{
  _id: ObjectId,
  email: String, // 索引
  otpHash: String, // 哈希后的 OTP
  attempts: Number, // 尝试次数
  maxAttempts: Number, // 最大尝试次数（默认 5）
  expiresAt: Date, // TTL 索引
  createdAt: Date
}
```

#### 3. refresh_tokens 集合
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // 关联 users._id
  tokenHash: String, // 哈希后的 refresh token
  expiresAt: Date, // TTL 索引
  isRevoked: Boolean,
  createdAt: Date,
  revokedAt: Date
}
```

### 索引设计
```javascript
// users 集合索引
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "status": 1 })

// email_otps 集合索引
db.email_otps.createIndex({ "email": 1 })
db.email_otps.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// refresh_tokens 集合索引
db.refresh_tokens.createIndex({ "userId": 1 })
db.refresh_tokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
db.refresh_tokens.createIndex({ "isRevoked": 1 })
```

---

## API 设计

### 认证相关接口

#### 1. 请求验证码
```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "email": "teacher@example.com"
}

Response:
{
  "success": true,
  "message": "验证码已发送到您的邮箱",
  "data": {
    "email": "teacher@example.com",
    "expiresIn": 600 // 10 分钟
  }
}
```

#### 2. 验证 OTP 并登录
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "teacher@example.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "user_id",
      "email": "teacher@example.com",
      "name": "教师姓名",
      "role": "teacher",
      "avatar": "avatar_url"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 3600
    }
  }
}
```

#### 3. 刷新 Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "expiresIn": 3600
  }
}
```

#### 4. 获取用户信息
```http
GET /api/auth/me
Authorization: Bearer jwt_access_token

Response:
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "teacher@example.com",
    "name": "教师姓名",
    "role": "teacher",
    "avatar": "avatar_url",
    "lastLoginAt": "2025-01-15T10:30:00Z"
  }
}
```

#### 5. 登出
```http
POST /api/auth/logout
Authorization: Bearer jwt_access_token
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}

Response:
{
  "success": true,
  "message": "登出成功"
}
```

### 错误码定义

```javascript
const ERROR_CODES = {
  // 邮箱相关
  INVALID_EMAIL: 'INVALID_EMAIL',
  EMAIL_REQUIRED: 'EMAIL_REQUIRED',
  
  // OTP 相关
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_REQUIRED: 'OTP_REQUIRED',
  OTP_ATTEMPTS_EXCEEDED: 'OTP_ATTEMPTS_EXCEEDED',
  
  // 用户相关
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_SUSPENDED: 'USER_SUSPENDED',
  
  // Token 相关
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REQUIRED: 'TOKEN_REQUIRED',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  
  // 系统相关
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
}
```

---

## 安全要求

### 1. 数据安全
- OTP 必须哈希存储，不得保存明文
- 用户密码字段不适用（无密码系统）
- 敏感信息传输必须使用 HTTPS
- 数据库连接使用 TLS 加密

### 2. 访问控制
- 实现邮箱白名单机制（可选）
- 同一邮箱每小时最多 5 次验证码请求
- 同一 IP 每小时最多 10 次验证码请求
- OTP 验证失败超过 5 次锁定 1 小时

### 3. Token 安全
- Access Token 有效期 1 小时
- Refresh Token 有效期 30 天
- 支持 Token 黑名单机制
- 登出时立即失效所有相关 Token

### 4. 限流保护
```javascript
// 限流规则
const RATE_LIMITS = {
  // 邮箱级别限流
  email: {
    windowMs: 60 * 60 * 1000, // 1 小时
    max: 5 // 最多 5 次
  },
  // IP 级别限流
  ip: {
    windowMs: 60 * 60 * 1000, // 1 小时
    max: 10 // 最多 10 次
  },
  // OTP 验证限流
  otpVerify: {
    windowMs: 60 * 60 * 1000, // 1 小时
    max: 5 // 最多 5 次失败
  }
}
```

---

## 前端实现

### 页面结构
```
src/
├── pages/
│   ├── Login.tsx              # 登录页面
│   └── Dashboard.tsx          # 教师工作台
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx      # 登录表单
│   │   ├── OTPForm.tsx        # OTP 验证表单
│   │   └── AuthGuard.tsx      # 认证守卫
│   └── layout/
│       └── TeacherLayout.tsx  # 教师布局
├── hooks/
│   ├── useAuth.ts             # 认证 Hook
│   └── useOTP.ts              # OTP Hook
├── services/
│   └── authService.ts         # 认证服务
└── types/
    └── auth.ts                # 认证类型定义
```

### 状态管理
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface User {
  id: string
  email: string
  name: string
  role: 'teacher' | 'admin' | 'super_admin'
  avatar?: string
  lastLoginAt?: string
}
```

---

## 验收标准

### 功能要求
- [ ] 教师可通过邮箱 + OTP 登录系统
- [ ] 首次登录自动创建教师账号
- [ ] 支持验证码重发功能
- [ ] 完整的登出和会话管理
- [ ] 用户信息获取和显示

### 性能要求
- [ ] 接口响应时间 P95 ≤ 600ms
- [ ] 验证码发送成功率 ≥ 99%
- [ ] 系统可用性 ≥ 99.5%
- [ ] 支持 100+ 并发用户

### 安全要求
- [ ] OTP 哈希存储，无明文保存
- [ ] HTTPS 传输所有敏感数据
- [ ] 限流机制正常工作
- [ ] Token 安全存储和传输
- [ ] 防止常见攻击（重放、暴力破解等）

### 用户体验要求
- [ ] 登录流程简单直观
- [ ] 错误提示清晰明确
- [ ] 移动端适配良好
- [ ] 加载状态反馈及时

---

## 实施计划

### 第一阶段：基础功能（3-5 天）
1. **数据库设计**：创建 MongoDB 集合和索引
2. **后端 API**：实现核心认证接口
3. **邮件服务**：集成邮件发送功能
4. **前端页面**：创建登录和 OTP 验证页面

### 第二阶段：安全加固（2-3 天）
1. **限流机制**：实现邮箱和 IP 限流
2. **安全增强**：Token 黑名单、错误处理
3. **测试验证**：安全测试和性能测试

### 第三阶段：集成优化（2-3 天）
1. **前端集成**：完善用户界面和体验
2. **系统集成**：与现有系统集成
3. **文档完善**：API 文档和用户指南

---

## 技术栈

### 后端技术
- **Node.js + Express**：API 服务框架
- **MongoDB**：数据存储
- **JWT**：Token 管理
- **bcrypt**：密码哈希
- **nodemailer**：邮件发送
- **express-rate-limit**：限流中间件

### 前端技术
- **React + TypeScript**：前端框架
- **React Router**：路由管理
- **Axios**：HTTP 客户端
- **React Hook Form**：表单管理
- **TailwindCSS**：样式框架

### 部署和运维
- **Docker**：容器化部署
- **PM2**：进程管理
- **Nginx**：反向代理
- **MongoDB Atlas**：云数据库
- **SendGrid**：邮件服务

---

## 风险评估

### 技术风险
- **邮件送达率**：选择可靠的邮件服务商
- **数据库性能**：合理设计索引和查询
- **安全漏洞**：定期安全审计和更新

### 业务风险
- **用户体验**：确保登录流程简单顺畅
- **系统稳定性**：充分的测试和监控
- **数据安全**：严格的安全措施和备份

### 缓解措施
- 选择成熟的邮件服务商（SendGrid/AWS SES）
- 实施完善的监控和告警
- 定期进行安全测试和代码审查
- 准备降级方案和应急响应流程

---

**文档版本**：v1.0  
**创建日期**：2025-01-15  
**维护团队**：Airbotix 开发团队  
**最后更新**：2025-01-15
