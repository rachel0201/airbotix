# DeepRouter PRD — MOVED

> ⚠️ 此 PRD 已迁移到 DeepRouter 独立 repo（DeepRouter 是 Lightman 主导的独立产品，不是 Airbotix 子模块）。
>
> **新位置**：`~/Documents/sites/deeprouter-ai/deeprouter/DeepRouter-PRD.md`
>
> **迁移日期**：2026-05-12
>
> Airbotix Kids 是 DeepRouter 的两个主要 V0 tenant 之一（与 JR Academy 并列）。本 stub 保留是为了让 Airbotix 这边搜索 `deeprouter-prd.md` 时能找到去向。

## 与 Airbotix 的接口契约（摘要，详情见新位置）

- Airbotix Kids 平台所有 LLM 调用走 `https://api.deeprouter.<tld>/v1`（OpenAI 兼容）
- Airbotix Kids 作为 DeepRouter 的 tenant，配置 `kids_mode: true`（合规硬约束集合）
- DeepRouter → Airbotix billing webhook：每请求结束 POST 到 Airbotix 内部 endpoint，Airbotix 端做 Stars 扣减
- Anthropic Tier 累计、上游限流、多 key 轮换由 DeepRouter 端负责

详细见 sibling repo PRD。
