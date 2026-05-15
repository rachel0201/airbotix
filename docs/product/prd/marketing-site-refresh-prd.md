# Airbotix Marketing Site Refresh — PRD

> **状态**：Draft v0.1 · 2026-05-15
> **目标**：把 airbotix.ai 从"workshop-only 营销站"升级为"4 个服务条线 + 平台预告"的完整商业入口
> **核心驱动**：Workshop / 小班课 / 1-on-1 可以**立即开卖**（不依赖平台），把流水跑起来；Platform 维持 2026 上线节奏
> **作者**：Lightman + Claude

---

## 1. Why Now

**问题**：当前 airbotix.ai 只有 1 个工作坊产品 + 一堆"Coming 2026"标签。BP / pitch 里 3-layer stack 叙事完整（Workshops + Platform + Hackathons），但**网站没承接住**。访客无法看到：

1. **现在能买什么**（除了 in-school workshop 几乎没有 funnel）
2. **未来要建什么**（AI Coding 平台只是模糊"Coming 2026"）
3. **为什么相信**（团队 / pilot 数据 / 学校背书都在 BP.md 里没暴露）

**机会**：
- 小班课 / 1-on-1 都是**现成可交付**服务（讲师 + Zoom + Cal.com booking + Airwallex 付费即可），不需要等 V0 平台
- AU 教培市场 8-17 岁 STEM 课程客单价 A$80-180/小时，市场存在，痛点清晰（家长想要 AI 课但找不到结构化路径，BP §2 已论证）
- 把这些上线后，Airbotix 立刻从"3-layer stack 故事"变成"3-layer stack 故事 + 当前能开账单"，**pitch 强 10 倍**

---

## 2. Current State Audit

### 现有 pages（9 个）

```
src/pages/
├── Home.tsx          → Hero + 4 program cards + workshop highlight + gallery + testimonials
├── About.tsx         → Mission / Vision / 100+ pilot 数据 / 4 values
├── Workshops.tsx     → 1 个 workshop（two-day AI & Robotics）
├── WorkshopDetail.tsx
├── Book.tsx          → Workshop 询单
├── Contact.tsx
├── FAQ.tsx
├── Media.tsx         → Pacific Camp 照片
└── Blog/             → 博客列表
```

### 现有 program cards（Home §"OUR PROGRAMS"）

| 卡片 | 状态 | 当前文案问题 |
|---|---|---|
| AI CODING | "Coming 2026 →" | 抽象，无可购买路径 |
| ROBOTICS | "Enrolling now →" | 唯一可购，但只指向 in-school workshop |
| HACKATHONS | "Coming 2026 →" | 抽象，无信号 |
| SCHOOLS | "For educators →" | OK，B2B 漏斗 |

**核心问题**：4 张卡片里 2 张是"Coming 2026"，1 张只能学校采购，**家长直接付钱的入口几乎不存在**。

### 存在但未发挥的资产

- `BP.md`（304 行）— 完整 thesis、市场分析、3-layer stack、商业模式、traction 数据
- `pitch-deck.md` — pitch deck，含 founder 介绍
- `DESIGN.md`（389 行）— 完整设计系统（5 色调色板、字体、组件规范）
- `src/data/workshops.ts` — 1 个 workshop 数据已结构化
- Pacific Camp 100+ 学生照片资源在 `public/media/`

---

## 3. Strategic Positioning（refreshed）

**One-liner**（替代当前 hero）：
> "Teach kids to code with AI — workshops, weekly classes, 1-on-1, and an AI coding platform built for K-12. Based in Australia, designed for the next generation of builders."

**3 个差异化支柱（vs 市面任何其他选择）**：

| 维度 | ChatGPT / Cursor / Claude Code | Khanmigo / Cluey 等 tutoring chatbot | Scratch / Tynker / Code.org | **Airbotix** |
|---|---|---|---|---|
| AI-native | ✅ | ⚪ | ❌ | ✅ |
| 给孩子用的 | ❌（成人工具） | ✅（但通用，非 coding 专精） | ✅ | ✅ |
| **专门为 K-12 设计的 AI coding 工具** | ❌ | ❌ | ❌（pre-AI） | ✅ **Kids OpenCode** |
| 家长可见 / audit replay | ❌ | ⚪ 部分 | ❌（不需要） | ✅ **完整** |
| Curriculum-driven（项目结构）| ❌（开放聊天） | ⚪ | ✅ | ✅ |

**真正的支柱叙事**（按重要性排序）：

#### 支柱 1：**我们做了自己的 Kids OpenCode** ⭐⭐⭐
这是**唯一一个专门为 K-12 设计的 AI Coding agent 工具**。市面所有 AI coding 工具（Cursor / Claude Code / Cline）都是为成人工程师设计的，**孩子用 = 不合适**：
- 默认输出过于复杂、术语过多
- 没有家长可见层
- 没有 prompt injection 防御 / 内容边界
- 可以执行任意命令、写任意文件

Kids OpenCode 把这些**重构成 kid-safe 版本**：
- Kid-safe system prompt（输出"鼓励式" 而非"批评式"）
- 工具白名单（read / write / edit，无 shell）
- 沙盒（kid 代码只在自己浏览器/电脑里跑，不影响平台）
- **每一次 agent 行动都被家长可见**

**这是 Airbotix 真正的 moat**。

#### 支柱 2：**家长可以放心内容**（trust mechanism — 最高频家长决策因素）

家长付费决策的 #1 顾虑：**"我让孩子用 AI，他会接触到什么我控制不了的内容？"** Airbotix 的回答：

