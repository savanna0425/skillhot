# SkillHot 数据管线

## 目标

在 GitHub API 配额可控的前提下，尽量完整地发现真实的 Agent Skills，并每天自动更新仓库事实和技能详情。

## 发现通道

### GitHub Topics

固定跟踪 Agent Skills、Claude、Codex、OpenClaw、Anthropic、MCP 等技能相关 Topic。GitHub Topic Search `skill` 的前三页仍被保存，用于审计与发现新话题，但不直接作为网站话题页的展示结构。

### 聚焦仓库搜索

搜索 `SKILL.md`、Agent Skills、Claude Skills、Codex Skills、OpenClaw Skills 等组合，并排除 Fork 和归档仓库。搜索结果还需通过仓库名称、描述或 Topic 的技能相关性检查。

### 精选来源

维护一小组容易被搜索排序遗漏、但具有明确代表性的官方和社区仓库。该列表用于补漏，不改变 Stars 与活跃度事实。

### 高星活跃搜索

每天以“Stars ≥ 500、最近 90 天有推送”为硬条件搜索 `skill`，并按 `500–999`、`1,000–1,999`、`2,000–4,999`、`5,000–9,999`、`10,000+` 分片。每片最多读取前 400 条，避免 GitHub 单个搜索结果的 1,000 条上限截断高热仓库。

## 数据处理

1. 合并并按 `owner/repo` 去重。
2. 排除与 Agent Skills 无关的宽泛结果。
3. 计算 Stars、更新时间、来源数量和技能相关性组成的综合分数。
4. 使用动态阈值保留符合相关性、活跃度、质量与精选规则的仓库，不再把目录固定截断为某个展示数量。
5. 在 GitHub Actions 每仓库每小时 1,000 次核心 API 配额内，最多读取 850 个高排名仓库与精选来源的 README；其余条目使用仓库元数据与通用安装命令。
6. 使用确定性规则分到统一分类；英文介绍生成中文摘要，仓库名与 Agent、Claude、Codex、MCP 等专有名词保留原文。
7. 为每个仓库生成用户视角详情页说明：这是什么、解决什么问题、能做什么、适合谁、不适合谁、怎么开始用、注意事项。默认由本地规则生成，不调用大模型。
8. 输出网站运行所需的 `public/data/skills.json`、`home.json`、`skills-lite.json`、分类/话题分包和每仓库 detail JSON。公开导出入口已按产品策略移除。

## 运行顺序

每次更新严格按以下四个阶段执行：

1. 发现 GitHub 仓库并将原始快照写入 `public/data/skills.json`。
2. 按配置选择性更新 `scripts/project-profile-overrides.json`，没有大模型配置时保持零 Token 成本。
3. 只运行一次 `scripts/catalog-derived.mjs`，从原始快照生成首页、轻量索引、分类/话题分包、详情页和 manifest。
4. 运行 `scripts/validate-data.mjs`，通过后才提交数据并部署 Pages。

本地 `pnpm update:data` 与 GitHub Actions 使用相同的“原始快照 → 可选增强 → 单次派生”顺序，避免在抓取脚本和工作流中重复生成派生数据。

## 分类体系

- UI设计
- 编程开发
- 办公效率
- 内容创作
- 数据分析
- 研究学习
- 自动化
- 安全
- 记忆与上下文
- Agent工具与平台
- 产品与商业
- 技能开发
- 技能合集
- 其他

同一分类数组同时驱动发现页、榜单页、分类页与左侧栏，避免筛选项不一致。

## 更新成本

日常更新只调用 GitHub REST API 和本地脚本，因此默认不会产生大模型 Token 消耗。README 请求属于 GitHub 的常规 API 配额；搜索请求按 GitHub 的搜索限流主动节流。

项目详情页默认由 `scripts/project-profile-rules.mjs` 的确定性模板生成，所以即使每天发现新仓库，也一定会有详情页输出。可选的大模型增强由 `pnpm enrich:profiles` 或 GitHub Actions 中的 “Optionally enrich project detail copy” 步骤执行；只有配置以下环境变量时才会请求模型：

- `SKILLHOT_LLM_BASE_URL`
- `SKILLHOT_LLM_API_KEY`
- `SKILLHOT_LLM_MODEL`
- `SKILLHOT_LLM_MAX_REPOS`，默认小批量，建议只处理新增或高星项目

增强结果写入 `scripts/project-profile-overrides.json` 缓存，后续派生数据复用缓存；网站页面不会显示“AI 解读”“离线生成”等生产过程标签。

## 已知边界

- GitHub 搜索最多返回每个查询的前 1,000 个结果，因此使用多个互补查询和 Stars 分片降低遗漏。
- 没有标准化 README 的仓库可能只能得到通用安装说明。
- 分类基于仓库元数据和规则；欢迎通过 Pull Request 修正精选条目。
- 规则生成的详情页适合做第一层选型说明；重点项目可以通过人工样例或可选大模型缓存继续加深。
