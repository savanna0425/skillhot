import { LogIn, Menu, Search, UserRound } from 'lucide-react'
import type { ViewKey } from '../types'
import { GithubMark } from './GithubMark'

const primaryNavigation: Array<{ key: ViewKey; label: string }> = [
  { key: 'discover', label: '发现' },
  { key: 'ranking', label: '榜单' },
  { key: 'categories', label: '分类' },
  { key: 'topics', label: '话题' },
]

interface SiteHeaderProps {
  view: ViewKey
  onNavigate: (view: ViewKey) => void
  query: string
  setQuery: (query: string) => void
  repositoryUrl: string
  onMenu: () => void
  userEmail?: string
  authConfigured: boolean
  authLoading: boolean
}

export function SiteHeader({ view, onNavigate, query, setQuery, repositoryUrl, onMenu, userEmail, authConfigured, authLoading }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <button className="site-wordmark" type="button" onClick={() => onNavigate('discover')}>SkillHot</button>
      <nav className="primary-navigation" aria-label="主要页面">
        {primaryNavigation.map((item) => (
          <button
            key={item.key}
            type="button"
            className={view === item.key ? 'active' : ''}
            onClick={() => onNavigate(item.key)}
            aria-current={view === item.key ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <label className="global-search">
        <Search size={18} />
        <input
          data-skill-search
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索 Skills、仓库、场景或平台"
          aria-label="搜索 Skills、仓库、场景或平台"
        />
        <kbd>⌘ K</kbd>
      </label>
      <a className="repository-link" href={repositoryUrl} target="_blank" rel="noreferrer">
        <GithubMark width={19} height={19} />
        <span>GitHub</span>
      </a>
      <button className={`account-button ${view === 'profile' || view === 'auth' ? 'active' : ''}`} type="button" onClick={() => onNavigate(userEmail ? 'profile' : 'auth')} title={userEmail || (authConfigured ? '登录' : '账号功能等待配置')}>
        {userEmail ? <UserRound size={18} /> : <LogIn size={18} />}
        <span>{authLoading ? '…' : userEmail ? userEmail : '登录'}</span>
      </button>
      <button className="mobile-menu-button" type="button" aria-label="打开筛选菜单" onClick={onMenu}><Menu size={22} /></button>
    </header>
  )
}