| 顾虑 | Airbotix 的机制 |
|---|---|
| 孩子和 AI 说了什么我不知道 | **Agent action replay** — 家长 dashboard 完整回看孩子和 AI 的每一句对话 + AI 做的每一个动作 |
| AI 会不会说不合适的话 | **双层过滤**：DeepRouter 服务端 kid-safe system prompt + 平台兜底 classifier |
| 孩子用 AI 偷懒 / 不学习 | **课程驱动**：AI 在 Mission / 课程包结构里，不是开放聊天框 |
| 孩子分享自己作品给陌生人 | **默认私有**：班级墙 + 公开分享都需老师审核 + 家长二次同意 |
| 我不想让孩子接触某些话题 | **话题边界配置**：家长可调级别（保守 / 标准 / 进阶） |
| 充值会不会失控 | **Stars 钱包 + 触顶软停 + 加额需家长批准**（详见 platform PRD §8）|

#### 支柱 3：**Real curriculum + Real builders, not vibes**
- 100+ pilot 学生 / 2 partner schools / Digital Technologies F-10 对齐
- Built by Lightman + Joe (ex-Google) — AI-native 团队
- 孩子结业能带走**真实可分享的作品 URL / PDF / 视频**（不是"我和 AI 聊过天"，是"我做了这个东西"）

**Audience priority**（按 funnel 大小排序）：
1. **AU 家长**（主要 B2C）— 给孩子找 AI/coding 课的家庭
2. **海外华人家长**（V1+ 市场）— 当前英文站够用，V2 加中文
3. **AU 学校**（B2B 持续合约）— Curriculum Lead / Deputy Principal
4. **投资人 / 媒体 / 合作方**（间接）— 看 vision + traction

---

## 4. What We Can Teach + How We Package It

### 4.0 Teaching Capability Catalog（先把"能教什么"摆清楚）

> **核心原则**：我们先盘点能力（subject × age），再决定每种能力**用什么方式交付**（workshop / 小班 / 1对1 / 平台）。同一个能力可以多种方式卖。

#### 6 大教学领域

| # | 领域 | 8-11 | **12-15（初中，平台主战场）** | 15-17 |
|---|---|---|---|---|
| **A** | **AI 创作**（图像 / 故事 / 音乐 / 视频 / 配音 / 漫画） | ✅ 主力 | ✅ 进阶（多媒体合成） | ⚪ 工具熟练用户 |
| **B** | **AI Coding 基础**（看懂 AI 写的代码 / 调 / 改 / 部署 — 不锁定语言）| ⚪ 入门可触 | ✅ **主力** | ✅ 主力 |
| **C** | **AI Agent 编程**（Cursor / Claude Code / Kids OpenCode + LLM API） | ❌ | ✅ **主力 — 平台核心场景** | ✅ 进阶 |
| **D** | **AI Robotics**（mBot + 传感器 + Scratch + AI 决策） | ✅ 入门 | ✅ 进阶 | ⚪ 选修 |
| **E** | **AI 素养 / Critical Thinking**（提示工程 / 输出判断 / 伦理 / 安全） | ✅ 必修嵌入 | ✅ 必修嵌入 | ✅ 必修嵌入 |
| **F** | **真实项目 / Portfolio / 升学准备**（部署上线项目 / Hackathon / 大学申请） | ❌ | ⚪ 起步 | ✅ **主力** |

图例：✅ 主力 / ⚪ 可教但不主推 / ❌ 不适合年龄

#### 每个领域**能交付什么具体技能**

**A — AI 创作**：
- 用 prompt 生成图像（角色 / 场景 / 风格）
- 用 AI 写故事（情节 / 对话 / 转折）
- 用 AI 做配音（TTS 多语言多角色）
- 用 AI 生成音乐（主题曲 / 背景乐）
- 用 AI 做短视频 / 动画 GIF
- 把以上 5 件事合成一本"个人故事书 / 短片"
- Stack：DeepRouter 后端代理 → Flux/SDXL/Claude/ElevenLabs/Suno/Runway

**B — AI Coding 基础**（重要：我们**不教传统编程语法班**）：
- 理解"AI 帮我写代码"到底是什么意思 — 孩子不是敲键盘，孩子是**指挥者** + **审核者** + **架构师**
- 看懂 AI 输出的代码：这段做什么？哪里可能出错？怎么改？
- 用 AI 协助修 bug / 加功能 / 重构 — 这才是真实工程师工作流
- Git / GitHub 协作（让 AI 也学会版本管理）
- 把项目部署到线上（第一次拿到可分享的 URL，孩子那个 wow 时刻）
- **关于编程语言**：按项目自然出现，不当作"主修课"
  - V0 起步语言 = HTML/CSS/JS（浏览器看得见摸得着，反馈最直观）
  - Python / 其他语言在 12+ 真实项目里需要才学 — 学语法不是目的，做出东西是目的
  - 区别于市面 "Scratch / Python 入门班" 的传统 coding 学校 — 我们走的是 AI-native 路径

**C — AI Agent 编程（平台 + 初中主战场）**：
- 理解 LLM / agent / tool use 概念
- 调用 OpenAI / Anthropic API（在 platform 上是 DeepRouter）
- 用 agent 构建"能自己思考一步、调工具一步"的小项目
- 工具白名单 / 沙盒 / 家长可见的"agent action replay"
- 直接对应 `kids-opencode` 本地工具 + airbotix-app 云端 IDE
- **这是初中阶段最有上限、最容易产生 wow 时刻的领域**

**D — AI Robotics**：
- mBot 基础控制（移动 / 转向 / 速度）
- 传感器（光 / 距离 / 颜色）单/双传感器
- 状态机 / 决策表 / 条件循环
- 进阶：让 AI 决定机器人下一步动作（用 LLM 做"思考层"）
- 已有的 2-day workshop spec 在 `src/data/workshops.ts`

**E — AI 素养**（嵌入所有课程，不单独卖）：
- Prompt literacy：怎么把想法翻译成 AI 听得懂的话
- Iteration habit：第一版不好不要紧，怎么调
- Critical eye：AI 输出哪里好 / 哪里假 / 怎么判断
- Safe AI hygiene：不分享个人信息 / 不轻信输出 / 遇到不适内容怎么办
- AI 伦理初步：偏见 / 版权 / 隐私 / fairness

