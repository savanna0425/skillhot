# SkillHot 部署交付文档

更新时间：2026-06-22

## 目标

把 SkillHot 部署为自动更新的 GitHub Agent Skills 中文发现站，通过 `skillhot.savs-ai.com` 对外提供服务。站点每天获取 GitHub 最新数据，更新榜单、分类、Stars、活跃度、图片、视频和使用信息，不依赖大模型执行日更。

## 部署架构

SkillHot 前端仍是纯静态 React 网站，账号收藏使用 Supabase 托管的开源 Auth 与 Postgres：

- 源代码与数据更新：GitHub 仓库 `savanna0425/skillhot`
- 构建与定时任务：GitHub Actions
- 静态托管与 HTTPS：GitHub Pages
- DNS：Cloudflare
- 邮箱登录与收藏：Supabase Auth + Postgres RLS
- 正式域名：`https://skillhot.savs-ai.com`

本项目没有部署到腾讯云 CVM。静态站使用 GitHub Pages 可以避免占用现有 API 服务器的 2 Mbps 带宽和内存，也无需维护额外容器。

## 已完成事项

### 1. GitHub 调研数据

- 保存 GitHub Topic Search `skill` 前三页，共 30 个 Topic。
- 固定跟踪 `skill`、`skills`、`agent-skills`、`claude-skills`、`codex-skills`、`openclaw-skills` 等 Topic，并自动吸收前三页中发现的相关话题；当前共 26 个来源 Topic。
- 增加 `SKILL.md`、Agent Skills、Claude、Codex、OpenClaw 等聚焦仓库搜索和精选补漏来源。
- 新增 Stars ≥ 500、最近 90 天仍活跃的 `skill` 分片搜索，避开单查询 1,000 条上限。
- 当前索引以综合排名前 1,500 个仓库为主，并额外保留精选补漏来源；当前共 1,502 个仓库。
- 数据包含分类、介绍、Stars、活跃度、最近更新时间、适用场景、兼容平台、技能规模、用法、安装命令、来源 Topic、仓库/主页链接、GitHub 社交预览图与视频链接。
- JSON：`public/data/skills.json`
- 运行数据：`public/data/skills.json`（不提供站内 CSV 导出）

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
2. 使用本地确定性规则过滤、分类、评分和生成中文摘要。
3. 生成网站运行所需的 JSON，并执行全库分类与简介质量门禁。
4. 写入带最新更新时间的完整快照并提交到 `main`。
5. 同一工作流的 deploy job 重新构建并发布网站；普通代码提交由 `.github/workflows/deploy-pages.yml` 发布。

日更流程不调用 OpenAI、Anthropic 或其他大模型 API。GitHub API 使用 Actions 自带的 `GITHUB_TOKEN`，无需保存个人令牌。

`.github/workflows/activate-domain.yml` 每天北京时间 08:35 检查 CNAME、Pages 绑定和 HTTPS 是否正常；它只读验证，不修改 Cloudflare 或 GitHub 配置。

### 5. Supabase 账号与收藏

当前生产项目：

- 项目名：`skillhot`
- Project ref：`kcetjexmnbqdyznnrzwa`
- 区域：Tokyo / `ap-northeast-1`
- Project URL：`https://kcetjexmnbqdyznnrzwa.supabase.co`
- 邮箱注册：已开启，必须完成邮箱确认
- 匿名账号：已关闭；未登录访客仍可浏览公开的静态 Skills 数据
- 数据库：`user_favorites` migration 已应用，RLS 已启用
- GitHub Secrets：已配置 URL 与 publishable key；secret/service-role key 未进入前端

前端通过两个 GitHub Actions Secrets 连接 Supabase：

- `VITE_SUPABASE_URL`：项目 URL，可公开。
- `VITE_SUPABASE_PUBLISHABLE_KEY`：浏览器端 publishable key，可公开；数据安全依赖 RLS，而不是隐藏这个 key。代码仍兼容旧项目的 `VITE_SUPABASE_ANON_KEY`。

数据库初始化 SQL：`supabase/migrations/202606210001_user_favorites.sql`。它创建 `user_favorites`，只授予 authenticated 角色查询、新增、删除权限，并通过 `(select auth.uid()) = user_id` 保证用户只能访问自己的收藏。

新环境重建步骤：

1. 在 Supabase Free Plan 创建 `skillhot` 项目。
2. 打开 SQL Editor，执行上述 migration。
3. Authentication → URL Configuration：Site URL 填 `https://skillhot.savs-ai.com`，Redirect URLs 增加 `https://skillhot.savs-ai.com/**` 和本地开发地址。
4. 保持 Email provider 开启，并保持 Confirm email 开启。
5. 把项目 URL 与 anon key 写入 GitHub Actions Secrets，重新运行部署工作流。

