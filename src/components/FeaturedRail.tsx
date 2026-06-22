import { ArrowRight, Bookmark, ExternalLink, RefreshCw, Sparkles, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { SyntheticEvent } from 'react'
import type { Skill, SkillData } from '../types'
import { daysFromNow, formatStars, formatUpdatedAt } from '../utils'

const previewFallback = `${import.meta.env.BASE_URL}assets/illustrations/official-skills.png`
const avatarFallback = `${import.meta.env.BASE_URL}favicon.svg`

function useFallback(event: SyntheticEvent<HTMLImageElement>, fallback: string) {
  const image = event.currentTarget
  image.onerror = null
  image.src = fallback
}

interface SkillActions {
  selected?: Skill
  favorites: Set<string>
  onSelect: (skill: Skill) => void
  onFavorite: (skill: Skill) => void
}

interface SkillCardProps extends SkillActions {
  skill: Skill
  compact?: boolean
}

export function SkillCard({ skill, selected, favorites, onSelect, onFavorite, compact = false }: SkillCardProps) {
  const active = selected?.fullName === skill.fullName
  const updatedDays = daysFromNow(skill.pushedAt)
  return (
    <article className={`discovery-card ${active ? 'selected' : ''} ${compact ? 'compact' : ''}`}>
      <button className="card-hit-area" type="button" onClick={() => onSelect(skill)} aria-label={`查看 ${skill.fullName}`} />
      <div className="card-preview">
        <img src={skill.media.socialPreview} alt="" loading="lazy" onError={(event) => useFallback(event, previewFallback)} />
        <span>{skill.category}</span>
      </div>
      <div className="card-content">
        <div className="card-title-row">
          <img src={skill.avatarUrl} alt="" loading="lazy" onError={(event) => useFallback(event, avatarFallback)} />
          <div><strong>{skill.fullName}</strong><small>{skill.platforms.slice(0, 3).join(' · ')}</small></div>
        </div>
        <p>{skill.summary}</p>
        <div className="card-meta">
          <span><Star size={14} fill="currentColor" /> {formatStars(skill.stars)}</span>
          <span>{updatedDays === 0 ? '今天更新' : `${updatedDays} 天前更新`}</span>
        </div>
        <div className="card-actions">
          <button
            type="button"
            className={favorites.has(skill.fullName) ? 'saved' : ''}
            onClick={() => onFavorite(skill)}
            aria-label={favorites.has(skill.fullName) ? '取消收藏' : '收藏'}
          >
            <Bookmark size={16} fill={favorites.has(skill.fullName) ? 'currentColor' : 'none'} />
          </button>
          <button type="button" onClick={() => onSelect(skill)}>详情</button>
          <a href={skill.url} target="_blank" rel="noreferrer" aria-label={`在 GitHub 打开 ${skill.fullName}`}><ExternalLink size={16} /></a>
        </div>
      </div>
    </article>
  )
}

interface SkillGridProps extends SkillActions {
  skills: Skill[]
  emptyText?: string
  limit?: number
}

export function SkillGrid({ skills, emptyText = '没有找到匹配的 Skills', limit, ...actions }: SkillGridProps) {
  const visible = typeof limit === 'number' ? skills.slice(0, limit) : skills
  if (!visible.length) return <div className="empty-grid"><Sparkles size={24} /><strong>{emptyText}</strong><span>尝试调整搜索词或分类。</span></div>
  return <div className="skill-card-grid">{visible.map((skill) => <SkillCard key={skill.fullName} skill={skill} {...actions} />)}</div>
}

interface DiscoverViewProps extends SkillActions {
  data: SkillData
  skills: Skill[]
  searching?: boolean
}

function hashName(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash)
}

function shuffledSkills(skills: Skill[], seed: number) {
  const copy = [...skills]
  let state = seed || 1
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export function DiscoverView({ data, skills, searching = false, ...actions }: DiscoverViewProps) {
  const [refresh, setRefresh] = useState(0)
  const newest = useMemo(
    () => skills.toSorted((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()).slice(0, 8),
    [skills],
  )
  const collections = useMemo(
    () => skills.filter((skill) => skill.isCollection).toSorted((a, b) => b.score - a.score).slice(0, 4),
    [skills],
  )
  const recommendations = useMemo(() => {
    if (!skills.length) return []
    const seed = hashName(`${new Date().toISOString().slice(0, 10)}:${skills.length}`)
    const shuffled = shuffledSkills(skills, seed)
    const offset = (refresh * 12) % shuffled.length
    return [...shuffled, ...shuffled].slice(offset, offset + Math.min(12, shuffled.length))
  }, [refresh, skills])

  return (
    <div className="discover-page">
      <section className="discover-hero">
        <div>
          <h1>发现适合你的 Agent Skills</h1>
          <p>持续整理可安装的 Skills 与配套 Agent 工具，用准确中文简介帮你更快选对。</p>
          <div className="hero-facts">
            <span><strong>{data.meta.repositories}</strong> 个仓库</span>
            <span><strong>{data.categories.length}</strong> 个分类</span>
            <span>更新于 {formatUpdatedAt(data.meta.generatedAt)}</span>
          </div>
        </div>
        <img src={`${import.meta.env.BASE_URL}assets/illustrations/superpowers.png`} alt="Agent 正在发现新技能" />
      </section>

      {searching ? (
        <section className="search-results-section">
          <div className="section-title-row">
            <div><h2>搜索结果</h2><p>找到 {skills.length} 个匹配项目，按综合质量排序。</p></div>
          </div>
          <SkillGrid skills={skills} limit={48} {...actions} />
        </section>
      ) : (
        <>

      <section className="new-discoveries">
        <div className="section-title-row"><div><h2>本周新发现</h2><p>最近仍在快速更新的实用项目。</p></div></div>
        <div className="story-rail">
          {newest.map((skill) => <SkillCard key={skill.fullName} skill={skill} compact {...actions} />)}
        </div>
      </section>

      {collections.length ? (
        <section className="collection-spotlight">
          <div className="section-title-row"><div><h2>精选技能合集</h2><p>一次找到一整套可安装的能力。</p></div></div>
          <div className="collection-list">
            {collections.map((skill) => (
              <button key={skill.fullName} className={actions.selected?.fullName === skill.fullName ? 'selected' : ''} aria-pressed={actions.selected?.fullName === skill.fullName} onClick={() => actions.onSelect(skill)}>
                <img src={skill.avatarUrl} alt="" onError={(event) => useFallback(event, avatarFallback)} /><span><strong>{skill.fullName}</strong><small>{skill.summary}</small></span><em>{skill.skillCount > 1 ? `${skill.skillCount}+ Skills` : formatStars(skill.stars)}</em><ArrowRight size={18} />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="recommendation-section">
        <div className="section-title-row">
          <div><h2>随机漫游</h2><p>换一批，也许会遇到意料之外的好工具。</p></div>
          <button onClick={() => setRefresh((value) => value + 1)}><RefreshCw size={16} /> 换一批</button>
        </div>
        <div key={refresh} className="recommendation-batch"><SkillGrid skills={recommendations} {...actions} /></div>
      </section>
        </>
      )}
    </div>
  )
}
