# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status (as of 2026-05-14)

This repo is in a **transitional state**:
1. **Marketing site** (`/src/`) — live, deployed to GitHub Pages at airbotix.ai
2. **Kids AI Platform** — in planning (see `docs/product/prd/`); scaffolds being created
3. **Removed 2026-05-14**: `super-admin/` (Supabase-based, replaced by future `platform-backend` on NestJS) and `auth-backend/` (in-memory PoC, never connected to real DB). The repo no longer uses Supabase anywhere.

## Tech Stack (locked 2026-05-14)

| Layer | Choice |
|---|---|
| Marketing site | React 18 + Vite + TypeScript + TailwindCSS, GitHub Pages |
| Kids platform frontend | React 18 + Vite + TS + Tailwind, Cloudflare Pages |
| Backend API | **NestJS** + TypeScript |
| Backend hosting | **AWS EC2 t3.small Sydney (ap-southeast-2)** + Docker Compose + nginx + Let's Encrypt |
| ORM | **Prisma** |
| Postgres | **Neon Serverless** (aws-ap-southeast-2) |
| Object storage | **AWS S3** (ap-southeast-2 Sydney) |
| Realtime | **WebSocket** (NestJS Gateway + nginx upgrade) |
| Auth | JWT + Refresh Token + OTP (SendGrid email) — self-built, no Supabase Auth |
| Agent runtime | AWS EC2 Sydney (same host as backend in V0; split later) |
| LLM gateway | DeepRouter `/v1` (independent product, sibling repo) |
| Payments | **Airwallex** (AUD local + cross-border FX) — NOT Stripe |

**Hard rules**:
- ❌ Do NOT introduce Supabase (auth, DB, storage, realtime, or RLS) — fully removed
- ❌ Do NOT introduce Stripe — payments go through Airwallex
- ❌ Do NOT introduce Fly.io / Vercel for backend — backend lives on AWS EC2 Sydney
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

### `platform-backend/` (scaffold, NestJS)
TBD — scaffold pending.

## Project Architecture

```
airbotix/
├── src/                      # Marketing site (live)
│   ├── components/
│   ├── pages/
│   ├── data/                 # Static workshop/blog/media content
│   └── services/
├── docs/
│   ├── product/prd/          # Active PRDs (kids-ai-platform-prd.md, kids-opencode-spec.md)
│   ├── product/prd/_archived/  # Archived 2026-05-14 super-admin/teacher PRDs
│   └── product/compliance/   # Minors compliance checklist
└── rules/                    # Coding standards (mandatory)
```

Sibling product repos (2026-05-15 brand restructure):

**Airbotix-AI org** — for-profit company. Holds all paid product code, planning docs, and the marketing site. This is where customer-facing products live.

```
github.com/Airbotix-AI/
├── airbotix              # Marketing site + planning docs (this repo)
├── platform-backend      # Shared NestJS API (private, NestJS + Prisma + Neon + S3 Sydney)
├── kids-opencode         # Line B product, 12+ (private, MIT)
├── creative-web          # Line A product, 6-11 (public)
└── planning              # Master cross-product plan (private)
```

**kidsinai org** — community / events / open-source brand. Used for hackathons, competitions, advocacy, and open-source contributions. Not a legal entity distinction; just a brand boundary.

```
github.com/kidsinai/
└── opencode-kernel       # Upstream-tracking fork of anomalyco/opencode (public, MIT)
```

**deeprouter-ai org** — separate company (LLM gateway, independent product).

```
github.com/deeprouter-ai/
└── deeprouter            # LLM gateway (Go fork of QuantumNous/new-api)
```

**Local clone paths** (historical, do NOT need to match GitHub org):
```
~/Documents/sites/
├── airbotix/                       # → Airbotix-AI/airbotix
├── kidsinai/creative-web/          # → Airbotix-AI/creative-web (clone dir not yet renamed)
├── kidsinai/kids-opencode/         # → Airbotix-AI/kids-opencode
├── kidsinai/opencode-kernel/       # → kidsinai/opencode-kernel
├── kidsinai/platform-backend/      # → Airbotix-AI/platform-backend
├── kidsinai/planning/              # → Airbotix-AI/planning
└── deeprouter-ai/deeprouter/       # → deeprouter-ai/deeprouter
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
- Two product lines: Line A creative web (6-11) + Line B Kids OpenCode (12+)
- Shared `platform-backend` (Family / Wallet / Course Pack / Class / Audit)
- All LLM traffic must route through DeepRouter `/v1` (OpenAI-compatible)
- Minors compliance: see `docs/product/compliance/minors-compliance.md` (C1-C15 required items)

### Performance Targets
- Bundle size: < 1MB gzipped
- Code splitting with React.lazy() for routes
- Memoization for expensive computations
