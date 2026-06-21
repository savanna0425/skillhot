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
const trackedTopics = [
  ...primaryTopics,
  'ai-skills',
  'agentic-skills',
  'ai-agent-skills',
  'claude-code-skills',
  'claude-code-skill',
  'anthropic-skills',
  'codex-skills',
  'openai-codex-skills',
  'openclaw-skills',
  'karpathy-skills',
  'mcp-skills',
]

const repositoryQueries = [
  '"SKILL.md" in:readme archived:false fork:false stars:>20',
  '"agent skills" in:name,description,readme archived:false fork:false stars:>20',
  '"claude skills" in:name,description,readme archived:false fork:false stars:>20',
  '"codex skills" in:name,description,readme archived:false fork:false stars:>10',
  '"openclaw skills" in:name,description,readme archived:false fork:false stars:>10',
  '"AI skills" in:name,description archived:false fork:false stars:>20',
]

const curatedRepositories = [
  'KKKKhazix/Khazix-Skills',
  'alchaincyf/karpathy-skill',
  'PBNZ/newton-skill',
  'op7418/guizang-ppt-skill',
  'mattpocock/skills',
  'garrytan/gstack',
  'affaan-m/ECC',
  'pbakaus/impeccable',
  'nvidia/skills',
  'dotnet/skills',
  'agentskills/agentskills',
  'googleworkspace/cli',
  'phuryn/pm-skills',
  'dpearson2699/swift-ios-skills',
  'ComposioHQ/awesome-codex-skills',
  'hashgraph-online/awesome-codex-plugins',
]

const maxRepositories = 600

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
  'KKKKhazix/Khazix-Skills': {
    summary: '数字生命卡兹克开源的 AI Skills 合集，包含 AIHot 资讯查询等实用技能',
    category: '技能合集',
    scenarios: ['AI 资讯追踪', '中文工作流', '跨平台技能安装'],
  },
  'alchaincyf/karpathy-skill': {
    summary: '把 Andrej Karpathy 的思考方式整理成可运行的认知技能',
    category: '研究学习',
    scenarios: ['第一性原理思考', '技术判断', '深度对话'],
  },
  'PBNZ/newton-skill': {
    summary: '受 Karpathy 方法启发的严谨推理与观点校准技能',
    category: '研究学习',
    scenarios: ['严谨推理', '观点辩论', '信息核验'],
  },
  'mattpocock/skills': {
    summary: '来自资深工程师实践的开发技能集合',
    category: '编程开发',
    scenarios: ['TypeScript 工程', '代码质量', '开发工作流'],
  },
  'garrytan/gstack': {
    summary: '覆盖产品、设计、工程、发布与质量保障的完整 Claude Code 工作栈',
    category: '产品与商业',
    scenarios: ['产品开发', '创业团队协作', '端到端发布'],
  },
  'pbakaus/impeccable': {
    summary: '帮助编程智能体产出更专业界面的设计语言与技能',
    category: 'UI设计',
    scenarios: ['界面设计', '视觉质量提升', '设计系统'],
  },
  'nvidia/skills': {
    summary: 'NVIDIA 官方维护并验证的 Agent Skills 目录',
    category: '技能合集',
    scenarios: ['CUDA-X 开发', 'NVIDIA 平台', '官方技能复用'],
  },
  'dotnet/skills': {
    summary: '.NET 团队为 C# 与 .NET 编程智能体维护的官方技能',
    category: '编程开发',
    scenarios: ['.NET 开发', '性能诊断', '数据访问'],
  },
  'googleworkspace/cli': {
    summary: '统一操作 Drive、Gmail、Calendar、Sheets 与 Docs，并提供 Agent Skills',
    category: '办公效率',
    scenarios: ['Google Workspace', '办公自动化', '邮件与文档处理'],
  },
  'phuryn/pm-skills': {
    summary: '覆盖产品发现、策略、执行、发布与增长的产品经理技能市场',
    category: '产品与商业',
    scenarios: ['产品管理', '用户研究', '发布与增长'],
  },
  'dpearson2699/swift-ios-skills': {
    summary: '面向 Swift、SwiftUI 与现代 Apple 框架的 Agent Skills',
    category: '编程开发',
    scenarios: ['iOS 开发', 'SwiftUI', 'Apple 平台'],
  },
}

