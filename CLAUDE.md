# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status (as of 2026-05-15)

This repo is in a **transitional state**:
1. **Marketing site** (`/src/`) — live, deployed to GitHub Pages at airbotix.ai
2. **Kids AI Platform** — in planning (see `docs/product/prd/`); pointer dirs reflect the platform topology
3. **Removed 2026-05-14**: `super-admin/` (Supabase-based) and `auth-backend/` (in-memory PoC). The repo no longer uses Supabase anywhere.

## Tech Stack (locked 2026-05-14, refined 2026-05-15)

### Deploy matrix per repo

| Repo | Stack | Domain | Hosting |
|---|---|---|---|
| `airbotix` (marketing) | React 18 + Vite + TS + Tailwind | airbotix.ai | GitHub Pages |
| `airbotix-app` | React 18 + Vite + TS + Tailwind (SPA) | app.airbotix.ai | **AWS S3 + CloudFront** (Sydney) |
| `teacher-console` | React 18 + Vite + TS + Tailwind (SPA) | teacher.airbotix.ai | **AWS S3 + CloudFront** (Sydney) |
| `platform-backend` | NestJS + Prisma + TS | api.airbotix.ai | **AWS EC2 t3.small** (Sydney) + Docker Compose + nginx + Let's Encrypt |

### Cross-cutting infra

| Layer | Choice |
|---|---|
| ORM | **Prisma** |
| Postgres | **Neon Serverless** (aws-ap-southeast-2) |
| Object storage | **AWS S3** (ap-southeast-2 Sydney) |
| Realtime | **WebSocket** (NestJS Gateway + nginx upgrade) |
| Auth | JWT + Refresh Token + OTP (SendGrid email) — self-built, no Supabase Auth |
| LLM gateway | DeepRouter `/v1` (independent product, sibling repo) |
| Payments | **Airwallex** (AUD local + cross-border FX) — NOT Stripe |
| DNS | **Cloudflare DNS** for airbotix.ai (free, DDoS, supports ACM validation) |
| TLS | ACM cert for `*.airbotix.ai` in us-east-1 (CloudFront requirement) |

**Hard rules**:
- ❌ Do NOT introduce Supabase (auth, DB, storage, realtime, or RLS) — fully removed
- ❌ Do NOT introduce Stripe — payments go through Airwallex
- ❌ Do NOT introduce Fly.io / Vercel / Cloudflare Pages for any app — frontends on S3 + CloudFront, backend on AWS EC2
- ✅ All AU user data must stay in ap-southeast-2 (Sydney) region for compliance

## Development Commands

### Marketing site (root directory)
```bash
npm run dev      # http://localhost:3000
npm run build    # TypeScript + Vite build
npm run lint     # ESLint, no warnings allowed
npm run preview  # Preview production build
npm run deploy   # Build + deploy to GitHub Pages
```

### `airbotix-app/`, `teacher-console/`, `platform-backend/` (sibling repos, pointer dirs only)
See each pointer README for actual location and scaffold status.

## Project Architecture

```
airbotix/                       (this repo)
├── src/                        # Marketing site (live)
│   ├── components/
│   ├── pages/
│   ├── data/                   # Static workshop/blog/media content
│   └── services/
├── docs/
│   ├── product/prd/            # Active PRDs (kids-ai-platform-prd.md, etc.)
│   ├── product/prd/_archived/  # Archived super-admin/teacher PRDs (2026-05-14)
│   └── product/compliance/     # Minors compliance checklist
├── airbotix-app/               # → Airbotix-AI/airbotix-app (pointer only)
├── teacher-console/            # → Airbotix-AI/teacher-console (pointer only)
├── platform-backend/           # → Airbotix-AI/platform-backend (pointer only)
├── kids-opencode/              # → kidsinai/kids-opencode (pointer; out of scope)
├── infra/                      # AWS Sydney + Cloudflare DNS deployment config
└── rules/                      # Coding standards (mandatory)
```

Sibling product repos (2026-05-15 brand + structure restructure):

**Airbotix-AI org** — for-profit company. All cloud-side products, backend, marketing, planning.

