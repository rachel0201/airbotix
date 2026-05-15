# DeepRouter Strong-Coupling Plan

> **文档状态**：TODO，**推迟到 V0 跑通后**（参考 `kids-ai-platform-prd.md` §13.1 V0 范围验收完成）。
> **优先级**：P2 — 战略重要但非 V0 阻塞。
> **创建日期**：2026-05-15
> **作者**：Airbotix
> **关联**：
> - `kids-ai-platform-prd.md`（Layer 2 主 PRD）
> - `kids-opencode-spec.md`（Line B 旗舰 spec）
> - `~/Documents/sites/deeprouter-ai/deeprouter/` (DeepRouter-PRD)
> - memory: [[airbotix-brand-repo-structure-2026-05-15]]（商业模型决策）

---

## 1. Why

2026-05-15 锁定的商业模型 = **产品开放 + 基础设施变现**：
- `kidsinai/kids-opencode` 设计为开放可用（MIT，未来可 PUBLIC）
- 商业护城河 = **DeepRouter LLM gateway 强关联**
- 任何人 fork kids-opencode 想自部署 → 要么走 Airbotix 的 DeepRouter 付费，要么放弃 kid-safe 价值层

如果这层耦合不做扎实，fork 后只需改一个 base URL 就能直连 OpenAI/Anthropic 绕过 Airbotix，整个变现逻辑就崩了。

## 2. The Threat Model

**对手画像**：一家中型教育公司 / 编程培训机构看到 kids-opencode 开源，想在自己产品里集成。

| 攻击路径 | 当前防御 | Gap |
|---|---|---|
| 改 `OPENCODE_BASE_URL` 指向 OpenAI | 无 | ❌ 一行配置即可 |
| 删掉 kid-safe system prompt | 客户端代码可见 | ❌ 改源码即可 |
| 关掉 audit log | 客户端控制 | ❌ 同上 |
| 关掉 Stars 计量 | 客户端控制 | ❌ 同上 |
| 复用 path guard / iframe preview 代码 | 这些本来就 MIT 开放 | ✅ 可接受（这部分本来就贡献给社区） |

核心问题：**所有 kid-safe 价值层目前都在客户端实现**，fork 后可绕。

## 3. Implementation Items

### 3.1 把 kid-safe 价值层迁到 DeepRouter 服务端

| 当前位置 | 目标位置 | Why |
|---|---|---|
| kids-opencode 客户端嵌入 kid-safe system prompt | DeepRouter 收到请求后**强制注入** kid-safe prefix | fork 改不掉 |
| 客户端 prompt 黑名单过滤 | DeepRouter 服务端 LLM classifier | 同上 |
| 客户端图像 NSFW 过滤 | DeepRouter 服务端 + 上游 provider 双层 | 同上 |
| 客户端 Stars 计量 | DeepRouter 服务端 metering（已经在做） | 计费侧永远不能信客户端 |

具体到 DeepRouter 端（在 sibling repo `~/Documents/sites/deeprouter-ai/deeprouter/` 实施）：
- 新增 endpoint `/v1/kids-completions`（OpenAI 兼容格式 + 额外 kid-safety hooks）
- 该 endpoint 收到请求时强制：
  1. Prepend `KID_SAFE_SYSTEM_PROMPT`（DeepRouter 端管理，定期更新，client 看不到内容）
  2. Run kid-classify on user message (block / warn / pass)
  3. Run kid-classify on assistant message before return
  4. Emit audit event to platform-backend
  5. Meter Stars
- 普通 `/v1/chat/completions` 不带这些 — DeepRouter 同时服务 JR Academy 等非儿童 tenant

### 3.2 kids-opencode 客户端只调 `/v1/kids-completions`

- 客户端 base URL 默认 `https://api.deeprouter.ai/v1`
- 客户端调用的是 `kids-completions` 而不是 `chat/completions`
- 如果 fork 把 base URL 改成 `https://api.openai.com/v1` → OpenAI 不识别 `kids-completions` endpoint → 直接 404
- fork 想绕：要么改代码把调用改回 `chat/completions`（这时 system prompt 注入丢失，kid-safe 价值层全没），要么实现自己的 kid-safety 网关（>6 个月工程量）

### 3.3 Telemetry（可选，敏感）