**F — 真实项目 / 升学**（15-17 主力，12-15 起步）：
- 部署上线项目（Vercel / GitHub Pages）
- 项目 README + demo 视频 + portfolio 站
- 参加 Airbotix 季度 Hackathon（V1+）
- 大学申请材料（针对海外华人家庭 — BP §3 提到的核心 segment）

#### Capability × Delivery Matrix（同一能力，多种卖法）

| 领域 | Workshop | 小班课 | 1-on-1 | Platform |
|---|---|---|---|---|
| A 创作 | ⚪ 单次体验 | ✅ 8 周深度 | ✅ 按需 | ⚪ 自助创作 |
| B Coding 基础 | ⚪ 1-day intro | ✅ 10 周 term | ✅ 按需 | ⚪ 练习 |
| C **AI Agent** | ❌（深度需要 series） | ⚪ 进阶班 | ✅ 个性化 | **✅ 平台核心** |
| D Robotics | ✅ **主力（已有）** | ⚪ 进阶 cohort | ⚪ 少见 | ❌（硬件依赖） |
| E AI 素养 | 嵌入 | 嵌入 | 嵌入 | 嵌入 |
| F 真实项目 / 升学 | ❌（一次性不够） | ⚪ Capstone | ✅ **主力** | ✅ 长期养成 |

**关键洞察**：
1. **Platform 的差异化能力 = C（AI Agent 编程），目标年龄 12-15 初中**
   - workshop / 小班 / 1-on-1 都难以承载 agent 编程的"长期养成"特性（每周 1 次 90 分钟根本不够）
   - 必须有平台让孩子在两次课之间持续在 agent 工具里"住"，才能真养成
   - 这也是为什么 `kids-opencode` 是本地桌面工具（孩子电脑常驻）
2. **Robotics 不需要平台** — 硬件依赖 + workshop 形态最合适，保持 in-school workshop 主力
3. **AI 创作（A） + 升学（F）** 是两端"非平台依赖"的现金牛 — 立即可卖

---

### 4.1-4.4 Service Taxonomy（4 条交付线 — 上面 capability 的"卖法"）

### 4.1 Workshops（in-school / holiday camp）— 已有，扩展

**形式**：1-3 天密集营，15-30 学生/cohort，hardware-included（mBot + sensors）
**渠道**：学校采购 + 假期 camp 家庭直购
**当前**：1 个 two-day workshop spec
**扩展**：
- 1-day 入门 workshop（school taster）
- 3-day 进阶 workshop（holiday camp）
- 学校年度合约（recurring partnership，BP §5 强调）

**Pricing**：[TBD: 学校采购 = 按 cohort 计价；holiday camp 家庭直购 = 按学生计价]

### 4.2 Small Group Classes（小班课）— 新增 ⭐

**形式**：在线 Zoom / 校外 in-person，3-6 学生/班，每周 1 次，按 term 招生（8-10 周/term）

**年龄分层**：
- Ages 8-11：**AI Creative Lab**（无 coding 门槛，视觉 / 听觉 / 故事输出）
- Ages 12-17：**AI Coding Studio**（Python + AI agent + 项目制）

#### AI Creative Lab（Ages 8-11）— 范围

覆盖 **§4.0 领域 A（AI 创作）+ E（AI 素养，嵌入）**。

**这门班教什么**（具体大纲推迟到老师备课时定）：
- AI 图像创作 + AI 故事写作 + AI 配音 + AI 音乐 + AI 短视频，孩子可输出多媒体作品集
- 嵌入 AI 素养：prompt literacy / iteration / critical eye / safe AI hygiene

**这门班不教什么**：编程、机器人、Agent 概念（这些是 AI Coding Studio / Platform 的事）

**结业承诺**：孩子能用 AI 工具产出**自己创作的视觉 + 文本 + 音频作品**，并初步形成"我怎么和 AI 对话"的能力。

#### AI Coding Studio（Ages 12-17）— 范围

覆盖 **§4.0 领域 B（Coding 基础）+ C（AI Agent 编程，重点）+ E（AI 素养） + F 起步（真实项目）**。

**这门班教什么**：
- AI Coding 基础概念（**不是传统编程语法班** — 指挥 / 看懂 / 调试 AI 输出）
- 起步语言 HTML/CSS/JS（看得见摸得着），其他语言按项目需要再学
- 用 AI 工具（Cursor / Claude / Kids OpenCode）做项目
- AI Agent 编程入门（LLM API / tool use / 简单 agent 项目）
- Git / 部署到 Vercel
- 至少 1-2 个真实项目，URL 可分享

**这门班的特殊价值**：**和 Platform 直接对接**。完成本 cohort 的孩子 = airbotix-app + kids-opencode 早期 power user，自然过渡到平台长期学习。

**结业承诺**：孩子能用 AI 工具独立做出**能部署上线的项目**，并理解 agent 工作机制。

---

**讲师**：Airbotix 自营老师（pilot 期 1-2 位）
**Tech stack**（V0 = MVP 工具栈，可立即开课）：
- Zoom / Google Meet（直播教学）
- Google Classroom 或 Notion（作业 / 资料）
- Cal.com（cohort 报名）
- Airwallex（按 term 一次性收费 or 月付）

**Pricing**（建议初始定价）：[TBD: 建议 A$60-80/课 × 8 课 = A$480-640/term/学生]

**为什么现在能做**：不需要平台，只要 1-2 位老师 + Zoom + 招够 3 个学生就能开班。

### 4.3 1-on-1 Tutoring（一对一）— 新增 ⭐

**形式**：在线 Zoom 私教，60-90 分钟/课，按需排课
**学科**：
- AI coding（Python + LLM）
- 学校项目 AI 辅助（孩子学校的科技作业用 AI 完成 = 家长爱好这个）
- 算法 / 数学（AI 角度切入）
- 12+ 旗舰：用 Claude Code / Cursor / Kids OpenCode 做真项目

