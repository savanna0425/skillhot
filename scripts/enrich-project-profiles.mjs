import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hasCompleteProjectProfile, projectProfileFor, sourceHashForProfile } from './project-profile-rules.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const defaultInput = path.join(projectRoot, 'public', 'data', 'skills.json')
const defaultOutput = path.join(__dirname, 'project-profile-overrides.json')

const args = parseArgs(process.argv.slice(2))
const dryRun = args.has('dry-run')
const inputPath = args.get('input') || defaultInput
const outputPath = args.get('output') || defaultOutput
const limit = Number(args.get('limit') || process.env.SKILLHOT_LLM_MAX_REPOS || 10)
const minStars = Number(args.get('min-stars') || 0)
const onlyNew = args.has('only-new')

const baseUrl = process.env.SKILLHOT_LLM_BASE_URL || ''
const apiKey = process.env.SKILLHOT_LLM_API_KEY || ''
const model = process.env.SKILLHOT_LLM_MODEL || ''
const temperature = Number(process.env.SKILLHOT_LLM_TEMPERATURE || 0.2)

const data = JSON.parse(await readFile(inputPath, 'utf8'))
const previous = await readOptionalJson(outputPath)
const existingProfiles = previous.profiles || {}
const candidates = selectCandidates(data.skills || [], existingProfiles, { limit, minStars, onlyNew })

if (dryRun) {
  console.log(`Project profile enrichment dry-run: ${candidates.length} candidate(s).`)
  candidates.forEach((skill, index) => {
    console.log(`${index + 1}. ${skill.fullName} · ${skill.stars} stars · ${skill.category} · ${skill.summary}`)
  })
}

if (!baseUrl || !apiKey || !model) {
  console.log('LLM profile enrichment is disabled: set SKILLHOT_LLM_BASE_URL, SKILLHOT_LLM_API_KEY and SKILLHOT_LLM_MODEL to enable it.')
  process.exit(0)
}

if (dryRun) {
  console.log('Dry-run mode: model configuration is present, but no requests were sent and no cache was written.')
  process.exit(0)
}

const profiles = { ...existingProfiles }
let written = 0
for (const skill of candidates) {
  const profile = await generateProfile(skill)
  if (!hasCompleteProjectProfile(profile)) {
    console.warn(`Skipped ${skill.fullName}: model response did not match the project profile schema.`)
    continue
  }
  profiles[skill.fullName] = {
    sourceHash: sourceHashForProfile(skill),
    profile,
  }
  written += 1
}

const payload = {
  generatedAt: new Date().toISOString(),
  model,
  note: 'Optional cache for user-facing project profiles. API keys are never stored here.',
  profiles,
}
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`Wrote ${written} enhanced project profile(s) to ${outputPath}.`)

function selectCandidates(skills, existing, options) {
  const normalizedExisting = new Map(Object.entries(existing).map(([name, value]) => [name.toLowerCase(), value]))
  return skills
    .filter((skill) => skill.stars >= options.minStars)
    .filter((skill) => {
      const cached = normalizedExisting.get(skill.fullName.toLowerCase())
      if (!cached) return true
      if (!options.onlyNew && cached.sourceHash !== sourceHashForProfile(skill)) return true
      return false
    })
    .sort((a, b) => b.stars - a.stars || new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())
    .slice(0, Math.max(0, options.limit))
}

async function generateProfile(skill) {
  const response = await fetch(completionsUrl(baseUrl), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            '你是 SkillHot 的中文产品经理，负责把 GitHub 开源项目解释给第一次看到这个网站的用户。',
            '只基于输入的公开仓库元数据写，不要编造 README 里没有的信息。',
            '不要提“AI 解读”“离线生成”“模型生成”“token”等生产过程。',
            '语气直白、诚实、面向用户选型；每个字段必须是中文。',
            '输出严格 JSON，不要 Markdown。',
          ].join('\n'),
        },
        {
          role: 'user',
          content: JSON.stringify({
            requiredSchema: {
              plainIntro: '一句话说明这个项目是什么，适合谁先看。',
              whatItIs: '用普通用户能懂的话解释它到底是什么，不超过 180 字。',
              problemSolved: ['3 条，它解决什么问题'],
              coreCapabilities: ['3-4 条，用户能用它做什么'],
              bestFor: ['2-4 条，适合谁'],
              notFor: ['2-3 条，不适合谁'],
              howItWorks: ['2-4 条，它大概怎么工作'],
              gettingStarted: ['3 条，怎么开始用'],
              expectedOutcome: ['2-3 条，预期效果'],
              caveats: ['2-4 条，注意事项'],
            },
            repository: {
              fullName: skill.fullName,
              description: skill.description,
              summary: skill.summary,
              category: skill.category,
              categoryDescription: skill.categoryDescription,
              scenarios: skill.scenarios,
              platforms: skill.platforms,
              language: skill.language,
              license: skill.license,
              stars: skill.stars,
              activity: skill.activity,
              skillCount: skill.skillCount,
              isCollection: skill.isCollection,
              repoTopics: skill.repoTopics,
            },
            fallbackProfile: projectProfileFor(skill),
          }),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`LLM profile request failed ${response.status}: ${await response.text()}`)
  }
  const payload = await response.json()
  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error(`LLM profile response is empty for ${skill.fullName}`)
  return JSON.parse(content)
}

function completionsUrl(value) {
  const trimmed = value.replace(/\/+$/, '')
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed
  return `${trimmed}/chat/completions`
}

async function readOptionalJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch {
    return {}
  }
}

function parseArgs(values) {
  const parsed = new Map()
  for (const value of values) {
    if (!value.startsWith('--')) continue
    const [key, raw = 'true'] = value.slice(2).split('=')
    parsed.set(key, raw)
  }
  return parsed
}
