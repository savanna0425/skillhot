# SkillHot Performance Enrichment Dynamic Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first shippable version of fast home loading, dynamic catalog wording/rules, and offline AI-style project interpretation for SkillHot.

**Architecture:** Keep GitHub and AI work out of user visits. The data pipeline continues to generate static files, but now emits a lightweight home catalog, a full lightweight index, per-repository detail files, and a manifest with daily update stats and catalog policy. The React app renders the home page from `home.json`, lazily loads the full index for search/list pages, and loads enriched details only when the user opens a project.

**Tech Stack:** Vite, React 19, TypeScript, Playwright, Node.js ESM scripts, GitHub Pages static files.

## Global Constraints

- Do not call GitHub from the browser.
- Do not call an AI model from the browser.
- Keep `public/data/skills.json` as a compatibility artifact for now.
- Use static generated JSON for `manifest.json`, `home.json`, `skills-lite.json`, category/topic files, and detail files.
- Use deterministic offline interpretation as the first implementation; optional model-backed generation can be added later behind a budgeted workflow.
- Keep local validation green before production deployment.

---

## File Structure

- Modify `scripts/update-skills.mjs`: replace the fixed `maxRepositories` product cap with a dynamic threshold, enrich each skill with status/delta/detail path, and call the derived-data writer.
- Create `scripts/catalog-derived.mjs`: shared pure helpers for dynamic stats, AI-style interpretation, safe detail paths, and split static JSON output.
- Modify `scripts/validate-data.mjs`: validate new generated artifacts and AI interpretation shape.
- Modify `src/types.ts`: add manifest, catalog delta, catalog status, and AI interpretation types.
- Modify `src/App.tsx`: load `home.json` first, lazily load `skills-lite.json`, and fetch detail JSON on selection.
- Modify `src/components/FeaturedRail.tsx`: show dynamic catalog wording, daily stats, and AI brief badges.
- Modify `src/components/DetailPanel.tsx`: show AI interpretation and detail-loading state.
- Modify `src/components/InfoViews.tsx`: update dynamic catalog wording in category/about views.
- Modify `src/styles.css`: style daily stats, AI interpretation block, and lightweight loading state.
- Modify `tests/skillhot.spec.ts`: cover fast home data, lazy index loading, and AI detail interpretation.

## Task 1: Generated Data Artifacts

**Files:**
- Create: `scripts/catalog-derived.mjs`
- Modify: `scripts/validate-data.mjs`
- Modify: `scripts/update-skills.mjs`
- Generated: `public/data/manifest.json`, `public/data/home.json`, `public/data/skills-lite.json`, `public/data/categories/*.json`, `public/data/topics/*.json`, `public/data/details/*.json`

**Interfaces:**
- Produces: `writeDerivedCatalog(data, options): Promise<{ manifest: object; home: object; skillsLite: object }>`
- Produces: `detailPathFor(fullName: string): string`
- Produces: generated `Skill.aiInsight`, `Skill.catalogStatus`, `Skill.catalogDelta`, `Skill.detailPath`
- Consumes: existing `public/data/skills.json` shape

- [ ] **Step 1: Write failing validation for derived artifacts**

Add checks in `scripts/validate-data.mjs` that read:

```js
const manifest = JSON.parse(await readFile(new URL('../public/data/manifest.json', import.meta.url), 'utf8'))
const home = JSON.parse(await readFile(new URL('../public/data/home.json', import.meta.url), 'utf8'))
const lite = JSON.parse(await readFile(new URL('../public/data/skills-lite.json', import.meta.url), 'utf8'))

assert(manifest.catalogPolicy.mode === 'dynamic-threshold', 'manifest must describe dynamic catalog policy')
assert(manifest.stats.repositories === data.skills.length, 'manifest stats must match skills.json')
assert(home.skills.length > 0 && home.skills.length < data.skills.length, 'home.json must be a lightweight subset')
assert(lite.skills.length === data.skills.length, 'skills-lite.json must contain every visible repository')

for (const skill of lite.skills) {
  assert(skill.detailPath, `missing detailPath for ${skill.fullName}`)
  assert(skill.aiInsight?.summary, `missing AI summary for ${skill.fullName}`)
}
```

