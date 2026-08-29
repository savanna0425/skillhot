import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyCategory, semanticQualityIssues } from '../scripts/catalog-taxonomy.mjs'

const dify = {
  full_name: 'langgenius/dify',
  name: 'dify',
  description: 'Build Agentic workflows, RAG pipelines, with rich AI model and tool support on one collaborative workspace.',
  topics: ['agent', 'agentic-ai', 'agentic-workflow', 'automation', 'mcp', 'rag', 'skills', 'workflow'],
}

test('classifies Dify as an Agent platform instead of UI design', () => {
  assert.equal(classifyCategory(dify).category, 'Agent工具与平台')
})

test('does not treat a generic product prototype as UI-purpose evidence', () => {
  const result = classifyCategory({
    full_name: 'example/agent-prototype',
    name: 'agent-prototype',
    description: 'A prototype for building agentic workflows and tool integrations.',
    topics: ['agent', 'workflow'],
  })
  assert.notEqual(result.category, 'UI设计')
})

test('keeps explicit UI prototype language classified as UI design', () => {
  const result = classifyCategory({
    full_name: 'example/ui-prototype-kit',
    name: 'ui-prototype-kit',
    description: 'A design system and interactive UI prototype kit for product teams.',
    topics: ['design-system', 'ui'],
  })
  assert.equal(result.category, 'UI设计')
})

test('does not report a semantic mismatch for the Dify classification', () => {
  const classification = classifyCategory(dify)
  const issues = semanticQualityIssues({
    fullName: dify.full_name,
    name: dify.name,
    description: dify.description,
    summary: 'dify 支持 Agent 工作流、知识库与模型工具协作。',
    category: classification.category,
    categoryConfidence: classification.confidence,
  })
  assert.deepEqual(issues, [])
})

test('flags summaries that have accumulated the derived template twice', () => {
  const issues = semanticQualityIssues({
    fullName: 'langgenius/dify',
    name: 'dify',
    description: 'Agent workflow platform',
    summary: 'dify：dify 支持工作流。适合在 Agent Skills 相关工作流里先做选型判断。适合在 Agent Skills 相关工作流里先做选型判断。',
    category: 'Agent工具与平台',
    categoryConfidence: '高',
  })
  assert.ok(issues.includes('repeated-summary-template'))
})