const categoryRules = [
  ['技能合集', /awesome|collection|directory|marketplace|registry|catalog|skills?\s+library/i],
  ['UI设计', /\bui\b|\bux\b|ui.?ux|design system|web design|frontend design|visual design|figma/i],
  ['安全', /security|secure|vulnerab|pentest|audit|threat|malware|forensic|owasp/i],
  ['数据分析', /data analy|analytics|sql|spreadsheet|statistics|visualization|business intelligence|\bbi\b/i],
  ['记忆与上下文', /memory|context|mem\b|rag|retrieval|knowledge graph/i],
  ['办公效率', /office|productivity|workspace|obsidian|calendar|gmail|docs|sheets|notion|pdf|document/i],
  ['内容创作', /image|video|slide|ppt|content|writing|copywriting|social|audio|presentation|media/i],
  ['研究学习', /research|scient|paper|literature|notebook|knowledge|biology|chemistry|medical|academic|learning|reasoning/i],
  ['自动化', /automation|automate|browser|scrap|crawl|workflow|web.?pilot|integration/i],
  ['产品与商业', /product.?manag|marketing|growth|seo|sales|finance|business|career|startup/i],
  ['编程开发', /code|coding|developer|engineering|react|frontend|backend|full.?stack|debug|test|review|database|swift|dotnet/i],
  ['技能开发', /framework|methodology|skill.?seek|skill.?creator|generate.?skill|skill.?manager|standard|specification/i],
  ['Agent平台', /agent|claude|codex|copilot|gemini|openclaw|opencode|multi.?agent/i],
]

const categoryMeta = {
  'UI设计': '界面、体验、设计系统与视觉质量工作流',
  '编程开发': '开发、调试、评审、测试与性能优化',
  '办公效率': '文档、表格、邮件、日历与个人生产力',
  '内容创作': '图片、视频、演示、写作与社交内容生产',
  '数据分析': 'SQL、表格、统计、可视化与商业分析',
  '研究学习': '科研、知识检索、文献、学习与推理工作流',
  '自动化': '浏览器、网页、集成与重复流程自动化',
  '安全': '安全审计、漏洞研究、威胁分析与合规',
  '记忆与上下文': '长期记忆、上下文压缩、检索与续接',
  'Agent平台': '多智能体、插件生态与通用 Agent 能力',
  '产品与商业': '产品管理、营销增长、销售与商业工作流',
  '技能开发': '创建、安装、组织与运行 Skills 的基础设施',
  '技能合集': '官方或社区维护的大型技能库与导航',
  '其他': '尚未归入主要类别的实用 Skill 项目',
}

const categoryAliases = {
  '官方合集': '技能合集',
  '技能框架': '技能开发',
  '编程工程': '编程开发',
  '研究知识': '研究学习',
  '效率工具': '办公效率',
  '智能体平台': 'Agent平台',
}

const curatedByLowerName = new Map(Object.entries(curated).map(([name, value]) => [name.toLowerCase(), value]))
const curatedFor = (fullName) => curatedByLowerName.get(fullName.toLowerCase())

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

function relevantRepo(repo, sourceTopics, channels) {
  if (channels.includes('精选来源')) return true
  const text = [repo.name, repo.full_name, repo.description, ...(repo.topics || [])].join(' ')
  const nameHasSkill = /skill/i.test(repo.name)
  const skillTopic = (repo.topics || []).some((topic) => /(?:^|-)skills?(?:-|$)|agentic-skill/i.test(topic))
  const descriptionConnectsSkillToAgents = /(?:agent|ai|claude|codex|copilot|gemini|openclaw|opencode|mcp).{0,64}skills?|skills?.{0,64}(?:agent|ai|claude|codex|copilot|gemini|openclaw|opencode|mcp)/i.test(text)
  const trustedTopic = sourceTopics.some((topic) => !['skill', 'skills'].includes(topic))
  return nameHasSkill || skillTopic || descriptionConnectsSkillToAgents || (trustedTopic && /agent|claude|codex|skill/i.test(text))
}

