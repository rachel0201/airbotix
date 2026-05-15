# Airbotix 未成年人服务合规参考 v0.1

> 文档状态：Draft v0.1 · 工程/产品参考
> 编写日期：2026-05-11
> 上游文档：`kids-ai-platform-prd.md` v0.4、`DeepRouter-PRD.md（sibling repo `~/Documents/sites/deeprouter-ai/deeprouter/`）` v0.1、`kids-opencode-spec.md` v0.2
> 范围：Airbotix 作为成年组织、面向 6-15 岁孩子提供 AI 服务时必须遵守的法规与上游 provider 条款的整合
>
> ⚠️ **免责声明**：本文档是基于公开材料（截至 2026-05-11）的研究综述，**不能替代正式法律意见**。V0 上线前必须由合资格的澳洲律师做正式 review。本文档的目标是让工程/产品团队"知道有哪些事必须做"，但具体合规边界以律师意见为准。

---

## 1. 我们在做什么（合规视角）

- **Airbotix 是成年组织**，注册主体在澳洲
- **终端用户是 6-15 岁儿童**，由家长创建账号并监管
- **AI 调用由 Airbotix（不是孩子）以公司账号发起**，通过 **DeepRouter** 路由到 Anthropic / OpenAI / 其它 provider
- **孩子从不直接持有 provider API key、不直接登录 ChatGPT/Claude**
- **主要市场**：Australia（V0）→ 海外华人家庭（V2+）→ 国际（V3+）

这种"成年组织代为调用"是上游 provider（Anthropic、OpenAI）明确允许的形态，但**合规责任随之转移到 Airbotix**：上游免责，Airbotix 全责。

---

## 2. 上游 Provider 要求

### 2.1 Anthropic（Claude）

**Usage Policy（AUP）原文**：

- > "We define a minor or child to be any individual under the age of 18 years old, regardless of jurisdiction."
- > "Products serving minors, including organizations providing minors with the ability to directly interact with products that incorporate our API(s), must comply with the additional guidelines outlined in our Help Center article."

**绝对禁止的产品行为**（AUP 第三条 Child Safety）：
- ❌ CSAM 创建/分发/推广（含 AI 生成的）
- ❌ 协助 minor grooming（任何形式，含"假装是未成年人"的 roleplay）
- ❌ 协助 child abuse 或 trafficking
- ❌ 推广 pedophilic 关系
- ❌ 性化/物化 minors（即使是虚构 / roleplay）

**Help Center "Responsible Use … Serving Minors"（Article 9307344）要求**：

| 项目 | Anthropic 原文要求 | Airbotix 必须做 |
|---|---|---|
| 年龄验证 | "Age verification systems to ensure only intended users can access the product" | 家长注册 + 实名/支付验证为代理；孩子 profile 由家长创建 |
| 内容审核 | "Content moderation and filtering to block inappropriate or harmful content" | DeepRouter 入口+出口双层过滤 |
| 监控与上报 | "Monitoring and reporting mechanisms to identify and address potential issues" | 全部 prompt+输出留存 90 天；异常告警；家长 audit log |
| 教育资源 | "Educational resources and guidance for minors on safe and responsible use" | 平台首次使用引导、家长指南 |
| AI 披露 | "Organizations must disclose to their users that they are interacting with an AI system rather than a human" | 孩子端 UI 明示 "AI 助手"，不假装人类 |
| 法规遵循 | "It is the responsibility of organizations to comply with all applicable child safety and data privacy regulations" | Airbotix 自行承担（见 §3） |
| 公开声明 | "compliance with these regulations should be clearly stated on the organization's website or similar public-facing documentation" | **airbotix.ai 必须有公开合规声明页**（V0 上线前） |
| 系统提示词 | Anthropic 可能提供 official child-safety system prompt | DeepRouter 在 `airbotix-kids` tenant 注入；Anthropic 提供官方版本时优先用其 |

**Anthropic 的执法权**：
> "We will periodically audit organizations for compliance. Non-compliance may result in suspension or termination of your account."

