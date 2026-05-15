# kids-web → Airbotix-AI/creative-web

> **此目录是 pointer，不是实际代码位置。**
> - GitHub: `Airbotix-AI/creative-web` (PUBLIC) — 2026-05-15 由 kidsinai 迁入
> - 本地 clone: `~/Documents/sites/kidsinai/creative-web/` (clone 目录历史命名未改)
>
> **注意命名差异**：airbotix repo 里仍叫 `kids-web/`（历史命名），实际 GitHub repo 叫 `creative-web/`。以 GitHub repo 名为准。

Airbotix Kids AI Platform — **Line A 低龄创作 web (6-11 岁)**。

## 实际位置

```bash
cd ~/Documents/sites/kidsinai/creative-web/
```

## Scope (V0)

- AI 图像创作向导（模板 + prompt + 生成 + 保存）
- AI 配音故事书
- 作品集 + 班级墙浏览
- 调 `platform-backend` REST/WebSocket，**不直连任何 LLM 或第三方**

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | TailwindCSS（复用 airbotix marketing site 设计令牌） |
| Routing | React Router v6 |
| State | React Context + TanStack Query |
| Forms | React Hook Form + Zod |
| Realtime | WebSocket (browser native) → platform-backend Gateway |
| Hosting | **Cloudflare Pages** |

## Constraints

- 6-11 岁 UI：大字体、图标主导、最小化文本、零外部跳转
- 所有 AI 调用走 `platform-backend`，**不要在前端塞任何 API key**
- 合规（minors-compliance.md C7/C8）：孩子作品默认私有，公开需家长批准

## Related docs (in airbotix repo)

- `../docs/product/prd/kids-ai-platform-prd.md` §13.1 Line A 范围
- `../docs/product/compliance/minors-compliance.md`