kids-opencode 启动时往 `https://telemetry.airbotix.ai/heartbeat` POST 一次匿名 instance ID。这让 Airbotix 能看到全网有多少 fork 在跑、什么地区。

**Tradeoff**：增加隐私顾虑 / 教师可能反感 / GitHub issue 上会被骂。**建议不做**，或者做成完全 opt-in，默认关。

### 3.4 License / 商业条款

- 代码：MIT 不变（开放承诺）
- 但增加 `KIDS_SAFETY_NOTICE.md`：
  - "Production deployment with minors requires a kid-safety-certified LLM gateway. Airbotix DeepRouter is the only certified provider as of 2026-05. Self-certifying requires meeting [list of criteria: COPPA / AU Online Safety Act / Anthropic AUP for minors / etc.]"
  - 不是法律强制，是道德 / PR 压力 + 实际门槛说明
- DeepRouter 那边：提供 "Kids Safety Gateway" 认证标签，定期审计自部署的 fork（如有）

### 3.5 V1+ 加深耦合（可选）

- DeepRouter 端的 prompt template 系统让 Airbotix 可以**远程更新** kid-safe prompt 而不需要发版 kids-opencode
- A/B 实验只在 DeepRouter 端做（fork 无法享受）
- 课程包 metadata 在 DeepRouter 端注入（agent 知道当前是哪个 Mission，fork 想自定义课程要自己实现整套）

## 4. Acceptance Criteria

启动这个 plan 后视为完成的标志：

- [ ] DeepRouter 暴露 `/v1/kids-completions` 端点，OpenAI 兼容签名 + 服务端 kid-safe 注入
- [ ] kids-opencode 客户端只调 kids-completions（不调 chat/completions）
- [ ] 把 base URL 改为 OpenAI 直连 → kids-opencode 报错 404 + 友好提示
- [ ] 把 base URL 改为 OpenAI 直连 + 改 endpoint 名 → 能跑但 kid-safe system prompt 丢失（用 red-team prompt 可立刻验证）
- [ ] `KIDS_SAFETY_NOTICE.md` 写完并 link 在 README
- [ ] DeepRouter 端 metering / audit event emit 验证端到端

## 5. Dependencies

- **DeepRouter `/v1/kids-completions` endpoint**（必须先做）
- **platform-backend audit 接收端**（已规划，V0 范围）
- **kid-safe prompt 内容**（教研团队产出，目前散落在 PRD §11.6 和 `kids-opencode-spec.md` §4.5，需要集中到一份可程序化加载的 JSON/YAML）

## 6. Trigger Conditions（什么时候启动）

不在 V0 范围（V0 主要解决"产品能不能跑"）。启动这个 plan 的触发条件至少满足其一：

1. kids-opencode 准备转为 **PUBLIC** repo（开源前必须做完，否则等于把变现逻辑送人）
2. 首个外部 fork / 试图自部署的请求出现
3. V1 上线倒计时（DeepRouter PRD 里规划的 prod-grade SLA 节点）
4. 投资人 / 收购方 due diligence 需要看到"商业护城河文档化"

预计工程量：DeepRouter 端 2-3 周，kids-opencode 端 1 周，测试 + 文档 1 周 = **总计约 1 个工程师 × 5-6 周**。

## 7. Open Questions（启动时再决策）

- [ ] DeepRouter 端 kid-safe prompt 用什么 versioning 策略？（hot-reload 还是 release notes 通知用户？）
- [ ] fork 的"友好提示"措辞 — 太硬会被骂，太软没威慑（建议跟法务咨询）
- [ ] 是否提供 "Kids Safety Certification Program" — 让其他 LLM provider 也能通过认证拿这个标签（扩大生态 vs 削弱护城河）
- [ ] Audit event emit 失败时（platform-backend down）的降级策略 — 阻止 LLM 调用 还是 fail-open？
- [ ] `/v1/kids-completions` 是否服务非 kids-opencode 客户（比如 Airbotix 的 airbotix-app `/learn/*`）？建议**是**（统一 kid-safety gateway 给所有 Line A/B 用），但接口契约要早定

---

**结论**：这个文档不需要任何 V0 行动。V0 跑通、kids-opencode 准备开放前回到此文档，按 §3 实施。
