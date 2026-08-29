import assert from 'node:assert/strict'
import test from 'node:test'
import { projectProfileFor } from '../scripts/project-profile-rules.mjs'

function skillWithSummary(summary) {
  return {
    name: 'dify',
    fullName: 'langgenius/dify',
    description: 'Build Agentic workflows and RAG pipelines in a collaborative workspace.',
    summary,
    category: 'Agent工具与平台',
    categoryDescription: 'Agent 客户端、模型切换、网关、运行环境与编排平台',
    categoryConfidence: '高',
    scenarios: ['Agent 编排', '知识检索', '工具集成'],
    platforms: ['Agent Skills'],
    repoTopics: ['agent', 'agentic-workflow', 'rag'],
    license: 'MIT',
    activity: '本周活跃',
    skillCount: 1,
    isCollection: false,
  }
}

test('project profile generation is idempotent for an already-derived summary', () => {
  const first = projectProfileFor(skillWithSummary('dify 支持 Agent 工作流、知识库与模型工具协作。'))
  const second = projectProfileFor(skillWithSummary(first.plainIntro))
  assert.equal(first.plainIntro, 'dify：支持 Agent 工作流、知识库与模型工具协作。适合在 Agent Skills 相关工作流里先做选型判断。')
  assert.equal(second.plainIntro, first.plainIntro)
  assert.equal((second.plainIntro.match(/适合在/g) || []).length, 1)
  assert.doesNotMatch(second.plainIntro, /dify[：:]\s*dify/i)
})
