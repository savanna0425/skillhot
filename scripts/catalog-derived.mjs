import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { projectProfileFor } from './project-profile-rules.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const defaultOutputDir = path.join(projectRoot, 'public', 'data')

export function detailPathFor(fullName) {
  return `data/details/${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '__').replace(/^__|__$/g, '')}.json`
}

function sourceHashFor(skill) {
  return createHash('sha256').update([
    skill.fullName,
    skill.description,
    skill.summary,
    skill.updatedAt,
    skill.pushedAt,
    ...(skill.repoTopics || []),
  ].join('\n')).digest('hex').slice(0, 16)
}

const sampleProjectProfiles = {
  'obra/superpowers': {
    plainIntro: 'superpowers 是一套给 Claude Code、Codex 这类编程智能体使用的软件开发方法和技能集合，帮助它们按更稳定的流程写代码、测试、评审和交付。',
    whatItIs: '它不是一个单独的 UI 工具，也不是一组零散 prompt，而是一套可以放进 Agent 环境里的软件工程工作方法。你可以把它理解成给编程智能体配的一本团队开发手册：什么时候先计划、什么时候写测试、什么时候调试、什么时候做代码评审，都有对应的 skill 来约束流程。',
    problemSolved: [
      '编程智能体容易跳过计划、测试或复盘，任务一长就开始跑偏。',
      '同一套开发习惯很难稳定复用，每次都要重新写一大段提示词。',
      '团队想让 AI 写代码更像真实工程流程，而不是只靠一次性聊天指令。',
    ],
    coreCapabilities: [
      '让智能体按计划、实现、测试、评审这些步骤推进任务。',
      '把常用软件开发方法沉淀成可重复调用的 skills。',
      '在复杂任务中提醒 Agent 先确认需求、再修改代码、最后验证结果。',
      '帮助你把个人或团队的开发纪律变成 Agent 能执行的工作流。',
    ],
    bestFor: [
      '经常用 Claude Code、Codex、OpenCode 等工具写代码的开发者。',
      '希望 AI 编程过程更稳定、更可复盘的人。',
      '想把团队工程规范沉淀成可复用 Agent 工作流的小团队。',
    ],
    notFor: [
      '只想找一个可视化 UI 组件库或桌面软件的人。',
      '不使用 Claude Code、Codex 或类似编程智能体的人。',
      '只需要一次性 prompt，不打算维护长期工作流的人。',
    ],
    howItWorks: [
      '仓库提供一组面向软件开发流程的 skills 和方法说明。',
      '你把需要的 skill 安装到对应 Agent 环境后，在任务中让 Agent 调用它。',
      'Agent 会按 skill 里的流程提醒自己：先理解问题，再计划，再实现，再验证。',
    ],
    gettingStarted: [
      '先打开 README，确认你的 Agent 工具是否支持这种 skill 组织方式。',
      '把仓库里的相关 skill 复制或安装到自己的 Agent Skills 目录。',
      '用一个小代码任务试跑，观察它是否真的按计划、测试、评审流程执行。',
    ],
    expectedOutcome: [
      'AI 写代码时更少跳步骤，长任务更容易保持纪律。',
      '重复的开发方法可以被复用，而不是每次重新写提示词。',
      '你能更快判断一次 AI 改动是否经过了必要的验证。',
    ],
    caveats: [
      '它提供的是方法和 skill 框架，不会替你自动保证代码质量。',
      '不同 Agent 工具的 skill 安装方式可能不同，仍要按 README 核对。',
      '如果你的团队流程很特殊，需要基于它再改成自己的版本。',
    ],
  },
  'anthropics/skills': {
    plainIntro: 'anthropics/skills 是 Agent Skills 的官方公共仓库，集中放了 Anthropic 提供的规范示例和参考实现，适合用来学习一个 Skill 应该怎么组织、描述和交付。',
    whatItIs: '它更像一个官方样板间，而不是单个业务工具。你可以在这里看 Anthropic 如何组织 Agent Skills：目录结构怎么放、说明文档怎么写、技能边界怎么定义，以及一个可复用 skill 应该交代哪些信息。',
    problemSolved: [
      '想写自己的 skill，但不知道标准结构和说明应该长什么样。',
      '网上有很多零散示例，难判断哪些写法更接近官方推荐。',
      '团队需要一个参考仓库，统一内部 skills 的命名、描述和交付方式。',
    ],
    coreCapabilities: [
      '提供官方 Agent Skills 示例，方便学习结构和写法。',
      '作为创建自定义 skills 时的参考模板。',
      '帮助团队统一 skill 文档、入口和使用说明的风格。',
    ],
    bestFor: [
      '准备创建或维护 Agent Skills 的开发者。',
      '想研究 Anthropic 官方 skill 设计方式的人。',
      '需要给团队建立 skills 规范的技术负责人。',
    ],
    notFor: [
      '想直接找某个垂直业务工具的人。',
      '不打算自己创建或改造 skills 的普通使用者。',
    ],
    howItWorks: [
      '仓库按 skill 示例和说明组织内容。',
      '你可以复制其中的结构，改成自己的领域能力。',
      '也可以把它当作检查清单，对照自己的 skill 是否说明清楚。',
    ],
    gettingStarted: [
      '先阅读 README，了解官方对 Agent Skills 的基本组织方式。',
      '选择一个与你需求接近的示例，观察它的目录和说明文档。',
      '用同样结构新建自己的 skill，再在 Agent 环境里测试。',
    ],
    expectedOutcome: [
      '更快理解官方 skill 的写法，不从零摸索。',
      '写出来的 skill 更容易被别人理解、安装和复用。',
      '团队内部的 skills 更统一，后续维护成本更低。',
    ],
    caveats: [
      '它主要是示例和参考，不等于所有 skill 都能直接解决你的业务问题。',
      '官方仓库会变化，具体格式仍以最新 README 为准。',
    ],
  },
  'farion1231/cc-switch': {
    plainIntro: 'cc-switch 是一个用来管理 Claude Code、Codex 等编程智能体配置和模型服务的工具，适合在多个 Agent、模型或 API 配置之间快速切换。',
    whatItIs: '它解决的是“我有好几个编程智能体和模型配置，不想每次手动改环境变量或配置文件”的问题。你可以把它理解成一个 Agent 配置切换器：把不同模型、不同服务商、不同工具的配置整理起来，需要时一键切换。',
    problemSolved: [
      '同时使用 Claude Code、Codex 或其他 Agent 时，配置容易混乱。',
      '不同模型服务的 API 地址、Key、模型名经常要手动切换。',
      '临时改配置容易出错，也不方便回到之前的工作环境。',
    ],
    coreCapabilities: [
      '集中管理多个 Agent 或模型服务配置。',
      '在不同 Claude Code、Codex 或模型提供商配置之间快速切换。',
      '减少手动改配置文件、环境变量带来的错误。',
    ],
    bestFor: [
      '同时使用多个编程智能体或模型服务的开发者。',
      '经常在不同 API 提供商、模型或项目环境之间切换的人。',
      '想把本地 Agent 配置管理得更清楚的重度用户。',
    ],
    notFor: [
      '只固定使用一个模型、一个工具、一个配置的人。',
      '完全不想接触命令行或本地配置文件的人。',
    ],
    howItWorks: [
      '你先把不同 Agent 或模型服务的配置写入 cc-switch 支持的配置格式。',
      '需要切换时，通过命令选择目标配置。',
      '工具会把当前环境切到对应模型、服务商或 Agent 配置。',
    ],
    gettingStarted: [
      '先阅读 README，确认它支持你正在使用的 Agent 工具。',
      '准备好不同服务商的 API 地址、Key 和模型名。',
      '按示例创建配置，再用一个低风险项目测试切换是否生效。',
    ],
    expectedOutcome: [
      '多个 Agent 和模型配置不再散落在不同文件里。',
      '切换模型服务更快，出错概率更低。',
      '你可以更清楚地知道当前项目正在用哪套配置。',
    ],
    caveats: [
      '它是配置管理工具，不是模型服务本身，也不会提供 API Key。',
      '涉及 API Key 时要注意本地权限和密钥泄露风险。',
      '不同工具版本的配置格式可能变化，使用前要核对 README。',
    ],
  },
}

