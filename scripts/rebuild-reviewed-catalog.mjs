import { readFile, writeFile } from 'node:fs/promises'
import {
  categoryMeta,
  classifyCategory,
  scenariosFor,
  semanticQualityIssues,
  summaryFor,
  usageFor,
} from './catalog-taxonomy.mjs'

const dataUrl = new URL('../public/data/skills.json', import.meta.url)
const auditUrl = new URL('../docs/CATALOG_AUDIT.md', import.meta.url)
const data = JSON.parse(await readFile(dataUrl, 'utf8'))
const previousCategories = new Map(data.skills.map((skill) => [skill.fullName, skill.category]))

data.skills = data.skills.map((skill) => {
  const classification = classifyCategory(skill)
  const category = classification.category
  return {
    ...skill,
    summary: summaryFor(skill, category),
    category,
    categoryDescription: categoryMeta[category],
    categoryConfidence: classification.confidence,
    categoryReason: classification.reason,
    scenarios: scenariosFor(category),
    howToUse: usageFor(category),
  }
})

data.categories = Object.entries(categoryMeta)
  .map(([name, description]) => ({
    name,
    description,
    count: data.skills.filter((skill) => skill.category === name).length,
  }))
  .filter((category) => category.count > 0)

data.meta.updateMode = 'GitHub REST API + reviewed summaries + weighted deterministic classification'
data.meta.catalogReviewedAt = new Date().toISOString()

const changed = data.skills.filter((skill) => previousCategories.get(skill.fullName) !== skill.category)
const confidence = Object.groupBy(data.skills, (skill) => skill.categoryConfidence)
const issues = data.skills.flatMap((skill) => semanticQualityIssues(skill).map((issue) => ({ repository: skill.fullName, issue })))
const genericSummaries = data.skills.filter((skill) => /可用于扩展 Agent 的实际工作能力|是一个面向.+的开源项目/.test(skill.summary))

const highlighted = ['obra/superpowers', 'farion1231/cc-switch', 'SaladDay/cc-switch-cli']
  .map((name) => data.skills.find((skill) => skill.fullName === name))
  .filter(Boolean)

const report = `# SkillHot 全库语义审计\n\n` +
  `生成时间：${data.meta.catalogReviewedAt}\n\n` +
  `## 审计范围\n\n` +
  `- 仓库：${data.skills.length}\n` +
  `- 分类：${data.categories.length}\n` +
  `- 分类发生调整：${changed.length}\n` +
  `- 高置信度：${(confidence['高'] || []).length}\n` +
  `- 人工复核：${(confidence['人工复核'] || []).length}\n` +
  `- 中等置信度：${(confidence['中'] || []).length}\n` +
  `- 待后续人工复核：${(confidence['待复核'] || []).length}\n` +
  `- 旧式空泛简介残留：${genericSummaries.length}\n` +
  `- 语义质量门禁问题：${issues.length}\n\n` +
  `## 重点纠正\n\n` +
  `| 仓库 | 原分类 | 新分类 | 新简介 |\n| --- | --- | --- | --- |\n` +
  highlighted.map((skill) => `| ${skill.fullName} | ${previousCategories.get(skill.fullName)} | ${skill.category} | ${skill.summary.replaceAll('|', '\\|')} |`).join('\n') +
  `\n\n## 分类分布\n\n` +
  `| 分类 | 数量 |\n| --- | ---: |\n` +
  data.categories.map((category) => `| ${category.name} | ${category.count} |`).join('\n') +
  `\n\n## 质量策略\n\n` +
  `- 分类采用“仓库名称/作者描述高权重，Topics 低权重”的加权规则，避免把实现细节误当主要用途。\n` +
  `- 中文简介优先采用人工条目或作者中文描述；英文描述由本地模型做忠实翻译，并经过长度、中文、重复与空话门禁。\n` +
  `- 每日更新不调用大模型；已审核结果按作者描述指纹复用，描述变化时自动回退到确定性规则。\n` +
  `- 待复核不等于错误，表示元数据不足；页面仍保留 GitHub 原始描述与 README 链接便于核验。\n`

await Promise.all([
  writeFile(dataUrl, `${JSON.stringify(data, null, 2)}\n`),
  writeFile(auditUrl, report),
])

console.log(`Rebuilt ${data.skills.length} repositories; ${changed.length} categories changed; ${issues.length} quality issues remain.`)
if (issues.length) {
  console.error(issues.slice(0, 30))
  process.exitCode = 1
}
