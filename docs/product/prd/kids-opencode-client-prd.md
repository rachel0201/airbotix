# Kids OpenCode — Client Architecture PRD v0.3

> 文档状态：Draft v0.3 · 待评审
> 编写日期：2026-05-15（v0.1 → v0.3 同日迭代，详见末尾修订历史）
> 作者：Airbotix（airbotix repo session）
> 文档定位：**handoff 备忘 + 架构决策记录**
> 实施 owner：`kidsinai/kids-opencode` repo session（另一个 AI agent + Lightman）
>
> **上游/平行文档**：
> - 上位：`kids-ai-platform-prd.md` v0.4（Layer 2 平台 PRD）
> - 平行（hosted Web 等价物，V0 主入口）：[`learn-code-studio-prd.md`](./learn-code-studio-prd.md) — 浏览器内 AI Coding Studio，sibling of `/learn/create/image` 等；V0 = Hosted-first 战略落地
> - 平行：`DeepRouter-PRD.md`（独立 LLM gateway，本产品强依赖）
> - 替代：`kids-opencode-spec.md` v0.2（pre-pivot 服务端沙盒方案，2026-05-15 标记 stale；本 PRD 取代其中"客户端形态"与"开发架构"两部分）
> - 实现现状：`~/Documents/sites/kidsinai/kids-opencode/PLAN.md` v0.3（工程已 G1-G12 收官，等架构决策才能进 Phase 2.5）
>
> **本文档不取代**：`PLAN.md` 的阶段拆解、`docs/compliance/au.md` 的合规清单、`KIDSINAI.md` 的产品愿景。本文档只回答一个问题——**孩子启动 `kids-opencode` 后看到的是什么，背后的引擎怎么搭，上游升级怎么吃。**
>
> ---
>
> **2026-05-25 定位修订（重要）**：本桌面客户端 PRD **不再是 Line B 的 V0 主入口**。`kids-ai-platform-prd.md` v0.4 战略明确"V0 Hosted-first，V1+ Local desktop"——但 V0 Hosted 落地一直缺 PRD。2026-05-25 新增 [`learn-code-studio-prd.md`](./learn-code-studio-prd.md) 补齐该缺口，作为 **V0 Line B 主入口**（浏览器内 Code Studio，sibling of `/learn/create/image`，零安装）。
>
> 本桌面客户端 PRD 的产品定位据此调整为：
> - **V0**：作为 hosted Code Studio 的**补充**，面向已 ship 的 TUI dogfood 用户（Workshop trial），不强推。
> - **V1+ 主线**：repositioned as **"graduate to power mode"** —— 家长 BYO API key、本地文件系统访问、更大 context、更宽 tool 白名单（V1 视情况开 `run_command`）。是 Line B 高端付费用户的可选项，不是 V0 主入口。
> - **架构不变**：TUI + serve + plugin 的 C 路线决策 (§2)、安装/onboarding (§7)、安全合规 (§6) 继续生效，因为这些约束在 V1+ 桌面端依然成立。
> - **不重叠**：hosted Studio 和 desktop client 共享同一 `Project.kind=code` 模型 + 同一 audit schema + 同一 Stars 体系；V1 加入 `[Open in Kids OpenCode desktop]` 一键 handoff（见 `learn-code-studio-prd.md` D-CODE-Q4）。

---

## 摘要

V0.3 工程闭环后实测发现，当前 `kids-opencode` 在 server-side 已经做到了 kid-safe（system prompt + tool 白名单 + audit），**但 kid 启动后看到的 UI 完全是上游 opencode 的原版 TUI**——配色、键位、logo、placeholder、提示音、欢迎页全部未改。banner 是唯一可见的 kid 化痕迹，且 TUI 接管后即滚出屏幕。

这违背"AI coding 是下一代通用素养"的产品承诺：屏幕环境对 12 岁过于工程师化，违和感会在 Workshop dogfood（Phase 6）第一分钟就暴露。

本 PRD 提出**自有客户端 + opencode-as-kernel** 架构（下文称 **C 路线**），并锁定以下决策：

1. **不 fork opencode 源码**；通过 `@opencode-ai/sdk` v2 连接本机 `opencode serve`
2. **分阶段交付而非一步到位**：V0a（Phase 2.4）先用 TUI 插件包做主题 / logo / 音效 / placeholder 改造（**A 路线**），赶第一次 Workshop dogfood；V0b（Phase 2.5）基于真实反馈做完整自有客户端（**C 路线**）；V1 是 Tauri GUI 桌面应用
3. **server-side 现有 plugin 保留**（迁 v2 plugin API），继续承担 system prompt、tool 白名单、audit；client 不重复这些逻辑
4. **每个 kid 一套本地 stack**（serve + client + plugin），workshop 模式靠 audit 流聚合而非中心 serve
5. **上游 SDK 精确版本钉死**，建立契约测试 gauntlet 作为升级闸门

---

## 1. 背景与问题陈述

### 1.1 V0.3 工程现状（事实，不是 PLAN.md 摘抄）

`packages/kids-plugin/` 已完成（922 行 TS + 36 个测试，全绿）：

- `src/index.ts:32-46` — 工具白名单（read/write/edit/glob/grep/webfetch）+ webfetch host 白名单（MDN/web.dev/whatwg/airbotix.ai）
- `src/index.ts:147-211` — `experimental.chat.system.transform`、`tool.execute.before`、`tool.execute.after` 三个 hook 实装
- `src/system-prompt.ts` + `config/system-prompt.md` — 10 条 kid-safe 行为规则，含 Kids Helpline 1800 55 1800
- `src/course-pack.ts`、`src/acceptance.ts`、`src/check-runner.ts` — Course Pack 加载器 + Mission 验收 runner
- `bin/kids-opencode` 174 行 wrapper（AI disclosure banner + `--course/--mission` flag）
- `install.sh` 141 行（SHA 校验 + 上游 opencode 自动安装）

测试覆盖了真实拦截：`shell/bash/task/lsp/skill/apply_patch` 被白名单拒绝；`example.com / docs.python.org / javascript: / ftp://` 被 host 白名单拒绝。

### 1.2 V0.3 没做的事

`packages/kids-plugin/package.json` 中**没有 `tui:` 入口**，只有 `server: plugin`。也就是说：

> **当孩子运行 `kids-opencode` 时，wrapper 打印一行 banner 后即 `exec opencode`，从此 TUI 由上游原版接管：原版 logo、原版深色配色、原版工程师风格键位、原版 placeholder "Type your prompt…"。孩子看到的"kid 化"全部在 LLM 回复的文字里。**