→ Airbotix 必须留存可审计证据（系统提示词、过滤命中日志、家长同意记录），随时能向 Anthropic 出示。

### 2.2 OpenAI（GPT / DALL-E / gpt-image-1）

**Terms of Use 关键句**：
- > "You must be at least 13 years old or the minimum age required in your country to consent to use the Services."
- > "If you are under 18 you must have your parent or legal guardian's permission to use the Services."

**Usage Policy 绝对禁止**：
- ❌ "OpenAI services must never be used to exploit, endanger, or sexualize anyone under 18 years old."

**Under-18 API Guidance（developers.openai.com）原文要求**：

| 项目 | OpenAI 原文 | Airbotix 必须做 |
|---|---|---|
| Zero Data Retention（< 13） | "You should not use OpenAI services to process any personal data of children under 13 or the applicable age of digital consent **without first implementing zero data retention in our API**." | **DeepRouter 在 `airbotix-kids` tenant 对 OpenAI 请求强制开启 ZDR flag**（对所有未成年用户，不只 < 13） |
| AI 披露 | "Providing age-appropriate disclosures to minors about AI tools and how to use them responsibly." | 同 Anthropic，UI 明示 |
| 内容过滤 | "Implementing age-appropriate content filters to address potentially sensitive content." | DeepRouter 出口 NSFW + 暴力 + 仇恨过滤 |
| 监控与上报 | "Implementing reasonable monitoring and reporting mechanisms, including escalation paths for high-risk interactions." | 高风险事件（自残/暴力倾向）→ 自动告警 + 人工 review 队列 |
| 年龄验证 | "Where required or otherwise appropriate for your use case, using age assurance systems to ensure only intended users can access the product." | 家长账号绑定 + 支付实名为代理 |
| 模型选择 | "Use OpenAI's most current flagship models, which incorporate the latest safety protections, particularly when building experiences for minors." | DeepRouter 路由 OpenAI 时优先用最新 flagship（非 legacy） |

**关键操作要点**：OpenAI 的 Zero Data Retention 是一个 API flag（`store: false` 或账号级配置），DeepRouter 必须为 `airbotix-kids` tenant 自动注入。Airbotix 工程师**不可以**让任何针对未成年人的 OpenAI 请求绕过 ZDR。

### 2.3 其它 provider（豆包 / DeepSeek / Qwen / GLM）

- DeepRouter 接入任何新 provider **必须**：
  1. 阅读该 provider 的 ToS 与儿童条款
  2. 在本文档 §2 新增对应小节
  3. 在 DeepRouter 的 `airbotix-kids` tenant 配置层评估是否允许 / 需要额外护栏
- 中国 provider（豆包、DeepSeek、Qwen、GLM）有自家的内容审核 + 实名要求，需要单独评估是否能被一个海外组织（Airbotix）合规调用并面向未成年人

---

## 3. 各市场法规要求

### 3.1 Australia（V0 主市场）

**Online Safety Act 2021 + Basic Online Safety Expectations**

| 要求 | 原文/释义 | 我们怎么做 |
|---|---|---|
| 儿童最佳利益优先 | "best interests of the child is a primary consideration in the design and operation of services likely to be used by children" | 写入产品设计原则文档 |
| Safety by Design | 默认隐私+安全最严，不让用户"自助选择放松" | 班级分享默认私密；公开走老师+家长审核 |
| AI 风险评估 | "undertaking assessments of safety risks and impacts ... throughout the design, development and deployment" | V0 上线前出 AI safety assessment（参考本文档 §5 模板） |

**Online Safety Amendment (Social Media Minimum Age) Act 2024**

- 16 岁以下禁用社交媒体
- **重要例外**：教育为主要目的的服务**豁免**（"platforms whose sole or primary purpose is education are exempt"）
- → Airbotix Kids 作为教育产品**适用例外**，但必须能证明"主要目的是教育"（课程包架构、教研流程、教师参与都是证据）
- 班级墙不是社交媒体（受教学情境约束，无私信、无 follow、无算法推荐 feed）

**Privacy Act + Children's Online Privacy Code（草案）**

