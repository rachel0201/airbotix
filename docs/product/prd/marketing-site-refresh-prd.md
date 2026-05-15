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

**3 个支柱叙事**（每个 surface 都强调）：
1. **Real curriculum, not vibes** — 100+ pilot 学生 / 2 partner schools / Digital Technologies F-10 对齐
2. **Built by AI-native founders** — Lightman + Joe (ex-Google) 团队信号
3. **Kid-safe by design** — agent 沙盒 + 家长可见 + 内容审核（这是和 ChatGPT 直接区别）

**Audience priority**（按 funnel 大小排序）：
1. **AU 家长**（主要 B2C）— 给孩子找 AI/coding 课的家庭
2. **海外华人家长**（V1+ 市场）— 当前英文站够用，V2 加中文
3. **AU 学校**（B2B 持续合约）— Curriculum Lead / Deputy Principal
4. **投资人 / 媒体 / 合作方**（间接）— 看 vision + traction

---

## 4. Service Taxonomy（4 条线）

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

#### AI Creative Lab（Ages 8-11）— 内容详解

**核心承诺**：每个孩子结业带走一本**自己创作的、AI 协作完成的"个人故事书 + 配套媒体"**（PDF + 音视频，家长可打印 / 分享）。

**8 周 cohort 大纲**：

| 周 | 主题 | 学生产出 |
|---|---|---|
| 1 | **AI 是什么 + 怎么和 AI 对话**（kid-safe 介绍 + prompt 基础） | 第一个 AI 生成图（self portrait） |
| 2 | **AI 图像创作**（角色 / 场景 / 道具设计） | 自己故事的主角设计稿 + 风格定调 |
| 3 | **AI 图像 进阶**（背景 / 色调 / 多张连贯性） | 5 张以上故事插图，风格统一 |
| 4 | **AI 故事写作**（情节结构 + 对话 + 转折） | 1500 字短篇故事大纲 + 完整文本 |
| 5 | **AI 配音 & 角色声音**（TTS / 多角色声线） | 故事全文 AI 配音 mp3 |
| 6 | **AI 音乐 & 主题曲**（用 Suno-like 工具生成） | 故事专属主题曲 + 1-2 段背景音乐 |
| 7 | **AI 短视频 & 动画 GIF**（让插图动起来） | 1-2 段故事关键场景动画 |
| 8 | **Showcase Day**：合成 + 家长开放课 | 完整作品 PDF 故事书 + 音视频包 + 家长展示 |

**贯穿能力培养**：
- **Prompt literacy** — 怎么把脑子里的想法翻译成 AI 听得懂的话
- **Iteration habit** — 第一版不好不要紧，怎么调整 prompt 改进
- **Critical eye** — AI 生成的东西哪里好 / 哪里假 / 怎么判断
- **Safe AI hygiene** — 不分享个人信息 / 不相信所有输出 / 遇到不舒服的内容怎么办
- **Storytelling** — 故事结构（开头 / 冲突 / 高潮 / 结局），AI 是工具，故事是孩子自己的

**用到的 AI 工具**（V0 课堂内，老师托管，孩子不直接管 API key）：
- **图像**：DeepRouter 后端代理到 Flux / SDXL / DALL-E
- **故事文本**：Claude 3.5 Sonnet（kid-safe system prompt）
- **TTS**：ElevenLabs（多角色多语言）
- **音乐**：Suno / Udio API（或类似）
- **视频**：Runway / Pika（5-10 秒短片）

**家长可见**：每周课后家长收到孩子作品 + 老师一段评语（视频 60-90s）。

**Class Wall**：可选 — 同 cohort 同学之间互看作品（家长授权后）。

**为什么这套有杠杆**：
- **可炫耀**：8-11 岁孩子拿到"一本自己的故事书"，家长朋友圈传播力极强 → 自然获客
- **可重复**：每个 cohort 同样大纲不同孩子作品，老师边际成本低
- **可衍生**：孩子结业作品集 → 后续家长续费 1-on-1 / 进阶 cohort 自然路径

#### AI Coding Studio（Ages 12-17）— 内容详解

**核心承诺**：每个孩子结业带走 **3 个能 demo 的真实项目**（部署在线，URL 可分享），并初步掌握用 AI agent（Cursor / Claude Code 入门）做软件。

**10 周 cohort 大纲**：

| 周 | 主题 | 学生产出 |
|---|---|---|
| 1 | Python 基础 + 怎么和 AI 编程对话 | 第一个能跑的 Python 脚本 |
| 2 | Web 基础（HTML/CSS/JS）+ AI 协助写代码 | 个人 portfolio 静态网页 |
| 3 | AI API 调用（用 Python 调 Claude / OpenAI） | "AI 笑话生成器"小项目 |
| 4 | Project 1：**AI 工具网页**（用 AI 写代码 + 部署） | URL 可分享的 AI 小工具 |
| 5-6 | Git / GitHub / 协作 + 用 Cursor 做项目 | Project 1 部署到 Vercel / Netlify |
| 7-8 | Project 2：**AI Agent 应用**（让 LLM 调工具） | 简单 agentic 项目（如自动整理笔记） |
| 9 | Project 3：**Capstone**（孩子自定义） | 真实需求驱动的项目（朋友的小生意、班级活动等） |
| 10 | Showcase Day：演示 + 家长 + 同伴互评 | 完整 portfolio + 现场 demo |

**Tech stack 教授**：Python · HTML/CSS/JS · Git · Cursor / Claude Code · Vercel deploy · Claude/OpenAI API

**对接平台**：完成本 cohort 的孩子 = airbotix-app + kids-opencode 桌面工具早期 power user。

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

### 4.4 Kids AI Platform — V0 上线 2026 Q3-Q4

**形式**：airbotix-app（云端 SPA）+ kids-opencode（12+ 本地工具）
**定位**：补充上面 3 条线，而非替代
- 小班课 / 1-on-1 学生 = 平台早期用户，老师直接在平台上布置作业
- 家长付费订阅 = 自主练习
**当前**：营销站只暴露 **waitlist 注册**，详细等 PRD 完成后再 marketing

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
| AI CODING / Coming 2026 → | **WEEKLY CLASSES** / `Small group AI coding classes, ages 8-17, online & in-person` / `Enroll now →` |
| ROBOTICS / Enrolling now → | **WORKSHOPS** / `1-3 day intensive AI & robotics workshops for schools and holiday camps` / `View workshops →` |
| HACKATHONS / Coming 2026 → | **1-ON-1 TUTORING** / `Private AI coding sessions with senior instructors. Online, flexible scheduling.` / `Book a session →` |
| SCHOOLS / For educators → | **PLATFORM** / `Kids-safe AI coding platform with parent visibility. Coming 2026 Q3.` / `Join waitlist →` |

加第 5 张（次要位置）：`SCHOOLS / Year-long partnerships for AU schools / Talk to us →`

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
