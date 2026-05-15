# kids-opencode → kidsinai/kids-opencode

> **⚠️ 此 repo 由另一个 AI agent 维护，不在 airbotix repo 工作范围内。**
> 所有架构 / 技术选型 / V0-V1 范围决策都在那个会话中进行。在 airbotix repo 工作时**不要**做 kids-opencode 的实施建议或修改 `docs/product/prd/kids-opencode-spec.md`。
>
> 此目录仅保留作为 platform 拓扑锚点。

## 位置

- GitHub: `kidsinai/kids-opencode` (PRIVATE, MIT)
- 本地 clone: `~/Documents/sites/kidsinai/kids-opencode/`
- 内核 fork: `kidsinai/opencode-kernel` (PUBLIC, MIT) — `~/Documents/sites/kidsinai/opencode-kernel/`

## 在 Airbotix Platform 中的角色（高层）

- Line B 12+ 旗舰产品（agentic AI coding tool for kids）
- 通过 airbotix-app `/download/kids-opencode` 入口分发
- 用 Airbotix Family Account 登录
- LLM 调用走 DeepRouter（**这是商业护城河**，详见 `docs/product/prd/deeprouter-coupling-plan.md`）
- Stars 在 DeepRouter 端计费，audit 通过 platform-backend 接收

## airbotix-app / platform-backend 与 kids-opencode 的接口契约

需要 cross-team 对齐的点（在 airbotix repo 工作时**可以讨论**这些接口，但**不要**单方面决定 kids-opencode 那边的实现）：

- `auth/oauth` 流程：kids-opencode 如何 token-exchange 用 Family Account
- `wallet/charge` 端点：DeepRouter 计费回写到 platform-backend wallet
- `audit/emit` 端点：kids-opencode 上报 agent action 给家长 audit 流
- 跨产品作品集：kids-opencode 完成的项目如何回写到 airbotix-app `/learn/classroom`

接口变更必须 cross-AI 沟通后落地，不要在任一边单方面定义。

## Related docs (in airbotix repo)

- `../docs/product/prd/kids-ai-platform-prd.md` — Line B 在主 PRD 的角色（高层）
- `../docs/product/prd/deeprouter-coupling-plan.md` — DeepRouter 商业护城河实施 plan（airbotix-app + kids-opencode 共同涉及）
- `../docs/product/prd/kids-opencode-spec.md` — **由另一个 agent 维护，本 repo 不主动改**
