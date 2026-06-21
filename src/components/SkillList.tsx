import { Bookmark, ExternalLink, Flame, Star } from 'lucide-react'
import type { Skill } from '../types'
import { formatDate, formatStars } from '../utils'

interface SkillListProps {
  title: string
  skills: Skill[]
  selected?: Skill
  favorites: Set<string>
  onSelect: (skill: Skill) => void
  onFavorite: (skill: Skill) => void
}

export function SkillList({ title, skills, selected, favorites, onSelect, onFavorite }: SkillListProps) {
  return (
    <section className="skills-section">
      <div className="section-heading list-heading">
        <h2>{title}</h2>
        <span>{skills.length} 个仓库</span>
      </div>
      <div className="skill-list">
        {skills.map((skill) => (
          <article className={`skill-row ${selected?.fullName === skill.fullName ? 'selected' : ''}`} key={skill.fullName}>
            <button className="skill-main" type="button" onClick={() => onSelect(skill)}>
              <img className="avatar" src={skill.avatarUrl} alt={`${skill.owner} avatar`} loading="lazy" />
              <span className="repo-copy">
                <strong>{skill.fullName}</strong>
                <small>{skill.summary}</small>
              </span>
            </button>
            <span className="category-label">{skill.category}</span>
            <span className="stars"><Star size={15} fill="currentColor" /> {formatStars(skill.stars)}</span>
            <span className="updated">{formatDate(skill.pushedAt)} 更新</span>
            <span className="activity"><Flame size={15} /> {skill.activity}<i /></span>
            <div className="row-actions">
              <button
                className={`favorite-button ${favorites.has(skill.fullName) ? 'active' : ''}`}
                type="button"
                onClick={() => onFavorite(skill)}
                aria-label={favorites.has(skill.fullName) ? '取消收藏' : '收藏'}
              >
                <Bookmark size={17} fill={favorites.has(skill.fullName) ? 'currentColor' : 'none'} />
              </button>
              <button className="view-button" type="button" onClick={() => onSelect(skill)}>查看</button>
              <a className="external-button" href={skill.url} target="_blank" rel="noreferrer" aria-label={`打开 ${skill.fullName}`}>
                <ExternalLink size={16} />
              </a>
            </div>
          </article>
        ))}
        {skills.length === 0 ? (
          <div className="empty-state">
            <strong>暂时没有匹配项</strong>
            <span>试试别的关键词或分类。</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