- [ ] **Step 2: Run validation and verify RED**

Run:

```bash
pnpm validate:data
```

Expected: FAIL because `public/data/manifest.json` does not exist yet.

- [ ] **Step 3: Implement derived data writer**

Create `scripts/catalog-derived.mjs` with:

```js
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

export function detailPathFor(fullName) {
  return `data/details/${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '__').replace(/^__|__$/g, '')}.json`
}

export function aiInsightFor(skill) {
  const target = skill.isCollection ? '想集中发现和比较 Skills 的用户' : `需要${skill.categoryDescription || skill.category}能力的用户`
  const scenarios = (skill.scenarios || []).slice(0, 3)
  return {
    summary: skill.summary || skill.description || `${skill.fullName} 是一个可用于扩展 Agent 工作流的开源项目。`,
    useCases: scenarios.length ? scenarios : ['Agent 工作流扩展', '开源工具选型'],
    expectedEffects: [
      skill.isCollection ? '减少逐个搜索同类项目的时间' : '把重复工作沉淀成可复用能力',
      '帮助用户更快判断项目是否值得进一步阅读 README',
    ],
    targetUsers: [target, '开发者和 AI 工具使用者'],
    gettingStarted: skill.howToUse || '先阅读 README，再按项目说明安装或复制对应 Skill。',
    limitations: [
      skill.license ? `许可证为 ${skill.license}，商用前仍建议核对仓库条款。` : '仓库未声明许可证，商用前需要谨慎核对。',
      skill.activity === '低活跃' ? '项目近期更新较少，使用前建议确认兼容性。' : 'AI 解读基于仓库元数据和 README 摘要，仍建议打开 GitHub 核对细节。',
    ],
    generatedAt: new Date().toISOString(),
    sourceHash: createHash('sha256').update([
      skill.fullName,
      skill.description,
      skill.summary,
      skill.updatedAt,
      skill.pushedAt,
      ...(skill.repoTopics || []),
    ].join('\\n')).digest('hex').slice(0, 16),
    method: 'deterministic-offline-v1',
  }
}

function withDerivedFields(skill, previousNames) {
  const detailPath = detailPathFor(skill.fullName)
  const catalogDelta = previousNames.size && !previousNames.has(skill.fullName.toLowerCase()) ? 'new' : 'stable'
  return {
    ...skill,
    detailPath,
    catalogStatus: 'active',
    catalogDelta,
    aiInsight: aiInsightFor(skill),
  }
}

function publicPath(outputDir, relativePath) {
  return path.join(outputDir, relativePath.replace(/^data\\//, ''))
}

async function readPreviousNames(snapshotPath) {
  try {
    const payload = JSON.parse(await readFile(snapshotPath, 'utf8'))
    return new Set((payload.skills || []).map((skill) => String(skill.fullName).toLowerCase()))
  } catch {
    return new Set()
  }
}

export async function writeDerivedCatalog(data, { outputDir, previousPath = '' } = {}) {
  const previousNames = previousPath ? await readPreviousNames(previousPath) : new Set()
  const skills = data.skills.map((skill) => withDerivedFields(skill, previousNames))
  const added = previousNames.size ? skills.filter((skill) => skill.catalogDelta === 'new').map((skill) => skill.fullName) : []
  const updated = skills.filter((skill) => skill.activity !== '低活跃').slice(0, 80).map((skill) => skill.fullName)
  const removed = []
  const manifest = {
    version: data.meta.generatedAt,
    generatedAt: data.meta.generatedAt,
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
  const homeSkills = [
    ...skills.slice(0, 36),
    ...skills.toSorted((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()).slice(0, 24),
  ]
  const uniqueHomeSkills = [...new Map(homeSkills.map((skill) => [skill.fullName, skill])).values()]
  const home = { ...data, meta: { ...data.meta, repositories: skills.length }, skills: uniqueHomeSkills }
  const lite = { ...data, meta: { ...data.meta, repositories: skills.length }, skills }

  await mkdir(outputDir, { recursive: true })
  await mkdir(path.join(outputDir, 'categories'), { recursive: true })
  await mkdir(path.join(outputDir, 'topics'), { recursive: true })
  await rm(path.join(outputDir, 'details'), { recursive: true, force: true })
  await mkdir(path.join(outputDir, 'details'), { recursive: true })

  await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\\n`)
  await writeFile(path.join(outputDir, 'home.json'), `${JSON.stringify(home, null, 2)}\\n`)
  await writeFile(path.join(outputDir, 'skills-lite.json'), `${JSON.stringify(lite, null, 2)}\\n`)
  await writeFile(path.join(outputDir, 'categories.json'), `${JSON.stringify(data.categories, null, 2)}\\n`)
  await writeFile(path.join(outputDir, 'topics.json'), `${JSON.stringify(data.topics, null, 2)}\\n`)

  for (const category of data.categories) {
    const payload = { ...lite, skills: skills.filter((skill) => skill.category === category.name) }
    await writeFile(path.join(outputDir, 'categories', `${category.name}.json`), `${JSON.stringify(payload, null, 2)}\\n`)
  }
  for (const topic of data.topics) {
    const payload = { ...lite, skills: skills.filter((skill) => skill.sourceTopics.includes(topic.name)) }
    await writeFile(path.join(outputDir, 'topics', `${topic.name}.json`), `${JSON.stringify(payload, null, 2)}\\n`)
  }
  for (const skill of skills) {
    await writeFile(publicPath(outputDir, skill.detailPath), `${JSON.stringify(skill, null, 2)}\\n`)
  }

  return { manifest, home, skillsLite: lite }
}
```

- [ ] **Step 4: Wire update script and compatibility generation**

Modify `scripts/update-skills.mjs` to import `writeDerivedCatalog`, replace the fixed `maxRepositories` cap with a dynamic threshold, and call:

```js
await writeDerivedCatalog(data, { outputDir, previousPath: path.join(outputDir, 'skills.json') })
```

Also create a small CLI path in `scripts/catalog-derived.mjs` so this command works against the existing local dataset:

```bash
node scripts/catalog-derived.mjs
```

- [ ] **Step 5: Generate artifacts and verify GREEN**

Run:

```bash
node scripts/catalog-derived.mjs
pnpm validate:data
```

Expected: PASS and new `public/data/*` artifacts exist.

- [ ] **Step 6: Commit**

```bash
git add scripts public/data
git commit -m "feat: generate split catalog data"
```

## Task 2: Frontend Fast Home and Lazy Catalog

**Files:**
- Modify: `src/types.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/FeaturedRail.tsx`
- Modify: `src/components/InfoViews.tsx`
- Modify: `src/components/DetailPanel.tsx`
- Modify: `src/styles.css`
- Test: `tests/skillhot.spec.ts`

**Interfaces:**
- Consumes: `data/home.json`, `data/skills-lite.json`, and `Skill.detailPath`
- Produces: visible home page before the full catalog index is loaded
- Produces: detail panel AI interpretation after selecting a project

- [ ] **Step 1: Write failing Playwright tests**

Add tests that:

```ts
test('home uses lightweight catalog and then loads full index lazily', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '发现适合你的 Agent Skills' })).toBeVisible()
  expect(requests.some((url) => url.endsWith('/data/home.json'))).toBeTruthy()
  await page.getByRole('navigation', { name: '主要页面' }).getByRole('button', { name: '榜单' }).click()
  await expect(page.getByRole('heading', { name: 'Skills 榜单' })).toBeVisible()
  expect(requests.some((url) => url.endsWith('/data/skills-lite.json'))).toBeTruthy()
})

test('detail panel shows offline AI interpretation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chrome-desktop', 'desktop product flow')
  await waitForCatalog(page)
  await page.getByRole('button', { name: '详情' }).first().click()
  const panel = page.locator('.detail-shell')
  await expect(panel.getByRole('heading', { name: 'AI 项目解读' })).toBeVisible()
  await expect(panel).toContainText('适合谁')
  await expect(panel).toContainText('预期效果')
})
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
pnpm test:e2e -- --project=chrome-desktop --grep "lightweight|AI interpretation"
```

Expected: FAIL because the app still fetches `skills.json` directly and the detail panel has no AI section.

- [ ] **Step 3: Implement types**

Add optional fields to `Skill`:

```ts
export type CatalogStatus = 'new' | 'active' | 'watching' | 'hidden'
export type CatalogDelta = 'new' | 'updated' | 'stable'

export interface AiInsight {
  summary: string
  useCases: string[]
  expectedEffects: string[]
  targetUsers: string[]
  gettingStarted: string
  limitations: string[]
  generatedAt: string
  sourceHash: string
  method: string
}
```

- [ ] **Step 4: Implement App data flow**

Change `App.tsx` so it:

- Fetches `data/home.json` first.
- Fetches `data/skills-lite.json` in the background or when a non-home view/search needs it.
- Fetches `selected.detailPath` on project selection and merges enriched detail into selected state.
- Falls back to `data/skills.json` if home/lite files fail.

- [ ] **Step 5: Implement UI copy and AI panel**

Update UI:

- Hero says “当前动态收录 X 个项目”.
- Shows today added/updated/removed stats when manifest data exists.
- Card can show `AI 已解读` when `skill.aiInsight` exists.
- Detail panel shows “AI 项目解读” with summary, target users, use cases, expected effects, getting started, and limitations.

- [ ] **Step 6: Run tests and verify GREEN**

Run:

```bash
pnpm test:e2e -- --project=chrome-desktop --grep "lightweight|AI interpretation"
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src tests
git commit -m "feat: load lightweight catalog and AI details"
```

## Task 3: Local Test Environment Release Check

**Files:**
- No production source changes expected after this task.

**Interfaces:**
- Consumes: final local branch from Tasks 1 and 2
- Produces: local preview evidence before production deploy

- [ ] **Step 1: Run full checks**

Run:

```bash
pnpm check
pnpm build
pnpm test:e2e
```

Expected: all commands exit 0.

- [ ] **Step 2: Run local preview smoke test**

Run a local preview and use Playwright to verify:

- Home page renders from local preview.
- Ranking page loads full index.
- Detail panel shows AI interpretation.
- Category and topic load-more still work.
- Console has no relevant errors.

- [ ] **Step 3: Commit fixes if needed**

If local preview finds issues, fix them using TDD where possible, rerun the same checks, then commit:

```bash
git add .
git commit -m "fix: polish local catalog release"
```

## Task 4: Production Release

**Files:**
- Git branch state only.

**Interfaces:**
- Consumes: locally verified feature branch
- Produces: production update on GitHub Pages

- [ ] **Step 1: Merge to main**

Run:

```bash
git switch main
git merge --ff-only feat/performance-enrichment-dynamic-catalog
```

- [ ] **Step 2: Push production branch**

Run:

```bash
git push origin main
```

- [ ] **Step 3: Verify production**

Verify `https://skillhot.savs-ai.com` serves the new assets and repeat the key Playwright smoke flow against production:

- Home page shows dynamic catalog wording.
- Detail panel shows AI interpretation.
- Ranking page still loads.
- Category/topic load-more still works.

Expected: production smoke test exits 0 and console has no relevant errors.
