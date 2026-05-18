# 外部参考项目研究归档

> Airbotix Kids AI Platform 立项前的对标研究
> 维护人：Claude (airbotix session) · 持续更新

这个目录用来归档**对标项目 / 开源参考 / 竞品分析**。研究目的是借鉴产品思路、教学法、技术架构，不是抄袭代码。

## 已完成研究

### 对标产品（产品形态 / 教学法 / 课程内容）

| 项目 | 类型 | 参考价值 | 文档 |
|---|---|---|---|
| **IBM Machine Learning for Kids** (taxinomitis) | 开源代码 + 教案 | ⭐⭐⭐⭐⭐ 最高 | [taxinomitis-reference.md](./taxinomitis-reference.md) |
| **Cognimates** (MIT Media Lab) | 开源代码 + 理念 | ⭐⭐⭐ 理念高代码低 | [cognimates-reference.md](./cognimates-reference.md) |
| **Day of AI** (MIT RAISE) | 课程目录可见 | ⭐⭐ 仅元数据 | [day-of-ai-reference.md](./day-of-ai-reference.md) |

### 开源积木（按 Airbotix 实际模块梳理）

| 文档 | 覆盖 |
|---|---|
| [building-blocks-reference.md](./building-blocks-reference.md) | DeepRouter / kids-opencode / 浏览器沙盒 / Guardrails / Chat UI / LMS / Wallet / Audit Log —— 每个模块的开源选项 + 是否推荐采用 |

## 快速对比

| 维度 | taxinomitis | Cognimates | Day of AI |
|---|---|---|---|
| 年龄段 | 9-14 | 7-10 | 5-18（K-12 全段） |
| 形态 | 完整产品 | 完整产品 | 纯课程材料 |
| 代码可访问 | ✅ Apache-2.0 | ✅ MIT（training） | N/A |
| 课程内容可访问 | ✅ 单独仓库 | ⚠️ 需查 kidsteach.ai | ❌ 需教师注册 |
| 活跃度 | ✅ 持续更新 | ❌ 2019 后停更 | ✅ 活跃 |
| ML 后端 | Watson + 自建 Python | Google AutoML | N/A |
| Scratch 集成 | ✅ | ✅ 更深 | N/A |
| 协作角色 | 儿童 + 教师 | 儿童 + 家长 | 儿童 + 教师 |

## 计划中的研究（未完成）

- [ ] **Code.org AI 模块** — 全球最大 K-12 CS 教育平台的 AI 课程部分
- [ ] **Scratch 3.0 扩展开发** — 评估 Airbotix Learn 集成 Scratch 的工程成本
- [ ] **MIT RAISE 公开论文** — Stefania Druga 等学者的 K-12 AI 教育研究
- [ ] **Common Sense Education** — Day of AI 合作伙伴，部分内容免注册
- [ ] **国内对标**：商汤 SenseStudy、网易卡搭、Makeblock —— 中文市场实际竞品
- [ ] **Hackidemia kidsteach.ai** — Cognimates 衍生的课程站，单独评估

## 如何使用这些文档

- 启动 Kids AI Platform 实际开发前（Phase 1），全员通读一次
- PRD 评审时，引用具体研究结论佐证产品决策
- 课程内容包设计时，对照 Day of AI 的分级和单元拆分方式
- 技术架构决策时，对照 taxinomitis 的微服务拆分模式

## 研究原则

1. **公开可访问的内容优先**：登录墙后面的内容能拿到就拿，拿不到就标注清楚，不要假装拿到了
2. **License 必须查清**：所有打算"借鉴/复用"的代码都要先确认 license
3. **诚实标注活跃度**：仓库停更的项目要说清楚，避免后续 fork 踩坑
4. **避免盲目崇拜 MIT 光环**：MIT 出的项目不等于"现在还能用"
