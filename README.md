# SkillHot

GitHub 高星、高活跃 Agent Skills 的中文发现站。线上目标地址：<https://skillhot.savs-ai.com>。

## 收录范围

- 精确保存 GitHub Topic Search `skill` 前三页（每页 10 个 Topic）。
- 重点收录 `skill`、`skills`、`agent-skills`、`claude-skills`，以及前三页里与 Claude、Codex、OpenClaw、AI Agent 相关的话题。
- 宽泛 Topic 中只有仓库名或描述明确把 Skill 与 Agent/AI 关联的项目才进入榜单。
- 综合热度由 Stars、最近推送时间、来源 Topic 数和 Skill 相关性确定。

## 字段

站点与 CSV 同时提供：分类、介绍、Stars、活跃度、最近更新、来源话题、适用场景、使用方法、安装片段、GitHub 社交预览、视频链接、主页与仓库链接。

## 日更成本

`scripts/update-skills.mjs` 只调用 GitHub REST API，并用本地确定性规则完成过滤、分类和排序；日常更新不调用大模型，Token 成本为 0。GitHub Actions 每天北京时间 08:20 运行，只有数据变化时才提交。

`activate-domain.yml` 每天自动检查 `skillhot.savs-ai.com` 的 CNAME。DNS 指向 `savanna0425.github.io` 后，它会自动绑定 GitHub Pages 自定义域，并在证书就绪后开启 HTTPS。

## 本地运行

```bash
pnpm install
GITHUB_TOKEN="$(gh auth token)" pnpm update:data
pnpm dev
```

构建与检查：

```bash
pnpm check
pnpm build
```

数据文件位于 `public/data/skills.json` 与 `public/data/skills.csv`。