export function projectInsightFor(skill, generatedAt = new Date().toISOString()) {
  const targetUser = skill.isCollection
    ? '想集中发现和比较 Skills 的用户'
    : `需要${skill.categoryDescription || skill.category}能力的用户`
  const useCases = (skill.scenarios || []).slice(0, 3)
  const limitations = [
    skill.license ? `许可证为 ${skill.license}，商用前仍建议核对仓库条款。` : '仓库未声明许可证，商用前需要谨慎核对。',
    skill.activity === '低活跃'
      ? '项目近期更新较少，使用前建议确认兼容性。'
      : '这份解读根据仓库公开信息整理，仍建议打开 GitHub 核对细节。',
  ]
  return {
    summary: skill.summary || skill.description || `${skill.fullName} 是一个可用于扩展 Agent 工作流的开源项目。`,
    useCases: useCases.length ? useCases : ['Agent 工作流扩展', '开源工具选型'],
    expectedEffects: [
      skill.isCollection ? '减少逐个搜索同类项目的时间' : '把重复工作沉淀成可复用能力',
      '帮助用户更快判断项目是否值得进一步阅读 README',
    ],
    targetUsers: [targetUser, '开发者和 AI 工具使用者'],
    gettingStarted: skill.howToUse || '先阅读 README，再按项目说明安装或复制对应 Skill。',
    limitations,
    generatedAt,
    sourceHash: sourceHashFor(skill),
    method: 'metadata-derived-v1',
    sourceNote: '根据仓库公开信息整理，仅供选型参考。',
  }
}

