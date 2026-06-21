import { ArrowUpRight, Star } from 'lucide-react'
import type { Skill } from '../types'
import { formatStars } from '../utils'

const preferred = ['obra/superpowers', 'anthropics/skills', 'K-Dense-AI/scientific-agent-skills']

interface FeaturedRailProps {
  skills: Skill[]
  onSelect: (skill: Skill) => void
}

export function FeaturedRail({ skills, onSelect }: FeaturedRailProps) {
  const selected = preferred
    .map((name) => skills.find((skill) => skill.fullName === name))
    .filter((skill): skill is Skill => Boolean(skill))
  const featured = [...selected, ...skills.filter((skill) => !preferred.includes(skill.fullName))].slice(0, 3)
  const illustrations = ['superpowers.png', 'official-skills.png', 'science-skills.png']

  return (
    <section className="featured-section">
      <div className="section-heading">
        <h2>本周值得装</h2>
        <span>编辑选择 · 根据热度与活跃度</span>
      </div>
      <div className="featured-grid">
        {featured.map((skill, index) => (
          <button
            type="button"
            className={`featured-card ${index === 1 ? 'dark' : ''}`}
            key={skill.fullName}
            onClick={() => onSelect(skill)}
          >
            <div className="featured-copy">
              <strong>{skill.fullName}</strong>
              <span>{skill.summary}</span>
            </div>
            <img src={`${import.meta.env.BASE_URL}assets/illustrations/${illustrations[index]}`} alt="" />
            <div className="featured-meta">
              <span><Star size={16} fill="currentColor" /> {formatStars(skill.stars)}</span>
              <i><ArrowUpRight size={18} /></i>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
