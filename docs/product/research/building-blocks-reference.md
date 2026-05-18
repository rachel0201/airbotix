# Reference: 按 Airbotix 模块梳理的开源积木

> 研究归档 · 2026-05-17 · Airbotix Kids AI Platform 参考
> 视角：从"Airbotix 现在/接下来 12 个月要建什么"反向找开源可用件
> 区别于其他三份 reference 文档（taxinomitis / cognimates / day-of-ai 是"对标产品"），本文档是"积木仓库"

## 总览（按模块快速索引）

| Airbotix 模块 | 状态 | 最值得用的开源 | License | 是否已采用 |
|---|---|---|---|---|
| **DeepRouter**（LLM 网关） | 在建 | [QuantumNous/new-api](https://github.com/QuantumNous/new-api) (Go, 32K★) | Apache-2.0 | ✅ 已 fork |
| **kids-opencode**（Line B agentic 编码） | 在建 | [anomalyco/opencode](https://github.com/anomalyco/opencode) (160K★, 900 contributors) | MIT | ✅ 已 fork |
| **浏览器代码沙盒**（Line A + Kids OpenCode V0） | 在建 | [LiveCodes](https://livecodes.io) / [Flems](https://github.com/porsager/flems) | MIT | ⚠️ 待评估 |
| **LLM 内容审核 / Guardrails** | 在建 | [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails) + Llama Guard | Apache-2.0 | ⚠️ 待评估 |
| **AI Chat UI**（Line A 创作前端参考） | 在建 | [LibreChat](https://github.com/danny-avila/LibreChat) / [Open WebUI](https://github.com/open-webui/open-webui) | MIT / BSD-3 | ⚠️ 仅参考 UX |
| **家长侧 AI 安全控制** | 在建 | [Aegis](https://www.parentalsafety.ai/) | MIT | ⚠️ 概念参考 |
| **LMS / 课程管理 / Teacher Console** | 在建 | Canvas / Open edX / Chamilo / [LearnHouse](https://github.com/learnhouse/learnhouse) | 各异 | ❌ 太重，不建议 |
| **Stars Wallet / 虚拟币系统** | 在建 | （无合适方案） | — | ❌ 自建 |
| **Audit Logging**（C1-C15 合规） | 在建 | NestJS interceptor + Prisma audit table 自建 | — | ❌ 自建 |

---

## 1. DeepRouter（LLM 网关）

### 已选定
**[QuantumNous/new-api](https://github.com/QuantumNous/new-api)** — Go 写的多模型网关，32K stars，OpenAI 兼容 `/v1`，支持多家 LLM provider 路由、计费、限流。

PRD 已确认 fork 路径：`~/Documents/sites/deeprouter-ai/deeprouter/`

### 备选（已被否决）
- **LiteLLM**（Python）— 模型路由库，但更偏 SDK 不是网关产品
- **Portkey**（Node）— SaaS 倾向重，自托管路径不清晰
- **Helicone**（Node）— 偏 observability，不是路由网关

**结论**：选型已锁，无需再调研。

---

## 2. kids-opencode（Line B 12+ 旗舰）

### 已选定
**[anomalyco/opencode](https://github.com/anomalyco/opencode)** — 160K stars、900 contributors、13K commits，PRD 写的是 158K，已经又涨了。

**核心特性可直接复用**：
- 双 agent 模式（build + plan）— 直接对应"实操 vs 解题思考"教学场景
- Client/server 架构 — 服务端跑 agent，客户端可以是 TUI/Web/Mobile，对 Airbotix V0 Hosted + V1+ Local 双形态天然友好
- 75+ AI provider 适配 — Airbotix 只对接 DeepRouter 一家，省事
- 子 agent（General / Explore / Scout）— 教学场景可包装成"老师助手 / 探索员 / 侦察员"角色

### License 提醒
**MIT** —— 商用 OK，必须保留版权。OpenCode 团队对 fork 友好（社区有大量教育向 fork）。

### Airbotix 改造方向（已在 PRD §11.6）
- V0：iframe sandbox + 虚拟 FS，限制 tool 到 Read/Write/Edit
- V1：Pyodide 接入
- V2+：服务端容器（机器人脚本场景）

**结论**：选型已锁，按 PRD 推进。

---

## 3. 浏览器代码沙盒（最需要现在决定）

### 候选

| 方案 | Stars | 体量 | 特点 | License |
|---|---|---|---|---|
| **[LiveCodes](https://livecodes.io)** | ~3K | 中 | 90+ 语言/框架，可嵌入，主题/编辑器可定制，已生产级 | MIT |
| **[Flems](https://github.com/porsager/flems)** | ~1K | 小 | 单文件，专做 HTML/CSS/JS，零依赖 | MIT |
| **[javascript-playgrounds](https://github.com/dabbott/javascript-playgrounds)** | ~1K | 中 | iframe-based，专为教学场景设计，支持 React Native | MIT |
| **[milankarman/Embed-Web-Playground](https://github.com/milankarman/Embed-Web-Playground)** | ~小 | 极小 | 无后端纯前端，HTML/CSS only | MIT |

### 推荐
**LiveCodes** 是最像"产品"的——主题、嵌入、配置都到位，可以直接嵌进 Airbotix Learn 端。
**Flems** 是兜底选择——如果只做 V0 HTML/CSS/JS，Flems 一个文件搞定，工程量最低。

### 关键决策点
- **Airbotix V0 PRD 说自己做 iframe sandbox + 虚拟 FS** —— 这部分要不要直接用 LiveCodes 替代自研，能省 4-6 周
- LiveCodes 已经实现了多文件、虚拟 FS、export/import、嵌入 API 这些 V0 PRD 列的所有功能

**行动建议**：P0 起一个小 spike，把 LiveCodes 嵌进 Airbotix Learn 原型里看是否满足需求，否则自研。

---

## 4. LLM 内容审核 / Guardrails

这是 C1-C15 minors compliance 的硬指标，**必须有**。

### 推荐组合
1. **[NVIDIA NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails)** (Apache-2.0)
   - 输入/输出双向 rail
   - Colang DSL 写对话流约束
   - 5 类 rail：input / dialog / retrieval / execution / output
   - 已生产级，NVIDIA 维护
2. **Meta Llama Guard**（模型）
   - NeMo 内置支持
   - 6 个不安全类别，可扩展
   - 走 DeepRouter 调用即可，不需要自托管

### 集成路径
```
Kid 输入 → DeepRouter（NeMo 前置 rail）→ LLM → DeepRouter（NeMo 后置 rail）→ 返回
                          ↓
                  Llama Guard 模型并行打分
                          ↓
                  违规 → 替换响应 + Audit log
```

### Airbotix 应做的额外定制
- 中文场景需要补中文敏感词库（NeMo 默认英文）
- 年龄分层 rail：6-11 岁和 12+ 岁触发不同严格度
- 违规事件直写 platform-backend audit table（关联 `audit-event-schema-prd.md`）

**结论**：强推 NeMo + Llama Guard，**不要自己重写内容审核**。中国合规层（敏感词）单独叠加。

---

## 5. AI Chat UI（Line A 创作前端参考）

### Line A 不直接抄整个 UI，但 LibreChat / Open WebUI 的几个能力值得借鉴

| 项目 | Stars | 适合借鉴的特性 |
|---|---|---|
| **[LibreChat](https://github.com/danny-avila/LibreChat)** | 28K+ | 预设 prompt + 变量/下拉、Artifacts 自动渲染（React 组件、diagram） |
| **[Open WebUI](https://github.com/open-webui/open-webui)** | 100K+ | 颗粒度权限、对话标签、克隆、记忆系统、本地 RAG |
| **[LobeChat](https://github.com/lobehub/lobe-chat)** | 50K+ | 插件市场、Agent 市场、移动端体验 |

### 关键判断：**不要 fork 整个项目**
- 这些 UI 是给成年人技术用户设计的（多 provider 切换、API key 管理、模型参数调节）
- Airbotix Line A 是 6-11 岁孩子，UI 要从零设计（大图标、少文字、强反馈）
- 但**艺术品（artifacts）渲染**、**预设 prompt 系统**这些底层模式可以照抄

### Artifacts 模式特别推荐
LibreChat 的 Artifacts：LLM 生成 React 组件/图表/HTML 自动渲染到侧栏 —— 这正是 Airbotix Line A "AI 帮我做图像/音乐/故事"的交互范式。**强烈建议把 LibreChat artifacts 模块单独拆出来研究**。

---

## 6. 家长侧 AI 安全控制

### [Aegis](https://www.parentalsafety.ai/) — MIT
开源的家长端 AI 聊天监控工具：本地过滤、不上云、支持 ChatGPT / Claude / Gemini / Copilot / Perplexity / Poe / Bing。

**对 Airbotix 的价值**：
- 不直接用代码（Aegis 是本地拦截工具，Airbotix 是云端平台）
- **借鉴产品形态**：家长能设置什么规则、看到什么报告、怎么 alert
- Airbotix Parent Portal 的"家长可见性"特性可以照着 Aegis 的能力清单做需求拆解

---

## 7. LMS / Teacher Console（不推荐用整套）

调研结论：**所有 LMS 都太重**，硬塞进 Airbotix 反而拖累。

| 项目 | 问题 |
|---|---|
| **Canvas LMS** | Ruby on Rails 单体，部署运维成本高 |
| **Open edX** | Python/Django，K-12 用太学术 |
| **Chamilo / Moodle** | PHP 老栈，与 NestJS+Prisma+TS 体系冲突 |
| **Gibbon / RosarioSIS** | K-12 友好但偏学校行政管理，不是教学平台 |
| **LearnHouse** | 最现代（TS），但功能定位差异大 |

**推荐做法**：teacher-console 完全自研（已在 PRD），按需要从 LMS 抄具体功能点（班级 invite code、学生进度面板、作业批改流），不引入整套。

### 唯一可借鉴的具体功能模式
- **Canvas 的 LTI 标准** — 如果未来要接 AU 学校的 SIS 系统，LTI 1.3 协议是行业标准
- **Open edX 的课程进度模型** — 课程包/单元/课时三级结构的数据模型设计

---

## 8. Stars Wallet / 虚拟币系统

**调研结论：没有合适的开源积木。** 现有的：
- 全是加密货币钱包（BlueWallet / Cake Wallet 等）—— 不适合
- SaaS credit 系统多是闭源 SaaS 产品（Stripe metered billing、Lago）

**推荐做法**：完全自建。这块业务逻辑足够简单（充值 → 余额 → 扣费 → 流水），用 Prisma 30 行表结构就能搞定。引开源积木反而徒增复杂度。

### 数据模型参考（已在 platform-backend-api-spec.md，本节仅备忘）
```
family { id, owner_id, ... }
wallet { family_id, balance_stars, version }
transaction { family_id, delta, reason, ref_type, ref_id, created_at }
```

---

## 9. Audit Logging（C1-C15 合规）

**调研结论：自建**。理由同上，业务逻辑不复杂，引入第三方反而引入合规风险（数据出境）。

### 实现路径
- NestJS Interceptor 统一拦截
- 写入 Prisma `audit_events` 表（Neon Postgres，悉尼）
- 关联 `audit-event-schema-prd.md` 已定义的事件 schema

---

## 决策汇总表

| 模块 | 决策 | 理由 |
|---|---|---|
| DeepRouter | ✅ 用 new-api | 已 fork |
| kids-opencode | ✅ 用 opencode | 已 fork |
| 浏览器沙盒 | ⏸ 评估 LiveCodes vs 自研 | **本周需要决策** |
| Guardrails | ✅ 用 NeMo + Llama Guard | 必须，且不重复造轮子 |
| AI Chat UI | ❌ 不直接用，借鉴 artifacts 模式 | 用户群不匹配 |
| 家长控制 | ❌ 不直接用，借鉴产品形态 | Aegis 是本地工具 |
| LMS | ❌ 自研 teacher-console | 现有 LMS 都太重 |
| Stars Wallet | ❌ 自建 | 业务简单 + 无好选项 |
| Audit Log | ❌ 自建 | 合规风险 + 业务简单 |

## 建议下一步（按优先级）

| 优先级 | 行动 | 关联模块 |
|---|---|---|
| **P0** | LiveCodes spike：嵌进 Airbotix Learn 原型 1 天评估 | airbotix-app, kids-opencode V0 |
| **P0** | NeMo Guardrails spike：跑通中文 + 年龄分层 rail | platform-backend, DeepRouter |
| P1 | 拆 LibreChat Artifacts 模块代码，吸收 Line A 创作交互模式 | airbotix-app `/learn/*` |
| P2 | Open edX 课程模型 schema 看一眼，对照 Airbotix 课程包数据模型 | platform-backend |
| P3 | Aegis 产品能力清单 → Parent Portal 功能 backlog | airbotix-app `/portal/*` |

---

**研究人**：Claude (airbotix session) · **下次审阅**：每个 P0 spike 完成后更新本文档对应行
