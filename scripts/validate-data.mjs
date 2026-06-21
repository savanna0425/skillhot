import { readFile } from 'node:fs/promises'

const data = JSON.parse(await readFile(new URL('../public/data/skills.json', import.meta.url), 'utf8'))
const csv = await readFile(new URL('../public/data/skills.csv', import.meta.url), 'utf8')

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
  'Agent平台',
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
assert(data.skills.length >= 500, `expected at least 500 repositories, received ${data.skills.length}`)
assert(data.meta.repositories === data.skills.length, 'meta.repositories must match skills length')
assert(!Object.hasOwn(data.meta, 'tokenCost'), 'tokenCost must not be part of public metadata')
assert(Array.isArray(data.categories) && data.categories.length >= requiredCategories.length, 'category metadata is incomplete')
assert(Array.isArray(data.topics) && data.topics.length >= 10, 'topic aggregation is incomplete')

const categoryNames = new Set(data.categories.map((item) => item.name))
requiredCategories.forEach((category) => assert(categoryNames.has(category), `missing category ${category}`))

const names = new Set()
for (const skill of data.skills) {
  const normalizedName = skill.fullName.toLowerCase()
  assert(!names.has(normalizedName), `duplicate repository ${skill.fullName}`)
  names.add(normalizedName)
  assert(/^https:\/\/github\.com\//.test(skill.url), `invalid repository URL for ${skill.fullName}`)
  assert(typeof skill.stars === 'number' && skill.stars >= 0, `invalid Stars for ${skill.fullName}`)
  assert(categoryNames.has(skill.category), `unknown category ${skill.category} for ${skill.fullName}`)
  assert(Array.isArray(skill.platforms) && skill.platforms.length > 0, `missing platforms for ${skill.fullName}`)
  assert(typeof skill.installCommand === 'string' && skill.installCommand.length > 0, `missing install command for ${skill.fullName}`)
}

requiredRepositories.forEach((repository) => assert(names.has(repository.toLowerCase()), `missing required source ${repository}`))
assert(csv.startsWith('\uFEFF排名,仓库,分类,'), 'CSV header is invalid')

console.log(`Validated ${data.skills.length} repositories, ${data.categories.length} categories and ${data.topics.length} topics.`)