| 要求 | 我们怎么做 |
|---|---|
| 仅收集"strictly necessary"信息 | 孩子档案默认只采集昵称、年龄段（非生日）；不收学校、地址、真实姓名（除非家长主动填） |
| 默认隐私设置最严 | 班级分享私密；公开分享需家长 + 老师双确认 |
| 不投放定向广告 | 平台不展示任何第三方广告 |
| 数据可携 + 销户权 | 家长一键导出全部作品 + 一键销户（V0 必须有） |

### 3.2 United States（V2+）

**COPPA（更新版，2026-04-22 生效）**

| 要求 | 我们必须做 |
|---|---|
| < 13 用户必须 Verifiable Parental Consent（VPC） | 不是单 checkbox。可用方式：信用卡 small charge（与支付绑定）/ 视频电话 / 政府 ID。**V0 用支付绑定作为 VPC 代理**（家长绑卡即视为父母身份验证） |
| AI 训练用途必须**单独** VPC | 我们承诺：**不将孩子数据用于训练任何模型**，并在隐私政策中明示 |
| 数据最小化 | 同 AU |
| 不能无限保留儿童数据 | 写入数据保留政策：作品 + audit log 保留 90 天后归档加密，3 年后删除（具体期限以律师审定） |
| 生物识别（语音/面孔）扩展为 PII | V0 不收集语音/面孔；V1+ 加 TTS/语音输入时 reassess |
| 必须有书面数据保留政策 | 写入 `privacy-policy.md` 公开发布 |
| 学校代理 consent 例外 | B 端学校采购场景下，学校可作为 parental consent 代理人（但仅限教育用途） |

**注意**：即便 V0 不主推美国市场，**澳洲家长可能用美国 IP 访问**，建议 V0 就达到 COPPA 标准（更严不会错）。

### 3.3 European Union（V2+）

**GDPR + GDPR-K**

| 要求 | 我们必须做 |
|---|---|
| 16 岁以下家长 consent（成员国可降至 13） | 同 COPPA VPC 思路 |
| 数据最小化 + 目的限定 | 同 AU |
| 数据可携权 | 同 AU |
| 被遗忘权 | 一键销户清理全部 PII |
| 跨境数据传输 | DeepRouter 主区域 SG，欧盟用户数据流出需 SCC / DPF；V2+ 评估 |

### 3.4 中国 / 海外华人（V2+）

**未成年人网络保护条例 + 个人信息保护法**

- 严格的实名要求
- 防沉迷时段
- 内容审核更严
- 数据本地化（个人信息出境需安全评估）
- → 海外华人家庭如住在 AU，不触发中国本地化要求；但若回中国短期访问，可能受当地法规约束
- V2+ 进入中国市场需要单独合规方案，不在 V0 范围

---

## 4. Airbotix 平台必须实现的清单（从上面合并得出）

### 4.1 V0 必须有（合规阻塞项）

