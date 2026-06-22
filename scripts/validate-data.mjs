import { readFile } from 'node:fs/promises'
import { semanticQualityIssues } from './catalog-taxonomy.mjs'

const data = JSON.parse(await readFile(new URL('../public/data/skills.json', import.meta.url), 'utf8'))

const requiredCategories = [
  'UI设计',
  '编程开发',
  '办公效率',
  '内容创作',
  '数据分析',
  '研究学习',
  '自动化',
  '安全',
  '记忆与上下文',
  'Agent工具与平台',
  '产品与商业',
  '技能开发',
  '技能合集',
]

const requiredRepositories = [
  'anthropics/skills',
  'KKKKhazix/khazix-skills',
  'alchaincyf/karpathy-skill',
  'op7418/guizang-ppt-skill',
  'NVIDIA/skills',
  'dotnet/skills',
]

function assert(condition, message) {
  if (!condition) throw new Error(`Data validation failed: ${message}`)
}

assert(Array.isArray(data.skills), 'skills must be an array')
assert(data.skills.length >= 1000, `expected at least 1000 repositories, received ${data.skills.length}`)
assert(data.meta.repositories === data.skills.length, 'meta.repositories must match skills length')
assert(!Object.hasOwn(data.meta, 'tokenCost'), 'tokenCost must not be part of public metadata')
assert(Array.isArray(data.categories) && data.categories.length >= requiredCategories.length, 'category metadata is incomplete')
assert(Array.isArray(data.topics) && data.topics.length >= 10, 'topic aggregation is incomplete')

const categoryNames = new Set(data.categories.map((item) => item.name))
requiredCategories.forEach((category) => assert(categoryNames.has(category), `missing category ${category}`))

const names = new Set()
let highStarActiveCount = 0
const activeHighStarCutoff = Date.parse(data.meta.activeHighStarCutoff)
assert(Number.isFinite(activeHighStarCutoff), 'active high-star cutoff is invalid')
for (const skill of data.skills) {
  const normalizedName = skill.fullName.toLowerCase()
  assert(!names.has(normalizedName), `duplicate repository ${skill.fullName}`)
  names.add(normalizedName)
  assert(/^https:\/\/github\.com\//.test(skill.url), `invalid repository URL for ${skill.fullName}`)
  assert(typeof skill.stars === 'number' && skill.stars >= 0, `invalid Stars for ${skill.fullName}`)
  assert(categoryNames.has(skill.category), `unknown category ${skill.category} for ${skill.fullName}`)
  assert(Array.isArray(skill.platforms) && skill.platforms.length > 0, `missing platforms for ${skill.fullName}`)
  assert(typeof skill.installCommand === 'string' && skill.installCommand.length > 0, `missing install command for ${skill.fullName}`)
  assert(/[\u3400-\u9fff]/.test(skill.summary), `summary must contain Chinese for ${skill.fullName}`)
  assert(skill.categoryDescription === data.categories.find((item) => item.name === skill.category)?.description, `stale category description for ${skill.fullName}`)
  assert(typeof skill.categoryConfidence === 'string' && skill.categoryConfidence.length > 0, `missing category confidence for ${skill.fullName}`)
  const semanticIssues = semanticQualityIssues(skill)
  assert(semanticIssues.length === 0, `${skill.fullName} failed semantic QA: ${semanticIssues.join(', ')}`)
  if (skill.discoveredBy.includes('GitHub 高星活跃搜索')) {
    highStarActiveCount += 1
    assert(skill.stars >= 500, `high-star search result below 500 Stars: ${skill.fullName}`)
    assert(Date.parse(skill.pushedAt) >= activeHighStarCutoff, `inactive high-star search result: ${skill.fullName}`)
  }
}

assert(highStarActiveCount >= 1000, `expected at least 1000 active high-star search results, received ${highStarActiveCount}`)

requiredRepositories.forEach((repository) => assert(names.has(repository.toLowerCase()), `missing required source ${repository}`))
assert(data.skills.find((skill) => skill.fullName === 'obra/superpowers')?.category === '编程开发', 'superpowers must be categorized as 编程开发')
assert(data.skills.find((skill) => skill.fullName === 'farion1231/cc-switch')?.category === 'Agent工具与平台', 'cc-switch must be categorized as Agent工具与平台')

console.log(`Validated ${data.skills.length} repositories, ${data.categories.length} categories and ${data.topics.length} topics.`)
