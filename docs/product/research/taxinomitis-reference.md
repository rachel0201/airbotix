# Reference: IBM/taxinomitis (Machine Learning for Kids)

> 研究归档 · 2026-05-17 · Airbotix Kids AI Platform 参考
> 来源仓库：https://github.com/IBM/taxinomitis
> 线上产品：https://machinelearningforkids.co.uk
> 配套教案仓库：https://github.com/IBM/taxinomitis-docs
> License：Apache-2.0（可商用，需保留版权声明）

## 为什么这个项目对 Airbotix 有参考价值

- **同领域、同年龄段、同教学闭环**：面向儿童的 AI 启蒙，"训练 → 测试 → 在 Scratch 里用模型做游戏"的完整三段式流程，和 Airbotix Kids AI Platform 的"Learn → 实操"思路高度一致。
- **真实运行了 7+ 年的生产级开源代码**：1,885 commits、185 stars、156 forks（截至 2026-05），是少数从 PoC 走到学校实际使用的开源 K-12 AI 平台。
- **完整教师/课堂工作流**：班级管理、学生账号配额、内容审核——这些 Airbotix Teacher Console 都要做。
- **课程内容（worksheets）独立仓库**：内容和代码解耦，方便频繁更新教案而不动产品代码。Airbotix 课程内容管理可以借鉴这个拆分。

## 产品概貌

### 三种 ML 模型类型（孩子可训练）
1. **文本分类**（Text classification）— 后端走 Watson Assistant workspaces
2. **数字分类**（Numbers）— 独立 Python 服务 `mlforkids-newnumbers` 自建模型
3. **图像识别**（Image recognition）— Cloud Object Storage 存训练集

### 教学闭环
```
孩子在 Web UI 训练模型 → 模型保存到 Postgres/COS → 进入 Scratch 3.0
→ Scratch 里通过自定义 block 调用自己训练的模型 → 做出能"看懂"或"听懂"的游戏
```

### 多语言支持（线上版本）
英语 / 阿拉伯 / 捷克 / 简繁中文 / 威尔士 / 德 / 希腊 / 波斯 / 法 / 亚美尼亚 / 意 / 日 / 韩 / 匈 / 荷 / 葡（两种）/ 俄 / 罗 / 僧伽罗 / 西 / 瑞典 / 土耳其 / 乌克兰 —— 国际化方案值得抄一遍。

## 技术架构（关键参考）

### 部署拓扑（IBM Cloud Code Engine + Kubernetes）

| 组件 | 技术栈 | 角色 |
|---|---|---|
| `mlforkids-api` | Node.js | 主站 + API 后端 |
| `mlforkids-newnumbers` | Python | 数字项目 ML 训练服务（独立微服务） |
| `mlforkids-scratch` | nginx | Scratch 静态资源 |
| `mlforkids-proxy` | nginx | Scratch 调用外部 API（Spotify / Wikipedia）的代理 + 缓存层 |
| `mlforkids-api-cleanup` | Node.js Job | 每小时清理任务（清未完成项目、过期数据） |

### 依赖服务

| 层 | 选型 | Airbotix 当前选型 | 对应关系 |
|---|---|---|---|
| 数据库 | IBM Cloud Postgres (us-south) | **Neon Serverless** (Sydney) | ✅ 同为 Postgres，迁移友好 |
| 对象存储 | IBM COS | **AWS S3** (Sydney) | ✅ 都是 S3 协议 |
| 文本 NLP | IBM Watson Assistant | **DeepRouter LLM 网关** | ⚠️ 我们可以用 LLM few-shot 替代 Watson 的意图分类 |
| 数字 ML | 自建 Python 服务 | 待定 | 可以照抄这个微服务模式 |
| 图像识别 | TensorFlow.js（推测，前端） | 待定 | 可在浏览器跑，省后端成本 |
| 认证 | Auth0 | **自建 JWT + OTP** | ❌ 不抄，Airbotix 自己 self-host |
| DNS/CDN | IBM Cloud Internet Services | **Cloudflare DNS + CloudFront** | ✅ 类似 |

### 关键架构启示