function categoryFor(repo) {
  const override = curatedFor(repo.full_name)
  if (override?.category) {
    return categoryAliases[override.category] || override.category
  }
  const text = [repo.name, repo.description, ...(repo.topics || [])].join(' ')
  for (const [category, matcher] of categoryRules) {
    if (matcher.test(text)) return category
  }
  return '其他'
}

function scenariosFor(category) {
  return {
    'UI设计': ['界面设计', '设计系统', '体验质量检查'],
    '编程开发': ['软件开发', '代码质量', '工程自动化'],
    '办公效率': ['文档与表格', '邮件与日历', '个人生产力'],
    '内容创作': ['内容生产', '视觉创作', '多媒体工作流'],
    '数据分析': ['数据处理', 'SQL 与表格', '分析与可视化'],
    '研究学习': ['资料调研', '知识检索', '学习与推理'],
    '自动化': ['重复任务', '浏览器操作', '跨工具集成'],
    '安全': ['代码审计', '漏洞研究', '安全合规'],
    '技能合集': ['发现新技能', '按领域选型', '构建个人技能库'],
    '技能开发': ['创建技能', '组织工作流', '扩展 Agent 能力'],
    '记忆与上下文': ['长期任务', '跨会话续接', '上下文管理'],
    'Agent平台': ['Agent 编排', '能力扩展', '多平台协作'],
    '产品与商业': ['产品管理', '营销增长', '商业决策'],
    '其他': ['能力探索', '流程扩展', '开源工具试用'],
  }[category]
}

function usageFor(category) {
  if (category === '技能合集') {
    return '先在仓库目录中选择目标 Skill，再按其 README 将对应目录复制或安装到你的 Agent Skills 目录。'
  }
  if (category === '技能开发') {
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
    .find((block) => /(?:git clone|npx |bunx |pnpm |npm |pipx? install|uv tool|brew install|skills? add|claude plugin)/i.test(block))
  if (!candidate) return fallback
  const normalized = candidate
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => line.trim())
    .slice(0, 3)
    .join('\n')
    .slice(0, 360)
  return normalized || fallback
}

function platformsFor(repo, markdown) {
  const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')} ${markdown.slice(0, 12000)}`
  const platforms = [
    ['Claude', /claude/i],
    ['Codex', /codex/i],
    ['Cursor', /cursor/i],
    ['Gemini CLI', /gemini/i],
    ['GitHub Copilot', /copilot/i],
    ['OpenClaw', /openclaw/i],
    ['OpenCode', /opencode/i],
    ['Antigravity', /antigravity/i],
  ].filter(([, matcher]) => matcher.test(text)).map(([name]) => name)
  return platforms.length ? platforms.slice(0, 6) : ['Agent Skills']
}

