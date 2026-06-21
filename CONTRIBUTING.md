# Contributing to SkillHot

感谢你帮助完善 Agent Skills 的开放索引。

## 可以贡献什么

- 推荐遗漏的 GitHub Skill 或技能合集。
- 修正分类、介绍、安装方式、兼容平台或媒体链接。
- 改进数据发现、去重、评分和活跃度规则。
- 修复响应式布局、无障碍、性能或交互问题。

## 推荐 Skill

提交 Issue 时请包含：

- GitHub 仓库链接。
- 它包含 `SKILL.md`、可安装技能或技能目录的证据。
- 建议分类与适用场景。
- 与现有条目的区别。

仅包含提示词、与 Agent Skills 无关的通用 AI 项目、归档仓库或明显复制项目可能不会收录。

## 开发流程

1. Fork 仓库并创建功能分支。
2. 安装依赖：`pnpm install`。
3. 修改代码或 `scripts/update-skills.mjs`。
4. 运行 `pnpm check && pnpm build`。
5. 涉及数据规则时，用有效的 GitHub Token 运行 `pnpm update:data` 并说明数据量变化。
6. 提交 Pull Request，描述用户可见影响和验证方式。

不要提交 API Token、账号信息、SSH 密钥或其他凭据。
