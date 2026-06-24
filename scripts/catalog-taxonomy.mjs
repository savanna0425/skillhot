import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

export const categoryMeta = {
  'UI设计': '界面、体验、设计系统与视觉质量工作流',
  '编程开发': '开发、调试、评审、测试、架构与工程交付',
  '办公效率': '文档、表格、邮件、日历、笔记与个人生产力',
  '内容创作': '图片、视频、演示、写作、音频与社交内容生产',
  '数据分析': 'SQL、数据处理、统计、可视化与商业分析',
  '研究学习': '科研、知识检索、文献、教学、学习与推理工作流',
  '自动化': '浏览器、网页抓取、工具集成与重复流程自动化',
  '安全': '安全审计、漏洞研究、威胁分析与合规',
  '记忆与上下文': '长期记忆、RAG、上下文压缩、知识图谱与检索',
  'Agent工具与平台': 'Agent 客户端、模型切换、网关、运行环境与编排平台',
  '产品与商业': '产品管理、营销增长、销售、金融与商业工作流',
  '技能开发': '创建、验证、安装、管理与分发 Skills 的基础设施',
  '技能合集': '官方或社区维护的 Skills、插件与资源目录',
  '其他': '尚未归入主要类别的实用项目',
}

export const categoryAliases = {
  '官方合集': '技能合集',
  '技能框架': '技能开发',
  '编程工程': '编程开发',
  '研究知识': '研究学习',
  '效率工具': '办公效率',
  '智能体平台': 'Agent工具与平台',
  'Agent平台': 'Agent工具与平台',
}

const categoryPatterns = {
  'UI设计': [
    [/\bui\b|\bux\b|ui.?ux|user interface|user experience|design system|visual design|web design|figma|wireframe|prototyp/i, 9],
    [/accessibility|a11y|responsive design|typography|design language/i, 5],
  ],
  '编程开发': [
    [/software development|coding|codebase|developer|engineering|programming|debug|testing?|code review|refactor|architecture|devops|ci\/cd/i, 7],
    [/frontend|backend|full.?stack|react|vue|angular|typescript|javascript|python|java|rust|swift|\.net|database|api development/i, 5],
    [/sdlc|spec.?driven|test.?driven|tdd|implementation|build software|coding agent/i, 8],
  ],
  '办公效率': [
    [/office|productivity|workspace|obsidian|notion|calendar|gmail|email|google docs|google sheets|document|pdf|word|excel|note.?taking/i, 7],
    [/meeting|task management|personal knowledge|knowledge base|drive|slack|outlook/i, 5],
  ],
  '内容创作': [
    [/image generation|video|slides?|ppt|presentation|writing|copywriting|social media|audio|podcast|media creation|content creation/i, 8],
    [/illustration|storytelling|subtitle|voice|music|photography|animation|markdown publishing/i, 5],
  ],
  '数据分析': [
    [/data analy|analytics|business intelligence|\bbi\b|sql|statistics|visualization|dashboard|spreadsheet analysis|data science/i, 8],
    [/pandas|jupyter|chart|dataset|etl|data pipeline/i, 4],
  ],
  '研究学习': [
    [/research|scientific|academic|paper|literature|citation|bibliograph|experiment|biology|chemistry|medical|learning|education|teaching|study|reasoning/i, 7],
    [/notebooklm|deep research|fact.?check|knowledge discovery|course|exam|interview coach/i, 5],
  ],
  '自动化': [
    [/browser automation|web automation|scrap|crawl|workflow automation|rpa|integration|web.?pilot|computer use/i, 9],
    [/automate|automation|scheduled|pipeline|batch processing|webhook|no.?code workflow/i, 5],
  ],
  '安全': [
    [/cybersecurity|security audit|secure coding|vulnerab|pentest|penetration test|threat|malware|forensic|owasp|red team|compliance/i, 9],
    [/privacy|secret scan|supply chain security|risk assessment/i, 5],
  ],
  '记忆与上下文': [
    [/long.?term memory|persistent memory|agent memory|context management|context engineering|context compression|knowledge graph|retrieval|\brag\b/i, 9],
    [/vector database|semantic search|context layer|remember|memory/i, 5],
  ],
  'Agent工具与平台': [
    [/agent platform|agent framework|agent harness|multi.?agent|agent runtime|agent orchestr|agent operating system|personal ai assistant/i, 9],
    [/model switch|provider management|model gateway|llm gateway|ai client|chat client|desktop assistant|ai workspace|model router/i, 10],
    [/claude code.*codex|codex.*claude code|openclaw|opencode|mcp client|mcp server/i, 4],
  ],
  '产品与商业': [
    [/product management|product manager|marketing|growth|seo|sales|finance|business|startup|customer research|career|recruit|conversion rate|\bcro\b/i, 8],
    [/pricing|go.?to.?market|market research|app store optimization|ecommerce/i, 5],
  ],
  '技能开发': [
    [/skill creator|skill generator|skill builder|skill validator|skill installer|skill manager|skills? specification|skills? standard/i, 11],
    [/(?:create|generate|convert|build|validate|package|install|manage).{0,30}(?:agent )?skills?|skills?.{0,30}(?:creation|generator|validator|installer|manager)/i, 8],
  ],
}