function skillCountFor(markdown) {
  const matches = [...markdown.matchAll(/(?:over\s+|more than\s+|\b)([\d,]{1,6})\+?\s+(?:agent\s+)?skills?/gi)]
    .map((match) => Number(match[1].replaceAll(',', '')))
    .filter((value) => Number.isFinite(value) && value > 1 && value < 100000)
  return matches.length ? Math.max(...matches) : 1
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
  const sourceTopics = [...new Set([...trackedTopics, ...discovered.filter(relevantTopic)])]
  const repositories = new Map()

  const addRepository = (repo, { topic = '', channel = '' } = {}) => {
    const current = repositories.get(repo.full_name)
    if (current) {
      if (topic) current.sourceTopics.add(topic)
      if (channel) current.channels.add(channel)
      return
    }
    repositories.set(repo.full_name, {
      repo,
      sourceTopics: new Set(topic ? [topic] : []),
      channels: new Set(channel ? [channel] : []),
    })
  }

  console.log(`Collecting repositories from ${sourceTopics.length} relevant topics…`)
  for (const topic of sourceTopics) {
    const perPage = trackedTopics.includes(topic) ? 100 : 30
    const payload = await github(`/search/repositories?q=topic:${encodeURIComponent(topic)}+archived:false+fork:false&sort=stars&order=desc&per_page=${perPage}`, { search: true })
    payload.items.forEach((repo) => addRepository(repo, { topic, channel: 'GitHub Topics' }))
  }

  console.log(`Collecting repositories from ${repositoryQueries.length} focused searches…`)
  for (const searchQuery of repositoryQueries) {
    const payload = await github(`/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=100`, { search: true })
    payload.items.forEach((repo) => addRepository(repo, { channel: 'GitHub 搜索' }))
  }

  console.log(`Adding ${curatedRepositories.length} official and community sources…`)
  for (let index = 0; index < curatedRepositories.length; index += 8) {
    const batch = curatedRepositories.slice(index, index + 8)
    const results = await Promise.all(batch.map(async (fullName) => {
      try {
        return await github(`/repos/${fullName}`)
      } catch (error) {
        console.warn(`Curated source skipped for ${fullName}: ${error.message}`)
        return null
      }
    }))
    results.filter(Boolean).forEach((repo) => addRepository(repo, { channel: '精选来源' }))
  }

  const allRanked = [...repositories.values()]
    .filter(({ repo, sourceTopics: topics, channels }) => relevantRepo(repo, [...topics], [...channels]))
    .map(({ repo, sourceTopics: topics, channels }) => ({ repo, sourceTopics: [...topics], channels: [...channels] }))
    .map((item) => ({ ...item, score: scoreFor(item.repo, item.sourceTopics) }))
    .sort((a, b) => b.score - a.score || b.repo.stargazers_count - a.repo.stargazers_count)

  const ranked = [...new Map([
    ...allRanked.slice(0, maxRepositories),
    ...allRanked.filter((item) => item.channels.includes('精选来源')),
  ].map((item) => [item.repo.full_name.toLowerCase(), item])).values()]
    .sort((a, b) => b.score - a.score || b.repo.stargazers_count - a.repo.stargazers_count)

  console.log(`Reading installation, platform and media hints for ${ranked.length} repositories…`)
  const readmes = new Map()
  const readmeTargets = ranked
  for (let index = 0; index < readmeTargets.length; index += 10) {
    const batch = readmeTargets.slice(index, index + 10)
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

  const skills = ranked.map(({ repo, sourceTopics: topics, channels, score }, index) => {
    const category = categoryFor(repo)
    const readme = readmes.get(repo.full_name) || ''
    const activity = activityFor(repo.pushed_at)
    const override = curatedFor(repo.full_name) || {}
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
      discoveredBy: channels,
      repoTopics: repo.topics || [],
      platforms: platformsFor(repo, readme),
      skillCount: skillCountFor(readme),
      isCollection: category === '技能合集' || /awesome|collection|library|marketplace|catalog/i.test(`${repo.name} ${repo.description || ''}`),
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

  const topics = sourceTopics.map((name) => {
    const matches = skills.filter((skill) => skill.sourceTopics.includes(name))
    return {
      name,
      url: `https://github.com/topics/${name}`,
      repositories: matches.length,
      activeRepositories: matches.filter((skill) => daysSince(skill.pushedAt) <= 30).length,
      stars: matches.reduce((total, skill) => total + skill.stars, 0),
    }
  }).filter((topic) => topic.repositories > 0)
    .sort((a, b) => b.repositories - a.repositories || b.stars - a.stars)

  const generatedAt = new Date().toISOString()
  const data = {
    meta: {
      generatedAt,
      query,
      topicPages: 3,
      repositories: skills.length,
      sourceTopics: sourceTopics.length,
      discoveryChannels: 3,
      updateMode: 'GitHub REST API + deterministic classification',
    },
    topicPages,
    sourceTopics: sourceTopics.map((name) => ({ name, url: `https://github.com/topics/${name}` })),
    topics,
    categories,
    skills,
  }

  const csvHeaders = ['排名', '仓库', '分类', '简介', 'Stars', '活跃度', '最近推送', '语言', '许可证', '兼容平台', '技能数量', '发现渠道', '来源话题', '适用场景', '用法', '安装命令', '图片', '视频', 'GitHub']
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
    skill.platforms.join(' | '),
    skill.skillCount,
    skill.discoveredBy.join(' | '),
    skill.sourceTopics.join(' | '),
    skill.scenarios.join(' | '),
    skill.howToUse,
    skill.installCommand,
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