### 1.3 为什么这不够

| 维度 | 当前状态 | 12 岁第一次见面的真实体感 |
|---|---|---|
| 启动画面 | 上游 opencode logo 占据顶部 | "这是什么软件" |
| 配色 | 上游深色工程师调色 | 与"kid-safe 学习平台"品牌承诺断裂 |
| Placeholder | "Type your prompt…" | 不知道该输入什么 |
| 键位提示 | 上游完整工程师 keymap（数十条） | 信息过载 |
| 进度可见性 | 无 Mission 进度条、无 Stars 余额 | 不知道做到第几步、还剩多少额度 |
| 反馈音效 | 上游默认 beep | 没有鼓励感 |

**判断**：这不是"再加几个 slot 就能修"的级别的问题。是产品体感与工具体感的根本错位。Phase 6（workshop dogfood）会撞这堵墙。

### 1.4 PLAN.md v0.2 pivot 时刻意砍掉了 TUI 这条线

PLAN.md:52（v0.3 文档）原话：

> "Upstream already exposes a headless HTTP server (`opencode serve`) and ships `@opencode-ai/sdk` + `@opencode-ai/plugin` as public npm packages. **There is no TUI replacement work needed because we're shipping a CLI. The plugin is the entire customisation surface.**"

这个决策在 V0.3 之前是合理的（赶 workshop 窗口、降低工程量）。本 PRD 主张**回滚这条决策**，理由见 §2。

---

## 2. 战略决策：C 路线（自有客户端 + opencode-as-kernel）

### 2.1 三条路的取舍

| 路线 | 自主度 | 工程量 | 上游升级成本 | 角色定位 |
|---|---|---|---|---|
| **A 路线**：TUI 插件 + theme / slot / sound / keymap | 受限于上游 slot/theme 暴露 | 5-7 天（1 个 sprint） | 中（slot 改名要跟） | **先行步骤** — 用最小代价拿到 80% 的"第一眼像 Kids"体感，赶上 Workshop dogfood，并用真实孩子反馈约束 C 的 UX 设计 |
| **B 路线**：fork opencode TUI 源码 | 完全 | 高（Solid.js + opentui 内核） | **极高**（每次上游 merge 都是 rebase 噩梦） | **否决**。Phase 1 已明确（OC-2 决策）；与"DeepRouter 才是 moat"战略冲突 |
| **C 路线**：opencode-as-kernel + 自有客户端 | **完全**（连"用不用终端"都可以重选） | 中（TUI 1.5-2 周 / GUI 3-4 周） | **低**（SDK 是稳定公开契约） | **完整解** — 接 A 的体验扩展瓶颈（A 做不到的 Mission 进度持久区、深度自定义聊天渲染、跨 client/GUI 复用） |

**决策：A → C 分阶段。** B 否决不变。具体节奏：

1. **V0a / Phase 2.4**：A 路线 TUI 插件包先上（详见 §9.2），赶第一次 Workshop dogfood（Phase 6）
2. **V0b / Phase 2.5**：基于 Workshop 反馈做 C 路线自有 client，接第二场 Workshop + V1 GUI 基础
3. A 不是 throwaway——它的 system prompt、theme、course pack 集成、audit pipeline 都被 C 复用

C 仍然是终态，但**不再要求一步到位**。A 作为 production stepping stone 也能服务真实孩子；如果 A 之后发现 80% 体感已够、且工程力紧张，C 可以推迟而非取消。

### 2.2 C 路线的官方背书

来自 `kidsinai/opencode-kernel/KERNEL.md:21-28`（kernel repo 自己写的）：

> "The product repo consumes opencode purely as a dependency via:
> - `@opencode-ai/sdk` (npm) — server client
> - `@opencode-ai/plugin` (npm) — plugin / hook registration
>
> **No code from this kernel repo is imported directly by the product.**"

这是上游对"产品形态"的官方建议。我们前面 V0.1-V0.3 走的就是这条路（只用 plugin npm 包），现在只是把"客户端"也归到自有 —— **同一个架构原则，只是边界画得更全**。

### 2.3 架构总图

```
每个 kid 的笔记本（独立完整 stack，无中心服务器）
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ┌─ kids-opencode 自有客户端 (Airbotix 自有，本 PRD 范围)    │
│   │     - V0：TUI（Ink/Bubble Tea），自有视觉系统             │
│   │     - V1：Tauri 桌面 GUI（双击图标启动）                  │
│   │     - 调用：@opencode-ai/sdk v2（HTTP + SSE）             │
│   ↓                                                          │
│   ┌─ opencode serve（上游原版 kernel，精确版本钉死）          │
│   │     - 127.0.0.1:4096 (默认)                              │
│   │     - HTTP Basic Auth, password 由 installer 随机生成    │
│   │     - 加载 @kidsinai/kids-opencode-plugin v2             │
│   │         · system prompt 注入                             │
│   │         · 工具白名单拦截                                  │
│   │         · webfetch host 白名单                           │
│   │         · audit 事件流                                    │
│   └─ Provider 路由 → DeepRouter                              │
│                                                              │
└────────────↓─────────────────────────────────────────────────┘
             ↓ 仅出网调用：HTTPS to DeepRouter
      ┌──────────────────────┐
      │ DeepRouter (Sydney)  │ → Claude / GPT / Doubao
      │ + audit 上报端点      │
      └──────────────────────┘
              ↑
      老师 console 通过 audit/event 流聚合 20 kid 进度
      （**不**通过中心 serve 集中跑 agent）
```

### 2.4 这套架构的关键性质

| 性质 | 含义 | 价值 |
|---|---|---|
| `opencode serve` 是本机进程 | 不是 opencode 公司的云 | AU 合规：kid 代码与对话不出本机，仅 LLM 调用出网 |
| 出网调用统一走 DeepRouter | 我们控制 LLM 入口 | 合规审计、成本核算、模型路由策略全在自家 |
| `server:` plugin 在 serve 进程加载 | 跟 TUI 加载是同一份代码 | 现有 plugin + 36 个测试 100% 复用 |
| Client 和 Server 解耦 | 升级 SDK 时只动 client | 客户端是我们的、节奏自定；plugin 和 serve 独立升级 |

---

## 3. 客户端 UX 需求（V0 TUI）

### 3.1 启动到聊天的关键时刻设计

**目标**：kid 双击 / 输入命令到看到"我在哪里 + 该做什么"≤ 5 秒。