const collectionPattern = /awesome|collection|directory|marketplace|registry|catalog|curated list|skill library|skills library|plugin library|resource list/i
const collectionSubject = /skills?|agents?|claude|codex|copilot|gemini|openclaw|mcp|plugins?|prompts?|resources?/i

const manualCategories = new Map(Object.entries({
  'obra/superpowers': '编程开发',
  'affaan-m/ECC': '编程开发',
  'farion1231/cc-switch': 'Agent工具与平台',
  'SaladDay/cc-switch-cli': 'Agent工具与平台',
  'danny-avila/LibreChat': 'Agent工具与平台',
  'NousResearch/hermes-agent': 'Agent工具与平台',
  'nexu-io/html-anything': '内容创作',
  'addyosmani/web-quality-skills': '编程开发',
  'codex-team/editor.js': '编程开发',
  'ogulcancelik/herdr': 'Agent工具与平台',
  'ParthJadhav/app-store-screenshots': '内容创作',
  'fantastic-admin/basic': '编程开发',
  'supreme-gg-gg/instagram-cli': '其他',
  'meodai/skill.color-expert': 'UI设计',
  'lahfir/agent-desktop': '自动化',
  'agents-io/PokeClaw': '自动化',
  'lobehub/lobehub': 'Agent工具与平台',
  'paperclipai/paperclip': 'Agent工具与平台',
  'bytedance/deer-flow': 'Agent工具与平台',
  'coreyhaines31/marketingskills': '产品与商业',
  'Imbad0202/academic-research-skills': '研究学习',
  'ruvnet/RuView': '其他',
  'laravel/laravel': '编程开发',
}))

function normalizedRepo(repo) {
  return {
    fullName: repo.full_name || repo.fullName || '',
    name: repo.name || '',
    description: (repo.description || '').trim(),
    topics: repo.topics || repo.repoTopics || [],
  }
}

export function classifyCategory(input, override = {}) {
  const repo = normalizedRepo(input)
  const manual = manualCategories.get(repo.fullName)
  if (manual) return { category: manual, confidence: '人工复核', reason: '重点项目人工校正' }

  if (override?.category) {
    const category = categoryAliases[override.category] || override.category
    if (categoryMeta[category]) return { category, confidence: '人工复核', reason: '精选项目人工校正' }
  }

  const primary = `${repo.fullName} ${repo.name} ${repo.description}`
  const topicText = repo.topics.join(' ')
  const scores = new Map(Object.keys(categoryMeta).map((category) => [category, 0]))
  const reasons = new Map(Object.keys(categoryMeta).map((category) => [category, []]))

  if (collectionPattern.test(primary) && collectionSubject.test(primary)) {
    scores.set('技能合集', 24)
    reasons.get('技能合集').push('名称或作者描述明确说明是目录/合集')
  }

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const [pattern, weight] of patterns) {
      if (pattern.test(primary)) {
        scores.set(category, scores.get(category) + weight)
        reasons.get(category).push(pattern.source.slice(0, 54))
      }
      if (pattern.test(topicText)) scores.set(category, scores.get(category) + Math.max(1, Math.round(weight * 0.2)))
    }
  }

  // "Claude/Codex skills for X" should be categorized by X, not by the host.
  if (/skills?/i.test(primary) && scores.get('Agent工具与平台') <= 4) scores.set('Agent工具与平台', 0)
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1] || Object.keys(categoryMeta).indexOf(a[0]) - Object.keys(categoryMeta).indexOf(b[0]))
  const [category, score] = ranked[0]
  const runnerUp = ranked[1][1]
  if (!score) return { category: '其他', confidence: '待复核', reason: '元数据没有足够的用途信号' }
  return {
    category,
    confidence: score >= 10 && score - runnerUp >= 3 ? '高' : score >= 6 ? '中' : '待复核',
    reason: reasons.get(category)[0] || '仓库 Topic 弱信号',
  }
}

export function scenariosFor(category) {
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
    'Agent工具与平台': ['模型与客户端管理', 'Agent 编排', '多平台协作'],
    '产品与商业': ['产品管理', '营销增长', '商业决策'],
    '其他': ['能力探索', '流程扩展', '开源工具试用'],
  }[category]
}

export function usageFor(category) {
  if (category === '技能合集') return '先在仓库目录中选择目标 Skill，再按 README 将对应目录复制或安装到你的 Agent Skills 目录。'
  if (category === '技能开发') return '按 README 安装工具或 CLI，使用其命令创建、验证、安装或管理 Skills。'
  if (category === 'Agent工具与平台') return '按 README 安装客户端或服务，配置模型提供商与凭据后，在对应界面或命令行使用。'
  return '阅读仓库 README 的安装要求，将 Skill、插件或工具接入对应环境，再按文档触发工作流。'
}