| # | 要求 | 来自 | 状态 |
|---|---|---|---|
| C1 | 家长账号注册（手机/邮箱验证 + 支付绑卡作为 VPC 代理） | COPPA / Anthropic / OpenAI | ✅ 已在 platform PRD |
| C2 | 孩子档案只能由家长创建 | COPPA / AU 隐私 | ✅ |
| C3 | AI 披露："我是 AI，不是真人"（首次会话强制 + 持续可见标识） | Anthropic + OpenAI | ⏸️ 写进 OpenCode spec §4.5 system prompt |
| C4 | 内容审核入口+出口双层（黑名单 + LLM classifier + NSFW） | Anthropic + OpenAI | ✅ DeepRouter §6 |
| C5 | OpenAI 调用强制 Zero Data Retention（针对 `airbotix-kids` tenant 全部请求） | OpenAI Under-18 Guidance | ⏸️ DeepRouter Team A Week 7 实现 |
| C6 | 所有 prompt + 输出留存 90 天用于追溯 | Anthropic 审计要求 | ✅ |
| C7 | 数据最小化（不收学校 / 地址 / 真实姓名） | AU + COPPA | ✅ |
| C8 | 默认隐私设置最严（班级分享私密，公开需双重审批） | AU + Safety by Design | ✅ |
| C9 | 数据导出 + 一键销户 | COPPA / GDPR / AU | ⏸️ V0 必须实现 |
| C10 | 公开合规声明页（airbotix.ai/compliance 或类似 URL） | Anthropic 明文要求 | 🟡 **草稿完成** [`../legal/compliance-statement.md`](../../legal/compliance-statement.md) — 待律师确认 + 上线 |
| C11 | 隐私政策 + 服务条款 + 家长授权书 | 全部法规 | 🟡 **三份全部起草完成** — [`../legal/privacy-policy.md`](../../legal/privacy-policy.md) · [`../legal/terms-of-service.md`](../../legal/terms-of-service.md) · [`../legal/parental-consent.md`](../../legal/parental-consent.md) — 待律师确认 + 上线 |
| C12 | 不将孩子数据用于训练任何 AI 模型 + 在隐私政策明示 | COPPA 2026 更新 | 🟡 已写入 [`../legal/privacy-policy.md`](../../legal/privacy-policy.md) §3 + [`../legal/compliance-statement.md`](../../legal/compliance-statement.md) §4 |
| C13 | 异常事件人工 review + 家长告警 | Anthropic + OpenAI 监控要求 | 🟡 NDB runbook 完成 [kids-opencode/docs/runbook/ndb-incident.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/runbook/ndb-incident.md) — V0 实现 pending |
| C14 | 不投放第三方广告 | AU + 行业最佳实践 | ✅ 商业模式已锁定；在 [`../legal/privacy-policy.md`](../../legal/privacy-policy.md) §3 公开承诺 |
| C15 | 留存可审计证据（system prompt 版本 / 过滤命中 / consent 记录） | Anthropic 审计 | 🟡 [kids-opencode/docs/safety-assessment.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/safety-assessment.md) §3 guardrail-9 — V0 实现 pending |

---

### 4.1.1 新增的 V0 合规交付物索引（2026-05-15）

工程团队完成了以下 V0 launch-blocker 文档的全部起草工作。律师 review 节省到约 11-16 小时（详见各文档 "Notes for Lightman" 段）。

**法律文档**（in `airbotix/docs/legal/`）：
- 🟡 [`privacy-policy.md`](../../legal/privacy-policy.md) — 完整 kid-aware Privacy Policy；待律师签字
- 🟡 [`terms-of-service.md`](../../legal/terms-of-service.md) — 完整 ToS（含 ACL 兼容的限责措辞）；待律师签字
- 🟡 [`parental-consent.md`](../../legal/parental-consent.md) — 14 条 itemised consent + immutable 记录设计；待律师签字
- 🟡 [`compliance-statement.md`](../../legal/compliance-statement.md) — airbotix.ai/compliance 公开页内容；待律师签字

