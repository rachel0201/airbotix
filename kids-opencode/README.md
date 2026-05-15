# kids-opencode → kidsinai/kids-opencode

> **此目录是 pointer，不是实际代码位置。**
> 真实代码在 sibling repos（两 repo 结构，2026-05-14 锁定）：
> - 产品代码：`~/Documents/sites/kidsinai/kids-opencode/`（PRIVATE，MIT）
> - 内核 fork：`~/Documents/sites/kidsinai/opencode-kernel/`（PUBLIC，MIT，近镜像 upstream `anomalyco/opencode`）

Airbotix Kids AI Platform — **Line B Kids OpenCode (12+ 旗舰)**。

## 实际位置

```bash
# 产品代码（私有，本文档对应）
cd ~/Documents/sites/kidsinai/kids-opencode/

# 内核 fork（公开，跟踪 upstream）
cd ~/Documents/sites/kidsinai/opencode-kernel/
```

## 两 repo 拆分原因

产品代码不 import 内核源码，只通过 `@opencode-ai/sdk` + `@opencode-ai/plugin`（npm）消费。这让：
- 内核 fork 保持近镜像 upstream，rebase 摩擦最小
- 产品 repo 私有保护商业敏感逻辑（kid-safe prompts、Stars 计量、家长 audit 集成）
- 通用价值改进（path guard / iframe preview / DeepRouter adapter）可贡献回 upstream

## Scope (V0)

- 孩子端 web 工作区（多文件树 + 编辑器 + iframe 预览）
- Agent 对话面板（plan / tool call 可见 / approve）
- **V0 沙盒**：服务端 virtual FS (AWS S3 Sydney) + 浏览器 `<iframe sandbox>`，**仅支持 HTML/CSS/JS**
- 工具白名单：`read_file` / `write_file` / `edit_file` / `list_dir` — 全部作用于 S3 virtual FS，**禁用 shell / 任意命令**

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TS + Tailwind + Monaco (复用 opencode 部分) |
| Frontend hosting | Cloudflare Pages |
| Agent runtime | Node + TS，AWS EC2 Sydney (V0 与 platform-backend 同机) |
| Virtual FS | AWS S3 SDK，bucket key 前缀 `<kid_profile_id>/<project_id>/` |
| Audit | platform-backend `/audit` endpoint → Neon Postgres |
| LLM | DeepRouter `/v1` (Claude 3.5 Sonnet via DeepRouter) |

## Hard rules

- ❌ 不允许在 fork 内引入 shell / Bash / 任意命令执行
- ❌ 不允许直连 OpenAI/Anthropic — 必须走 DeepRouter
- ❌ 不允许把 kid 代码跑在服务端（仅浏览器 iframe 渲染）

## Related docs (in airbotix repo)

- `../docs/product/prd/kids-opencode-spec.md` — 完整 spec (v0.1 → 已对齐两 repo 结构)
- `../docs/product/prd/kids-ai-platform-prd.md` §13.1 Line B 范围 + §11.6 安全护栏
- `../docs/product/compliance/minors-compliance.md`
