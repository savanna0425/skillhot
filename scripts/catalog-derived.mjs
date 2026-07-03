import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
  return {
    ...skill,
    detailPath,
    catalogStatus: 'active',
    catalogDelta,
    projectInsight: projectInsightFor(skill, generatedAt),
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
