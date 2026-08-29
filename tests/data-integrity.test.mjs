import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCatalogIntegrity } from '../scripts/data-integrity.mjs'

function baseCatalog() {
  const skill = { fullName: 'example/repo', category: '编程开发', summary: '示例项目用于软件开发。' }
  return {
    data: { meta: { repositories: 1 }, skills: [skill], categories: [{ name: '编程开发', count: 1 }] },
    lite: { meta: { repositories: 1 }, skills: [{ ...skill, detailPath: 'data/details/example__repo.json' }] },
    categoryPayloads: { 编程开发: { skills: [{ ...skill, detailPath: 'data/details/example__repo.json' }] } },
  }
}

test('rejects a lite catalog with a different repository set', async () => {
  const fixture = baseCatalog()
  fixture.lite.skills[0].fullName = 'example/other'
  await assert.rejects(() => validateCatalogIntegrity(fixture), /repository set mismatch/i)
})

test('rejects replacement characters in category fields', async () => {
  const fixture = baseCatalog()
  fixture.lite.skills[0].category = '记忆���上下文'
  await assert.rejects(() => validateCatalogIntegrity(fixture), /replacement character/i)
})

test('rejects category shard counts that disagree with metadata', async () => {
  const fixture = baseCatalog()
  fixture.categoryPayloads['编程开发'].skills = []
  await assert.rejects(() => validateCatalogIntegrity(fixture), /编程开发.*count/i)
})