```
┌─ kids-opencode 启动屏 ──────────────────────────────────────┐
│                                                            │
│                    [Airbotix Kids OpenCode 字样]            │
│                                                            │
│   你好！我是 Kids OpenCode —— 帮你做编程项目的 AI 老师。    │
│                                                            │
│   我不是真人，我有时候也会答错。                            │
│   遇到不懂的，问家长或老师。                                 │
│                                                            │
│   澳大利亚紧急求助：Kids Helpline 1800 55 1800              │
│                                                            │
│   [Enter] 开始新项目          [c] 选择 Course Pack          │
│   [r] 继续上次               [h] 帮助                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**不允许**直接跳入 chat prompt（当前 opencode TUI 行为）。

### 3.2 Mission 进行中的屏幕结构

```
┌──────────────────────────────────────────────────────────────┐
│ Mission 1/3 · 项目设置 + 第一个 HTML 页面 · ⭐ 余 36/40       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ 🤖 来吧！你想做的网站是关于什么的？                          │
│                                                              │
│ 👦 我喜欢恐龙                                                │
│                                                              │
│ 🤖 好棒。我们先做一个文件叫 index.html。我可以创建吗？       │
│    [y 同意 / n 不要 / e 我自己来]                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 💬 输入你想做的（中文/英文都行）                              │
└──────────────────────────────────────────────────────────────┘
```

**关键差异 vs 上游 TUI**：
- 顶部 Mission 进度条（上游无）
- ⭐ 余额（kid 经济系统的核心反馈，上游无）
- 角色标识（👦 / 🤖 / ⚙️）（上游用 user/assistant）
- 权限确认用孩子能看懂的中文按键提示（上游是技术化术语）
- Placeholder 是邀请式而非工程式

### 3.3 视觉规范

| 维度 | 要求 |
|---|---|
| 配色 | 暖色调（不是上游深色调）；对比度 ≥ WCAG AA；可选高对比模式 |
| 字体 | 默认终端字体放大 10-15%；避免等宽字体的工程感（如果终端支持） |
| Emoji 使用 | 角色标识（🤖👦⚙️）、状态（✅❌⏳）、Mission 进度（⭐）；不滥用 |
| 动效 | 思考中三点闪烁；工具调用前权限弹窗有 0.3s 滑入；Mission 完成有 ASCII 烟花 |
| 字串 | 全部 Year-6 阅读水平；术语必带括号解释（如 "HTML 文件（网页的骨架）"） |

### 3.4 关键交互

| 场景 | V0 行为 |
|---|---|
| 工具权限询问 | 模态屏蔽，必须 y/n/e 选一个；不允许快捷键跳过 |
| AI 回复中 | SSE 流式渲染，思考阶段显示"AI 正在想…"，工具调用前显式声明 |
| Mission 完成 | 调起 `kids-opencode check <mission>` 接受度 runner，结果以友好语言展示 |
| Stars 耗尽 | 不强制退出；提示"今天的 ⭐ 用完了，明天再来或者请家长充值"，软引导到 airbotix.ai/portal/wallet |
| 危险话题（self-harm 触发） | 即时弹模态，遮挡 chat，显示 Kids Helpline 提示，需要家长按键解锁 |

### 3.5 不在 V0 范围

- 多窗口 / 分屏
- 主题切换（V0 一套主题；V1 加可选高对比 + dyslexia-friendly）
- 自定义快捷键（V0 固定 keymap）
- 多 Mission 并行
- 项目分享（PLAN.md D-KO4 已明确推迟到 airbotix-app web 端）

---

## 4. 客户端 UX 需求（V1 GUI）

V1 的 Tauri 桌面应用复用 V0 的 client core（业务逻辑同源），只换渲染层（terminal → web）。

| 增量需求 | 原因 |
|---|---|
| 系统托盘图标 / 开始菜单入口 | 不再要求 kid 开终端 |
| 内嵌浏览器预览（kid 写 HTML，旁边即所见即所得） | 改善 "Mission 1 五分钟看到自己名字渲染" 的 UX 闭环 |
| 自更新（auto-updater） | 减少家长操心 |
| 系统级通知（done / permission 待回应） | TUI 无法做的提示 |
| 麦克风输入选项（语音转文字） | 12 岁以下打字慢，可显著降低门槛 |
| 触屏支持（iPad、二合一笔记本） | 学校设备多样性 |

V1 不在本 PRD 的工程量范围，但 V0 的 client 代码组织必须从一开始**分离 core logic（业务）和 render layer（终端 vs Web）**，否则 V1 等于重写。

---

## 5. 服务端（plugin + serve）需求

### 5.1 现有 plugin 继续生效，但要迁 v2

当前 `@kidsinai/kids-opencode-plugin@0.0.1` 用的是 v1 plugin API（`@opencode-ai/plugin` 主入口）。但上游已经在 `packages/sdk/js/src/v2/` 和 `packages/plugin/src/tui.ts` 全面引用 `from "@opencode-ai/sdk/v2"`——v2 是上游下一站。

**决策**：本 PRD 实施时一次到位迁 v2 plugin API。理由：

1. 现有 plugin 总共 922 行代码 + 36 测试，迁移可控
2. 留 v1 等于给自己挖一个明显的债（v1 文档已不是优先维护对象）
3. v0.1 plugin 还没正式发到 npm（PLAN.md Phase 2 阻塞项 #1）—— 首发就 v2，省一次迁移

**未验证**（§10 列入待办）：v2 plugin API 的 hook 命名是否变了。如果 `experimental.chat.system.transform` 在 v2 改名，36 个测试要重写一部分。

### 5.2 server 启动期间必须设密码

`opencode serve` 在没设 `OPENCODE_SERVER_PASSWORD` 时启动会打 warning："server is unsecured"。证据：`packages/opencode/src/cli/cmd/serve.ts:15`。

**问题场景**：学校共享笔记本。kid A 跑 serve 后，同机的任何其他进程都能通过 `localhost:4096` 驱动他的 agent、读他文件、用他的 LLM 额度、产生他名下的 audit 日志。

**V0 必须的实施**：

```bash
# install.sh 增量
KIDS_SERVER_PASSWORD=$(openssl rand -base64 32)
mkdir -p ~/.config/kids-opencode
echo "$KIDS_SERVER_PASSWORD" > ~/.config/kids-opencode/server-password
chmod 600 ~/.config/kids-opencode/server-password

