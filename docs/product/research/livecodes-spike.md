# Spike: LiveCodes 评估报告

> Spike 归档 · 2026-05-18 · 决策依据
> 触发：[building-blocks-reference.md](./building-blocks-reference.md) P0 行动项
> 评估问题：**LiveCodes 能否替代 Airbotix V0 PRD 里自研的 iframe sandbox + 虚拟 FS？**

## TL;DR（结论先行）

**❌ 不能直接替代 Kids OpenCode V0 的沙盒方案。** LiveCodes 是单页 playground，**不支持多文件项目**——这是设计取舍，不是漏装功能。

但仍有**两条可用路径**：

| 路径 | 适用场景 | 推荐度 | 决策状态 |
|---|---|---|---|
| **Path A：LiveCodes 用在 Line A（6-11 岁低龄创作）** | 单页 HTML/CSS/JS 创作 + AI 生成代码即看即得 | ⭐⭐⭐⭐⭐ 强推 | ✅ **2026-05-20 Lightman 锁定** |
| **Path B：Sandpack 用在 Line B（Kids OpenCode V0）** | 多文件项目 + AI agent 写入文件 + 渲染 | ⭐⭐⭐ 慎重评估 | ⏸ 待 spike |
| **Path C：自研（按原 PRD）** | 兜底 | ⭐⭐ 工程量大 | 兜底 |

## LiveCodes 评估详情

