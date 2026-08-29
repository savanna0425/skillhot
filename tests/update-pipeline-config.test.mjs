import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('update script writes raw data without invoking derived output', async () => {
  const source = await readFile(new URL('../scripts/update-skills.mjs', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /writeDerivedCatalog/)
})

test('daily workflow invokes catalog derivation exactly once after enrichment', async () => {
  const workflow = await readFile(new URL('../.github/workflows/daily-update.yml', import.meta.url), 'utf8')
  assert.equal((workflow.match(/node scripts\/catalog-derived\.mjs/g) || []).length, 1)
  assert.match(workflow, /node scripts\/enrich-project-profiles\.mjs[\s\S]+node scripts\/catalog-derived\.mjs/)
})