**讲师**：Airbotix 资深老师（pilot 期 Lightman + Joe 偶尔亲自上）
**Tech stack**：
- Cal.com（直接预约，可重复）
- Zoom
- Airwallex per-session 收费 or 课程包（10 课包打折）

**Pricing**（2026-05-15 更新，从 A$80 起步）：
- Single session — **A$80/hour**
- 10-pack — **A$750**（A$75/hour，省 A$50）
- 20-pack — **A$1,400**（A$70/hour，省 A$200）

[备注] 起步定价 A$80/h 是入门价位（对标 AU 一般在线 tutoring A$60-100/h），主打"用 AI 工具的私教，进入门槛低"。Pilot 期跑 1-2 个月后看复购 / 家长反馈，再决定是否升至 A$100-140/h premium 路线。

**为什么这是高 ARPU 产品**：单学生 LTV 高（高频家长 6 个月 = A$3000+），现金流即时，且产生大量 case study / 内容（每节课 1-on-1 笔记是博客素材源头）。

### 4.4 Kids AI Platform — V0 上线 2026 Q3-Q4 ⭐ **初中主战场**

**核心定位（2026-05-15 锁定）**：Platform 的 primary persona = **初中孩子（12-15 岁）+ 他们的家长**。原因：
- 8-11 创作类 → live class 老师陪练就够，不需要平台常驻
- 15-17 升学 → 1-on-1 + Hackathon 更直接
- **12-15 初中** → 需要"在两次课之间持续在 AI 工具里住下来"的能力培养，**只有平台能承载**

**形式**：
- `airbotix-app`（云端 SPA）= 家长 portal + 孩子 6-11 创作区 + 12+ 学习区入口
- **`kids-opencode`（本地桌面工具）= 12-15 初中孩子的 AI Coding 主力工具**
  - 装在孩子自己的电脑上，每天能打开
  - 用 Airbotix Family Account 登录
  - 所有 LLM 调用走 DeepRouter（计费 + kid-safe 双重保险）
  - 真正能让初中孩子做"agent 帮我做项目"这件事

**承接 §4.0 哪些能力**：
- 主力承载 **C — AI Agent 编程**（live class 难以养成的长期能力）
- 补充 B — Coding 基础（练习平台）
- 不承载 A 创作（live class 主战场）/ D Robotics（硬件依赖）/ F 升学（1-on-1 主战场）

**和 live class 关系**：
- 小班课 / 1-on-1 学生 = 平台早期用户
- 老师在 live class 教完概念 → 孩子在平台上独立练 → 下次课 review
- 家长在 portal 看到孩子整周用平台的进度 + agent action replay

**营销站当前阶段**：只暴露 **waitlist 注册**。截图 / 详细 spec 等 platform PRD（parent-portal / learn / api）写完后再展示。

---

## 4.6 Our Proprietary Tools + AI Engines We Use（Trust Signal — 必须上首页）

**核心叙事**（两层结构 — 顺序重要）：

> **我们的 Kids OpenCode 是世界上第一个专门为孩子设计的 AI Coding agent 工具。**
> 它的"大脑"用世界级 AI 引擎 — Anthropic Claude, OpenAI, ElevenLabs 等。我们的工作不是重新造 AI 模型，而是为 K-12 孩子建造**他们能安全使用、家长能完全监管**的工具层。

为什么这两层都要 visible：
1. **Kids OpenCode 是 Airbotix 的真正 moat**（不是杂牌 ChatGPT 包装，是我们自有 IP）
2. **AI 引擎透明披露**（家长 / 投资人都看得到我们用的是世界级基础设施，不是黑盒）
3. **这两层加起来**：才能完整回答家长的核心问题 "为什么我应该让你来教 AI，而不是直接给 ChatGPT 用？"

### 4.6.1 Airbotix 自有产品（the moat）⭐

这一层是 Airbotix 真正的差异化。展示时**logo 用我们自己的品牌色，比第三方 logo 大一档**。

| 产品 | 角色 | 状态 |
|---|---|---|
| 🛡️ **Kids OpenCode** | 专门为 K-12 设计的 AI Coding agent 工具（本地桌面 + 浏览器都有）— 我们自有 IP，fork 自 opencode 内核并深度改造为 kid-safe 版本 | V0 在建（kidsinai/kids-opencode）|
| 🌐 **airbotix-app** | 统一云端学习平台（家长 portal + 孩子学习区）— 我们自有 | V0 在建（Airbotix-AI/airbotix-app）|
| ⚙️ **DeepRouter** | 我们自家 LLM gateway — 所有 AI 调用必经此路，保证 kid-safe + 计费 + 多模型 routing | V0 在建（deeprouter-ai/deeprouter）|
| 📚 **Airbotix Curriculum** | 100+ 学生验证过的课程包 + AU Digital Technologies F-10 对齐 | 自营，2 partner schools 验证中 |

**marketing 文案**：
> "We don't build AI models. We build **the kid-safe layer on top** — Kids OpenCode for coding, airbotix-app for learning, DeepRouter for routing, and a curriculum that's been classroom-tested in real Australian schools."

### 4.6.2 AI 引擎我们使用（under the hood）

这一层是"诚实披露 + 信任信号"。展示时 logo 比 4.6.1 小一档，灰阶或柔和色。

**LLM / Agent 推理**
| Vendor | 在 Airbotix 用于 |
|---|---|
| **Anthropic Claude** | AI Tutor / Agent 推理（主力，通过 DeepRouter）|
| **OpenAI** | 备选 LLM + DALL-E（视情况）|

**AI 创作引擎**
| Vendor | 用途 |
|---|---|
| **ElevenLabs** | TTS / 多角色配音 / 多语言 |
| **Suno** | AI 音乐 / 主题曲生成 |
| **Runway** | AI 短视频 / 动画 |
| **Black Forest Labs (Flux)** | 高质量图像生成 |
| **Stability AI (SDXL)** | 备选图像 |

