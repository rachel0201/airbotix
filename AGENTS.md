# Repository Guidelines

This repository (`Airbotix-AI/airbotix`) is the umbrella for the marketing site + cross-product planning docs. **Sibling product repos live separately under the `Airbotix-AI` and `kidsinai` GitHub orgs** — see `CLAUDE.md` for the full topology.

## What's in this repo

- `src/` — Marketing site (React 18 + Vite + TypeScript + TailwindCSS), deployed to GitHub Pages at airbotix.ai
- `docs/` — Active PRDs, compliance, AI context, architecture, archived docs
- `rules/` — Mandatory coding standards (SOLID / DRY / KISS / file size / TS)
- `airbotix-app/`, `teacher-console/`, `platform-backend/`, `kids-opencode/`, `infra/` — **Pointer dirs**, not actual code (READMEs documenting sibling repo locations + tech stack)

## What's NOT in this repo

- The unified portal + learn SPA → `Airbotix-AI/airbotix-app` (separate repo)
- The teacher / admin console → `Airbotix-AI/teacher-console` (separate repo)
- The NestJS backend → `Airbotix-AI/platform-backend` (separate repo)
- The 12+ local desktop coding tool → `kidsinai/kids-opencode` (separate repo, **managed by a different AI agent**)
- The LLM gateway → `deeprouter-ai/deeprouter` (separate repo, independent product)

**Removed 2026-05-14** (do not try to restore from git history):
- `super-admin/` (was Supabase-based; replaced by `Airbotix-AI/teacher-console`)
- `auth-backend/` (in-memory PoC; replaced by `Airbotix-AI/platform-backend` auth module)

## Build, Test, and Dev Commands

Marketing site (root directory):
- `npm run dev` — start Vite dev server (http://localhost:3000)
- `npm run build` — type-check + Vite build to `dist/`
- `npm run preview` — serve production build locally
- `npm run lint` — ESLint, no warnings allowed
- `npm run deploy` — Build + deploy to GitHub Pages (airbotix.ai)

For sibling repos, `cd` into the actual location (typically `~/Documents/sites/kidsinai/<repo>/`) and follow that repo's README.

## Coding Style & Naming

- TypeScript, 2-space indent, no semicolons, single quotes (`.prettierrc`)
- ESLint with TypeScript + React Hooks rules; fix with `npm run lint -- --fix`
- Names: Components `PascalCase`, hooks `useCamelCase`, files match export (e.g., `WorkshopCard.tsx`)
- Avoid string literals in conditionals; centralize constants (see `rules.md`)

## Testing Guidelines

- Marketing site: no test framework wired yet. Plan: Vitest + Playwright.
- Sibling repos may use Jest (platform-backend NestJS) or Vitest (SPAs). Check each repo's README.
- Place tests near source or in `__tests__` and name as `*.test.ts(x)`.

## Commit & PR Guidelines

- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Branch names: `feature/...`, `fix/...`, `docs/...`
- PRs: clear description, testing steps, screenshots for UI, linked issues, checklist from `rules.md`
- Do NOT commit `.claude/settings.local.json` (gitignored permission accumulator; already untracked as of 2026-05-15)

## Agent-Specific Notes

- Follow file size and constant rules in `rules.md`
- Keep changes scoped; do not modify unrelated modules
- **Cross-repo scope boundary** (2026-05-15): when working in this repo, do NOT make architectural decisions for `kidsinai/kids-opencode` or `kidsinai/opencode-kernel` — those are managed by a different AI agent. You may discuss interface contracts (auth token-exchange, audit emit endpoints, wallet charge webhooks) but never unilaterally define kids-opencode internals.
- Update docs in `docs/` when adding features (architecture + env vars)
- All tech stack and brand structure is in `CLAUDE.md` — read first when unclear
