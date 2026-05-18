# Reference: Cognimates (MIT Media Lab)

> 研究归档 · 2026-05-17 · Airbotix Kids AI Platform 参考
> 项目主页：https://www.media.mit.edu/projects/cognimates/overview/
> 官方网站：https://hackidemia.github.io/cognimates-website/home/
> 衍生课程站：kidsteach.ai（Hackidemia 非营利组织持续运营）

## ⚠️ 一句话总结

**理念金贵，代码老旧。** Cognimates 的教学哲学（"kids teach AI"）和 7-10 岁低龄段定位对 Airbotix 有强参考价值，但**代码仓库基本停更**（最近 release 2019），不要直接 fork，只参考思路。

## 三个核心仓库

| 仓库 | 用途 | License | 活跃度 |
|---|---|---|---|
| [mitmedialab/cognimates-vm](https://github.com/mitmedialab/cognimates-vm) | Scratch VM 扩展（运行逻辑） | LICENSE 文件存在但类型未明确 | 17★ / 3 forks / 2,522 commits — 缓慢更新 |
| [mitmedialab/cognimates-gui](https://github.com/mitmedialab/cognimates-gui) | Scratch GUI 扩展（React 组件） | LICENSE 文件存在但类型未明确 | 2★ / 4 forks / 2,390 commits — 缓慢更新 |
| [hackidemia/cognimates-training](https://github.com/hackidemia/cognimates-training) | AI 训练平台（文本/图像分类） | **MIT** | 23★ / 7 forks — **2019 年后基本停更** |

## 产品概貌

### 目标用户
- **儿童 + 家长**协作（与 taxinomitis 的"儿童 + 教师"路径不同）
- 年龄段：**7-10 岁为核心**（部分活动延伸到 12 岁），明显比 taxinomitis（9-14）低龄
- 家庭场景 + 课外活动 > 课堂场景

### 三大功能模块
1. **训练自己的 AI 模型** — 文本分类 + 图像分类，后端走 **Google Cloud AutoML / Vertex AI**
2. **可视化编程**（Scratch 3.0 扩展） — 添加自定义 block 调用训练好的模型
3. **编程实体机器人** — 支持 Alexa、Cozmo 等"embodied intelligent agents"

### 教学哲学（重点参考）
- **"Kids teach AI" 而非 "AI teaches kids"** — 强调孩子是创造者、训练者，不只是消费者
- "I taught a computer? Sometimes a computer teaches me!" —— 官方引用，体现"互相教学"双向关系
- **创意 > 准确率** — 学习目标是"理解 AI 怎么学习"，不是训出最准的模型

## 技术栈

| 层 | Cognimates 选型 | Airbotix 对应 | 启示 |
|---|---|---|---|
| 视觉编程基础 | Scratch 3.0（VM + GUI + Blocks） | 待定 | 低龄段几乎绕不开 Scratch |
| AI 训练后端 | Google Cloud AutoML (Vertex AI) | **DeepRouter LLM 网关** | 我们走 LLM 路线，比 AutoML 灵活但贵 |
| 前端 | Handlebars + SCSS（旧）/ React（GUI） | React 18 + Vite + Tailwind | 不抄技术，抄交互 |
| 后端 | Node.js 18+ | NestJS | 同生态 |
| 机器人接口 | Alexa / Cozmo | 待定 | Airbotix 工作坊有硬件，可借鉴 |

## 对 Airbotix 的具体启示

### ✅ 值得借鉴
1. **低龄段（7-10 岁）"家长 + 孩子"协作模式** — 直接对应 Airbotix `/portal/*`（家长）+ `/learn/*`（孩子）双角色架构。Cognimates 在这条路上跑了 8 年，UX 细节值得拆解
2. **"训练 → 玩"的快速反馈循环** — 5 分钟内训完一个简单模型 → 立刻在 Scratch 里看到效果。低龄段必须有"立竿见影"的反馈
3. **Scratch 3.0 集成模式** — 如果 Airbotix Learn 要做拖拽编程，Cognimates 的 `cognimates-vm` + `cognimates-gui` 改造模式是现成参考
4. **"Kids teach AI" 叙事** — 直接拿过来做 Airbotix marketing 文案的核心 narrative，比"教孩子学 AI"更有差异化

### ❌ 不要抄
1. **代码本身** — 最近一次大更新在 2019，依赖陈旧（Handlebars、旧 Node 版本），fork 不如重写
2. **Google AutoML 后端** — 贵 + 不可控；Airbotix 走 DeepRouter LLM 网关路线更好
3. **依赖 Cozmo 等已停产硬件** — Cozmo 母公司 Anki 2019 倒闭，机器人路径要重选

### ⚠️ 需要进一步调研
- [ ] `cognimates-vm` 和 `cognimates-gui` 的 LICENSE 具体类型（页面有 LICENSE 文件但 WebFetch 未抓到具体内容，使用前必须 clone 查看）
- [ ] `kidsteach.ai` 课程站的实际内容和授权范围
- [ ] Cognimates 的学术论文（MIT Media Lab 发过多篇 paper，搜 "Stefania Druga Cognimates"）
- [ ] Scratch 3.0 扩展开发的工作量评估（如果 Airbotix Learn 要集成）

## License 提醒

- `cognimates-training`：**MIT**，可商用，需保留版权
- `cognimates-vm` / `cognimates-gui`：LICENSE 文件存在但未确认类型，**clone 后必须先看 LICENSE 文件再决定能否使用**
- MIT Media Lab 名称、Cognimates 品牌名受版权和商标保护

## 与 taxinomitis 的对比（给 Airbotix 选型用）

| 维度 | taxinomitis（IBM） | Cognimates（MIT） |
|---|---|---|
| 年龄段 | 9-14 | 7-10 |
| 活跃度 | ✅ 持续更新 | ❌ 2019 后基本停更 |
| 协作角色 | 儿童 + 教师 | 儿童 + 家长 |
| ML 训练 | Watson + 自建 Python | Google AutoML |
| Scratch 集成 | ✅ 深度 | ✅ 更深度（fork 整个 Scratch 改） |
| 工程质量 | 中等（作者自承"业余项目痕迹"） | 偏研究原型 |
| **对 Airbotix 直接参考价值** | **代码 + 课程双高** | **理念高，代码低** |

## 行动建议

| 优先级 | 建议 | 备注 |
|---|---|---|
| P0 | 把 "Kids teach AI" 这条叙事用到 Airbotix marketing site 文案 | 直接收益，0 工程成本 |
| P1 | clone `cognimates-training` 跑一遍（如果能跑起来），理解低龄段 UX 节奏 | 代码可能跑不起来，做好心理准备 |
| P2 | 搜 Stefania Druga 等 MIT 作者的 paper，扒研究方法和发现 | 学术内容公开 |
| P3 | 评估"家长 + 孩子协作"在 Airbotix Portal/Learn 双角色架构里怎么落地 | 关联 `kids-ai-platform-prd.md` |

---

**研究人**：Claude (airbotix session) · **下次审阅**：Phase 1 Kids AI Platform 启动开发时