# wrapper 启动 serve 时
export OPENCODE_SERVER_PASSWORD="$(cat ~/.config/kids-opencode/server-password)"
opencode serve --hostname 127.0.0.1 --port 4096 &

# client 启动时
KIDS_SERVER_PASSWORD=$(cat ~/.config/kids-opencode/server-password) ./kids-opencode-client
```

这条不是优化，是 AU 合规底线。和 OAIC 律师对话时这个细节会被问。

### 5.3 serve 的进程生命周期

| 场景 | 行为 |
|---|---|
| client 启动且 serve 未运行 | wrapper 拉起 serve，等待 ready signal（§10 待验证），然后启 client |
| client 异常退出 | serve 留存（kid 可以重新连上 session） |
| 用户主动 `kids-opencode --shutdown` | 干净停止 serve 并清理临时状态 |
| 笔记本休眠后唤醒 | client 自动重连同一 serve；SSE 断流应优雅恢复 |
| serve crash | client 弹错误屏，提示"出了点问题，要不要重启 AI 老师"；不向 kid 暴露技术细节 |

### 5.4 plugin 的 audit 流不再止于 stderr

V0.3 现状：`audit()` 函数（`src/index.ts:113`）只写 stderr。

V0 增量需求：plugin audit 同时 POST 到 platform-backend `/audit` 端点（异步、失败不阻塞 agent）。原因：

- 老师 console 实时进度依赖此（PLAN.md Phase 5）
- 家长 dashboard 查询历史依赖此（airbotix-app/portal）
- AU 合规审计要求结构化、可检索的日志

但 plugin 不直连 platform-backend（避免硬编码 URL、handle JWT、网络重试这些 client 该做的事）。架构是：

```
plugin audit() → 写 stderr + 内存环形缓冲
                       ↓
                 client 通过 SSE 订阅 serve 的 event 流（包含 plugin 事件）
                       ↓
                 client batch 上报 platform-backend /audit
```

Client 负责持久化、重试、JWT。Plugin 保持纯净。

---

## 6. 安全 & 合规要求

### 6.1 网络边界

| 边界 | 规则 |
|---|---|
| serve 绑定 | 强制 127.0.0.1，禁用 0.0.0.0（`packages/opencode/src/cli/network.ts:14` 默认正确，wrapper 不应允许覆盖） |
| client → serve | HTTP，Basic Auth（§5.2 密码） |
| serve → DeepRouter | HTTPS，租户 key（family wallet） |
| serve → 其他 LLM 直连 | **禁止**。config 里只允许 `deeprouter` provider，wrapper 在启动时校验配置 |
| webfetch tool | 已实装 host 白名单（plugin `src/index.ts:41-46`） |
| filesystem tool | TODO V0：plugin 增加 path 守卫，拒绝项目目录之外的读写（当前 plugin 仅靠 opencode permission 系统） |

### 6.2 数据驻留

- Kid 项目代码：**只存在 kid 本机** + 可选 git push（kid 主动）
- 对话历史：opencode serve 默认存 `~/.local/share/opencode/`；plugin 应当能配置加密 at rest（V1 增量）
- Audit 上报：summary 形式，**不上报完整对话内容**（合规要求）；完整对话仅在家长 dashboard 通过本地 client 主动拉取展示
- LLM 调用：DeepRouter 走 Sydney region（独立 PRD）

### 6.3 家长可见性

V0 不在本 PRD 的范围，但 client 必须从架构上预留：

- 一个 `~/.config/kids-opencode/parent-audit-key` 文件，家长用此 key 在 airbotix-app/portal 查询本机产生的所有 audit
- Plugin 上报的 audit 必须带 family_id（来自 DeepRouter 租户 key 解析）

---

## 7. 安装与首次运行 (Onboarding)

### 7.1 设计目标

家长从看到广告到孩子开始 Mission 1，**只需两条命令**：

```
$ curl -fsSL https://airbotix.ai/install/kids | sh
$ kids-opencode register
```

第一条命令完成所有技术安装；第二条命令处理家长身份 + 付费（DeepRouter API key 签发）。这是命令数的**结构性下限**——少一条意味着后端代签家长同意，违 COPPA / OAIC Children's Online Privacy Code 的 verifiable parental consent 要求。

### 7.2 自动安装责任清单

`install.sh` 必须在不要求任何输入的前提下完成以下全部（系统 root 提示除外）：

| 项 | 命令 / 操作 | 现状 |
|---|---|---|
| `opencode` 上游 binary | 检测 PATH，缺失则 `curl -fsSL https://opencode.ai/install \| sh` | ✅ 已实装（install.sh:72-78） |
| `@kidsinai/kids-opencode-plugin` | `opencode plugin install @kidsinai/kids-opencode-plugin` | ✅ 已实装（install.sh:82-84），阻塞 npm scope 发包 |
| `bun` runtime | 检测命令，缺失则 `curl -fsSL https://bun.sh/install \| bash` | ❌ 必须补；当前是 fail-hard 让用户自己装 |
| `OPENCODE_SERVER_PASSWORD` | `openssl rand -base64 32 > ~/.config/kids-opencode/server-password && chmod 600` | ❌ 必须补（§6.2 合规底线） |
| `opencode.json` 配置 | 拉模板写入 `~/.config/kids-opencode/opencode.json` | ✅ 已实装（install.sh:87-93） |
| `kids-opencode` wrapper | SHA 校验后装到 `$PREFIX/bin/` | ✅ 已实装（install.sh:96-121） |
| `~/.config/kids-opencode/` 目录权限 | `chmod 700`（含密码、未来含 API key） | ❌ 必须补 |
| 首次运行指引打印 | 提示下一步 + `kids-opencode register` 命令 | 🟡 现有指引但 register 子命令尚未实装 |

### 7.3 结构性不可自动：DeepRouter API key

API key 签发**永远做不到完全无浏览器**，因为它必须绑：

1. 家长身份（COPPA + OAIC Children's Online Privacy Code 的 verifiable parental consent）
2. 家长付费（Stars 钱包初充，否则 LLM 调用即时 402）
3. Family 实体在 platform-backend 注册

最丝滑形态是 `kids-opencode register` 子命令走 OAuth-style 本地回调：

```
$ kids-opencode register
[Opening https://app.airbotix.ai/portal/signup?callback=http://localhost:7777&device=<uuid>]
[Waiting for browser callback on localhost:7777 (60s timeout)...]
✓ Received: family_id=fam_..., api_key=dr_live_...
✓ Encrypted and stored in ~/.config/kids-opencode/api-key.enc
                  (AES-256-GCM, key derived from machine-id)
✓ Done.

Now run:  kids-opencode --course portfolio-site
          kids-opencode wallet
```

