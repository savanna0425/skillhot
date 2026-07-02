import { ArrowRight, ArrowUpRight, Database, RefreshCw, SearchCheck, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Skill, SkillData } from '../types'
import { formatStars, formatUpdatedAt } from '../utils'
import { SkillGrid } from './FeaturedRail'
import { GithubMark } from './GithubMark'

interface SkillActions {
  selected?: Skill
  favorites: Set<string>
  onSelect: (skill: Skill) => void
  onFavorite: (skill: Skill) => void
}

const PAGE_SIZE = 24

interface PaginatedSkillGridProps extends SkillActions {
  skills: Skill[]
  resetKey: string
  pageSize?: number
  emptyText?: string
}

function PaginatedSkillGrid({ skills, resetKey, pageSize = PAGE_SIZE, emptyText, ...actions }: PaginatedSkillGridProps) {
  const [limit, setLimit] = useState(pageSize)

  useEffect(() => {
    setLimit(pageSize)
  }, [pageSize, resetKey])

  const visible = skills.slice(0, limit)
  const remaining = Math.max(0, skills.length - visible.length)

  return (
    <>
      <SkillGrid skills={visible} emptyText={emptyText} {...actions} />
      {remaining > 0 ? (
        <button
          className="load-more"
          type="button"
          onClick={() => setLimit((value) => value + pageSize)}
          aria-label={`加载更多，还剩 ${remaining} 个项目`}
        >
          加载更多 <span>{remaining}</span>
        </button>
      ) : null}
    </>
  )
}

interface CategoriesViewProps extends SkillActions {
  data: SkillData
  skills: Skill[]
  category: string
  onCategory: (category: string) => void
  scrollRequest: number
}