**成人 / 进阶级别 AI Coding 工具**（**仅 15+ 高阶学生在 1-on-1 教学中接触，绝大多数孩子用 Kids OpenCode 不接触这些**）
| Vendor | 用途 |
|---|---|
| **Cursor** | 介绍给 15+ 学生作为"成人世界用的 AI IDE" |
| **Anthropic Claude Code** | 同上，CLI agent 工具 |
| **opencode** (upstream, MIT) | 我们 fork 用作 Kids OpenCode 的内核，致敬开源社区 |

**Dev / 部署**（学生项目部署用）
| Vendor | 用途 |
|---|---|
| **Vercel** | 学生作品部署 / 域名分配 |
| **GitHub** | 代码托管 / 协作 |

**平台基础设施**（家长不直接关心，但完整披露）
| Vendor | 用途 |
|---|---|
| AWS Sydney | EC2 / S3 / Secrets Manager |
| Neon | Postgres |
| Cloudflare | DNS + ACM |
| Airwallex | 支付（AUD + 跨境 FX）|
| SendGrid | OTP / 通知邮件 |

### 4.6.3 Why Parents Can Trust This（trust mechanism 详解）

**这个 section 必须独立呈现** — 不能只是 logo 堆。给家长 5 个具体的可验证机制：

| # | 机制 | 家长能在哪看到 / 验证 |
|---|---|---|
| 1 | **Agent Action Replay** | airbotix-app `/portal/audit` — 完整回看孩子和 AI 的每一次对话 + AI 调用的每一个工具 + 文件改动 diff |
| 2 | **Kid-safe System Prompt（服务端强制）** | DeepRouter 在所有调用注入 kid-safe prefix，**孩子 / fork 改不掉**（详见 deeprouter-coupling-plan.md）|
| 3 | **工具白名单 + 沙盒** | Kids OpenCode 只能 read/write/edit 虚拟 FS，无 shell / 无任意命令 / 无外部网络 |
| 4 | **课程驱动 vs 开放聊天** | 孩子不是面对一个"AI 聊天框"，是面对"Mission 1: 做你的个人故事书" — AI 是工具，目标是项目 |
| 5 | **默认私有 + 分享审核** | 孩子作品默认私有，分享班级墙需老师审核，公开需家长 + 老师双签 |

**marketing 文案**（直接可上 site）：
> "Every conversation. Every line of code AI writes. Every tool the AI uses. **You can replay it all.** Parents always see what their kid is doing with AI — not just a vague summary."

### 4.6.4 在网站上的呈现（两层结构）

**Home `/`** — 三个 section 联动：

1. **Hero 下方第一个 section ⭐**：突出 Kids OpenCode（自有 IP，logo + 一句话）
   ```
   ─────────────────────────────────────────────────────────────
   [Kids OpenCode logo]   The first AI coding tool built for kids,
                          not adults using kids.
                          [Learn more →]
   ─────────────────────────────────────────────────────────────
   ```
2. **接下来 section**："Powered by world-class AI" 灰阶 logo 横条
   ```
   Built on best-in-class AI infrastructure
   [Anthropic] [OpenAI] [ElevenLabs] [Suno] [Vercel] [GitHub]
   ```
3. **再接下来 section**："Parents always know what's happening" — trust 机制 5 条（4.6.3）的视觉化展示，含 audit replay 截图占位

**顺序极重要**：
- 先看到 OUR product（Kids OpenCode）→ 建立"这是 Airbotix 真东西"
- 再看到 partner logos → "用的是世界级 AI"
- 再看到 trust 机制 → "我可以放心让孩子用"

**About `/about`** — 完整 4.6 section：
- 4.6.1 我们的自有产品（大 logo + 描述）
- 4.6.2 我们用的 AI 引擎（partner logos + 表格）
- 4.6.3 5 个 trust 机制（最长 section，含截图/示意图）

**Platform `/programs/platform`** — Kids OpenCode 是这页的主角。完整产品介绍 + 视频 demo 占位 + waitlist。

**1-on-1 / Classes 页** — 每页底部加"Tools your kid will use"（轻量提及具体工具，不抢焦点）。

### 4.6.5 Logo 资产 logistics

| 项 | 任务 |
|---|---|
| **Kids OpenCode / airbotix-app / DeepRouter 自有 logo** | [TBD: 需要设计师做品牌 logo — 这是 Airbotix 自有产品识别系统，比 partner logo 优先] |
| Partner SVG/PNG 下载 | 每个 vendor 官网 brand 资源页 |
| 存放 | `public/media/brand/` (自有) + `public/media/partners/` (第三方) |
| Attribution | 大部分公司允许"我们使用此服务"的展示。trademark 敏感的（Anthropic / OpenAI）需检查 brand guideline。**任务**：建 `docs/legal/partner-logos-usage.md` 记录每家的链接 + 检查结果 |
| 视觉层级 | 自有 logo > partner logo (大小 + 色彩) — 视觉上必须传达"自有产品是主，partner 是辅" |
| Fallback | 不支持/没拿到 logo 时用 text-only |

### 4.6.6 关键 marketing 文案（直接可上 site）

**顶层定位**（首页 hero 下方第一段）：
> "Airbotix builds **Kids OpenCode** — the first AI coding tool designed for kids, not adults using kids. Curriculum-aligned. Parent-visible. Safe by design."

**Partner 透明（灰阶 logo 横条 caption）**：
> "Built on best-in-class AI — Claude, OpenAI, ElevenLabs, Suno. We don't build the AI models. We build the **kid-safe layer** on top."

**家长信任（trust 机制 section 的标题 + 副标题）**：
> **Every conversation. Every line of code AI writes. Every tool the AI uses.**
> You can replay it all. Parents always see what their kid is doing with AI — not just a vague summary.

**为什么我们存在（差异化对比）**：
> "ChatGPT was built for adults. Cursor and Claude Code are built for engineers. Scratch and Tynker are pre-AI. **Kids OpenCode is the only AI coding tool built specifically for K-12 students** — with the safety, scaffolding, and parent visibility that everything else is missing."