回调失败的兜底是 **device-code 流**（用户在浏览器看到 6 位 code，手动复制回终端粘贴）。

### 7.4 自更新

`kids-opencode --update` 子命令必须存在：

```bash
exec curl -fsSL https://airbotix.ai/install/kids | sh
```

`install.sh` 必须**幂等**——第二次跑不能破坏现有 config / api-key / password / Course Pack 进度，仅升级 opencode binary / plugin / wrapper / bun。

### 7.5 Wrapper 启动序列（自动拉 serve）

`bin/kids-opencode` 在启动 client 之前必须：

```
1. 读 ~/.config/kids-opencode/server-password；不存在 → 提示重新 install
2. 检测 localhost:4096 是否在 listen
   - 已 listen：用 Basic Auth 试 GET /app；200 → 复用现有 serve
   - 未 listen：spawn `opencode serve --hostname 127.0.0.1 --port 4096` 为后台进程
     OPENCODE_SERVER_PASSWORD 通过 env 传给子进程
3. Poll GET /app 直到 200 OK（最长 10 秒；超时 → friendly error）
4. 解密 api-key.enc → DEEPROUTER_API_KEY
   - 不存在 / 解密失败 → 提示 `kids-opencode register`
5. 启动 client，把 serve URL + auth + api key 通过 env / IPC 传过去
6. Client 退出后保留 serve 进程（除非 `--shutdown` 显式指定关闭）
```

孩子的 mental model 简化为"敲 `kids-opencode` 就有 AI 老师"——"serve / 端口 4096 / 后台进程"全部对用户透明。

### 7.6 跨平台

| 平台 | V0 | 备注 |
|---|---|---|
| macOS（Intel + Apple Silicon） | ✅ 一等 | 主要 dogfood 平台 |
| Linux（Ubuntu / Debian） | ✅ 一等 | school 共享笔记本场景 |
| WSL2 on Windows | ✅ 二等 | 现有 install.sh 直接能跑 |
| 原生 Windows（PowerShell / Chocolatey） | ❌ 推迟 V1 | install.sh 是 POSIX sh；改写 PowerShell 是独立工作量 |
| Chromebook | ❌ 推迟 V1 | Crostini 容器内可跑 Linux 路径，家长配置门槛高 |

V1 Tauri GUI 把矩阵简化为：每平台一个签名安装包，所有依赖 bundle 进去。

### 7.7 安装失败的友好降级

任何一步失败，`install.sh` 必须：

1. **打印具体哪一步失败 + 原因**（不要 silent fail）
2. 给一条修复指引（"网络不通 → 试 VPN" / "去 airbotix.ai/help"）
3. **不留半成品**：清理已创建的 `~/.config/kids-opencode/` 部分内容，避免下次跑进半安装态
4. exit code 非 0，便于被自动化脚本调用时正确判断

### 7.8 V1 GUI 的安装路径（前瞻）

Tauri 桌面应用是单一签名安装包（`.pkg` / `.msi` / `.dmg` / `.AppImage`），把所有依赖（opencode binary、plugin、bun、config 模板）bundle 进去。家长流程退化为：

```
1. airbotix.ai/download 点下载
2. 双击安装包，系统级安装向导走完
3. 启动 app，第一屏即 register / 充值
4. Done
```

零命令行。这是 V1 体验，但 V0 §7.2-§7.5 的工作就是它的基础设施——`opencode serve` lifecycle、密码生成、auto-update 这些 V1 仍然要做，只是搬进 Tauri 进程模型。

---

## 8. 上游同步策略

### 8.1 上游发版节奏的真实数据（必须正视）

`npm view @opencode-ai/sdk versions --json` 实测：

- **2025-06-24 至 2026-05-15 共 ~11 个月**
- **7178 个发布版本** → 平均 21 个/天
- 含大量 `0.0.0-dev-*` 和 `0.0.0-beta-*` 持续发布快照
- 真正语义版本（`1.14.x` 系列）少得多，但今日（2026-05-15）`1.14.51` → `1.15.0` 已经发生过一次 minor 跳

含义：**语义版本不等于稳定**。upstream 的 `1.x.x` 不等同社区惯例下的 SemVer。

### 8.2 锁版本规则

| 包 | 规则 | 原因 |
|---|---|---|
| `@opencode-ai/sdk` | **精确版本**（`"1.14.51"`，不是 `^1.14.0`） | SDK 是 client 的硬契约 |
| `@opencode-ai/plugin` | **精确版本** | plugin hook 签名必须匹配 serve 版本 |
| `opencode` binary | **精确版本**（installer pin） | serve 行为绑定到具体版本 |
| 三者必须**同源**（同一个 1.x.y） | 通过 release manifest 强约束 | 避免 plugin v1.14.50 配 serve v1.15.0 导致 hook 不触发 |

### 8.3 升级闸门：契约测试 gauntlet

升级任一上游版本前，必须全绿通过以下 10-15 条测试：

1. `opencode serve` 启动 < 3 秒
2. plugin loaded（看到 `[kids-audit] plugin.loaded` 事件）
3. session create 成功
4. session.prompt 提交一个 kid 消息，收到 streaming 回复
5. AI 触发 read tool，权限询问通过 SSE 可见
6. 用户拒绝权限，tool 不执行
7. plugin 拦截 shell tool（验证白名单仍生效）
8. plugin 拦截 example.com webfetch（验证 host 白名单仍生效）
9. audit 事件包含 stars_estimated 字段
10. `kids-opencode check mission-1` 在示例项目上返回 exit 0
11. AI disclosure banner 在 wrapper 启动时出现
12. SSE 断线后 5 秒内自动重连
13. session abort 后 LLM 调用真的停止（不计费给 kid）
14. config 文件 missing 时 client 给出 friendly error
15. v2 plugin API 的所有 hook 名仍存在（升级 plugin 时关键）

这些测试跑在 CI 上，每次 dependabot PR 必须先通过 gauntlet 才能 merge。

### 8.4 升级节奏

- **非紧急**：每 2 周（不是每周）评估上游，做一次"是否升"决定
- **紧急 hotfix**：仅当上游修了影响 kid-safety 的安全问题
- **不自动**：dependabot 只开 PR，不自动 merge
- **回退预案**：每次 release 的 install.sh 同时 pin sdk + plugin + serve + client 版本，整套作为"已知好"组合签名固化；生产出问题改 install.sh 一个变量即可回滚

