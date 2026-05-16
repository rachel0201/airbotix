# infra (Airbotix-AI AWS Sydney + Cloudflare DNS)

> **Airbotix-AI 基础设施配置占位。**
> 实际 IaC 落地位置：本目录或独立 `Airbotix-AI/infra` repo，V0 阶段两者均可。

承载 Airbotix-AI 全部前后端的 AWS 基础设施。

## 顶层架构

```
Cloudflare DNS (airbotix.ai)
├─ airbotix.ai           → GitHub Pages (marketing site)
├─ app.airbotix.ai       → CloudFront → S3 (airbotix-app, Sydney)
├─ teacher.airbotix.ai   → CloudFront → S3 (teacher-console, Sydney)
└─ api.airbotix.ai       → EC2 (Sydney, NestJS)

AWS ap-southeast-2 (Sydney)
├─ EC2 t3.small × 1
│  ├─ Elastic IP
│  ├─ SG: 22 (your IP only), 80, 443
│  └─ Ubuntu 22.04 + Docker Compose + nginx + Certbot
│     └─ docker-compose.yml:
│        └─ platform-backend (NestJS, port 3000)
├─ S3 buckets (all ap-southeast-2):
│  ├─ airbotix-app-prod         # airbotix-app SPA assets
│  ├─ teacher-console-prod      # teacher-console SPA assets
│  ├─ airbotix-virtual-fs-prod  # Virtual FS (for kids-opencode V1+ if needed)
│  └─ airbotix-artifacts-prod   # kid 作品集导出 + 课程包静态资源
├─ IAM role for EC2: read/write to buckets + read Secrets Manager
├─ Secrets Manager (/airbotix/prod/*):
│  ├─ jwt-secret
│  ├─ sendgrid
│  ├─ airwallex
│  ├─ deeprouter
│  └─ database-url (Neon)
└─ CloudWatch Logs: /airbotix/prod/platform-backend

AWS us-east-1 (CloudFront 强制区)
├─ ACM 证书: *.airbotix.ai (DNS validation via Cloudflare)
└─ CloudFront distributions:
   ├─ app-airbotix-ai      → origin: airbotix-app-prod (S3)
   │  ├─ SPA fallback: 404/403 → /index.html (200)
   │  ├─ Custom domain: app.airbotix.ai
   │  └─ ACM: *.airbotix.ai
   └─ teacher-airbotix-ai  → origin: teacher-console-prod (S3)
      ├─ SPA fallback: 同上
      ├─ Custom domain: teacher.airbotix.ai
      └─ ACM: *.airbotix.ai
```

## External services (not in AWS)

- **Cloudflare DNS** — airbotix.ai zone（免费，DDoS 防护，支持 ACM DNS validation token）
- **Neon Postgres** — aws-ap-southeast-2 region
- **GitHub Pages** — airbotix.ai marketing site（保留现状）
- **DeepRouter** — Singapore region（独立产品 `~/Documents/sites/deeprouter-ai/deeprouter/`）
- **Airwallex** — 支付 SaaS
- **SendGrid** — 邮件 SaaS

## SPA 部署到 S3 + CloudFront 的关键配置

### S3 bucket policy（每个 SPA bucket）
```json
{
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::airbotix-app-prod/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DIST_ID"
      }
    }
  }]
}
```
S3 bucket **不开放公网直接访问**，全部走 CloudFront OAC (Origin Access Control)。

### CloudFront SPA fallback（必须）
```
Custom error responses:
  HTTP 403 → /index.html, response code 200, cache 0
  HTTP 404 → /index.html, response code 200, cache 0
```
React Router v6 客户端路由依赖此 fallback；不配会导致刷新 `/portal/family` 等深链接 404。

### Cache 策略
- `/index.html` — no-cache, must-revalidate（确保新版本立即可见）
- `/assets/*` — public, max-age=31536000, immutable（Vite hashed filename）
- API responses — 不经 CloudFront，直接 EC2

### ACM 证书
- **必须在 us-east-1 申请**（CloudFront 强制）
- DNS validation via Cloudflare DNS（添加 CNAME `_xxx.airbotix.ai`）
- 一张证书覆盖 `*.airbotix.ai` + `airbotix.ai`

## Cost estimate (V0, monthly USD)

| Item | Cost |
|---|---|
| EC2 t3.small (on-demand, ap-southeast-2) | ~$18 |
| Elastic IP (attached) | $0 |
| S3 storage (~20 GB across buckets) | ~$5 |
| S3 + CloudFront requests (low V0 traffic) | ~$3 |
| CloudFront data transfer (10 GB/mo) | ~$1.5 |
| Neon Postgres (free tier or Launch plan) | $0-19 |
| ACM cert | $0 |
| Cloudflare DNS | $0 |
| GitHub Pages (marketing) | $0 |
| **Total** | **~$28-47/mo** |

