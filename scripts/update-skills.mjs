import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const outputDir = path.join(projectRoot, 'public', 'data')
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const apiBase = 'https://api.github.com'
const query = 'skill'
const primaryTopics = ['skill', 'skills', 'agent-skills', 'claude-skills']

const curated = {
  'obra/superpowers': {
    summary: '一套面向智能体的软件开发方法与技能框架',
    category: '技能框架',
    scenarios: ['复杂软件开发', '规范化 Agent 工作流', '团队工程实践'],
  },
  'anthropics/skills': {
    summary: 'Agent Skills 公共仓库、规范示例与参考实现',
    category: '官方合集',
    scenarios: ['学习 Skills 结构', '复用官方技能', '编写自定义技能'],
  },
  'JuliusBrussee/caveman': {
    summary: '用极简表达压缩 Agent 对话，减少上下文 Token 消耗',
    category: '效率工具',
    scenarios: ['长会话控费', '压缩 Agent 输出', '低带宽协作'],
  },
  'ComposioHQ/awesome-claude-skills': {
    summary: 'Claude Skills、工具与实践资源的精选导航',
    category: '技能合集',
    scenarios: ['发现新技能', '对比技能生态', '搭建个人技能库'],
  },
  'Leonxlnx/taste-skill': {
    summary: '让编程智能体生成更克制、更有设计品位的界面',
    category: '内容创作',
    scenarios: ['网页设计', '前端审美约束', 'UI 质量复核'],
  },
  'addyosmani/agent-skills': {
    summary: '面向生产环境的工程技能合集',
    category: '编程工程',
    scenarios: ['代码评审', '性能优化', '工程交付'],
  },
  'thedotmack/claude-mem': {
    summary: '为多种 Agent 提供跨会话持久上下文与相关记忆检索',
    category: '记忆与上下文',
    scenarios: ['长期项目', '跨会话续接', '上下文召回'],
  },
  'K-Dense-AI/scientific-agent-skills': {
    summary: '把通用 Agent 扩展成覆盖科研数据库与实验流程的 AI 科学家',
    category: '研究知识',
    scenarios: ['文献调研', '生物医药研究', '科学数据库检索'],
  },
  'VoltAgent/awesome-agent-skills': {
    summary: '跨 Claude、Codex、Gemini CLI 等平台的技能精选目录',
    category: '技能合集',
    scenarios: ['跨平台选型', '批量发现技能', '技能生态调研'],
  },
  'OthmanAdi/planning-with-files': {
    summary: '用持久化文件计划承接长任务，抵抗上下文丢失',
    category: '效率工具',
    scenarios: ['长周期任务', '上下文恢复', '多人或多 Agent 协作'],
  },
  'sickn33/antigravity-awesome-skills': {
    summary: '可安装的跨平台 Agent Skills 大型技能库',
    category: '技能合集',
    scenarios: ['批量安装技能', '按领域检索', '构建技能包'],
  },
  'wshobson/agents': {
    summary: '面向多种编程智能体的插件与技能市场',
    category: '智能体平台',
    scenarios: ['多智能体编排', '插件市场', '工程自动化'],
  },
  'github/awesome-copilot': {
    summary: 'GitHub Copilot 社区指令、Agent、Skills 与配置合集',
    category: '技能合集',
    scenarios: ['Copilot 定制', '团队指令复用', 'Agent 配置'],
  },
  'kepano/obsidian-skills': {
    summary: '让 Agent 熟练操作 Obsidian CLI 与 Markdown、Bases、Canvas',
    category: '效率工具',
    scenarios: ['知识库维护', '笔记自动化', '结构化内容管理'],
  },
  'op7418/guizang-ppt-skill': {
    summary: '生成杂志感、瑞士风等高质量 HTML 演示文稿',
    category: '内容创作',
    scenarios: ['演示文稿', '社交封面', 'HTML Slides'],
  },
  'JimLiu/baoyu-skills': {
    summary: '覆盖图文、网页与内容生产的一组实用 Agent Skills',
    category: '内容创作',
    scenarios: ['图文创作', '网页内容', '社交媒体生产'],
  },
  'yusufkaraaslan/Skill_Seekers': {
    summary: '把文档网站、GitHub 仓库和 PDF 自动转换为 Skills',
    category: '技能框架',
    scenarios: ['知识产品化', '文档转技能', '技能生成'],
  },
  'Orchestra-Research/AI-Research-SKILLs': {
    summary: '面向 AI 研究与工程的开源技能库',
    category: '研究知识',
    scenarios: ['AI 论文调研', '实验复现', '研究工程'],
  },
  'joeseesun/qiaomu-anything-to-notebooklm': {
    summary: '把网页、视频、PDF 等多源内容加工后送入 NotebookLM',
    category: '研究知识',
    scenarios: ['资料汇总', '播客与测验生成', '知识研究'],
  },
  'millionco/react-doctor': {
    summary: '自动诊断 Agent 生成的 React 代码质量与常见问题',
    category: '编程工程',
    scenarios: ['React 代码体检', '前端质量门禁', 'Agent 代码审查'],
  },
  'alirezarezvani/claude-skills': {
    summary: '覆盖工程、营销、产品、合规与运营的综合 Skills 套装',
    category: '技能合集',
    scenarios: ['业务工作流', '工程开发', '日常生产力'],
  },
  'teng-lin/notebooklm-py': {
    summary: 'NotebookLM 的 Python API、CLI 与 Agent Skill',
    category: '研究知识',
    scenarios: ['NotebookLM 自动化', '资料研究', '内容生成'],
  },
  'nextlevelbuilder/ui-ux-pro-max-skill': {
    summary: '为 Agent 提供跨平台 UI/UX 设计知识、模式与审美约束',
    category: '内容创作',
    scenarios: ['网页与 App 设计', '设计系统选型', 'UI 质量提升'],
  },
  'VoltAgent/awesome-openclaw-skills': {
    summary: '从官方注册表筛选整理 5,400+ OpenClaw Skills',
    category: '技能合集',
    scenarios: ['OpenClaw 技能发现', '按领域筛选', '技能市场调研'],
  },
  'safishamsi/graphify': {
    summary: '把代码、数据库、文档与多媒体转成可查询知识图谱',
    category: '记忆与上下文',
    scenarios: ['代码库理解', '跨模态知识图谱', '复杂项目检索'],
  },
  'nexu-io/open-design': {
    summary: '本地优先的 AI 设计工作台，内置 259+ Skills 与 142+ 设计系统',
    category: '内容创作',
    scenarios: ['界面原型', '演示与视频', '多平台设计交付'],
  },
  'jeecgboot/JeecgBoot': {
    summary: '内置 AI Skills、知识库与流程编排的 Java 低代码平台',
    category: '编程工程',
    scenarios: ['企业应用开发', '表单与流程生成', 'Java 低代码'],
  },
  'zhayujie/CowAgent': {
    summary: '支持 Skills、记忆与多渠道接入的轻量开源 Agent Harness',
    category: '智能体平台',
    scenarios: ['个人 AI 助手', '多渠道机器人', 'Agent 自进化'],
  },
  'mvanhorn/last30days-skill': {
    summary: '跨 Reddit、X、YouTube、HN 等来源调研最近 30 天热点',
    category: '研究知识',
    scenarios: ['趋势调研', '社交媒体研究', '时效信息综述'],
  },
  'Egonex-AI/Understand-Anything': {
    summary: '把任意代码库转成可搜索、可问答的交互知识图谱',
    category: '记忆与上下文',
    scenarios: ['代码库理解', '架构探索', '新成员上手'],
  },
  'ruvnet/ruflo': {
    summary: '面向 Claude、Codex 的多智能体协作、记忆与 RAG 编排框架',
    category: '智能体平台',
    scenarios: ['多智能体协作', '任务编排', '长期记忆'],
  },
  'CherryHQ/cherry-studio': {
    summary: '集成智能对话、自治 Agent 与 300+ 助手的生产力工作台',
    category: '智能体平台',
    scenarios: ['多模型使用', '自治任务', '个人 AI 工作台'],
  },
  'code-yeongyu/oh-my-openagent': {
    summary: '面向复杂代码库与长任务的高强度编程 Agent Harness',
    category: '编程工程',
    scenarios: ['复杂代码库', '长链路开发', 'Codex 与 OpenCode 编排'],
  },
  'shanraisshan/claude-code-best-practice': {
    summary: '从 Vibe Coding 走向 Agentic Engineering 的 Claude Code 实践库',
    category: '编程工程',
    scenarios: ['Claude Code 工程化', '提示与工作流', '团队最佳实践'],
  },
  'volcengine/OpenViking': {
    summary: '以文件系统范式统一管理 Agent 的记忆、资源与 Skills',
    category: '记忆与上下文',
    scenarios: ['上下文数据库', '分层记忆', 'Agent 自进化'],
  },
  'flipped-aurora/gin-vue-admin': {
    summary: '内置 MCP 与 Skills 管理的 Vue + Gin 企业开发平台',
    category: '编程工程',
    scenarios: ['前后端开发', '后台管理系统', 'AI 辅助编码'],
  },
  'zarazhangrui/frontend-slides': {
    summary: '用编程 Agent 的前端能力生成精美网页演示文稿',
    category: '内容创作',
    scenarios: ['网页 Slides', '视觉演示', '前端动效'],
  },
  'Yuan1z0825/nature-skills': {
    summary: '面向 Nature 风格学术表达与科研绘图的 Skills',
    category: '研究知识',
    scenarios: ['论文写作', '科研绘图', '学术表达'],
  },
}

