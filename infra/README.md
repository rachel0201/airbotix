# infra (Airbotix-AI AWS Sydney)

> **此目录是 Airbotix-AI 的部署配置占位。**
> 实际 IaC 落地位置：本目录或独立 `Airbotix-AI/infra` repo，V0 阶段两者均可。

承载 Kids AI Platform 全部产品的 AWS 基础设施。所有 kidsinai 产品共享同一套 AWS 账户 / 区域 / 桶（账单归 Airbotix-AI）。

## Target architecture (V0)

```
ap-southeast-2 (Sydney)
├─ VPC (default 即可，V0 不分私网)
├─ EC2 t3.small (1 台)
│  ├─ Elastic IP
│  ├─ SG: 22 (your IP only), 80, 443
│  └─ Ubuntu 22.04 LTS
│     ├─ Docker + Docker Compose
│     ├─ nginx (HTTPS termination + WebSocket upgrade)
│     ├─ Certbot (Let's Encrypt)
│     └─ docker-compose.yml:
│        ├─ kidsinai/platform-backend (NestJS, port 3000)
│        ├─ kidsinai/kids-opencode runtime (Node, port 3100)
│        └─ (无 postgres — 用 Neon；无对象存储 — 用 AWS S3)
├─ S3 bucket: airbotix-virtual-fs-prod
│  ├─ Versioning: enabled
│  ├─ Encryption: SSE-S3
│  └─ Lifecycle: 90-day glacier for old project files
├─ S3 bucket: airbotix-artifacts-prod (kid 作品集导出)
├─ IAM role for EC2: read/write to both buckets, read Secrets Manager
├─ Secrets Manager:
│  ├─ /airbotix/prod/jwt-secret
│  ├─ /airbotix/prod/sendgrid
│  ├─ /airbotix/prod/airwallex
│  ├─ /airbotix/prod/deeprouter
│  └─ /airbotix/prod/database-url (Neon)
└─ CloudWatch Logs: /airbotix/prod/{platform-backend,kids-opencode}
```

## External services (not in AWS)

- **Neon Postgres** — aws-ap-southeast-2 region (managed separately)
- **Cloudflare Pages** — kidsinai/creative-web、kidsinai/kids-opencode、teacher-console 前端
- **GitHub Pages** — airbotix.ai 营销站
- **DeepRouter** — Singapore region（独立产品 `~/Documents/sites/deeprouter-ai/deeprouter/`）
- **Airwallex** — 支付（SaaS）
- **SendGrid** — 邮件（SaaS）

## IaC plan

- **V0**：AWS Console 手工开 + 本目录沉淀 nginx.conf + docker-compose.yml + setup.sh
- **V1+**：考虑 Terraform（不上 CDK，单台 EC2 体量 CDK overhead 不值）

## Cost estimate (V0, monthly)

| Item | Cost (USD) |
|---|---|
| EC2 t3.small (on-demand, ap-southeast-2) | ~$18 |
| Elastic IP (attached) | $0 |
| S3 (~10 GB stored, light traffic) | ~$3 |
| Neon Postgres (free tier or scale plan) | $0-19 |
| Data transfer out (10 GB/mo) | ~$1.5 |
| Cloudflare Pages | $0 |
| **Total** | **~$25-45/mo** |

## Related docs (in airbotix repo)

- `../CLAUDE.md` — repo-level architecture summary
- `../docs/product/prd/kids-ai-platform-prd.md` §15 platform architecture
