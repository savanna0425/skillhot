# Security Policy

## 报告安全问题

请不要通过公开 Issue 披露可被利用的漏洞。请使用仓库的 [Private vulnerability reporting](https://github.com/savanna0425/skillhot/security/advisories/new)，并包含复现步骤、影响范围和建议修复方式。

## 支持范围

当前 `main` 分支和线上站点 `skillhot.savs-ai.com` 属于支持范围。第三方仓库内容、安装脚本和外部链接由其作者负责；SkillHot 只提供索引，不执行第三方代码。

## 数据与隐私

- 浏览与搜索无需登录；收藏需要经过邮箱验证的账号。
- 账号由 Supabase Auth 管理，收藏保存在 Postgres，并由 RLS 按 `auth.uid()` 隔离。
- 网站不提供头像上传、简介或自定义资料字段，也不保存搜索历史。
- 前端只使用 Supabase anon key；service role key 不得进入仓库或浏览器构建产物。
- 自动更新只读取公开 GitHub 数据。