### 8.5 v1 → v2 SDK 迁移

V0.4（本 PRD 实施版本）直接走 v2，不在 v1 上构建任何新功能。详见 §5.1。

---

## 9. 实施阶段与 PLAN.md 衔接

本 PRD 不替代 PLAN.md 的阶段拆解；本节给出 PLAN.md v0.4 应吸收的变更。

### 9.1 PLAN.md Phase 2 维持现状

`install.sh`、`bin/kids-opencode` wrapper、`@kidsinai/kids-opencode-plugin`、config 模板、Course Pack —— 这些是基础设施，不丢。

唯一改动：

- `wrapper` 增加启动 serve 子进程的逻辑（§5.3）
- `install.sh` 增加随机密码生成（§5.2）
- `plugin` 准备 v2 迁移分支（§5.1）

### 9.2 新增 Phase 2.4：TUI 插件皮肤改造（A 路线，先行步骤）

时间窗：W7（在 Workshop dogfood Phase 6 之前；先于 Phase 2.5）

**为什么先做 A**：自有 client（Phase 2.5）是 2 周工程量，A 是 1 周内可上的"第一眼 Kids 化"。先用 A 服务第一场 workshop，拿到孩子真实反馈，再用反馈约束 C 的 UX；A 的代码不丢弃（system prompt 复用、theme 复用、audit 复用），C 把它扩展为完整客户端。

**新包**：`@kidsinai/kids-opencode-tui-plugin`（独立于现有 server plugin，因为 `PluginModule` 与 `TuiPluginModule` 类型互斥；见 `@opencode-ai/plugin/dist/index.d.ts`）。

| 任务 | 验收 |
|---|---|
| 注册自有 theme（暖色调、≥ WCAG AA 对比度、可选高对比模式） | `api.theme.install()` + `api.theme.set("kids-warm")` 启动即生效 |
| 替换 `home_logo` slot 为 Airbotix Kids OpenCode 字样 | 启动屏不再是上游 opencode logo |
| 替换 `home_prompt` placeholder 为 "想做什么？告诉我吧（中文 / 英文都行）" | TUI 输入框 placeholder 是邀请式 |
| 注册 sidebar slot 显示 Mission 进度（当 `KIDS_COURSE_PACK` 环境变量存在时） | 侧栏出现 "Mission 1/3 · ⭐ 36/40" |
| 注册自有 sound pack（鼓励 / 提示 / 错误三种） | 工具完成有鼓励音，权限请求有友好提示音 |
| 简化 keymap layer，隐藏 kid 不需要的工程师快捷键（命令面板、agent 切换等） | `?` 帮助列表只显示 6-8 个核心键位 |
| AI 思考中状态显示中文友好文字（"AI 老师在想…"） | 替换上游 "Thinking…" |
| 危险话题触发时弹模态遮挡 chat，显示 Kids Helpline | 与 system prompt 配套的视觉警示 |
| Pre-pivot：把现有 server plugin（v1 plugin API）迁到 v2，与 TUI plugin 用同套 SDK 版本 | 见 §5.1；Q1 验证通过后开工 |

**Phase 2.4 不做的事**：

- 完整重写 chat 渲染（slot 没有暴露这个能力——留给 Phase 2.5）
- 自有 client 进程模型（仍然走 `kids-opencode wrapper → opencode TUI + 插件`）
- 内嵌浏览器预览（slot 不支持，留给 V1 GUI）
- 跨平台 GUI 改造

**风险**：上游对 TUI plugin 的 `api.slots.register` 仍标 `experimental` / `@deprecated` 较多（参见 `tui.d.ts`）；slot 名称变更需要跟。缓解：A 的核心价值（theme + logo + sound + placeholder + keymap）即便 slot 全废也能用 90% — `api.theme` 和 `keymap.registerLayer` 是稳定的，仅 slot 部分可能要重做。

---

### 9.3 新增 Phase 2.5：自有 Client TUI（C 路线，完整解）

时间窗：W9-11（紧接 Phase 2.4 之后，在 Workshop #1 dogfood 之后、Workshop #2 之前）

| 任务 | 验收 |
|---|---|
| 选定 TUI 框架 | Bubble Tea（Go）/ Ink（React+Node）二选一；决策依据：Tauri V1 复用性 + 团队语言栈 |
| Client core / render 分层 | core 用纯函数 + state machine；render 是适配层（TUI 一份、Web 一份） |
| 启动屏（§3.1） | 5 秒看到欢迎、4 个按键选项可用 |
| Mission 进行中屏幕（§3.2） | 进度条 + ⭐ 余额 + 角色标识 + 流式聊天 |
| 权限确认模态（§3.4） | y/n/e 三选一；上游 permission API 调用打通 |
| SSE 流式订阅 | 断线 5s 内重连；back-pressure 处理 |
| 客户端跑 audit 上报 pipeline | 失败重试、本地落盘缓冲、批量上报 |
| 友好错误屏 | 至少 6 类（serve 起不来、网络断、Stars 耗尽、密码错、配置丢、AI 长时间无响应） |

### 9.4 PLAN.md Phase 3 Course Pack 验收增条

- 验收新增：第一次孩子见面看到的是 Kids 自己的视觉系统，不是上游原版 TUI
- Mission 完成时 client 渲染庆祝动画，不靠 LLM 文字描述

### 9.5 PLAN.md Phase 5 Workshop 模式重写

**当前 PLAN.md 写**："Pre-warm: ensure DeepRouter handles 20 concurrent kid sessions in the same workshop without 429s"

**改为**："Workshop = 20 个 kid 各自本地 stack（serve + plugin + client），不存在中心 serve。老师 console 通过订阅 platform-backend 的 audit 事件流聚合 20 路进度。压测目标是 platform-backend audit ingest 端点和 DeepRouter 20 并发，不是中心 serve。"

### 9.6 新增 Phase 7（V1）：GUI 桌面应用

不在 V0 范围，但建立锚点：

- Tauri 壳 + V0 client core 复用
- 内嵌浏览器预览
- 系统级通知 + 托盘
- 自更新
- 签名分发（macOS Notarization、Windows EV cert）

### 9.7 时间线影响

分阶段交付带来的关键时间收益：

