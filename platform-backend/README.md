# platform-backend → Airbotix-AI/platform-backend

> **此目录是 pointer，不是实际代码位置。**
> - GitHub: `Airbotix-AI/platform-backend` (PRIVATE) — 2026-05-15 由 kidsinai 迁入
> - 本地 clone: `~/Documents/sites/kidsinai/platform-backend/` (clone 目录历史命名未改)

Airbotix Kids AI Platform 的共享后端 API。承接 Family / Kid / Wallet / Course Pack / Class / Audit 全部跨产品线数据。

## 实际位置

```bash
cd ~/Documents/sites/kidsinai/platform-backend/
```

## 为什么在 Airbotix-AI org（2026-05-15 更新）

- **Airbotix-AI** = for-profit 商业实体，所有付费产品代码、营销站、planning docs 都在这里
- **kidsinai** = 社区 / 比赛 / 开源品牌，只保留对外开放的 opencode-kernel fork
- 学习体验产品（platform-backend / kids-opencode / creative-web）= Airbotix-AI 资产
- 学校签合同、家长付费 = 与 Airbotix-AI 公司发生关系，repo 归属与商业关系对齐

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
| Domain | `api.airbotix.ai` |
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