const categoryRules = [
  ['记忆与上下文', /memory|context|mem\b|rag|retrieval|knowledge graph/i],
  ['研究知识', /research|scient|paper|literature|notebook|knowledge|biology|chemistry|medical|academic/i],
  ['内容创作', /design|image|video|slide|ppt|content|writing|marketing|social|audio|presentation/i],
  ['编程工程', /code|coding|developer|engineering|react|frontend|backend|full.?stack|debug|test|review|security|database/i],
  ['效率工具', /planning|productivity|automation|workspace|obsidian|calendar|docs|sheets|workflow/i],
  ['技能合集', /awesome|collection|directory|marketplace|registry|library|skills?\s+library/i],
  ['技能框架', /framework|methodology|skill.?seek|skill.?creator|generate.?skill|standard/i],
  ['智能体平台', /agent|claude|codex|copilot|gemini|openclaw/i],
]

const categoryMeta = {
  '官方合集': '官方维护的技能规范、示例或目录',
  '技能合集': '按领域整理的大型技能库与导航',
  '技能框架': '创建、安装、组织与运行 Skills 的基础设施',
  '编程工程': '面向开发、调试、评审、测试和性能优化',
  '研究知识': '科研、知识检索、文献与数据工作流',
  '内容创作': '图片、视频、演示、写作与设计生产',
  '记忆与上下文': '长期记忆、上下文压缩、检索与续接',
  '效率工具': '计划、办公自动化与个人生产力',
  '智能体平台': '多智能体、插件生态与通用 Agent 能力',
  '其他': '尚未归入主要类别的实用 Skill 项目',
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let lastSearchAt = 0

async function github(pathname, { search = false } = {}) {
  if (search) {
    const wait = Math.max(0, 2100 - (Date.now() - lastSearchAt))
    if (wait) await sleep(wait)
    lastSearchAt = Date.now()
  }

  const response = await fetch(`${apiBase}${pathname}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'skillhot-daily-indexer',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (response.status === 403 && response.headers.get('x-ratelimit-reset')) {
    const resetAt = Number(response.headers.get('x-ratelimit-reset')) * 1000
    const wait = Math.max(1000, resetAt - Date.now() + 1500)
    console.log(`GitHub rate limit reached; waiting ${Math.ceil(wait / 1000)}s`)
    await sleep(wait)
    return github(pathname, { search })
  }

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${pathname} — ${await response.text()}`)
  }
  return response.json()
}