---

## 5. Site IA — Pages & Routes（refresh）

```
airbotix.ai
├── /                          [refresh] Home — 4 service tracks
├── /programs                  [NEW] Programs index (4 tracks 总览)
│   ├── /workshops             [refresh from /workshops] In-school + holiday camp
│   │   └── /workshops/:slug   [keep] Workshop detail
│   ├── /classes               [NEW] 小班课 (Small Group Classes)
│   │   ├── /classes/ai-creative-lab    Ages 8-11
│   │   └── /classes/ai-coding-studio   Ages 12-17
│   ├── /one-on-one            [NEW] 1-on-1 Tutoring
│   └── /platform              [NEW] Kids AI Platform preview + waitlist
├── /about                     [refresh] + 3-layer stack vision + founders + traction
├── /book                      [refresh] Service-aware booking
├── /faq                       [refresh] + new-service FAQs
├── /contact                   [minor] School inquiry 专用
├── /media                     [keep] Pacific Camp + 后续案例
├── /blog                      [keep]
└── /privacy /terms            [TBD: 是否已有？]
```

**Migrations**：
- 旧 `/workshops` → 301 重定向到 `/programs/workshops`
- 旧 `/workshops/:slug` → 301 重定向到 `/programs/workshops/:slug`

---

## 6. Page-by-Page Blueprint

### 6.1 `/` (Home) — refresh

**Hero**：
- 保留 video background + dark overlay
- H1：`Teach kids to code with AI.`（保留）
- Subtitle 改：`In-school workshops · weekly small group classes · 1-on-1 tutoring · and an AI coding platform built for K-12. Designed in Australia for the next generation of builders.`
- 主 CTA：`Book a Free Consultation`（新，先约 15 分钟咨询）
- 次 CTA：`View Programs`（指向 `/programs`）

**Programs section**（4 张卡片改写）：

| 当前 | 改为 |
|---|---|
| AI CODING / Coming 2026 → | **KIDS OPENCODE** ⭐ / `The first AI coding tool built for kids, not adults. Parent-visible. Safe by design.` / `See how it works →` |
| ROBOTICS / Enrolling now → | **WORKSHOPS** / `1-3 day intensive AI & robotics workshops for schools and holiday camps` / `View workshops →` |
| HACKATHONS / Coming 2026 → | **1-ON-1 TUTORING** / `Private AI coding sessions with senior instructors. From A$80/hr.` / `Book a session →` |
| SCHOOLS / For educators → | **WEEKLY CLASSES** / `Small group AI Creative & Coding classes. Ages 8-17.` / `View cohorts →` |

加第 5 张（次要位置）：`SCHOOLS / Year-long partnerships for AU schools / Talk to us →`

**注**：把 Kids OpenCode 提到 #1 卡片（之前是 AI CODING 抽象"Coming 2026"），让访客第一眼看到我们最重要的差异化产品。Platform 整体 waitlist 移到 Kids OpenCode 卡片的 "See how it works" 路径里（Kids OpenCode + airbotix-app 都在那一页 / 那一组介绍）。

**"Powered by" 横条**（紧贴 hero 下方，必加 — see §4.6.2）：
- 灰阶 logo 横排：Anthropic / OpenAI / ElevenLabs / Cursor / Vercel / GitHub（6-8 个）
- 上方 1 行 caption：`Powered by best-in-class AI infrastructure`

**Trust signals section**（新增）：
- 100+ students taught
- 2 partner schools
- 4 reasons parents trust us（kid-safe / curriculum-aligned / parent visibility / AU-based）
- 简短 founder bio：`Built by Lightman (coding pedagogy) and Joe (ex-Google).`

**Testimonials**（保留 3 条 + 加家长 1 条）：
- [TBD: 需要 1 条真实家长 testimonial — 用 pilot 学生家长]

**Final CTA**：`Not sure which fits? Book a 15-min free consult.` → `/book?type=consult`

### 6.2 `/programs` — NEW（4 卡片 hub）

简短 hero + 4 张卡片（workshops / classes / 1-on-1 / platform），每张卡片 1 段描述 + 1 个 CTA 进入子页。

### 6.3 `/programs/workshops` — refresh

- 现有 workshop list 内容保留
- 加 **Workshop Inquiry** CTA（学校）
- 加 **Holiday Camp 报名** CTA（家庭，V1+ 当假期 camp 立项时启用）

### 6.4 `/programs/classes` — NEW（小班课）⭐

**Hero**：`Weekly AI classes that turn kids into builders. Small groups, real projects, parent-visible progress.`

**两个 cohort 卡片**：
- **AI Creative Lab** (Ages 8-11) — 8 weeks, weekly 75min, online + optional in-person
- **AI Coding Studio** (Ages 12-17) — 10 weeks, weekly 90min, online

每个卡片含：
- Curriculum outline（[TBD: 每个 cohort 大纲 8-10 节课内容，Lightman/Joe 教研产出]）
- 上课时段（[TBD: 具体 Term 时间]）
- 班级人数（3-6）
- 讲师介绍
- 定价 + 报名 CTA → `/book?type=class&cohort=<slug>`

**FAQ inline**：缺课处理、试听政策、退款政策（[TBD]）

### 6.5 `/programs/one-on-one` — NEW（1对1）⭐

**Hero**：`1-on-1 AI coding with senior instructors. Bring your kid's idea — leave with a real project.`

**Subject menu**：
- AI Coding (Python + LLM)
- School Project Co-pilot（用 AI 完成学校 STEM 作业）
- 12+ Real Projects（用 Cursor / Claude Code / Kids OpenCode 做能上线的项目）
- Math / Algorithm with AI

**定价**：
- Single session A$140/hour
- 10-pack A$1300（A$130/hour）
- 20-pack A$2400（A$120/hour）
- [TBD: Lightman 确认这些数字]