### ✅ 优点
| 维度 | 评估 | 来源 |
|---|---|---|
| License | MIT，可商用 | [GitHub](https://github.com/live-codes/livecodes) |
| 活跃度 | 1.4K★ / 247 forks / 最新 v49 (2026-05-08) | 同上 |
| 技术栈 | TypeScript 87.5%、框架无关、有官方 React SDK | 同上 |
| 部署 | 纯浏览器端，零服务端依赖 | 官方文档 |
| 语言支持 | 90+ 语言/框架，**包含 Python 双方案**：Brython（轻）+ Pyodide（含科学计算包） | livecodes.io/docs/languages/python |
| 编辑器 | Monaco（VS Code 同款），含 Vim/Emacs 绑定 | livecodes.io/docs/features |
| SDK | `setConfig()` / `getCode()` / `run()` / `watch()` —— 完全支持外部 agent 注入代码 + 监听变化 | livecodes.io/docs/sdk/js-ts |
| 嵌入 | `import LiveCodes from 'livecodes/react'` 一行接入 React/Vite | 官方 |
| 隐私 | 默认代码不离开浏览器，除非主动 share | 官方 |
| 移动 + i18n | 都支持 | 官方 |

### ❌ 致命短板

**LiveCodes 不支持多文件项目。** 这是设计哲学，不是 bug。

> "A LiveCodes project is a combination of markup, styles & scripts that result in a single web page, and **there is no concept of file system or organizing multiple files in a directory structure of a single project**."
> — LiveCodes 官方 FAQ

项目结构是固定的三个编辑器：
- markup（HTML）
- style（CSS）
- script（JS）

部署时输出 `index.html` + `style.css` + `script.js` 三个独立文件，但**项目内不能有 `src/components/Button.tsx` 这种结构**。

### 与 Airbotix Kids OpenCode V0 PRD 的冲突

PRD §11.6 明确说：
- **V0 仅支持 HTML/CSS/JS** ✅ LiveCodes 支持
- **沙盒 = 浏览器 iframe + 服务端虚拟 FS** ❌ LiveCodes 无 VFS 概念
- **Agent tool 限于 Read/Write/Edit 虚拟 FS** ❌ 不能写多个文件，只能改 HTML/CSS/JS 三块
- **多文件项目**（PRD §1.2 写"让孩子做真·多文件项目"） ❌ 根本冲突

**核心矛盾**：Line B 旗舰产品的卖点是"做真·多文件项目"，LiveCodes 是"单页 playground"，两个产品形态根本不同。

## 备选方案 1：Sandpack（CodeSandbox 开源）

### 关键特性
| 维度 | 评估 |
|---|---|
| License | **Apache-2.0**（注意不是 MIT，商用 OK） |
| 活跃度 | 6.1K★ / 469 forks / 372 releases，但**最近一次 release 是 v2.20.0 在 2025-02-14**，节奏明显放缓 |
| 多文件 | ✅ **支持**，`files` 对象 = `{ '/path/to/file': content, ... }` |
| 虚拟 FS | ✅ 这就是 Sandpack 的核心 |
| Bundler | 自带 bundler，支持 React/Vue/Svelte 等模板，热重载 |
| AI agent 友好 | ✅ 通过 props 注入 `files` 对象即可 |

### ⚠️ 风险
- 维护节奏放缓（Feb 2025 后无新 release）
- 网上有说法 "Sandpack will no longer be actively maintained"（来源不确定，需要去 GitHub Issues 验证）
- 如果 CodeSandbox 公司战略转向，OSS 包可能停更

### Sandpack vs LiveCodes vs 自研

| 维度 | LiveCodes | Sandpack | 自研 |
|---|---|---|---|
| 单页（Line A 用） | ✅ 完美 | ⚠️ 可以但 overkill | ❌ 浪费 |
| 多文件（Line B 用） | ❌ 设计冲突 | ✅ 原生支持 | ✅ 全自主 |
| 工程量 | 1 天集成 | 1-2 周集成 | 4-6 周 |
| 维护风险 | 低（活跃） | 中（节奏慢） | 高（自己背） |
| AU/中国合规 | 纯前端无数据出境 | 同上 | 同上 |

## 推荐执行路径

### Phase 1（立即，本周）
**Line A 直接用 LiveCodes**——风险低、工程量低、产品 fit 度高。

- [ ] 起一个 `airbotix-app/playground` PoC 分支
- [ ] `npm i livecodes`
- [ ] 在 Learn 端嵌入 LiveCodes React 组件
- [ ] 用 DeepRouter 调 LLM，把生成的 HTML/CSS/JS 通过 `setConfig()` 注入
- [ ] 验证 K12 视觉风格能否覆盖 LiveCodes 默认主题
- [ ] **验收**：孩子输入"做一个会动的彩虹"→ LLM 输出 HTML/CSS/JS → 沙盒立刻渲染

### Phase 2（与 Phase 1 并行，2 周内）
**Line B Kids OpenCode V0 做 Sandpack 对比 spike**——验证多文件 + agent 协作是否能跑通。

- [ ] 单独起 `kids-opencode-sandpack-spike` 分支
- [ ] 集成 `@codesandbox/sandpack-react`
- [ ] 让 opencode agent 通过 SDK 写入多个文件
- [ ] 测试热重载 + 错误反馈链路
- [ ] **验收**：agent 创建一个 `index.html` + `style.css` + `app.js` 三文件项目，沙盒正确渲染
- [ ] 同时检查 Sandpack GitHub Issues / Discussions，确认维护状态

### Phase 3（Phase 2 结果出来后决策）
- Sandpack 跑通 + 维护状态可接受 → **采用 Sandpack**
- Sandpack 不行 → 回到 PRD 原方案自研（评估 StackBlitz WebContainers 闭源是否能接受）

## 节省工程量估算

- 如果 Phase 1 + Phase 2 都成功：**省 5-7 周**（原 PRD 自研沙盒预计 4-6 周 + Line A 重新做 UI 1-2 周）
- 如果只有 Phase 1 成功：**省 2-3 周**（Line A 用 LiveCodes）
- 如果都失败：**回归原 PRD 方案**，spike 投入约 1-2 人周（沉没成本可接受）

## 关键决策点（需要 Lightman 拍板）

1. **Line A 是否锁定 LiveCodes？** —— 风险极低，建议直接定
2. **Line B Sandpack 维护风险能否接受？** —— Apache-2.0 即便停更也能 fork 自维护，但要评估自维护成本
3. **如果 Sandpack 也不行，StackBlitz WebContainers（闭源 SaaS）是否考虑？** —— 这条路径意味着引入第三方运行时依赖，与"全部自托管 + AU 数据不出境"原则有冲突

## 关联文档

- 上游：[building-blocks-reference.md](./building-blocks-reference.md) §3
- PRD：`docs/product/prd/kids-ai-platform-prd.md` §11.6
- PRD：`docs/product/prd/kids-opencode-spec.md` v0.2

## 还需要确认的事

- [ ] **Sandpack 维护状态**：去 GitHub Issues 看 maintainer 最近 6 个月的活跃度，确认"不再维护"是真消息还是误传
- [ ] **LiveCodes K12 主题适配**：能否完整套上 Airbotix design system（`DESIGN.md`）的色板/字体/圆角
- [ ] **Sandpack iframe 安全模型**：sandpack-client 用的 iframe sandbox attribute 配置是否够严格
- [ ] **Pyodide 加载时长**：实测 LiveCodes Python (Wasm) 首次加载耗时，评估 V1 路线可用性

---

**Spike 执行人**：Claude (airbotix session) · **下次更新**：Phase 1 PoC 跑通后
