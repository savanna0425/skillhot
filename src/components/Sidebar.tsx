import {
  Bookmark,
  Compass,
  Grid2X2,
  Info,
  MessagesSquare,
  Trophy,
} from 'lucide-react'
import type { ViewKey } from '../types'

const items = [
  { key: 'discover', label: '发现', icon: Compass },
  { key: 'ranking', label: '榜单', icon: Trophy },
  { key: 'categories', label: '分类', icon: Grid2X2 },
  { key: 'topics', label: '话题', icon: MessagesSquare },
  { key: 'favorites', label: '收藏', icon: Bookmark },
] as const

interface SidebarProps {
  view: ViewKey
  setView: (view: ViewKey) => void
  favoriteCount: number
}

export function Sidebar({ view, setView, favoriteCount }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="主导航">
      <button className="brand-mark" onClick={() => setView('discover')} aria-label="返回发现页">S.</button>
      <nav className="sidebar-nav">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            className={`nav-item ${view === key ? 'active' : ''}`}
            key={key}
            onClick={() => setView(key)}
            aria-current={view === key ? 'page' : undefined}
          >
            <span className="nav-icon-wrap">
              <Icon size={23} strokeWidth={1.8} />
              {key === 'favorites' && favoriteCount > 0 ? <span className="favorite-count">{favoriteCount}</span> : null}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <button className={`nav-item about-item ${view === 'about' ? 'active' : ''}`} onClick={() => setView('about')}>
        <Info size={23} strokeWidth={1.8} />
        <span>关于</span>
      </button>
    </aside>
  )
}