function relevantTopic(name) {
  if (/alexa|portfolio|education|leetcode|advent-of-code|sports|interview|publishing/i.test(name)) return false
  return /skill|agent|claude|codex|openclaw|clawhub|hermes/i.test(name)
}

function relevantRepo(repo, sourceTopics) {
  const specificSource = sourceTopics.some((topic) => !['skill', 'skills'].includes(topic))
  if (specificSource) return true
  const text = [repo.name, repo.full_name, repo.description].join(' ')
  const nameHasSkill = /skill/i.test(repo.name)
  const descriptionConnectsSkillToAgents = /(?:agent|ai|claude|codex|copilot|gemini|openclaw|mcp).{0,48}skills?|skills?.{0,48}(?:agent|ai|claude|codex|copilot|gemini|openclaw|mcp)/i.test(text)
  return nameHasSkill || descriptionConnectsSkillToAgents
}

function categoryFor(repo) {
  if (curated[repo.full_name]?.category) return curated[repo.full_name].category
  const text = [repo.name, repo.description, ...(repo.topics || [])].join(' ')
  for (const [category, matcher] of categoryRules) {
    if (matcher.test(text)) return category
  }
  return '其他'
}

function scenariosFor(category) {
  return {
    '官方合集': ['学习标准结构', '复用官方示例', '创建自定义技能'],
    '技能合集': ['发现新技能', '按领域选型', '构建个人技能库'],
    '技能框架': ['创建技能', '组织工作流', '扩展 Agent 能力'],
    '编程工程': ['软件开发', '代码质量', '工程自动化'],
    '研究知识': ['资料调研', '知识检索', '研究工作流'],
    '内容创作': ['内容生产', '视觉设计', '多媒体工作流'],
    '记忆与上下文': ['长期任务', '跨会话续接', '上下文管理'],
    '效率工具': ['任务规划', '办公自动化', '个人生产力'],
    '智能体平台': ['Agent 编排', '能力扩展', '多平台协作'],
    '其他': ['能力探索', '流程扩展', '开源工具试用'],
  }[category]
}