export function CategoriesView({ data, skills, category, onCategory, scrollRequest, ...actions }: CategoriesViewProps) {
  const selectedMeta = data.categories.find((item) => item.name === category)
  const resultsRef = useRef<HTMLDivElement>(null)
  const selectCategory = (next: string) => {
    onCategory(next)
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  useEffect(() => {
    if (!scrollRequest) return
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [scrollRequest])

  return (
    <section className="content-page categories-page">
      <div className="page-heading">
        <div><h1>技能分类</h1><p>按真实工作场景浏览，快速找到对口的 Skill。</p></div>
        <strong>{data.categories.length}</strong>
      </div>
      <div className="category-board">
        <button className={category === '全部' ? 'selected' : ''} aria-pressed={category === '全部'} onClick={() => selectCategory('全部')}>
          <span>全部分类</span><strong>{data.meta.repositories}</strong><p>浏览 SkillHot 动态收录的全部开源项目。</p><ArrowRight size={18} />
        </button>
        {data.categories.map((item) => (
          <button className={category === item.name ? 'selected' : ''} aria-pressed={category === item.name} key={item.name} onClick={() => selectCategory(item.name)}>
            <span>{item.name}</span><strong>{item.count}</strong><p>{item.description}</p><ArrowRight size={18} />
          </button>
        ))}
      </div>
      <div className="category-result-heading" ref={resultsRef} id="category-results">
        <div><h2>{selectedMeta?.name || '全部 Skills'}</h2><p>{selectedMeta?.description || '完整的开源 Agent Skills 索引。'}</p></div>
        <span>{skills.length} 个项目</span>
      </div>
      <PaginatedSkillGrid skills={skills} resetKey={`category:${category}:${skills.length}`} {...actions} />
    </section>
  )
}

interface TopicsViewProps {
  data: SkillData
  favorites: Set<string>
  onSelect: (skill: Skill) => void
  onFavorite: (skill: Skill) => void
}

export function TopicsView({ data, favorites, onSelect, onFavorite }: TopicsViewProps) {
  const [selectedTopic, setSelectedTopic] = useState(data.topics[0]?.name || '')
  const topicSkills = useMemo(
    () => data.skills.filter((skill) => skill.sourceTopics.includes(selectedTopic)),
    [data.skills, selectedTopic],
  )
  const platformTopics = data.topics.filter((topic) => /agent|claude|codex|openclaw|copilot|gemini|anthropic/i.test(topic.name))
  const capabilityTopics = data.topics.filter((topic) => !platformTopics.includes(topic))
  const selected = data.topics.find((topic) => topic.name === selectedTopic)

  return (
    <section className="content-page topics-page">
      <div className="page-heading">
        <div><h1>Skills 生态话题</h1><p>按平台生态与能力方向聚合 GitHub Topics，快速了解每个话题的项目规模与活跃度。</p></div>
        <strong>{data.topics.length}</strong>
      </div>

      <div className="topic-feature-grid">
        {data.topics.slice(0, 6).map((topic) => (
          <button className={selectedTopic === topic.name ? 'selected' : ''} aria-pressed={selectedTopic === topic.name} onClick={() => setSelectedTopic(topic.name)} key={topic.name}>
            <span>#{topic.name}</span><strong>{topic.repositories}</strong><small>{topic.activeRepositories} 个本月活跃 · {formatStars(topic.stars)} Stars</small>
          </button>
        ))}
      </div>

      <div className="topic-groups">
        <section><div><h2>平台生态</h2><span>{platformTopics.length}</span></div><nav>{platformTopics.map((topic) => <button className={selectedTopic === topic.name ? 'selected' : ''} aria-pressed={selectedTopic === topic.name} key={topic.name} onClick={() => setSelectedTopic(topic.name)}>#{topic.name}<small>{topic.repositories}</small></button>)}</nav></section>
        <section><div><h2>能力与工具</h2><span>{capabilityTopics.length}</span></div><nav>{capabilityTopics.map((topic) => <button className={selectedTopic === topic.name ? 'selected' : ''} aria-pressed={selectedTopic === topic.name} key={topic.name} onClick={() => setSelectedTopic(topic.name)}>#{topic.name}<small>{topic.repositories}</small></button>)}</nav></section>
      </div>

      {selected ? (
        <div className="topic-result-heading">
          <div><h2>#{selected.name}</h2><p>{selected.repositories} 个仓库，其中 {selected.activeRepositories} 个最近 30 天仍在更新。</p></div>
          <a href={selected.url} target="_blank" rel="noreferrer">在 GitHub 查看 <ArrowUpRight size={16} /></a>
        </div>
      ) : null}
      <PaginatedSkillGrid
        skills={topicSkills}
        resetKey={`topic:${selectedTopic}:${topicSkills.length}`}
        favorites={favorites}
        onSelect={onSelect}
        onFavorite={onFavorite}
      />
    </section>
  )
}

export function AboutView({ data, repositoryUrl }: { data: SkillData; repositoryUrl: string }) {
  return (
    <section className="content-page about-page">
      <div className="about-hero">
        <h1>找 Skill，不用再翻遍 GitHub。</h1>
        <p>SkillHot 把 GitHub 上可安装、仍在维护的 Agent Skills 与配套工具整理成一份每天更新的中文索引，帮你更快找到趁手的那一个。</p>
        <div><a className="black-button" href={repositoryUrl} target="_blank" rel="noreferrer"><GithubMark width={18} height={18} /> 在 GitHub 查看源代码</a></div>
      </div>
      <div className="about-metrics">
        <article><strong>{data.meta.repositories}</strong><span>动态收录</span></article>
        <article><strong>{data.categories.length}</strong><span>工作分类</span></article>
        <article><strong>{data.topics.length}</strong><span>生态话题</span></article>
        <article><strong>{formatUpdatedAt(data.meta.generatedAt)}</strong><span>最近更新</span></article>
      </div>
      <div className="principle-grid">
        <article><SearchCheck /><h2>动态筛选</h2><p>不按固定数量截断，而是按相关性、活跃度、质量和精选来源决定是否收录。</p></article>
        <article><RefreshCw /><h2>每天更新</h2><p>Stars、活跃度、安装方式、兼容平台和收录状态每天刷新。</p></article>
        <article><Database /><h2>AI 解读</h2><p>用中文补充项目用途、适合场景和预期效果，先看懂再决定要不要点进 GitHub。</p></article>
        <article><ShieldCheck /><h2>放心参考</h2><p>每条信息都能链接回原始仓库核对，方便你自己判断要不要用。</p></article>
      </div>
    </section>
  )
}