function descriptionHash(repo) {
  const normalized = normalizedRepo(repo)
  return createHash('sha256').update(`${normalized.fullName}\n${normalized.description}`).digest('hex').slice(0, 16)
}

let catalogReview = { items: {} }
try {
  catalogReview = JSON.parse(readFileSync(new URL('./catalog-review.json', import.meta.url), 'utf8'))
} catch {
  // The first bootstrap run intentionally works before the optional local review cache exists.
}

export function reviewedSummaryFor(repo) {
  const normalized = normalizedRepo(repo)
  const review = catalogReview.items?.[normalized.fullName]
  if (!review || review.descriptionHash !== descriptionHash(repo)) return ''
  return review.summary || ''
}

function cleanChineseDescription(description) {
  const cleaned = description
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/([。！？；])\s+[A-Za-z][\x00-\x7F\s]{24,}$/s, '$1')
    .trim()
  // English-first bilingual descriptions carry their Chinese past the first 120 chars
  // (e.g. "Reverse Engineering ... 逆向/渗透/安全技能路由包 ..."). If the head has no
  // Chinese, start from the first CJK character so the summary keeps the Chinese part.
  const firstCJK = cleaned.search(/[㐀-鿿]/)
  const body = firstCJK > 0 && !/[㐀-鿿]/.test(cleaned.slice(0, 120)) ? cleaned.slice(firstCJK) : cleaned
  return body.slice(0, 120)
}

export function summaryFor(repo, category, override = {}) {
  if (override.summary) return override.summary
  const reviewed = reviewedSummaryFor(repo)
  if (reviewed) return reviewed
  const normalized = normalizedRepo(repo)
  const description = normalized.description
  if (/[\u3400-\u9fff]/.test(description)) {
    const cleaned = cleanChineseDescription(description)
    if (/[\u3400-\u9fff]/.test(cleaned)) return cleaned
  }
  const name = normalized.name
  const text = `${normalized.fullName} ${description} ${normalized.topics.join(' ')}`
  if (category === '技能合集') return `${name} 汇总相关 Skills、插件与社区资源，方便集中发现和选型。`
  if (category === '技能开发') return `${name} 用于创建、验证、安装或管理 Agent Skills。`
  if (category === 'Agent工具与平台' && /switch|provider|gateway|router/i.test(text)) return `${name} 用于统一切换和管理不同 AI 模型、提供商或 Agent 配置。`
  if (category === 'Agent工具与平台') return `${name} 是用于运行、管理或编排 AI Agent 的开源工具。`
  if (category === '编程开发') return `${name} 聚焦软件开发、代码质量与工程交付。`
  if (category === 'UI设计') return `${name} 帮助改进界面设计、用户体验与视觉质量。`
  if (category === '安全') return `${name} 聚焦安全审计、漏洞检查与风险治理。`
  if (category === '研究学习') return `${name} 支持资料研究、知识检索或学习任务。`
  if (category === '记忆与上下文') return `${name} 提供记忆、上下文管理或知识检索能力。`
  if (category === '自动化') return `${name} 用于自动化浏览器、工具集成或重复流程。`
  return `${name}：${categoryMeta[category] || categoryMeta['其他']}。`
}

export function semanticQualityIssues(skill) {
  const issues = []
  if (!categoryMeta[skill.category]) issues.push('unknown-category')
  if (!/[\u3400-\u9fff]/.test(skill.summary || '')) issues.push('summary-not-chinese')
  if ((skill.summary || '').length < 8) issues.push('summary-too-short')
  if (/可用于扩展 Agent 的实际工作能力|是一个面向.+的开源项目/.test(skill.summary || '')) issues.push('generic-summary')
  if (/(\S{2,8})\1{4,}/.test(skill.summary || '')) issues.push('repeated-summary')
  // 用途启发式仅用于纠正自动分类；人工复核（curated/manual）的类别以人工判断为准，
  // 不被针对上游一句话描述的正则否决（例如 anthropics/skills 被人工标为官方合集，
  // 但其 GitHub 描述 "Public repository for Agent Skills" 命中不了合集关键词）。
  const humanCurated = skill.categoryConfidence === '人工复核'
  if (!humanCurated && skill.category === 'UI设计' && !/\bui\b|\bux\b|design|figma|interface|experience|color|palette|typography|accessibility|视觉|界面|设计|色彩/i.test(`${skill.fullName} ${skill.description}`)) issues.push('ui-purpose-mismatch')
  if (!humanCurated && skill.category === '技能合集' && !(collectionPattern.test(`${skill.fullName} ${skill.description}`) && collectionSubject.test(`${skill.fullName} ${skill.description}`))) issues.push('collection-purpose-mismatch')
  return issues
}
