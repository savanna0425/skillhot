import { Bookmark, ChevronDown, ExternalLink, Flame, SlidersHorizontal, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Skill, SortKey } from '../types'
import { formatDate, formatStars } from '../utils'

interface RankingTableProps {
  skills: Skill[]
  categories: string[]
  category: string
  onCategory: (category: string) => void
  sort: SortKey
  onSort: (sort: SortKey) => void
  selected?: Skill
  favorites: Set<string>
  onSelect: (skill: Skill) => void
  onFavorite: (skill: Skill) => void
}

export function RankingTable({
  skills,
  categories,
  category,
  onCategory,
  sort,
  onSort,
  selected,
  favorites,
  onSelect,
  onFavorite,
}: RankingTableProps) {
  const [limit, setLimit] = useState(50)
  useEffect(() => setLimit(50), [category, sort, skills.length])
  const visible = skills.slice(0, limit)

  return (
    <section className="ranking-page">
      <div className="page-heading ranking-heading">
        <div><h1>Skills 榜单</h1><p>按综合热度、Stars 或最近更新查看完整索引。</p></div>
        <div className="ranking-total"><strong>{skills.length}</strong><span>匹配项目</span></div>
      </div>

      <div className="ranking-controls">
        <div className="filter-buttons" role="tablist" aria-label="榜单分类">
          {categories.map((item) => (
            <button key={item} className={category === item ? 'selected' : ''} onClick={() => onCategory(item)} role="tab" aria-selected={category === item}>{item}</button>
          ))}
        </div>
        <label className="sort-control">
          <SlidersHorizontal size={16} />
          <select value={sort} onChange={(event) => onSort(event.target.value as SortKey)} aria-label="榜单排序">
            <option value="score">综合热度</option>
            <option value="stars">Stars</option>
            <option value="recent">最近更新</option>
          </select>
          <ChevronDown size={15} />
        </label>
      </div>

      <div className="ranking-table" role="table" aria-label="Skills 排名">
        <div className="ranking-table-head" role="row">
          <span role="columnheader">排名</span><span role="columnheader">仓库</span><span role="columnheader">分类</span><span role="columnheader">Stars</span><span role="columnheader">活跃度</span><span role="columnheader">更新</span><span role="columnheader">操作</span>
        </div>
        {visible.map((skill, index) => {
          const active = selected?.fullName === skill.fullName
          return (
            <article className={`ranking-row ${active ? 'selected' : ''}`} role="row" key={skill.fullName}>
              <strong className="rank-number" role="cell">{String(index + 1).padStart(2, '0')}</strong>
              <button className="rank-repo" type="button" onClick={() => onSelect(skill)} role="cell">
                <img src={skill.avatarUrl} alt="" loading="lazy" />
                <span><strong>{skill.fullName}</strong><small>{skill.summary}</small></span>
              </button>
              <span className="rank-category" role="cell">{skill.category}</span>
              <span className="rank-stars" role="cell"><Star size={15} fill="currentColor" /> {formatStars(skill.stars)}</span>
              <span className="rank-activity" role="cell"><Flame size={15} /> {skill.activity}</span>
              <span className="rank-updated" role="cell">{formatDate(skill.pushedAt)}</span>
              <span className="rank-actions" role="cell">
                <button type="button" onClick={() => onFavorite(skill)} aria-label={favorites.has(skill.fullName) ? '取消收藏' : '收藏'} className={favorites.has(skill.fullName) ? 'saved' : ''}><Bookmark size={16} fill={favorites.has(skill.fullName) ? 'currentColor' : 'none'} /></button>
                <button type="button" onClick={() => onSelect(skill)}>详情</button>
                <a href={skill.url} target="_blank" rel="noreferrer" aria-label={`打开 ${skill.fullName}`}><ExternalLink size={16} /></a>
              </span>
            </article>
          )
        })}
      </div>
      {!visible.length ? <div className="empty-grid"><strong>没有匹配的榜单项目</strong><span>尝试调整搜索词或分类。</span></div> : null}
      {limit < skills.length ? <button className="load-more" type="button" onClick={() => setLimit((value) => value + 50)}>加载更多 <span>{skills.length - limit}</span></button> : null}
    </section>
  )
}
