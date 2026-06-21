import { Bookmark, Check, Copy, ExternalLink, Image as ImageIcon, PlayCircle, Star, X } from 'lucide-react'
import { useState } from 'react'
import type { Skill } from '../types'
import { formatStars } from '../utils'
import { GithubMark } from './GithubMark'

interface DetailPanelProps {
  skill?: Skill
  open: boolean
  isFavorite: boolean
  onFavorite: (skill: Skill) => void
  onClose: () => void
}

export function DetailPanel({ skill, open, isFavorite, onFavorite, onClose }: DetailPanelProps) {
  const [copied, setCopied] = useState(false)

  if (!skill) {
    return (
      <aside className="detail-panel detail-empty">
        <img src={`${import.meta.env.BASE_URL}assets/illustrations/official-skills.png`} alt="" />
        <strong>挑一个 Skill 看看</strong>
        <span>介绍、用法、场景、图片与视频都会在这里展开。</span>
      </aside>
    )
  }

  const copyInstall = async () => {
    await navigator.clipboard.writeText(skill.installCommand)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <aside className={`detail-panel ${open ? 'open' : ''}`} aria-label={`${skill.fullName} 详情`}>
      <div className="detail-topline">
        <button className="mobile-close" type="button" onClick={onClose} aria-label="关闭详情"><X size={20} /></button>
        <button className={`favorite-detail ${isFavorite ? 'active' : ''}`} onClick={() => onFavorite(skill)} aria-label="收藏">
          <Bookmark size={19} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="detail-title">
        <div>
          <h2>{skill.fullName}</h2>
          <span className="category-label">{skill.category}</span>
        </div>
        <strong><Star size={17} fill="currentColor" /> {formatStars(skill.stars)}</strong>
      </div>
      <p className="detail-summary">{skill.summary}</p>
      <a className="preview-frame" href={skill.url} target="_blank" rel="noreferrer">
        <img src={skill.media.socialPreview} alt={`${skill.fullName} GitHub 社交预览`} />
      </a>
      <div className="detail-block">
        <h3>适用场景</h3>
        <div className="scenario-list">
          {skill.scenarios.map((scenario) => <span key={scenario}>{scenario}</span>)}
        </div>
      </div>
      <div className="detail-block">
        <h3>怎么使用</h3>
        <p>{skill.howToUse}</p>
        <pre><code>{skill.installCommand}</code></pre>
      </div>
      <div className="detail-block media-block">
        <h3>图片 / 视频</h3>
        <div>
          <span><ImageIcon size={17} /> GitHub 预览</span>
          {skill.media.videoUrl ? (
            <a href={skill.media.videoUrl} target="_blank" rel="noreferrer"><PlayCircle size={17} /> 查看演示</a>
          ) : <span className="muted"><PlayCircle size={17} /> 暂未发现视频</span>}
        </div>
      </div>
      <div className="detail-block">
        <h3>来源话题</h3>
        <div className="topic-links">
          {skill.sourceTopics.map((topic) => (
            <a key={topic} href={`https://github.com/topics/${topic}`} target="_blank" rel="noreferrer"># {topic}</a>
          ))}
        </div>
      </div>
      <div className="detail-actions">
        <a className="primary-button" href={skill.url} target="_blank" rel="noreferrer">
          <GithubMark width={18} height={18} /> 查看 GitHub <ExternalLink size={15} />
        </a>
        <button className="copy-button" type="button" onClick={copyInstall}>
          {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? '已复制' : '复制安装命令'}
        </button>
      </div>
    </aside>
  )
}