**Kids OpenCode 产品 repo（`kidsinai/kids-opencode`）合规文档**：
- 🟡 [`docs/compliance/au.md`](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au.md) — AU 合规审计
- 🟡 [`docs/compliance/au-lawyer-pass.md`](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au-lawyer-pass.md) — 8 个 AU-* 待决项 substantive 答案
- 🟡 [`docs/compliance/au-sole-or-primary-purpose-statement.md`](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au-sole-or-primary-purpose-statement.md) — 教育豁免立场声明
- 🟡 [`docs/compliance/au-oaic-copc-explainer.md`](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au-oaic-copc-explainer.md) — OAIC 咨询说明
- 🟡 [`docs/compliance/au-oaic-copc-submission-draft.md`](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au-oaic-copc-submission-draft.md) — OAIC 咨询提交草稿（2026-06-05 截止）
- 🟡 [`docs/safety-assessment.md`](https://github.com/kidsinai/kids-opencode/blob/main/docs/safety-assessment.md) — AI Safety Assessment v0.1
- 🟡 [`docs/red-team.md`](https://github.com/kidsinai/kids-opencode/blob/main/docs/red-team.md) — 50-prompt 红队测试集
- 🟡 [`docs/runbook/ndb-incident.md`](https://github.com/kidsinai/kids-opencode/blob/main/docs/runbook/ndb-incident.md) — Notifiable Data Breach 应急流程

**部署设计**：
- 🟡 [`airbotix/docs/ai/install-kids-hosting.md`](../../ai/install-kids-hosting.md) — `airbotix.ai/install/kids` 部署设计

### 4.2 V0 之后（V1+ / V2+）

- 海外市场进入前重新审视所在地法规
- 加入新 LLM provider 前更新本文档 §2
- 每 6 个月（或法规更新时）重审本文档

---

## 5. AI Safety Assessment 模板（V0 上线前提交，AU 监管期望）

工程团队按下列模板写一份 AI Safety Assessment，归档备查：

```
项目：Airbotix Kids AI Platform V0
日期：YYYY-MM-DD

1. 服务对象
   - 年龄段：[低龄 6-11 / 旗舰 12-15]
   - 主要场景：[创作/学习/课堂/家庭]

2. 风险识别
   - 内容风险：[暴力/性/政治/自残/...]
   - 行为风险：[沉迷/数据泄露/同伴伤害/...]
   - 数据风险：[PII 收集/留存/共享/...]

3. 缓解措施（与本文档 §4 对应）
   - C1-C15 实施状态

4. 测试结果
   - red team 测试样本
   - 实际命中率与漏过率

5. 持续监控
   - 指标 + 告警阈值
   - review 周期

6. 余留风险与接受决策
```

---

## 6. 工程团队的硬性约束

工程实现层面，下列规则**不可被功能开发覆盖**：

1. **孩子从不直接调用任何 LLM provider 的 API**。所有调用走 Airbotix 服务端 → DeepRouter → Provider。Airbotix 服务端是合规主体。
2. **OpenAI 调用永远带 `store: false` / ZDR flag**（对 `airbotix-kids` tenant 全部请求；不只 < 13）。
3. **Provider 请求里禁止携带可识别孩子身份的元数据**（不能在 user agent / metadata 中放真实姓名、生日、邮箱）。tenant 标签即可。
4. **平台不收集孩子语音、面孔图像、生物识别**（V0）；V1+ 引入 TTS 前 reassess。
5. **任何"AI 训练用孩子数据"特性**进入产品前必须重新过本文档 §3 + 律师 sign-off。
6. **System prompt 注入**走 DeepRouter，不依赖应用层；应用层注入可能被绕过。
7. **审计日志保留**：所有 prompt + 输出 + 工具调用，按 family_id 分区，90 天热存 + 加密归档至 3 年。

---

## 7. 待解决项（V0 阻塞）

> 🟢 **更新 2026-05-15**：L2 + L3 草稿全部完成（见 §4.1.1）。L1 律师 retainer 仍待启动，但律师工作量降到 11-16 小时（见 [kids-opencode/docs/compliance/au-lawyer-pass.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au-lawyer-pass.md)）。

| ID | 事项 | 责任人 | 状态 | 截止 |
|---|---|---|---|---|
| L1 | 与 AU 合资格律师签订 retainer，做正式 review | Lightman | 🔴 未启动 | V0 启动后 2 周内 |
| L2 | 起草 / 律师审 / 上线公开合规声明页（airbotix.ai/compliance） | 律师 + 产品 | 🟡 草稿完成（[`compliance-statement.md`](../../legal/compliance-statement.md)），待律师 + 上线 | V0 上线前 |
| L3 | 起草 / 律师审 / 上线隐私政策、服务条款、家长授权书 | 律师 + 产品 | 🟡 三份草稿完成（见 §4.1.1），待律师 + 上线 | V0 上线前 |
| L4 | DeepRouter 实现 OpenAI ZDR 强制注入 | Team A | ✅ 已 ship（DeepRouter commits `2620e4d7` + `54fc4cf0`） | — |
| L5 | C9 数据导出 + 一键销户 UI + 后端 | platform-backend | 🔴 未启动 | Week 10 |
| L6 | C13 异常事件 review 队列 + 家长告警 pipeline | platform-backend + Team B | 🟡 NDB runbook 完成；pipeline 工程 pending | Week 10 |
| L7 | C15 审计证据留存 schema | Team A + B | 🟡 plugin 端 stderr 发出已实现；platform-backend 端持久化 pending | Week 8 |
| L8 | 申请 Anthropic / OpenAI / Doubao "organizations serving minors" outreach | Lightman | 🟡 措辞模板在 [au-lawyer-pass.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au-lawyer-pass.md#au-8-anthropic-organizations-serving-minors-approval) AU-8；待 Lightman 发邮件 | V0 前 |
| **L9** | **OAIC Children's Online Privacy Code 咨询提交** | Lightman | 🟡 草稿完成（[au-oaic-copc-submission-draft.md](https://github.com/kidsinai/kids-opencode/blob/main/docs/compliance/au-oaic-copc-submission-draft.md)），待 Lightman 润色 + 发邮件 | **2026-06-05 COB（硬截止）** |
| **L10** | **`airbotix.ai/install/kids` 部署** | Airbotix-AI/airbotix 工程 | 🟡 设计完成（[install-kids-hosting.md](../../ai/install-kids-hosting.md)），CloudFront + S3 + GitHub Actions OIDC pipeline pending | V0 上线前 |
| **L11** | **`@kidsinai/kids-opencode-plugin` npm 发布** | Lightman | 🔴 需要 npm `@kidsinai` scope auth | V0 上线前 |

---

## 8. 来源（截至 2026-05-11）

- [Anthropic Usage Policy (AUP)](https://www.anthropic.com/legal/aup)
- [Anthropic Help Center — Responsible Use of Anthropic's Models: Guidelines for Organizations Serving Minors (Article 9307344)](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors)
- [OpenAI Under-18 API Guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance)
- [OpenAI Usage Policies](https://openai.com/policies/usage-policies/)
- [OpenAI Terms of Use](https://openai.com/policies/row-terms-of-use/)
- [eSafety Commissioner — Basic Online Safety Expectations](https://www.esafety.gov.au/industry/basic-online-safety-expectations)
- [eSafety Commissioner — Industry Regulation](https://www.esafety.gov.au/about-us/industry-regulation)
- [Australia Online Safety Amendment (Social Media Minimum Age) Act 2024 — analysis](https://www.quinnemanuel.com/the-firm/publications/australia-sets-minimum-age-for-social-media-use-a-closer-look-at-the-online-safety-amendment-social-media-minimum-age-act-2024/)
- [Children's Privacy in 2026: Australia + United States overview (Sidley)](https://datamatters.sidley.com/2026/02/13/childrens-privacy-in-2026-from-australias-under-16-social-media-ban-to-a-shift-beyond-notice-and-consent-in-the-united-states/)
- [FTC COPPA Rule (canonical)](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa)
- [COPPA 2026 Update Analysis (Akin)](https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/new-coppa-obligations-for-ai-technologies-collecting-data-from-children)
- [Anthropic now lets kids use its AI tech — within limits (TechCrunch, May 2024)](https://techcrunch.com/2024/05/10/anthropic-now-lets-kids-use-its-ai-tech-within-limits/)

---

## 9. Revision History

| 版本 | 日期 | 改动 |
|---|---|---|
| v0.2 | 2026-05-15 | 重大更新：C10-C15 状态全部从 🔴/⏸️ 升级为 🟡（草稿全部完成）。新增 §4.1.1 V0 合规交付物索引指向 11 份 kids-opencode + airbotix 仓的新文档。L1-L8 状态全部刷新；新增 L9（OAIC 咨询 2026-06-05 硬截止）/ L10（install endpoint 部署）/ L11（npm publish）。L4 标记为已完成。 |
| v0.1 | 2026-05-11 | 初版。整合 Anthropic AUP + Help Center 9307344、OpenAI Under-18 API Guidance + ToS、AU Online Safety Act/BOSE/Social Media Min Age Act exemption、COPPA 2026 更新、AU Children's Online Privacy Code 草案。引出 C1-C15 平台合规清单 + L1-L8 待办。 |