| Phase | 工程量 | 用于哪场 workshop |
|---|---|---|
| Phase 2.4（A 路线 TUI 插件） | 5-7 天 | **Workshop #1**（W11，PLAN.md 原 Phase 6 第一场） |
| Phase 2.5（C 路线自有 client） | 10-14 天 | Workshop #2（W13-14） |
| Phase 7（V1 Tauri GUI） | 3-4 周 | Workshop #3+ / 公开发布 |

**关键判断**：
- **不延迟 Workshop #1 dogfood**。A 路线在原 Phase 6 窗口前能上，是这次分阶段最大的收益
- **Workshop #1 的反馈**直接喂给 Phase 2.5 的 UX 设计——避免凭成人想象造自有 client 的 12 岁体验
- **如果 A 路线在 Workshop #1 反响超预期**（80% 体感已够），Phase 2.5 可以推迟、缩范围，把工程力投到 V1 Tauri GUI——这是 V0a-as-stepping-stone 模式的额外价值
- **v2 plugin 迁移与 Phase 2.4 同 sprint 做**（A 路线的 TUI plugin 必须用 v2 SDK，迫使现有 server plugin 一起迁），不再是独立工作项

---

## 10. 待解决问题（必须验证后才能开工的）

| # | 问题 | 验证方法 | 阻塞什么 |
|---|---|---|---|
| Q1 | v2 plugin API 的 hook 命名是否与 v1 一致？特别是 `experimental.chat.system.transform`、`tool.execute.before`、`tool.execute.after` 三个我们重度依赖 | 读 `opencode-kernel/packages/plugin/src/index.ts` v2 部分；写一个最小 v2 plugin 加载试 | §5.1 v2 迁移工作量估算 |
| Q2 | `opencode serve` 启动后多久能接受 client 连接？是否有 readiness signal？还是只能轮询 `/app` 端点 | 在干净机器上 strace/dtrace `opencode serve` 启动；测 socket listen 时间 | §5.3 wrapper 启动序列设计 |
| Q3 | v2 SDK 的 SSE 事件 schema 是否与 v1 兼容？plugin emit 的 audit 事件，client 在 v2 SDK 下是否还能订阅到？ | 写最小 client 用 v2 SDK 订阅 `/event`，看是否能收到 plugin 发的 audit | §5.4 audit pipeline 设计 |
| Q4 | TUI 框架选型：Bubble Tea (Go) vs Ink (Node+React)？前者性能更好、跨平台分发更省心；后者与 V1 Tauri (Web 渲染) 复用更顺 | 各做一个 1-day spike，对比开发速度 + V1 复用度 | §9.3 Phase 2.5 启动 |
| Q5 | macOS Notarization + Windows EV signing 的合规与成本预算 | 询问 Apple Developer Account（年费 $99）+ DigiCert/Sectigo EV cert（$300-700/年）；时间窗：notarization 2-7 工作日 | §9.6 Phase 7 V1 启动前置 |
| Q6 | `airbotix-app/portal` 是否能快速实现 OAuth-style 浏览器回调 localhost 端口的 register 流程？还是要走 device-code 备选路径？ | 找 airbotix-app session 确认 portal signup 流的扩展点 + 实现 callback handler | §7.3 register 子命令实施 |

Q1、Q2、Q3 必须在 Phase 2.5 启动前由 kids-opencode session 验证完成。Q4 在 Phase 2.5 第一天决定。Q5 在 V1 启动前 1 个月开始办理。Q6 在 Phase 2.5 启动前由 airbotix-app + kids-opencode 双 session 协同验证。

---

## 11. 风险登记

| 风险 | 严重度 | 缓解 |
|---|---|---|
| Q1-Q3 验证失败（v2 API 大改） | 🔴 高 | 退路：V0 仍用 v1 plugin + v1 SDK，V0 后续 1-2 个 sprint 内迁 v2 |
| Phase 2.5 工程量被低估，撞 Phase 6 workshop 窗口 | 🟡 中 | 第一场 workshop 用 partial（minimal viable client，关键三屏：启动 / mission / 权限），其余 polish 留到 workshop 之间 |
| TUI 框架选错（Q4），半路推倒 | 🟡 中 | 1-day spike 验证；client core 分层架构保证 render 层可替换 |
| 上游 1.15.0 引入破坏性变化 | 🟡 中 | 契约测试 gauntlet 在 dependabot PR 上 gate；不升 1.15 直到 §8.3 测试全绿 |
| 自有 client 引入 kid-safety 回归（client bug 让 dangerous tool 跑掉） | 🔴 高 | plugin 是 server 端硬拦截层；client bug 不能绕过 plugin。同时给 client 加自己的 e2e 安全测试 |
| client 用户体验仍不够 kid（成人审美越权） | 🟡 中 | Phase 6 workshop 之前必须找至少 3 个 12-13 岁孩子做可用性测试；不靠成人想象 |

---

## 12. 决策记录

| ID | 决策 | 状态 | 日期 |
|---|---|---|---|
| D-CL1 | 走 C 路线（自有 client + opencode-as-kernel） | ✅ 本 PRD 锁定 | 2026-05-15 |
| D-CL2 | V0a = TUI 插件皮肤改造（A 路线，Phase 2.4），V0b = TUI 自有 client（C 路线，Phase 2.5），V1 = Tauri GUI（Phase 7） | ✅ 本 PRD 锁定 | 2026-05-15 |
| D-CL3 | plugin / SDK / serve 一次到位走 v2 | 🟡 待 Q1 验证 | 2026-05-15 |
| D-CL4 | server 强制 OPENCODE_SERVER_PASSWORD | ✅ 本 PRD 锁定 | 2026-05-15 |
| D-CL5 | Workshop 模式 = 每 kid 一套 stack + audit 聚合 | ✅ 本 PRD 锁定 | 2026-05-15 |
| D-CL6 | 上游精确版本钉死 + 契约测试 gauntlet | ✅ 本 PRD 锁定 | 2026-05-15 |
| D-CL7 | TUI 框架（Bubble Tea vs Ink） | 🟡 待 Q4 spike | TBD |
| D-CL8 | 安装走"两条命令"模式：`curl ... \| sh` + `kids-opencode register`；不试图把 register 也塞进 `install.sh` | ✅ 本 PRD 锁定 | 2026-05-15 |
| D-CL9 | `install.sh` 必须幂等；任何一步可独立重跑；失败时清理半成品 | ✅ 本 PRD 锁定 | 2026-05-15 |
| D-CL10 | `kids-opencode` wrapper 自动管理 `opencode serve` 子进程；用户不需要懂 serve 概念 | ✅ 本 PRD 锁定 | 2026-05-15 |
| D-CL11 | A 路线（TUI 插件）作为先行步骤，C 路线（自有 client）作为完整解。A 不是 throwaway；其代码（theme / sound / placeholder / mission overlay）被 C 复用 | ✅ 本 PRD 锁定 | 2026-05-15 |