## IaC plan

- **V0**：AWS Console 手工开 + 本目录沉淀脚本/模板/CI workflow（已落地，见下方目录）
- **V1+**：考虑 Terraform（不上 CDK，单台 EC2 体量 CDK overhead 不值）

## Directory contents

```
infra/
├── README.md                              # 本文件
├── ec2/
│   ├── setup.sh                           # 首次 EC2 bootstrap (Docker + Compose + nginx + certbot)
│   ├── docker-compose.yml                 # 跑 platform-backend，从 ECR 拉镜像
│   ├── nginx.conf                         # 反向代理 :3000，含 /ws upgrade + Let's Encrypt webroot
│   └── .env.example                       # /opt/airbotix/secrets/.env 模板
├── cloudfront/
│   ├── README.md                          # CloudFront + S3 一次性 setup walkthrough
│   ├── spa-distribution.json              # CloudFront distribution 模板（两个前端共用）
│   └── s3-bucket-policy.json              # OAC bucket policy 模板
└── github-actions/
    ├── README.md                          # OIDC + IAM role + SSH key 一次性配置
    ├── deploy-airbotix-app.yml.example    # → 复制到 airbotix-app repo
    ├── deploy-teacher-console.yml.example # → 复制到 teacher-console repo
    └── deploy-platform-backend.yml.example# → 复制到 platform-backend repo
```

## First-time setup walkthrough

按这个顺序做，整套环境从零到可用：

1. **域名 / DNS**
   - Cloudflare 接管 `airbotix.ai` zone（保留 `airbotix.ai` → GitHub Pages 不动）
2. **ACM 证书（us-east-1）**
   - 申请 `*.airbotix.ai` + `airbotix.ai`，DNS validation via Cloudflare
   - 见 `cloudfront/README.md` §1
3. **S3 buckets（ap-southeast-2）**
   - `airbotix-app-prod`, `teacher-console-prod`, `airbotix-artifacts-prod`
   - 全部 `BlockPublicAccess=true`，由 CloudFront OAC 读取
4. **CloudFront × 2**
   - `app.airbotix.ai`, `teacher.airbotix.ai`
   - 用 `cloudfront/spa-distribution.json` 模板 + `s3-bucket-policy.json`
5. **Cloudflare DNS records**
   - `app` CNAME → CloudFront distribution（grey cloud，不开 proxy）
   - `teacher` CNAME → CloudFront distribution（同上）
   - `api` A → EC2 EIP
6. **EC2**
   - t3.small Ubuntu 22.04，ap-southeast-2，EIP，SG: 22(your IP)/80/443
   - 实例 IAM role：ECR read, Secrets Manager read（`/airbotix/prod/*`），S3 read/write `airbotix-artifacts-prod`
   - SSH 进去 `curl ... infra/ec2/setup.sh | sudo bash` → 见 `ec2/setup.sh`
7. **EC2 secrets**
   - 从 `ec2/.env.example` 复制到 `/opt/airbotix/secrets/.env`，`chmod 600`
   - 或用 Secrets Manager + `aws secretsmanager get-secret-value` 拉到本地
8. **TLS for api.airbotix.ai**
   - `sudo certbot --nginx -d api.airbotix.ai --redirect`
9. **ECR repo**
   - `aws ecr create-repository --repository-name airbotix/platform-backend --region ap-southeast-2`
10. **GitHub Actions OIDC**
    - 见 `github-actions/README.md`，三个 IAM role + EC2 SSH key
11. **首次 deploy**
    - 在每个 repo `gh workflow run deploy.yml`
    - 验证：`curl https://api.airbotix.ai/health` / 访问 `https://app.airbotix.ai`

## Deploy flow per repo

| Repo | Build | Upload | Distribution |
|---|---|---|---|
| `airbotix` (marketing) | `npm run build` | `gh-pages -d dist` | GitHub Pages (sync) |
| `airbotix-app` | `npm run build` | `aws s3 sync dist/ s3://airbotix-app-prod/ --delete` | `aws cloudfront create-invalidation --paths "/index.html"` |
| `teacher-console` | 同上，bucket = `teacher-console-prod` | 同上 | 同上 |
| `platform-backend` | `docker build` + push to ECR | SSH 到 EC2 + `docker compose pull && up -d` | nginx 自动 reload |

所有 SPA / backend 部署都通过 GitHub Actions OIDC，**无静态 AWS access key**。

## Related docs

- `../CLAUDE.md` — repo-level architecture summary
- `../docs/product/prd/kids-ai-platform-prd.md` §15 platform architecture
- `../docs/product/prd/auth-system-prd.md` §13.1 — env var reference for backend
- `../docs/product/prd/platform-backend-api-spec.md` §6 — WebSocket contract (nginx /ws block 依据)