```
github.com/Airbotix-AI/
├── airbotix              # Marketing site + planning docs (this repo, airbotix.ai)
├── airbotix-app          # Unified cloud SPA: /portal/* (parents) + /learn/* (kids) — app.airbotix.ai
├── teacher-console       # Teacher / admin console — teacher.airbotix.ai
├── platform-backend      # Shared NestJS API (private; api.airbotix.ai)
└── planning              # Master cross-product plan (private)
```

**kidsinai org** — community / events / open-distribution brand. Historically owned by a separate AI session; **as of 2026-05-16, cross-repo coordination is permitted with explicit user consent on a per-task basis** — the airbotix session may implement / commit / push to kids-opencode when Lightman authorizes a specific deliverable (e.g., Phase 2.5 own-client TUI was implemented from this session on 2026-05-16). Default stance without explicit authorization: do not change architecture there; route discussion to the kids-opencode session. Monetization moat lives in DeepRouter (LLM gateway), not in code access.

```
github.com/kidsinai/
├── kids-opencode         # Line B product, 12+ — local desktop tool, distributed via airbotix.ai/download
└── opencode-kernel       # Upstream-tracking fork of anomalyco/opencode (public, MIT)
```

**deeprouter-ai org** — separate company (LLM gateway, independent product).

```
github.com/deeprouter-ai/
└── deeprouter            # LLM gateway (Go fork of QuantumNous/new-api)
```

**Local clone paths** (historical naming under `kidsinai/`, do NOT need to match GitHub org):
```
~/Documents/sites/
├── airbotix/                       # → Airbotix-AI/airbotix
├── kidsinai/airbotix-app/          # → Airbotix-AI/airbotix-app
├── kidsinai/teacher-console/       # → Airbotix-AI/teacher-console
├── kidsinai/platform-backend/      # → Airbotix-AI/platform-backend
├── kidsinai/planning/              # → Airbotix-AI/planning
├── kidsinai/kids-opencode/         # → kidsinai/kids-opencode (cross-repo with explicit task scope)
├── kidsinai/opencode-kernel/       # → kidsinai/opencode-kernel (cross-repo with explicit task scope)
└── deeprouter-ai/deeprouter/       # → deeprouter-ai/deeprouter (cross-repo with explicit task scope)
```

## Development Standards

### MANDATORY CODING RULES
**ALL AI coding tools must follow the rules in `/rules/` directory.**

Categories: General (SOLID/DRY/KISS), Frontend (React/TS), Backend (API/DB/Security), Deployment.

Non-negotiable:
- SOLID, DRY, KISS
- Max 1000 lines per file
- TypeScript interfaces for all data structures
- No magic strings/numbers — use named constants
- Explicit error handling at boundaries

### Git Workflow
- Branch naming: `feature/<desc>`, `fix/<issue>`
- Conventional Commits
- CI/CD on push to main

## Environment Variables

### Marketing site
- `VITE_FORMSPREE_ID`
- `VITE_CONTACT_EMAIL`

### platform-backend (planned)
- `DATABASE_URL` — Neon Postgres connection string
- `AWS_REGION=ap-southeast-2`
- `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (or IAM role on EC2)
- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- `SENDGRID_API_KEY`
- `AIRWALLEX_CLIENT_ID` / `AIRWALLEX_API_KEY` / `AIRWALLEX_WEBHOOK_SECRET`
- `DEEPROUTER_BASE_URL` / `DEEPROUTER_API_KEY`

## Testing

No framework configured yet. Plan: Vitest (frontend unit) + Jest (NestJS backend) + Playwright (E2E).

## Important Context

### Marketing site
- Workshop is the primary content type
- All content is static (TypeScript files in `src/data/`)
- Mobile-first responsive design
- No backend dependency

### Kids AI Platform (planned)
- **Cloud side** (this AI's scope): `airbotix-app` (unified Portal + Learn SPA) + `teacher-console` + `platform-backend`
- **Local side** (other AI's scope): `kids-opencode` desktop tool, downloaded from airbotix.ai
- Shared `platform-backend` (Family / Wallet / Course Pack / Class / Audit)
- All LLM traffic must route through DeepRouter `/v1` (OpenAI-compatible)
- Minors compliance: see `docs/product/compliance/minors-compliance.md` (C1-C15 required items)

### Performance Targets
- Bundle size: < 1MB gzipped
- Code splitting with React.lazy() for routes
- Memoization for expensive computations