function usageFor(category) {
  if (category === '技能合集' || category === '官方合集') {
    return '先在仓库目录中选择目标 Skill，再按其 README 将对应目录复制或安装到你的 Agent Skills 目录。'
  }
  if (category === '技能框架') {
    return '按 README 安装框架或 CLI，初始化项目后通过技能触发说明在 Agent 会话中调用。'
  }
  return '阅读仓库 README 的安装要求，将 Skill 目录或插件接入你的 Agent 环境，再用自然语言触发对应工作流。'
}

function daysSince(iso) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}

function activityFor(pushedAt) {
  const days = daysSince(pushedAt)
  if (days <= 7) return { label: '本周活跃', score: 30 }
  if (days <= 30) return { label: '本月活跃', score: 23 }
  if (days <= 90) return { label: '近期活跃', score: 15 }
  if (days <= 365) return { label: '活跃', score: 7 }
  return { label: '低活跃', score: 0 }
}

function scoreFor(repo, sourceTopics) {
  const activity = activityFor(repo.pushed_at).score
  const starScore = Math.log10(repo.stargazers_count + 10) * 24
  const sourceBonus = Math.min(16, sourceTopics.length * 4)
  const skillBonus = /skill/i.test(`${repo.name} ${repo.description || ''}`) ? 8 : 0
  return Math.round((activity + starScore + sourceBonus + skillBonus) * 10) / 10
}

function decodeReadme(payload) {
  if (!payload?.content || payload.encoding !== 'base64') return ''
  return Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8')
}

function extractVideo(markdown) {
  const match = markdown.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|bilibili\.com\/video\/|vimeo\.com\/|loom\.com\/share\/)[^\s)"'<>]+/i)
  return match?.[0] || ''
}

function extractInstall(markdown, fallback) {
  const blocks = [...markdown.matchAll(/```(?:bash|sh|shell|zsh|console)?\s*\n([\s\S]{1,1200}?)```/gi)]
  const candidate = blocks
    .map((match) => match[1].trim())
    .find((block) => /(?:git clone|npx |pnpm |npm |pipx? install|uv tool|brew install|skills? add|claude plugin)/i.test(block))
  if (!candidate) return fallback
  return candidate
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .slice(0, 3)
    .join('\n')
    .slice(0, 360)
}

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

