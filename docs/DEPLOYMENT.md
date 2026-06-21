# SkillHot 部署交付文档

更新时间：2026-06-21

## 目标

把 SkillHot 部署为自动更新的 GitHub Agent Skills 中文发现站，通过 `skillhot.savs-ai.com` 对外提供服务。站点每天获取 GitHub 最新数据，更新榜单、分类、Stars、活跃度、图片、视频和使用信息，不依赖大模型执行日更。

## 部署架构

SkillHot 是纯静态 React 网站，采用以下轻量架构：

- 源代码与数据更新：GitHub 仓库 `savanna0425/skillhot`
- 构建与定时任务：GitHub Actions
- 静态托管与 HTTPS：GitHub Pages
- DNS：Cloudflare
- 正式域名：`https://skillhot.savs-ai.com`

本项目没有部署到腾讯云 CVM。静态站使用 GitHub Pages 可以避免占用现有 API 服务器的 2 Mbps 带宽和内存，也无需维护额外容器。

## 已完成事项

### 1. GitHub 调研数据

- 保存 GitHub Topic Search `skill` 前三页，共 30 个 Topic。
- 重点跟踪 `skill`、`skills`、`agent-skills`、`claude-skills` 等 20 个相关 Topic。
- 当前榜单为 180 个去重后的高星、高活跃仓库。
- 数据包含分类、中文介绍、Stars、活跃度、最近更新时间、适用场景、用法、安装片段、来源 Topic、仓库/主页链接、GitHub 社交预览图与视频链接。
- JSON：`public/data/skills.json`
- CSV：`public/data/skills.csv`

### 2. Cloudflare DNS

域名：`savs-ai.com`

| 类型 | 名称 | 内容 | 代理状态 | TTL |
| --- | --- | --- | --- | --- |
| CNAME | `skillhot` | `savanna0425.github.io` | DNS only | Auto |

使用 `DNS only` 是 GitHub Pages 自定义域名的稳定配置，可让 GitHub 直接完成域名校验与 TLS 证书签发。

### 3. GitHub Pages

- 正式地址：`https://skillhot.savs-ai.com`
- 备用地址：`https://savanna0425.github.io/skillhot/`
- Pages 构建方式：GitHub Actions
- 自定义域名文件：`public/CNAME`
- HTTPS：GitHub Pages 自动签发并强制启用

### 4. 每日自动更新

`.github/workflows/daily-update.yml` 每天北京时间 08:20 执行：

1. 调用 GitHub REST API 获取 Topic 与仓库数据。
2. 使用本地确定性规则过滤、分类、评分和生成中文字段。
3. 生成 JSON 与 CSV。
4. 只有数据发生变化时才提交到 `main`。
5. 数据提交触发 `.github/workflows/deploy-pages.yml`，重新构建并发布网站。

日更流程不调用 OpenAI、Anthropic 或其他大模型 API，Token 消耗为 0。GitHub API 使用 Actions 自带的 `GITHUB_TOKEN`，无需保存个人令牌。

`.github/workflows/activate-domain.yml` 每天北京时间 08:35 检查 CNAME、Pages 绑定和 HTTPS 是否正常；它只读验证，不修改 Cloudflare 或 GitHub 配置。

## 本地项目

工作目录：

`/Volumes/Mac SN7100/Documents/codex图文/skillhot`

本地启动：

```bash
cd "/Volumes/Mac SN7100/Documents/codex图文/skillhot"
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

## GitHub Actions 运维

查看最近任务：

```bash
gh run list --repo savanna0425/skillhot --limit 10
```

手动刷新数据：

```bash
gh workflow run daily-update.yml --repo savanna0425/skillhot
```

手动重新部署：

```bash
gh workflow run deploy-pages.yml --repo savanna0425/skillhot
```

手动检查域名：

```bash
gh workflow run activate-domain.yml --repo savanna0425/skillhot
```

## 域名与 HTTPS 检查

```bash
dig +short skillhot.savs-ai.com CNAME
curl -I https://skillhot.savs-ai.com/
gh api repos/savanna0425/skillhot/pages
```

正确状态应满足：

- CNAME 返回 `savanna0425.github.io.`
- HTTPS 返回 `200`。
- Pages API 的 `cname` 为 `skillhot.savs-ai.com`。
- Pages API 的 `https_enforced` 为 `true`。

## 故障排查

### 页面仍显示旧数据

先查看 `Update SkillHot data` 是否成功，再查看由数据提交触发的 `Deploy SkillHot to GitHub Pages`。GitHub Pages CDN 通常会在几分钟内完成刷新。

### 自定义域名打不开

检查 Cloudflare 中 `skillhot` 是否仍为 CNAME、目标是否为 `savanna0425.github.io`、代理是否为 `DNS only`。不要把它改成腾讯云服务器 IP。

### GitHub API 限流

Actions 任务使用仓库 `GITHUB_TOKEN`，配额足以完成每日一次更新。如果手动连续触发多次导致限流，等待配额恢复即可；现有线上数据不会受影响。

### 自动任务没有提交

如果日志显示 `No data changes`，表示当天抓取结果与仓库数据一致，属于正常情况，不会产生空提交。

## 安全与费用

- 仓库不保存 Cloudflare 登录信息、个人 GitHub Token、SSH 密钥或服务器密码。
- GitHub Pages、GitHub Actions 公共仓库额度与 Cloudflare DNS 当前均可零额外服务器成本运行。
- 日更不使用大模型，避免 Token 成本和非确定性输出。
- 腾讯云 CVM 上的 Sav's API 与本项目相互独立，SkillHot 故障不会影响 API 服务。
