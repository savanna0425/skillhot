import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useAuth } from './auth/AuthContext'
import { AuthView, ProfileView } from './components/AuthViews'
import { DetailPanel } from './components/DetailPanel'
import { DiscoverView, SkillGrid } from './components/FeaturedRail'
import { SiteHeader } from './components/HeaderHero'
import { AboutView, CategoriesView, TopicsView } from './components/InfoViews'
import { FeedbackDialog } from './components/FeedbackDialog'
import { Sidebar } from './components/Sidebar'
import { RankingTable } from './components/SkillList'
import { supabase } from './lib/supabase'
import type { DetailMode, Skill, SkillData, SortKey, ViewKey } from './types'

const repositoryUrl = 'https://github.com/savanna0425/skillhot'
const validViews: ViewKey[] = ['discover', 'ranking', 'categories', 'topics', 'favorites', 'about', 'auth', 'profile']

const DETAIL_MODE_KEY = 'skillhot:detailMode'
const DETAIL_MODES: DetailMode[] = ['side', 'half', 'full']

function initialDetailMode(): DetailMode {
  const stored = window.localStorage.getItem(DETAIL_MODE_KEY) as DetailMode | null
  return stored && DETAIL_MODES.includes(stored) ? stored : 'side'
}

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
  const { configured: authConfigured, loading: authLoading, user } = useAuth()
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
  const [detailMode, setDetailMode] = useState<DetailMode>(initialDetailMode)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [categoryScrollRequest, setCategoryScrollRequest] = useState(0)

  const updateQuery = (value: string) => {
    setQuery(value)
    if (value.trim()) setCategory('全部')
  }

  useEffect(() => {
    let active = true
    fetch(`${import.meta.env.BASE_URL}data/skills.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<SkillData>
      })
      .then((payload) => {
        if (!active) return
        setData(payload)
        const preferred = payload.skills.find((skill) => skill.fullName === 'anthropics/skills')
        setSelected(preferred || payload.skills[0])
      })
      .catch((error: unknown) => {
        if (!active) return
        console.error('SkillHot data failed to load', error)
        setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!user || !supabase) {
      setFavorites(new Set())
      setFavoritesLoading(false)
      return
    }
    let active = true
    setFavoritesLoading(true)
    supabase
      .from('user_favorites')
      .select('repository')
      .then(({ data: rows, error }) => {
        if (!active) return
        if (error) console.error('SkillHot favorites failed to load', error)
        else setFavorites(new Set((rows || []).map((row) => row.repository)))
        setFavoritesLoading(false)
      })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    const onHashChange = () => setView(initialView())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(DETAIL_MODE_KEY, detailMode)
  }, [detailMode])

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

  const searchedSkills = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase()
    return data.skills.filter((skill) => {
      const text = [
        skill.fullName,
        skill.summary,
        skill.description,
        skill.category,
        ...skill.scenarios,
        ...skill.sourceTopics,
        ...skill.platforms,
      ].join(' ').toLowerCase()
      return !normalized || text.includes(normalized)
    })
  }, [data.skills, deferredQuery])

  const visibleSkills = useMemo(() => {
    const filtered = searchedSkills.filter((skill) => category === '全部' || skill.category === category)
    return filtered.toSorted((a, b) => {
      if (sort === 'stars') return b.stars - a.stars
      if (sort === 'recent') return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
      return b.score - a.score
    })
  }, [category, searchedSkills, sort])

  const favoriteSkills = useMemo(
    () => data.skills.filter((skill) => favorites.has(skill.fullName)),
    [data.skills, favorites],
  )

  const toggleFavorite = async (skill: Skill) => {
    if (!user || !supabase) {
      navigate('auth')
      return
    }
    const wasFavorite = favorites.has(skill.fullName)
    setFavorites((current) => {
      const next = new Set(current)
      if (wasFavorite) next.delete(skill.fullName)
      else next.add(skill.fullName)
      return next
    })
    const request = wasFavorite
      ? supabase.from('user_favorites').delete().eq('user_id', user.id).eq('repository', skill.fullName)
      : supabase.from('user_favorites').insert({ user_id: user.id, repository: skill.fullName })
    const { error } = await request
    if (error) {
      console.error('SkillHot favorite update failed', error)
      setFavorites((current) => {
        const next = new Set(current)
        if (wasFavorite) next.add(skill.fullName)
        else next.delete(skill.fullName)
        return next
      })
    }
  }

  const selectSkill = (skill: Skill) => {
    setSelected(skill)
    setDetailOpen(true)
  }

  const selectSidebarCategory = (name: string) => {
    setCategory(name)
    navigate('categories')
    setCategoryScrollRequest((value) => value + 1)
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
      return <DiscoverView data={data} skills={searchedSkills} searching={Boolean(deferredQuery.trim())} {...sharedGridProps} />
    }
    if (view === 'ranking') {
      return <RankingTable skills={visibleSkills} categories={categories} category={category} onCategory={setCategory} sort={sort} onSort={setSort} {...sharedGridProps} />
    }
    if (view === 'categories') {
      return <CategoriesView data={data} skills={visibleSkills} category={category} onCategory={setCategory} scrollRequest={categoryScrollRequest} {...sharedGridProps} />
    }
    if (view === 'topics') return <TopicsView data={data} onSelect={selectSkill} favorites={favorites} onFavorite={toggleFavorite} />
    if (view === 'about') return <AboutView data={data} repositoryUrl={repositoryUrl} />
    if (view === 'auth') return user
      ? <ProfileView favorites={favoriteSkills} selected={selected} onSelect={selectSkill} onFavorite={toggleFavorite} onSignOut={() => navigate('discover')} />
      : <AuthView onContinue={() => navigate('discover')} onSuccess={() => navigate('profile')} />
    if (view === 'profile') return user
      ? <ProfileView favorites={favoriteSkills} selected={selected} onSelect={selectSkill} onFavorite={toggleFavorite} onSignOut={() => navigate('discover')} />
      : <AuthView onContinue={() => navigate('discover')} onSuccess={() => navigate('profile')} />
    if (!user) return <AuthView onContinue={() => navigate('discover')} onSuccess={() => navigate('favorites')} />
    return (
      <section className="content-page">
        <div className="page-heading">
          <div><h1>收藏</h1><p>与你的账号同步，在不同设备上继续查看。</p></div>
          <strong>{favoriteSkills.length}</strong>
        </div>
        {favoritesLoading ? <div className="page-state"><span className="loading-dot" />正在读取收藏…</div> : <SkillGrid skills={favoriteSkills} emptyText="还没有收藏任何 Skill" {...sharedGridProps} />}
      </section>
    )
  }

  return (
    <div className="site-app">
      <SiteHeader view={view} onNavigate={navigate} query={query} setQuery={updateQuery} repositoryUrl={repositoryUrl} onMenu={() => setMobileFiltersOpen(true)} userEmail={user?.email} authConfigured={authConfigured} authLoading={authLoading} />
      <div className={`site-layout ${leftCollapsed ? 'left-collapsed' : ''} ${detailOpen ? 'detail-visible' : ''} detail-${detailMode}`}>
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
          onFeedback={() => setFeedbackOpen(true)}
        />
        <main id="main-content" className="site-main">
          {renderMain()}
          <footer className="site-footer">
            <span>SkillHot · 每日更新的 Agent Skills 与开源工具索引</span>
            <nav>
              <button onClick={() => navigate('about')}>关于</button>
              <a href={repositoryUrl} target="_blank" rel="noreferrer">GitHub</a>
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
          mode={detailMode}
          onMode={setDetailMode}
        />
      </div>
      {mobileFiltersOpen || detailOpen ? <button className="page-scrim" aria-label="关闭浮层" onClick={() => { setMobileFiltersOpen(false); setDetailOpen(false) }} /> : null}
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}

export default App
