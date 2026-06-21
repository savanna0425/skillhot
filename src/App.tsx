import { Download } from 'lucide-react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { DetailPanel } from './components/DetailPanel'
import { DiscoverView, SkillGrid } from './components/FeaturedRail'
import { SiteHeader } from './components/HeaderHero'
import { AboutView, CategoriesView, TopicsView } from './components/InfoViews'
import { Sidebar } from './components/Sidebar'
import { RankingTable } from './components/SkillList'
import type { Skill, SkillData, SortKey, ViewKey } from './types'

const repositoryUrl = 'https://github.com/savanna0425/skillhot'
const validViews: ViewKey[] = ['discover', 'ranking', 'categories', 'topics', 'favorites', 'about']

const emptyData: SkillData = {
  meta: {
    generatedAt: new Date().toISOString(),
    query: 'skill',
    topicPages: 3,
    repositories: 0,
    sourceTopics: 0,
    discoveryChannels: 0,
    updateMode: 'GitHub REST API',
  },
  topicPages: [],
  sourceTopics: [],
  topics: [],
  categories: [],
  skills: [],
}

function initialView(): ViewKey {
  const value = window.location.hash.replace('#', '') as ViewKey
  return validViews.includes(value) ? value : 'discover'
}

function App() {
  const [data, setData] = useState<SkillData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [view, setView] = useState<ViewKey>(initialView)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [category, setCategory] = useState('全部')
  const [sort, setSort] = useState<SortKey>('score')
  const [selected, setSelected] = useState<Skill>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('skillhot:favorites:v1') || localStorage.getItem('skillhot:favorites') || '[]'
      return new Set(JSON.parse(stored))
    } catch {
      return new Set()
    }
  })

  const updateQuery = (value: string) => {
    setQuery(value)
    if (value.trim()) setCategory('全部')
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}data/skills.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<SkillData>
      })
      .then((payload) => {
        setData(payload)
        const preferred = payload.skills.find((skill) => skill.fullName === 'anthropics/skills')
        setSelected(preferred || payload.skills[0])
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('SkillHot data failed to load', error)
        setLoadError(true)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const onHashChange = () => setView(initialView())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('[data-skill-search]')?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const navigate = (next: ViewKey) => {
    setView(next)
    setMobileFiltersOpen(false)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${next}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const categories = useMemo(() => ['全部', ...data.categories.map((item) => item.name)], [data.categories])

  const visibleSkills = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase()
    const filtered = data.skills.filter((skill) => {
      const matchesCategory = category === '全部' || skill.category === category
      const text = [
        skill.fullName,
        skill.summary,
        skill.description,
        skill.category,
        ...skill.scenarios,
        ...skill.sourceTopics,
        ...skill.platforms,
      ].join(' ').toLowerCase()
      return matchesCategory && (!normalized || text.includes(normalized))
    })
    return filtered.toSorted((a, b) => {
      if (sort === 'stars') return b.stars - a.stars
      if (sort === 'recent') return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
      return b.score - a.score
    })
  }, [category, data.skills, deferredQuery, sort])

  const favoriteSkills = useMemo(
    () => data.skills.filter((skill) => favorites.has(skill.fullName)),
    [data.skills, favorites],
  )

  const toggleFavorite = (skill: Skill) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(skill.fullName)) next.delete(skill.fullName)
      else next.add(skill.fullName)
      localStorage.setItem('skillhot:favorites:v1', JSON.stringify([...next]))
      return next
    })
  }

  const selectSkill = (skill: Skill) => {
    setSelected(skill)
    setDetailOpen(true)
  }

  const selectSidebarCategory = (name: string) => {
    setCategory(name)
    if (view === 'topics' || view === 'about' || view === 'favorites') navigate('categories')
  }

  const sharedGridProps = {
    selected,
    favorites,
    onSelect: selectSkill,
    onFavorite: toggleFavorite,
  }

  const renderMain = () => {
    if (loadError) {
      return (
        <section className="page-state" role="alert">
          <h1>数据暂时没有加载成功</h1>
          <p>请稍后刷新页面，或前往 GitHub 查看当前数据状态。</p>
          <a href={repositoryUrl} target="_blank" rel="noreferrer">打开项目仓库</a>
        </section>
      )
    }
    if (loading) return <section className="page-state"><span className="loading-dot" />正在同步 GitHub Skills 数据…</section>
    if (view === 'discover') {
      return <DiscoverView data={data} skills={visibleSkills} categories={categories} category={category} onCategory={setCategory} {...sharedGridProps} />
    }
    if (view === 'ranking') {
      return <RankingTable skills={visibleSkills} categories={categories} category={category} onCategory={setCategory} sort={sort} onSort={setSort} {...sharedGridProps} />
    }
    if (view === 'categories') {
      return <CategoriesView data={data} skills={visibleSkills} category={category} onCategory={setCategory} {...sharedGridProps} />
    }
    if (view === 'topics') return <TopicsView data={data} onSelect={selectSkill} favorites={favorites} onFavorite={toggleFavorite} />
    if (view === 'about') return <AboutView data={data} repositoryUrl={repositoryUrl} />
    return (
      <section className="content-page">
        <div className="page-heading">
          <div><h1>收藏</h1><p>保存在当前浏览器中的 Skills，方便稍后继续查看。</p></div>
          <strong>{favoriteSkills.length}</strong>
        </div>
        <SkillGrid skills={favoriteSkills} emptyText="还没有收藏任何 Skill" {...sharedGridProps} />
      </section>
    )
  }

  return (
    <div className="site-app">
      <SiteHeader view={view} onNavigate={navigate} query={query} setQuery={updateQuery} repositoryUrl={repositoryUrl} onMenu={() => setMobileFiltersOpen(true)} />
      <div className={`site-layout ${leftCollapsed ? 'left-collapsed' : ''} ${detailOpen ? 'detail-visible' : ''}`}>
        <Sidebar
          view={view}
          onNavigate={navigate}
          categories={data.categories}
          category={category}
          onCategory={selectSidebarCategory}
          favoriteCount={favorites.size}
          collapsed={leftCollapsed}
          onCollapse={() => setLeftCollapsed((value) => !value)}
          mobileOpen={mobileFiltersOpen}
          onMobileClose={() => setMobileFiltersOpen(false)}
        />
        <main id="main-content" className="site-main">
          {renderMain()}
          <footer className="site-footer">
            <span>SkillHot · 每日更新的开源 Agent Skills 索引</span>
            <nav>
              <button onClick={() => navigate('about')}>关于</button>
              <a href={repositoryUrl} target="_blank" rel="noreferrer">GitHub</a>
              <a href={`${import.meta.env.BASE_URL}data/skills.csv`} download><Download size={15} /> 导出 CSV</a>
            </nav>
          </footer>
        </main>
        <DetailPanel
          skill={selected}
          open={detailOpen}
          isFavorite={selected ? favorites.has(selected.fullName) : false}
          onFavorite={toggleFavorite}
          onClose={() => setDetailOpen(false)}
          onRestore={() => setDetailOpen(true)}
        />
      </div>
      {mobileFiltersOpen || detailOpen ? <button className="page-scrim" aria-label="关闭浮层" onClick={() => { setMobileFiltersOpen(false); setDetailOpen(false) }} /> : null}
    </div>
  )
}

export default App
