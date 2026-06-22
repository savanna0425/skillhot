import {
  BarChart3,
  Bookmark,
  Bot,
  BriefcaseBusiness,
  Brush,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  FileText,
  FlaskConical,
  FolderKanban,
  Grid2X2,
  Info,
  Library,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import type { SkillData, ViewKey } from '../types'

const iconByCategory: Record<string, ComponentType<LucideProps>> = {
  'UI设计': Brush,
  '编程开发': Code2,
  '办公效率': BriefcaseBusiness,
  '内容创作': FileText,
  '数据分析': BarChart3,
  '研究学习': FlaskConical,
  '自动化': Zap,
  '安全': ShieldCheck,
  '记忆与上下文': Database,
  'Agent工具与平台': Bot,
  '产品与商业': FolderKanban,
  '技能开发': Sparkles,
  '技能合集': Library,
  '其他': FolderKanban,
}

interface SidebarProps {
  view: ViewKey
  onNavigate: (view: ViewKey) => void
  categories: SkillData['categories']
  category: string
  onCategory: (category: string) => void
  favoriteCount: number
  collapsed: boolean
  onCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({
  view,
  onNavigate,
  categories,
  category,
  onCategory,
  favoriteCount,
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  return (
    <aside className={`filter-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`} aria-label="分类与导航">
      <div className="sidebar-toolbar">
        <strong>浏览</strong>
        <button className="mobile-sidebar-close" type="button" onClick={onMobileClose} aria-label="关闭菜单"><X size={20} /></button>
        <button className="sidebar-collapse" type="button" onClick={onCollapse} aria-label={collapsed ? '展开左侧栏' : '收起左侧栏'}>
          {collapsed ? <PanelLeftOpen size={19} /> : <><PanelLeftClose size={19} /><span>收起</span></>}
        </button>
      </div>

      <nav className="sidebar-shortcuts" aria-label="快捷页面">
        <button className={view === 'discover' ? 'active' : ''} onClick={() => onNavigate('discover')} title="发现">
          <Sparkles size={18} /><span>发现</span>{collapsed ? <ChevronRight size={14} /> : null}
        </button>
        <button className={view === 'favorites' ? 'active' : ''} onClick={() => onNavigate('favorites')} title="收藏">
          <Bookmark size={18} /><span>收藏</span>{favoriteCount > 0 ? <em>{favoriteCount}</em> : null}
        </button>
        <button className={`mobile-shortcut ${view === 'ranking' ? 'active' : ''}`} onClick={() => onNavigate('ranking')} title="榜单">
          <Trophy size={18} /><span>榜单</span>
        </button>
        <button className={`mobile-shortcut ${view === 'categories' ? 'active' : ''}`} onClick={() => onNavigate('categories')} title="分类">
          <Grid2X2 size={18} /><span>分类</span>
        </button>
        <button className={`mobile-shortcut ${view === 'topics' ? 'active' : ''}`} onClick={() => onNavigate('topics')} title="话题">
          <MessagesSquare size={18} /><span>话题</span>
        </button>
        <button className={`mobile-shortcut ${view === 'about' ? 'active' : ''}`} onClick={() => onNavigate('about')} title="关于">
          <Info size={18} /><span>关于</span>
        </button>
      </nav>

      <div className="sidebar-section-heading"><span>分类</span><small>{categories.length}</small></div>
      <div className="category-filter-list">
        <button className={category === '全部' ? 'active' : ''} aria-pressed={category === '全部'} onClick={() => onCategory('全部')} title="全部 Skills">
          <Library size={18} /><span>全部 Skills</span><small>{categories.reduce((sum, item) => sum + item.count, 0)}</small>
        </button>
        {categories.map((item) => {
          const Icon = iconByCategory[item.name] || FolderKanban
          return (
            <button className={category === item.name ? 'active' : ''} aria-pressed={category === item.name} onClick={() => onCategory(item.name)} key={item.name} title={item.name}>
              <Icon size={18} /><span>{item.name}</span><small>{item.count}</small>
            </button>
          )
        })}
      </div>

      <button className="clear-filter" type="button" onClick={() => onCategory('全部')}>
        <RefreshCw size={16} /><span>清除筛选</span>
      </button>
      <button className="sidebar-edge-toggle" type="button" onClick={onCollapse} aria-label={collapsed ? '展开左侧栏' : '收起左侧栏'}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}