1. **数字 ML 单独拆 Python 服务**：Node.js 主站不背 ML 训练负载，靠 HTTP/job 调用 Python sidecar——和 Airbotix 当前 NestJS 单体后端不冲突，未来要加图像/语音训练时可以照搬这个模式。
2. **Scratch proxy 单独一个 nginx 容器**：是因为 Scratch 浏览器端要调 Spotify/Wikipedia 这些不允许 CORS 的服务，需要后端 proxy + 缓存——如果 Airbotix Learn 端也要接第三方 API，这个模式可直接复制。
3. **`mlforkids-api-cleanup` 定时清理 job**：儿童项目会留下大量未完成、待审、过期的数据。Airbotix 一定也要有类似 cron job（建议从 day 1 就规划，不要等数据爆炸再加）。
4. **内容仓库分离**（`taxinomitis-docs`）：worksheets 独立仓库，独立发布节奏——Airbotix 课程内容（PRD 已规划）应该走类似拆分，避免每改一份教案都要重新部署平台。

## 教学/产品启示

### 适合直接借鉴
- ✅ **"训练 → 测试 → 用"三段式 UX**：进 UI 第一屏就是"我要训练什么"，而不是先讲概念
- ✅ **集成 Scratch**：低龄段（< 12 岁）孩子的编程语言事实标准，Airbotix Learn 应该认真评估是否集成
- ✅ **多模型类型分开 UI**：文本/数字/图像走完全不同的训练流程，不要做"通用 ML 流水线"——孩子认知负担会爆炸
- ✅ **Worksheets PDF 教案**：纸质工作单 + 线上平台双轨，适合线下课堂场景（Airbotix 的工作坊定位）

### Airbotix 应该做得更好的地方
- ❌ taxinomitis 是"个人副业项目"出身，README 作者自承"有些尴尬的代码痕迹"。Airbotix 从 day 1 就是工程化产品，结构会更干净
- ❌ Watson Assistant 在 2026 视角已经过时；Airbotix 走 LLM 网关（DeepRouter）路线，能做更灵活的对话/分类任务
- ❌ taxinomitis 没有家长侧（Portal），Airbotix `airbotix-app` 有 `/portal/*`（家长）+ `/learn/*`（孩子）双角色——这是关键差异化
- ❌ 没有钱包/课时包/支付系统，Airbotix 有（Airwallex）

## License & 合规

- **Apache-2.0**：可商用、可修改、可闭源衍生，**必须**保留版权声明和 LICENSE 文件，**必须**在 NOTICE 里声明使用了 IBM 的代码
- 教案仓库 `taxinomitis-docs`：需单独确认 license（README 未明确，使用前要去仓库根目录确认）
- IBM 商标、"Machine Learning for Kids" 名称受版权和商标保护，**不能直接复用品牌**

## 可行动建议（给 Airbotix）

| 优先级 | 建议 | 关联模块 |
|---|---|---|
| P0 | clone taxinomitis 跑一遍线上版本，让产品/教研团队亲手训一次模型，理解 UX 节奏 | 全员体验 |
| P1 | 把 `taxinomitis-docs` 里的 worksheets 翻译/改编成 Airbotix 的中英文课程包种子内容 | `docs/product/prd/kids-ai-platform-prd.md` |
| P1 | 借鉴"内容仓库分离"模式，规划 Airbotix 课程内容仓库（参考 jr-academy `curriculum/` 工作流） | platform-backend + 内容仓库 |
| P2 | 实现"数字 ML"训练时，参考 `mlforkids-newnumbers` Python 微服务模式 | platform-backend 扩展 |
| P2 | 评估 Scratch 3.0 集成可行性——是否做 Airbotix 版自定义 block | airbotix-app `/learn/*` |
| P3 | 借鉴 `mlforkids-api-cleanup` 模式，规划数据清理 cron job | platform-backend |

## 还需要补充研究的点（TODO）

- [ ] 图像识别在前端跑还是后端跑？看 `mlforkids-api` 源码确认（影响 Airbotix 后端 EC2 规格）
- [ ] Auth0 怎么处理未成年人邮箱注册？（COPPA / Privacy Act 合规相关，对照 Airbotix `docs/product/compliance/minors-compliance.md`）
- [ ] `taxinomitis-docs` 的 license 和翻译/改编授权范围
- [ ] 训练数据归属：孩子上传的图片归谁？删除策略？（对照 Airbotix C1-C15 合规清单）
- [ ] 配套 worksheets PDF 的设计模板（视觉风格、信息密度）—— 对 Airbotix 工作坊讲义有借鉴价值

---

**研究人**：Claude (airbotix session) · **下次审阅**：Phase 1 启动 Kids AI Platform 实际开发时
