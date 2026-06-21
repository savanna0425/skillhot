import { Search } from 'lucide-react'
import type { SkillData } from '../types'
import { formatUpdatedAt } from '../utils'
import { GithubMark } from './GithubMark'

interface HeaderHeroProps {
  data: SkillData
  query: string
  setQuery: (query: string) => void
  compact?: boolean
}

export function HeaderHero({ data, query, setQuery, compact = false }: HeaderHeroProps) {
  return (
    <>
      <header className="main-header">
        <button className="wordmark" type="button">SkillHot</button>
        <label className="search-field">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索技能、仓库或使用场景"
            aria-label="搜索技能、仓库或使用场景"
          />
          <kbd>⌘ K</kbd>
        </label>
        <a className="github-button secondary-button" href="https://github.com/topics/agent-skills" target="_blank" rel="noreferrer">
          <GithubMark width={19} height={19} /> GitHub
        </a>
      </header>
      {!compact ? (
        <section className="hero-section">
          <div>
            <h1>今天，给 Agent 加点新本事。</h1>
            <p>追踪 GitHub 高星、高活跃、真能落地的 Skills 与合集。每天自动更新，不烧 Token。</p>
          </div>
          <div className="update-card" aria-label="数据更新时间">
            <span><i /> 今日已更新</span>
            <strong>{formatUpdatedAt(data.meta.generatedAt)}</strong>
            <small>GitHub API · {data.meta.tokenCost} Token</small>
          </div>
        </section>
      ) : null}
    </>
  )
}