Supabase Free Plan 当前包含 50,000 MAU 与 500 MB 数据库，足够早期使用。内置邮件服务仅适合试用，项目级合计 2 封/小时；正式开放注册前应配置自有 SMTP。Custom SMTP 在 Free Plan 可用，不需要升级 Supabase 套餐。

生产验证结果：匿名请求收藏表返回 HTTP 401；临时已确认用户读取返回 200、写入自己的收藏返回 201、伪造其他 `user_id` 返回 403、删除自己的收藏返回 204。临时测试用户已删除。

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
pnpm test:e2e
```

`pnpm test:e2e` 通过 Playwright 的 `channel: chrome` 明确调用 Google Chrome，而不是系统默认的 Edge。当前自动化覆盖：

- 搜索 `cc-switch` 后只展示一组去重结果，并核验“Agent工具与平台”分类与中文简介。
- 搜索 `superpowers` 后核验“编程开发”分类。
- 详情栏的作者原始描述、分类置信度、安装与平台信息。
- 访客收藏跳转登录、榜单/分类导航。
- 页面不存在 CSV 导出、下载开放数据或 `skills.csv` 链接。
- 390 × 844 窄屏下的筛选抽屉和分类页。

### 全库语义审计

- `scripts/audit-catalog-local.py`：一次性使用本地 Qwen3.5 翻译作者描述，不调用付费 API。
- `scripts/catalog-review.json`：按仓库描述指纹缓存 1,502 条审核结果。
- `scripts/catalog-taxonomy.mjs`：名称/作者描述高权重、Topics 低权重的确定性分类。
- `scripts/rebuild-reviewed-catalog.mjs`：重建当前快照并生成 `docs/CATALOG_AUDIT.md`。
- 每日任务只复用审核缓存和确定性规则，付费模型 Token 为 0。

### 横屏介绍视频

视频工程：`video/skillhot-intro/`

- 1920 × 1080 / 30fps / 72 秒。
- 素材：真实 Google Chrome 网站录屏与页面截图。
- 旁白：本机 Qwen TTS 克隆 Sav 同学音色，离线生成并用本地 Whisper 转录校对。
- 动画：HyperFrames + GSAP，包含推入、模糊交叉、zoom-through 和字幕时间线。
- 最终成片：`video/skillhot-intro/renders/skillhot-intro.mp4`（本地交付，不提交 Git）。

重新渲染：

```bash
cd "/Volumes/Mac SN7100/Documents/codex图文/skillhot/video/skillhot-intro"
pnpm install
pnpm exec hyperframes lint
pnpm exec hyperframes validate
pnpm exec hyperframes render -o renders/skillhot-intro.mp4 --quality high --fps 30 --video-frame-format png
```

本地账号联调：

```bash
cp .env.example .env.local
# 填入 VITE_SUPABASE_URL 与 VITE_SUPABASE_PUBLISHABLE_KEY
pnpm dev
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

先查看 `Update SkillHot data` 的 update 与 deploy 两个 job 是否成功；普通代码提交则查看 `Deploy SkillHot to GitHub Pages`。GitHub Pages CDN 通常会在几分钟内完成刷新。

### 自定义域名打不开

检查 Cloudflare 中 `skillhot` 是否仍为 CNAME、目标是否为 `savanna0425.github.io`、代理是否为 `DNS only`。不要把它改成腾讯云服务器 IP。

### GitHub API 限流

Actions 任务使用仓库 `GITHUB_TOKEN`，配额足以完成每日一次更新。如果手动连续触发多次导致限流，等待配额恢复即可；现有线上数据不会受影响。

### 自动任务没有提交

查看 `Validate generated data` 是否因缺少必需来源、字段或分类而阻止提交。验证门禁失败时，旧版线上数据会继续保留，不会发布不完整快照。

### 登录页提示“登录服务等待部署配置”

检查 GitHub 仓库的 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_PUBLISHABLE_KEY` 是否存在，并确认最近一次 Pages 构建步骤已读取它们。Vite 环境变量在构建时写入产物，因此修改 Secret 后必须重新部署。

### 收到登录但看不到收藏

在 Supabase Table Editor 确认 `user_favorites` 已创建并启用 RLS；在 SQL Editor 检查三条策略。不要为了排错关闭 RLS，也不要把 service role key 放进前端或 GitHub Pages。

## 安全与费用

- 仓库不保存 Cloudflare 登录信息、个人 GitHub Token、SSH 密钥或服务器密码。
- GitHub Pages、GitHub Actions 公共仓库额度与 Cloudflare DNS 当前均可零额外服务器成本运行。
- 日更不使用大模型，保持更新成本和结果可预测。
- Supabase Free 项目一周无活动会暂停；需要时可在 Dashboard 恢复，数据仍会保留。
- 腾讯云 CVM 上的 Sav's API 与本项目相互独立，SkillHot 故障不会影响 API 服务。