**Booking**：嵌入 Cal.com booking widget → 直接进 Airwallex 收银台

### 6.6 `/programs/platform` — NEW（Kids AI Platform 预告）

简短 vision + 截图占位（暂用 wireframe） + Waitlist 表单：
- 家长 email + 孩子年龄 + 兴趣（AI 创作 / coding）
- Submit → 进入 platform-backend 的 `waitlist` 表（[TBD: V0 阶段先用 Formspree 收集，不需要后端]）

强调："Built on top of the curriculum your kid is already learning in classes and 1-on-1s — not a separate product."

### 6.7 `/about` — refresh

- 保留 Hero / Mission / Vision / Values / Pilot snapshot
- **新增**：
  - **"Our Technology Stack" 章节** ⭐ — see §4.6.2（彩色 logo + 简短描述每家用途，"建平台 + 用最好的 AI" 哲学的视觉化呈现）
  - 3-layer stack diagram（视觉化 BP §5）
  - Founders section（Lightman + Joe，头像 + 1 段 bio + LinkedIn）
  - Press / Awards（[TBD: 如果有]）
  - Roadmap timeline（2026 H1 = classes + 1-on-1 launch / H2 = platform V0 / 2027 = hackathons）

### 6.8 `/book` — refresh（service-aware）

URL query 区分：
- `/book?type=consult` — 15min free consultation（Cal.com 嵌入）
- `/book?type=workshop` — Workshop inquiry form（保留现有 Formspree）
- `/book?type=class&cohort=<slug>` — Small group enrollment（Cal.com 选 cohort + Airwallex 收银）
- `/book?type=1on1&pack=<single|10|20>` — 1-on-1 booking（Cal.com + Airwallex）
- `/book?type=school` — School partnership form

V0 实现：上面四种都通过 Cal.com 不同 event type 实现，Airwallex 用 hosted checkout，无需自建后端

### 6.9 `/faq` — refresh

加新分类：
- **Small Group Classes**（[TBD: 5-8 FAQs]）
- **1-on-1 Tutoring**（[TBD: 5-8 FAQs]）
- **Platform**（waitlist 后回答）
- 保留 Workshop 相关 FAQs

---

## 7. Booking Flows（V0 不需要 platform-backend）

| 服务 | 流程 |
|---|---|
| Free consult | Cal.com 嵌入 → 自动确认邮件 → Zoom 链接 |
| Workshop（学校） | Formspree 收 inquiry → Lightman 人工跟进（保留现状）|
| Workshop（holiday camp） | Cal.com 选 camp 日期 + Airwallex hosted checkout |
| 小班课 | Cal.com 选 cohort（含开课日期 / 剩余名额）+ Airwallex 一次性收 term 费用 |
| 1-on-1 | Cal.com per-session booking + Airwallex per-session 或预付课包 |
| Platform waitlist | Formspree → CSV，后期导入 platform-backend |

**关键洞察**：V0 完全不需要写后端代码，全部 SaaS 拼接（Cal.com + Airwallex + Formspree + 邮件）。

---

## 8. Pricing — proposed defaults（待 Lightman 拍）

| 服务 | 提议定价 | 备注 |
|---|---|---|
| Free consult | A$0（15min） | 漏斗顶部 |
| Workshop（school，2-day cohort 20 学生） | A$3,000-5,000/cohort | [TBD: 现有 pilot 实际数] |
| Workshop（holiday camp，per student） | A$220/day | 含 hardware 使用 |
| Small group class（per term, 8 课，AI Creative Lab） | **A$480** | A$60/课 |
| Small group class（per term, 10 课，AI Coding Studio） | **A$600** | A$60/课 |
| 1-on-1 single | **A$80/hour** | 起步定价（2026-05-15 拍） |
| 1-on-1 10-pack | **A$750** | A$75/hour，省 A$50 |
| 1-on-1 20-pack | **A$1,400** | A$70/hour，省 A$200 |
| Platform subscription（2026 上线后）| **TBD per kids-ai-platform-prd** | 当前是 Stars pay-as-you-go |

**Why these numbers**：
- 对标 AU 1-on-1 tutoring 市场（A$80-180/hour），Airbotix 因 AI 专业溢价取中上
- 小班课 60/课 vs AU 一般小班 50-80/课（Cluey Learning 60-80），合理
- 给家长**Single → 10-pack → 20-pack** 阶梯，制造课包采购心理（提高 LTV）

---

## 9. CTAs & Conversion Targets

| 漏斗节点 | 目标 |
|---|---|
| Home → Programs 页 | CTR ≥ 25% |
| Home → Free consult | CTR ≥ 5% |
| 1-on-1 页 → 实际首次预约 | 转化 ≥ 8% |
| 小班课页 → cohort 报名 | 转化 ≥ 3-5% |
| Workshop inquiry | 已有 baseline，[TBD] |
| Platform waitlist | 100 个家长 in 2 个月（验证需求） |

---

## 10. Tech Changes

### 新增 page 文件
```
src/pages/
├── Programs.tsx              (新 /programs hub)
├── programs/
│   ├── Classes.tsx           (/programs/classes)
│   ├── ClassDetail.tsx       (/programs/classes/:slug)
│   ├── OneOnOne.tsx          (/programs/one-on-one)
│   └── Platform.tsx          (/programs/platform)
```

### Data layer 扩展
```
src/data/
├── workshops.ts              (现有，保留)
├── classes.ts                (新：小班课 cohorts 数据)
├── one-on-one.ts             (新：subjects / packs / 讲师)
└── faqs.ts                   (新：按 category 分组 FAQs)
```

### 集成
- **Cal.com** — embed widget（npm @calcom/embed-react），多 event type
- **Airwallex** — hosted checkout（用他们的 JS SDK，无后端）
- **Formspree** — workshop inquiry / waitlist（保留现状）