async function readPreviousNames(snapshotPath) {
  if (!snapshotPath) return new Set()
  try {
    const payload = JSON.parse(await readFile(snapshotPath, 'utf8'))
    return new Set((payload.skills || []).map((skill) => String(skill.fullName).toLowerCase()))
  } catch {
    return new Set()
  }
}

function withDerivedFields(skill, previousNames, generatedAt) {
  const detailPath = detailPathFor(skill.fullName)
  const catalogDelta = previousNames.size && !previousNames.has(skill.fullName.toLowerCase()) ? 'new' : 'stable'
  const projectProfile = projectProfileFor(skill)
  return {
    ...skill,
    summary: projectProfile?.plainIntro || skill.summary,
    detailPath,
    catalogStatus: 'active',
    catalogDelta,
    projectInsight: projectInsightFor(skill, generatedAt),
    projectProfile,
  }
}

function publicPath(outputDir, relativePath) {
  return path.join(outputDir, relativePath.replace(/^data\//, ''))
}

function uniqueByFullName(skills) {
  return [...new Map(skills.map((skill) => [skill.fullName, skill])).values()]
}

function liteSkillFor(skill) {
  return {
    rank: skill.rank,
    id: skill.id,
    name: skill.name,
    fullName: skill.fullName,
    owner: skill.owner,
    avatarUrl: skill.avatarUrl,
    url: skill.url,
    description: skill.description,
    summary: skill.summary,
    category: skill.category,
    categoryConfidence: skill.categoryConfidence,
    scenarios: skill.scenarios,
    howToUse: skill.howToUse,
    installCommand: skill.installCommand,
    language: skill.language,
    license: skill.license,
    stars: skill.stars,
    score: skill.score,
    activity: skill.activity,
    pushedAt: skill.pushedAt,
    sourceTopics: skill.sourceTopics,
    platforms: skill.platforms,
    skillCount: skill.skillCount,
    isCollection: skill.isCollection,
    media: skill.media,
    detailPath: skill.detailPath,
    catalogStatus: skill.catalogStatus,
    catalogDelta: skill.catalogDelta,
  }
}

export async function writeDerivedCatalog(data, { outputDir = defaultOutputDir, previousPath = '' } = {}) {
  const previousNames = await readPreviousNames(previousPath)
  const generatedAt = data.meta.generatedAt || new Date().toISOString()
  const skills = data.skills.map((skill) => withDerivedFields(skill, previousNames, generatedAt))
  const skillNames = new Set(skills.map((skill) => skill.fullName.toLowerCase()))
  const added = previousNames.size ? skills.filter((skill) => skill.catalogDelta === 'new').map((skill) => skill.fullName) : []
  const removed = previousNames.size ? [...previousNames].filter((name) => !skillNames.has(name)).sort() : []
  const updated = skills
    .filter((skill) => skill.activity !== '低活跃')
    .toSorted((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())
    .slice(0, 80)
    .map((skill) => skill.fullName)
  const liteSkills = skills.map(liteSkillFor)
  const manifest = {
    version: generatedAt,
    generatedAt,
    stats: {
      repositories: skills.length,
      categories: data.categories.length,
      topics: data.topics.length,
      added: added.length,
      updated: updated.length,
      removed: removed.length,
    },
    catalogPolicy: {
      mode: 'dynamic-threshold',
      description: '符合相关性、活跃度、质量与精选规则的项目会动态进入 SkillHot，不再按固定展示数量截断。',
    },
    projectProfilePolicy: {
      mode: 'deterministic-rules-with-optional-llm-cache',
      defaultTokenCost: 0,
      description: '每个详情页默认使用本地规则生成用户视角项目介绍；如配置大模型增强脚本，只会写入缓存文件供后续派生数据复用。',
      optionalEnv: ['SKILLHOT_LLM_BASE_URL', 'SKILLHOT_LLM_API_KEY', 'SKILLHOT_LLM_MODEL'],
    },
    files: {
      home: 'data/home.json',
      skillsLite: 'data/skills-lite.json',
      categories: 'data/categories.json',
      topics: 'data/topics.json',
    },
    diff: { added, updated, removed },
  }
  const recent = liteSkills.toSorted((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()).slice(0, 24)
  const collections = liteSkills.filter((skill) => skill.isCollection).slice(0, 12)
  const home = {
    ...data,
    meta: { ...data.meta, repositories: skills.length },
    skills: uniqueByFullName([...liteSkills.slice(0, 36), ...recent, ...collections]),
  }
  const skillsLite = {
    ...data,
    meta: { ...data.meta, repositories: skills.length },
    skills: liteSkills,
  }

  await mkdir(outputDir, { recursive: true })
  await mkdir(path.join(outputDir, 'categories'), { recursive: true })
  await mkdir(path.join(outputDir, 'topics'), { recursive: true })
  await rm(path.join(outputDir, 'details'), { recursive: true, force: true })
  await mkdir(path.join(outputDir, 'details'), { recursive: true })

  await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  await writeFile(path.join(outputDir, 'home.json'), `${JSON.stringify(home, null, 2)}\n`)
  await writeFile(path.join(outputDir, 'skills-lite.json'), `${JSON.stringify(skillsLite, null, 2)}\n`)
  await writeFile(path.join(outputDir, 'categories.json'), `${JSON.stringify(data.categories, null, 2)}\n`)
  await writeFile(path.join(outputDir, 'topics.json'), `${JSON.stringify(data.topics, null, 2)}\n`)

  for (const category of data.categories) {
    const payload = { ...skillsLite, skills: liteSkills.filter((skill) => skill.category === category.name) }
    await writeFile(path.join(outputDir, 'categories', `${category.name}.json`), `${JSON.stringify(payload, null, 2)}\n`)
  }

  for (const topic of data.topics) {
    const payload = { ...skillsLite, skills: liteSkills.filter((skill) => skill.sourceTopics.includes(topic.name)) }
    await writeFile(path.join(outputDir, 'topics', `${topic.name}.json`), `${JSON.stringify(payload, null, 2)}\n`)
  }

  for (const skill of skills) {
    await writeFile(publicPath(outputDir, skill.detailPath), `${JSON.stringify(skill, null, 2)}\n`)
  }

  return { manifest, home, skillsLite }
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  const dataPath = path.join(defaultOutputDir, 'skills.json')
  const previousPath = path.join(defaultOutputDir, 'skills-lite.json')
  const data = JSON.parse(await readFile(dataPath, 'utf8'))
  const { manifest } = await writeDerivedCatalog(data, { outputDir: defaultOutputDir, previousPath })
  console.log(`Wrote derived catalog: ${manifest.stats.repositories} repositories, ${manifest.stats.categories} categories, ${manifest.stats.topics} topics.`)
}
