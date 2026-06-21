import { ArrowRight, ArrowUpRight, Database, HeartHandshake, RefreshCw, SearchCheck, ShieldCheck } from 'lucide-react'
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
        <div><h1>技能分类</h1><p>按真实工作场景浏览，所有页面使用同一套分类标准。</p></div>
        <strong>{data.categories.length}</strong>
      </div>
      <div className="category-board">
        <button className={category === '全部' ? 'selected' : ''} aria-pressed={category === '全部'} onClick={() => selectCategory('全部')}>
          <span>全部分类</span><strong>{data.meta.repositories}</strong><p>浏览 SkillHot 收录的全部开源项目。</p><ArrowRight size={18} />
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
      <SkillGrid skills={skills} limit={24} {...actions} />
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
    () => data.skills.filter((skill) => skill.sourceTopics.includes(selectedTopic)).slice(0, 18),
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
      <SkillGrid skills={topicSkills} favorites={favorites} onSelect={onSelect} onFavorite={onFavorite} />
    </section>
  )
}

export function AboutView({ data, repositoryUrl }: { data: SkillData; repositoryUrl: string }) {
  return (
    <section className="content-page about-page">
      <div className="about-hero">
        <h1>让好用的 Agent Skills 更容易被发现。</h1>
        <p>SkillHot 是一个开放的中文索引，持续整理 GitHub 上可安装、可复用、仍在维护的 Agent Skills。</p>
        <div><a className="black-button" href={repositoryUrl} target="_blank" rel="noreferrer"><GithubMark width={18} height={18} /> 查看源代码</a><a href={`${import.meta.env.BASE_URL}data/skills.csv`} download>下载开放数据</a></div>
      </div>
      <div className="about-metrics">
        <article><strong>{data.meta.repositories}</strong><span>开源仓库</span></article>
        <article><strong>{data.categories.length}</strong><span>工作分类</span></article>
        <article><strong>{data.topics.length}</strong><span>生态话题</span></article>
        <article><strong>{formatUpdatedAt(data.meta.generatedAt)}</strong><span>最近更新</span></article>
      </div>
      <div className="principle-grid">
        <article><SearchCheck /><h2>多源发现</h2><p>综合 GitHub Topics、聚焦搜索和经过核验的社区来源，降低遗漏。</p></article>
        <article><RefreshCw /><h2>持续更新</h2><p>每天刷新 Stars、活跃度、README 安装方式、兼容平台与媒体信息。</p></article>
        <article><Database /><h2>开放数据</h2><p>网站使用的 JSON 与 CSV 均公开，可下载、复核或用于自己的项目。</p></article>
        <article><ShieldCheck /><h2>可追溯</h2><p>每个条目都链接回原始仓库与 GitHub Topic，不代替作者文档。</p></article>
      </div>
      <div className="community-callout">
        <HeartHandshake size={28} />
        <div><h2>一起完善 Skills 地图</h2><p>欢迎在 GitHub 提交遗漏项目、分类建议或数据修正。</p></div>
        <a href={`${repositoryUrl}/issues/new`} target="_blank" rel="noreferrer">提交建议 <ArrowUpRight size={16} /></a>
      </div>
    </section>
  )
}
