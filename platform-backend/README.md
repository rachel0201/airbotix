# platform-backend → kidsinai/platform-backend

> **此目录是 pointer，不是实际代码位置。**
> 真实代码在 sibling repo：`~/Documents/sites/kidsinai/platform-backend/`

Airbotix Kids AI Platform 的共享后端 API。承接 Family / Kid / Wallet / Course Pack / Class / Audit 全部跨产品线数据。

## 实际位置

```bash
cd ~/Documents/sites/kidsinai/platform-backend/
```

## 为什么不在 airbotix repo

按 [[airbotix-kids-ai-platform-direction]] memory 的三品牌结构（2026-05-12 决策）：
- **`kidsinai/platform-backend`**（PRIVATE）= 共享后端，服务 kidsinai 旗下所有 kid-facing 产品
- **`Airbotix-AI/airbotix`**（本 repo）= for-profit 教育业务 — 营销站 + planning docs，不放产品代码

## Tech Stack (locked 2026-05-14)

| Layer | Choice |
|---|---|
| Framework | **NestJS** + TypeScript |
| ORM | **Prisma** |
| Database | **Neon Serverless Postgres** (aws-ap-southeast-2) |
| Object storage | **AWS S3** (ap-southeast-2 Sydney) |
| Realtime | **WebSocket** (NestJS Gateway) |
| Auth | JWT + Refresh Token + OTP (SendGrid email) |
| Payments | **Airwallex** webhook → wallet credit |
| Hosting | **AWS EC2 t3.small Sydney** + Docker Compose + nginx + Let's Encrypt |
| LLM gateway | DeepRouter `/v1` (HTTP client only) |

## Hard rules

- ❌ No Supabase (auth / DB / storage / realtime / RLS — all removed)
- ❌ No Stripe — payments are Airwallex
- ❌ No Fly.io / Vercel — backend hosts on AWS EC2 Sydney
- ✅ AU user data must stay in ap-southeast-2 region

## Related docs (in airbotix repo)

- `../docs/product/prd/kids-ai-platform-prd.md` — main PRD (Section 15 architecture)
- `../docs/product/prd/kids-opencode-spec.md` — Kids OpenCode spec (Section 5 components)
- `../docs/product/compliance/minors-compliance.md` — C1-C15 platform requirements
