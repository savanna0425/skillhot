# SkillHot

每天更新的开源 Agent Skills 中文发现站。

- 在线访问：<https://skillhot.savs-ai.com>
- 开放数据：[JSON](https://skillhot.savs-ai.com/data/skills.json) · [CSV](https://skillhot.savs-ai.com/data/skills.csv)
- 许可证：[MIT](LICENSE)

## 功能

- 发现：按工作分类探索新近活跃、精选合集与随机推荐。
- 榜单：按综合热度、Stars 和最近更新查看完整索引。
- 分类：统一覆盖 UI 设计、编程开发、办公效率、内容创作、数据分析、研究学习、自动化、安全等领域。
- 话题：把 GitHub Topics 聚合成平台生态与能力地图。
- 详情：展示适用场景、兼容平台、安装命令、许可证、预览图、视频和来源链接。
- 收藏与搜索：收藏保存在浏览器本地，支持仓库、场景、分类和平台关键词检索。
- 响应式布局：桌面端左右侧栏可收起，移动端使用筛选抽屉和详情底部面板。

## 数据覆盖

当前数据管线保留综合排名前 600 个去重仓库，并额外保留可能被星数排序遗漏的精选来源。来源包括：

1. GitHub Topic Search `skill` 前三页，用作来源审计和新 Topic 发现。
2. `agent-skills`、`claude-skills`、`codex-skills`、`openclaw-skills` 等持续跟踪的 Topic。
3. `SKILL.md`、Agent Skills、Claude Skills、Codex Skills 等聚焦仓库搜索。
4. 官方与社区精选来源，包括 Anthropic、NVIDIA、.NET、Google Workspace、Karpathy 相关技能和 Khazix Skills。

所有数据每天通过 GitHub REST API 更新。分类、筛选和评分由确定性脚本完成；README 用于提取安装方式、平台兼容性、技能规模与视频链接。

详细规则见 [数据管线文档](docs/DATA_PIPELINE.md)。

## 本地开发

```bash
pnpm install
pnpm dev
```

刷新数据：

```bash
GITHUB_TOKEN="$(gh auth token)" pnpm update:data
```

检查与构建：

```bash
pnpm check
pnpm build
```

## 自动更新与部署

- `.github/workflows/daily-update.yml`：每天北京时间 08:20 更新数据并发布。
- `.github/workflows/deploy-pages.yml`：`main` 分支更新后构建 GitHub Pages。
- `.github/workflows/activate-domain.yml`：每天检查自定义域名与 HTTPS。

完整运维信息见 [部署交付文档](docs/DEPLOYMENT.md)。

## 参与贡献

欢迎提交遗漏的 Skill、分类修正、数据规则或界面改进。请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。安全问题请参阅 [SECURITY.md](SECURITY.md)。

## License

[MIT](LICENSE) © 2026 savanna0425
