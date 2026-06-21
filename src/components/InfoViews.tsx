import { ArrowDownToLine, ArrowUpRight, RefreshCw, Sparkles } from 'lucide-react'
import type { SkillData } from '../types'
import { GithubMark } from './GithubMark'

export function CategoriesView({ data, onCategory }: { data: SkillData; onCategory: (name: string) => void }) {
  return (
    <section className="info-view">
      <div className="view-intro">
        <h1>Skills 都在做什么？</h1>
        <p>从工程、研究到内容生产，按真实仓库描述与 Topic 规则归类。</p>
      </div>
      <div className="category-board">
        {data.categories.map((category, index) => (
          <button key={category.name} onClick={() => onCategory(category.name)} className={index === 1 ? 'dark' : ''}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h2>{category.name}</h2>
            <p>{category.description}</p>
            <strong>{category.count} 个仓库 <ArrowUpRight size={18} /></strong>
          </button>
        ))}
      </div>
    </section>
  )
}

export function TopicsView({ data }: { data: SkillData }) {
  return (
    <section className="info-view">
      <div className="view-intro">
        <h1>GitHub Topic Search 前三页</h1>
        <p>查询词为 <code>skill</code>，每页 10 个话题；完整保留原始结果，再筛出 Agent Skills 相关来源。</p>
      </div>
      <div className="topic-pages">
        {data.topicPages.map((page) => (
          <section key={page.page}>
            <div className="topic-page-title"><span>0{page.page}</span><h2>第 {page.page} 页</h2></div>
            {page.topics.map((topic) => (
              <a href={topic.url} target="_blank" rel="noreferrer" key={topic.name}>
                <div><strong>{topic.displayName}</strong><small>{topic.description || 'GitHub Topic'}</small></div>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </section>
        ))}
      </div>
    </section>
  )
}

export function AboutView({ data }: { data: SkillData }) {
  return (
    <section className="info-view about-view">
      <div className="view-intro">
        <h1>不靠模型，也能每天变新。</h1>
        <p>SkillHot 把昂贵的一次性调研变成可重复的数据管道：GitHub API 负责事实，本地规则负责分类与排名。</p>
      </div>
      <div className="method-grid">
        <article><GithubMark /><h2>官方数据源</h2><p>抓取 Topic Search 前三页与重点话题，记录 Stars、活跃度、README 媒体和安装片段。</p></article>
        <article><RefreshCw /><h2>每天 08:20</h2><p>GitHub Actions 定时运行；只有数据变化时才提交，静态站随提交自动发布。</p></article>
        <article><Sparkles /><h2>0 Token 日更</h2><p>分类、活跃度与综合热度完全由确定性规则计算，不调用大模型 API。</p></article>
        <article><ArrowDownToLine /><h2>开放导出</h2><p>JSON 供网站使用，CSV 可直接下载到 Excel；字段包括介绍、用法、场景、媒体与链接。</p></article>
      </div>
      <div className="source-note">
        <strong>当前收录 {data.meta.repositories} 个仓库，来自 {data.meta.sourceTopics} 个相关 Topic。</strong>
        <a href={`${import.meta.env.BASE_URL}data/skills.csv`} download>下载 CSV</a>
      </div>
    </section>
  )
}