async function main() {
  console.log('Discovering the first three pages of GitHub topic search…')
  const topicPages = []
  for (let page = 1; page <= 3; page += 1) {
    const payload = await github(`/search/topics?q=${query}&per_page=10&page=${page}`, { search: true })
    topicPages.push({
      page,
      topics: payload.items.map((item) => ({
        name: item.name,
        displayName: item.display_name || item.name,
        description: item.short_description || '',
        url: `https://github.com/topics/${item.name}`,
      })),
    })
  }

  const discovered = topicPages.flatMap((page) => page.topics.map((topic) => topic.name))
  const sourceTopics = [...new Set([...primaryTopics, ...discovered.filter(relevantTopic)])]
  const repositories = new Map()

  console.log(`Collecting repositories from ${sourceTopics.length} relevant topics…`)
  for (const topic of sourceTopics) {
    const perPage = primaryTopics.includes(topic) ? 40 : 10
    const payload = await github(`/search/repositories?q=topic:${encodeURIComponent(topic)}+archived:false+fork:false&sort=stars&order=desc&per_page=${perPage}`, { search: true })
    for (const repo of payload.items) {
      const current = repositories.get(repo.full_name)
      if (current) {
        current.sourceTopics.add(topic)
      } else {
        repositories.set(repo.full_name, { repo, sourceTopics: new Set([topic]) })
      }
    }
  }

  const ranked = [...repositories.values()]
    .filter(({ repo, sourceTopics: topics }) => relevantRepo(repo, [...topics]))
    .map(({ repo, sourceTopics: topics }) => ({ repo, sourceTopics: [...topics] }))
    .map((item) => ({ ...item, score: scoreFor(item.repo, item.sourceTopics) }))
    .sort((a, b) => b.score - a.score || b.repo.stargazers_count - a.repo.stargazers_count)
    .slice(0, 180)

  console.log(`Reading installation and video hints for the top ${Math.min(36, ranked.length)} repositories…`)
  const readmes = new Map()
  const readmeTargets = ranked.slice(0, 36)
  for (let index = 0; index < readmeTargets.length; index += 6) {
    const batch = readmeTargets.slice(index, index + 6)
    const results = await Promise.all(batch.map(async ({ repo }) => {
      try {
        const payload = await github(`/repos/${repo.full_name}/readme`)
        return [repo.full_name, decodeReadme(payload)]
      } catch (error) {
        console.warn(`README skipped for ${repo.full_name}: ${error.message}`)
        return [repo.full_name, '']
      }
    }))
    results.forEach(([name, markdown]) => readmes.set(name, markdown))
  }

  const skills = ranked.map(({ repo, sourceTopics: topics, score }, index) => {
    const category = categoryFor(repo)
    const readme = readmes.get(repo.full_name) || ''
    const activity = activityFor(repo.pushed_at)
    const override = curated[repo.full_name] || {}
    const cloneCommand = `git clone ${repo.html_url}.git`
    return {
      rank: index + 1,
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      avatarUrl: repo.owner.avatar_url,
      url: repo.html_url,
      homepage: repo.homepage || '',
      description: repo.description || '',
      summary: override.summary || repo.description || `${repo.name} 开源项目`,
      category,
      categoryDescription: categoryMeta[category],
      scenarios: override.scenarios || scenariosFor(category),
      howToUse: usageFor(category),
      installCommand: extractInstall(readme, cloneCommand),
      language: repo.language || '',
      license: repo.license?.spdx_id || '',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      score,
      activity: activity.label,
      pushedAt: repo.pushed_at,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      sourceTopics: topics,
      repoTopics: repo.topics || [],
      media: {
        socialPreview: `https://opengraph.githubassets.com/skillhot/${repo.full_name}`,
        videoUrl: extractVideo(readme),
      },
      readmeUrl: `${repo.html_url}#readme`,
    }
  })

  const categories = Object.entries(categoryMeta).map(([name, description]) => ({
    name,
    description,
    count: skills.filter((skill) => skill.category === name).length,
  })).filter((category) => category.count > 0)

  const generatedAt = new Date().toISOString()
  const data = {
    meta: {
      generatedAt,
      query,
      topicPages: 3,
      repositories: skills.length,
      sourceTopics: sourceTopics.length,
      updateMode: 'GitHub REST API + deterministic rules',
      tokenCost: 0,
    },
    topicPages,
    sourceTopics: sourceTopics.map((name) => ({ name, url: `https://github.com/topics/${name}` })),
    categories,
    skills,
  }

  const csvHeaders = ['排名', '仓库', '分类', '简介', 'Stars', '活跃度', '最近推送', '语言', '许可证', '来源话题', '适用场景', '用法', '图片', '视频', 'GitHub']
  const csvRows = skills.map((skill) => [
    skill.rank,
    skill.fullName,
    skill.category,
    skill.summary,
    skill.stars,
    skill.activity,
    skill.pushedAt,
    skill.language,
    skill.license,
    skill.sourceTopics.join(' | '),
    skill.scenarios.join(' | '),
    skill.howToUse,
    skill.media.socialPreview,
    skill.media.videoUrl,
    skill.url,
  ])
  const csv = `\uFEFF${[csvHeaders, ...csvRows].map((row) => row.map(csvEscape).join(',')).join('\n')}\n`

  await mkdir(outputDir, { recursive: true })
  await Promise.all([
    writeFile(path.join(outputDir, 'skills.json'), `${JSON.stringify(data, null, 2)}\n`),
    writeFile(path.join(outputDir, 'skills.csv'), csv),
  ])
  console.log(`Wrote ${skills.length} repositories, ${categories.length} categories and ${topicPages.length} topic pages at ${generatedAt}.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