### 路由
React Router v6 嵌套路由：
```
<Route path="/programs">
  <Route index element={<Programs />} />
  <Route path="workshops" element={<Workshops />} />
  <Route path="workshops/:slug" element={<WorkshopDetail />} />
  <Route path="classes" element={<Classes />} />
  <Route path="classes/:slug" element={<ClassDetail />} />
  <Route path="one-on-one" element={<OneOnOne />} />
  <Route path="platform" element={<Platform />} />
</Route>
```

### 旧 URL 301 重定向
GitHub Pages 不支持 server-side 301。两个选项：
- **Option A**：用 client-side `<Navigate>` 重定向（用户能用，但 SEO 不传权重）
- **Option B**（推荐）：保留 `/workshops` 同时存在（不删旧 URL），同时新加 `/programs/workshops`，两者指向同一组件

### SEO
- 每个 program 子页独立 `<title>` / `<meta description>` / OG / Twitter Card
- 在 `src/data/` 各文件加 `seo` 字段，pages 自动渲染
- sitemap.xml 加新 URLs

---

## 11. i18n（V1+，本次 PRD 不做）

英文站当前够用（AU 主市场 + 海外华人也读 EN）。中文站推迟到：
- 海外华人市场启动时（kids-ai-platform-prd D5）
- 触发条件：classes / 1-on-1 验证后，开海外华人 GTM

---

## 12. Out of Scope（本次明确不做）

- ❌ 中文站翻译（i18n V1+）
- ❌ 平台 V0 上线相关（airbotix-app / platform-backend，由独立 PRD 覆盖）
- ❌ Blog 内容生产（保留现有架构）
- ❌ 在线讲师注册 / multi-teacher portal（V1+，pilot 期手工）
- ❌ Discord / Slack 社区（V1+）
- ❌ 推荐返利 / Affiliate（V1+）
- ❌ 真实付款集成自动化（Airwallex webhook → 系统 — V1，本次 V0 用 hosted checkout 即可）
- ❌ 家长 portal（airbotix-app /portal/*，独立 PRD）

---

## 13. Open Questions — 需 Lightman 拍

| # | 问题 | 影响 |
|---|---|---|
| Q1 | 小班课 / 1-on-1 讲师在哪？pilot 期是 Lightman + Joe 兼职上课？还是已经有 1-2 位独立讲师签了？ | 影响"立即开课"可行性 |
| ~~Q2~~ | ~~1-on-1 起步定价~~ | ✅ **2026-05-15 拍**：A$80/h 起步，10-pack A$750，20-pack A$1,400。Pilot 后视复购情况再决定是否升档 |
| Q3 | 小班课首 Term 想 2026 哪个时段开？（[TBD: 通常 AU Term 1 = 1月底 / Term 2 = 4月底 / Term 3 = 7月中 / Term 4 = 10月初；如果 ASAP 可能要做 "Mini-term" 概念，4-6 周快速开班验证）| 影响 home page launch banner 文案 |
| Q4 | Cal.com / Airwallex 现在公司账号有了吗？还是要新申请？ | 影响真正能开卖的时间（Airwallex KYC 通常 1-2 周） |
| Q5 | 现有 100+ pilot 学生家长里，有几位可以拿到 testimonial + 头像 + 同意公开？ | 影响 trust signal 真实度 |
| Q6 | 平台 waitlist 在 V0 营销站要不要明确"What's coming"截图？还是只放抽象文字？ | 截图能提升转化但需要 placeholder design 工作 |
| Q7 | Founder section 想公开 Joe 的 ex-Google 信息到 marketing site 吗？（pitch deck 有，公开 site 是另一个层级） | 影响 trust signal |
| Q8 | Workshop 的 holiday camp 这条线想 V0 一起做吗？还是只做 in-school workshop？ | 影响 `/programs/workshops` 页面深度 |

---

## 14. Execution Plan

### Phase 1（Week 0-1，约 1 周）— 基础架构 + 一条线先打通
- [ ] 答 §13 Q1-Q8（Lightman）
- [ ] 创建 `/programs` hub + `/programs/one-on-one`（因为是最简单的，1 个讲师就能开卖）
- [ ] Cal.com + Airwallex 账号开通 + 1 个 1-on-1 event type 上线
- [ ] Home `/` 改写（4 张卡片）+ 加 trust signals
- [ ] 部署 + 验证可下单

### Phase 2（Week 1-2）— 小班课线
- [ ] 写 2 个 cohort 大纲（AI Creative Lab / AI Coding Studio）
- [ ] `/programs/classes` 上线
- [ ] Cal.com 加 cohort event type
- [ ] 招生 Term 1 cohort（目标 3-6 学生 × 2 班）

### Phase 3（Week 2-3）— 完成剩余 surface
- [ ] `/programs/workshops` refresh
- [ ] `/programs/platform` + waitlist
- [ ] `/about` refresh（3-layer stack + founders）
- [ ] `/book` 多入口逻辑
- [ ] `/faq` 扩

### Phase 4（Week 3-4）— Launch
- [ ] SEO / sitemap / OG 全部到位
- [ ] LinkedIn / 公众号宣发
- [ ] 监测漏斗指标，调文案

---

## 15. Success Metrics（90 天）

- **流水**：1-on-1 + 小班课累计 ≥ A$20,000
- **学生数**：小班课实际开班 ≥ 2 班 × 3-6 学生 = 6-12 学生
- **1-on-1**：累计课时 ≥ 50 小时
- **Platform waitlist**：≥ 100 个家长
- **Home → Programs 页** CTR ≥ 25%
- **Free consult booking**：30 天内 ≥ 20 个

---

## Related docs

- `BP.md` — 完整商业故事 + 3-layer stack 来源
- `pitch-deck.md` — 投资人 deck，可提取 founder bios / traction 数据
- `DESIGN.md` — 设计系统（颜色、字体、组件已就绪）
- `docs/product/prd/kids-ai-platform-prd.md` — 平台 PRD（本次 PRD 的下游产品）
- `airbotix-app/README.md` — 平台前端 repo pointer