---

## 13. 跨 repo handoff

本 PRD 是 airbotix repo 写的、给 `kidsinai/kids-opencode` session 的 handoff 备忘。下游应执行：

1. **kids-opencode session** 读本文档 + 验证 Q1-Q3，输出 PLAN.md v0.4
2. **kids-opencode session** 选定 TUI 框架（Q4），开 Phase 2.5
3. **airbotix session（本 repo）** 在 `infra/` 或 `script/` 准备 `airbotix.ai/install/kids` 端点的静态文件部署（PLAN.md Phase 2 阻塞项 #2）
4. **Lightman** 推进 npm scope 认证、DeepRouter tenant key 签发流程
5. **deeprouter-ai session** 准备 audit ingest 端点
6. **Airbotix-AI/planning session** 在 master `PROJECT.md` 登记本 PRD 编号与状态

无 cross-AI 协调机制时，handoff 走：本 PRD 内容 → 复制粘贴到对应 repo 的对话 → 让那边 session 输出 repo 内 PR。

---

## 附录 A：证据档案（本 PRD 援引的具体文件位置）

为后续审计与争议追溯，列出本 PRD 每条核心断言的代码 / 文档证据：

| 断言 | 证据文件路径 | 行号 |
|---|---|---|
| `opencode serve` 是 headless HTTP server | `kidsinai/opencode-kernel/packages/opencode/src/cli/cmd/serve.ts` | 10 |
| serve 默认 127.0.0.1:4096 | `kidsinai/opencode-kernel/packages/opencode/src/cli/network.ts` | 14 |
| port 0 → 4096 优先 | `kidsinai/opencode-kernel/packages/opencode/src/server/server.ts` | 98 |
| `server:` plugin 在 serve 进程加载 | `kidsinai/opencode-kernel/packages/opencode/src/plugin/index.ts` | 99 |
| multi-project via x-opencode-directory | `kidsinai/opencode-kernel/packages/sdk/js/src/client.ts` | 20 |
| password not set → unsecured warning | `kidsinai/opencode-kernel/packages/opencode/src/cli/cmd/serve.ts` | 15 |
| HTTP Basic Auth schema | `kidsinai/opencode-kernel/packages/opencode/src/server/auth.ts` | 36-42 |
| SDK 提供 SSE 流式订阅 | `kidsinai/opencode-kernel/packages/sdk/js/src/gen/sdk.gen.ts` | `event<ThrowOnError>` line（grep） |
| SDK 提供 promptAsync | `kidsinai/opencode-kernel/packages/sdk/js/src/gen/sdk.gen.ts` | `promptAsync` line（grep） |
| `tui` 与 `server` plugin 模块互斥 | `kids-opencode/node_modules/.bun/@opencode-ai+plugin@1.14.51/.../dist/index.d.ts` | `PluginModule` type |
| 上游 KERNEL.md 背书 SDK + plugin 架构 | `kidsinai/opencode-kernel/KERNEL.md` | 21-28 |
| v2 SDK 并存 | `kidsinai/opencode-kernel/packages/sdk/js/src/v2/` | 目录 |
| TUI 已用 sdk/v2 | `kidsinai/opencode-kernel/packages/plugin/src/tui.ts` | import 行 |
| 7178 npm 发布版本 | `npm view @opencode-ai/sdk versions` | 2025-06-24 起至今 |
| 当前 plugin v1 实现 | `kidsinai/kids-opencode/packages/kids-plugin/src/index.ts` | 222 行总计 |
| 现有 36 测试覆盖白名单 | `kidsinai/kids-opencode/packages/kids-plugin/test/plugin.test.ts` | `bun test` 输出 |

---

## 附录 B：与 `kids-opencode-spec.md` v0.2 的差异

| 章节 | v0.2（stale） | 本 PRD |
|---|---|---|
| 客户端形态 | 服务端 hosted web UI（React） | 自有 client，V0 TUI / V1 Tauri 桌面 GUI |
| 沙盒 | 浏览器 iframe + 服务端虚拟 FS | kid 本机文件系统 + plugin 路径守卫 |
| 代码执行 | 服务端跑 agent | 本机 opencode serve 跑 agent |
| LLM 调用入口 | 经 Airbotix 服务端代理 | 经 DeepRouter（架构同，但中间无 Airbotix 服务） |
| 家长付费 | Hosted Stars | 同 Hosted Stars（DeepRouter 计费） |
| Workshop 模式 | 服务端 multi-tenant | 每 kid 一套本地 stack + audit 聚合 |

v0.2 的合规分析、Stars 经济模型、家长 dashboard 设计**仍然有效**，不在本 PRD 范围；建议 v0.2 文档头加 deprecation note，指向本 PRD 替代"客户端形态"与"开发架构"两节。

---

## 修订历史

| Version | Date | Note |
|---|---|---|
| 0.3 | 2026-05-15 | **战略：A → C 分阶段。** §2.1 三路取舍重写：A 不再是"治标不治本"，而是 production stepping stone；A 在 1 周内交付以赶 Workshop #1 dogfood，反馈反哺 C 路线 UX 设计。§9 拆分原 Phase 2.5 为 §9.2（Phase 2.4 / A 路线 TUI 插件）+ §9.3（Phase 2.5 / C 路线自有 client）；后续小节顺移。§9.7 时间线重写。摘要第 2 条改为分阶段交付。新增 D-CL11；D-CL2 拆分 V0a / V0b / V1。v2 plugin 迁移并入 Phase 2.4，不再独立。 |
| 0.2 | 2026-05-15 | 新增 §7 安装与首次运行（Onboarding）：自动安装责任清单、`kids-opencode register` OAuth 回调流、wrapper 自动管理 serve、`--update` 自更新、跨平台矩阵、V1 GUI 安装路径前瞻。锁定 D-CL8/9/10。Q6 加入待办（airbotix-app register 回调流）。原 §7-§12 顺移至 §8-§13；相应 inline `§X.Y` 引用同步更新。 |
| 0.1 | 2026-05-15 | 初版。基于 V0.3 plugin 工程闭环 + opencode-kernel 源码深扒后撰写。锁定 D-CL1/2/4/5/6；D-CL3/7 待验证。 |
