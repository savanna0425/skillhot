import { ChevronDown, Download, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DetailPanel } from './components/DetailPanel'
import { FeaturedRail } from './components/FeaturedRail'
import { HeaderHero } from './components/HeaderHero'
import { AboutView, CategoriesView, TopicsView } from './components/InfoViews'
import { Sidebar } from './components/Sidebar'
import { SkillList } from './components/SkillList'
import type { Skill, SkillData, SortKey, ViewKey } from './types'

const emptyData: SkillData = {
  meta: {
    generatedAt: new Date().toISOString(),
    query: 'skill',
    topicPages: 3,
    repositories: 0,
    sourceTopics: 0,
    updateMode: 'GitHub REST API + deterministic rules',
    tokenCost: 0,
  },
  topicPages: [],
  sourceTopics: [],
  categories: [],
  skills: [],
}

function App() {
  const [data, setData] = useState<SkillData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewKey>('discover')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [sort, setSort] = useState<SortKey>('score')
  const [selected, setSelected] = useState<Skill>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('skillhot:favorites') || '[]'))
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/skills.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<SkillData>
      })
      .then((payload) => {
        setData(payload)
        const preferred = payload.skills.find((skill) => skill.fullName === 'anthropics/skills')
        setSelected(preferred || payload.skills[0])
      })
      .catch((error) => console.error('SkillHot data failed to load', error))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['全部', ...data.categories.map((item) => item.name)], [data.categories])

  const visibleSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = data.skills.filter((skill) => {
      const matchesCategory = category === '全部' || skill.category === category
      const text = [skill.fullName, skill.summary, skill.description, skill.category, ...skill.scenarios, ...skill.sourceTopics].join(' ').toLowerCase()
      return matchesCategory && (!normalized || text.includes(normalized))
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'stars') return b.stars - a.stars
      if (sort === 'recent') return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
      return b.score - a.score
    })
  }, [category, data.skills, query, sort])

  const favoriteSkills = useMemo(
    () => data.skills.filter((skill) => favorites.has(skill.fullName)),
    [data.skills, favorites],
  )

  const toggleFavorite = (skill: Skill) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(skill.fullName)) next.delete(skill.fullName)
      else next.add(skill.fullName)
      localStorage.setItem('skillhot:favorites', JSON.stringify([...next]))
      return next
    })
  }

  const selectSkill = (skill: Skill) => {
    setSelected(skill)
    setDetailOpen(true)
  }

  const openCategory = (name: string) => {
    setCategory(name)
    setView('discover')
  }

  const renderMain = () => {
    if (view === 'categories') return <CategoriesView data={data} onCategory={openCategory} />
    if (view === 'topics') return <TopicsView data={data} />
    if (view === 'about') return <AboutView data={data} />
    if (view === 'favorites') {
      return <SkillList title="我的收藏" skills={favoriteSkills} selected={selected} favorites={favorites} onSelect={selectSkill} onFavorite={toggleFavorite} />
    }

    return (
      <>
        {view === 'discover' ? <FeaturedRail skills={data.skills} onSelect={selectSkill} /> : (
          <section className="ranking-title">
            <span>综合热度 · 星数 · 活跃度</span>
            <h1>GitHub Skills 总榜</h1>
            <p>优先展示高星、最近仍在维护、并被多个相关 Topic 收录的实用项目。</p>
          </section>
        )}
        <div className="filter-bar">
          <div className="category-tabs" role="tablist" aria-label="技能分类">
            {categories.slice(0, 7).map((item) => (
              <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item} role="tab">
                {item}
              </button>
            ))}
          </div>
          <label className="sort-select">
            <SlidersHorizontal size={16} />
            <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} aria-label="排序方式">
              <option value="score">综合热度</option>
              <option value="stars">Stars</option>
              <option value="recent">最近更新</option>
            </select>
            <ChevronDown size={15} />
          </label>
        </div>
        {loading ? <div className="loading-state">正在读取 GitHub 数据…</div> : (
          <SkillList
            title={view === 'ranking' ? '排名结果' : '全部 Skills'}
            skills={visibleSkills.slice(0, view === 'ranking' ? 100 : 36)}
            selected={selected}
            favorites={favorites}
            onSelect={selectSkill}
            onFavorite={toggleFavorite}
          />
        )}
      </>
    )
  }

  const compactHeader = ['categories', 'topics', 'about', 'favorites'].includes(view)

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} favoriteCount={favorites.size} />
      <main className="main-column">
        <HeaderHero data={data} query={query} setQuery={setQuery} compact={compactHeader} />
        <div className="main-scroll">{renderMain()}</div>
        <footer className="status-footer">
          <span><i /> 每日 08:20 更新</span>
          <span>数据源 GitHub API</span>
          <span>0 Token 日更</span>
          <a href={`${import.meta.env.BASE_URL}data/skills.csv`} download><Download size={15} /> CSV</a>
        </footer>
      </main>
      <DetailPanel
        skill={selected}
        open={detailOpen}
        isFavorite={selected ? favorites.has(selected.fullName) : false}
        onFavorite={toggleFavorite}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}

export default App
