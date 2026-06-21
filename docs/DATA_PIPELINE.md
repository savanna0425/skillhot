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

## 数据处理

1. 合并并按 `owner/repo` 去重。
2. 排除与 Agent Skills 无关的宽泛结果。
3. 计算 Stars、更新时间、来源数量和技能相关性组成的综合分数。
4. 保留综合排名前 600 个仓库，并额外保留因星数较低而未进入前 600 的精选来源。
5. 读取每个入选仓库的 README，提取安装命令、视频、兼容平台和技能规模。
6. 使用确定性规则分到统一分类。
7. 输出 `public/data/skills.json` 和 `public/data/skills.csv`。

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
- Agent平台
- 产品与商业
- 技能开发
- 技能合集
- 其他

同一分类数组同时驱动发现页、榜单页、分类页与左侧栏，避免筛选项不一致。

## 更新成本

日常更新只调用 GitHub REST API 和本地脚本，不调用大模型。README 请求属于 GitHub 的常规 API 配额；搜索请求按 GitHub 的搜索限流主动节流。

## 已知边界

- GitHub 搜索最多返回每个查询的前 1,000 个结果，因此使用多个互补查询降低遗漏。
- 没有标准化 README 的仓库可能只能得到通用安装说明。
- 分类基于仓库元数据和规则；欢迎通过 Pull Request 修正精选条目。
