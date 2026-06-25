import { Bookmark, Check, ChevronLeft, ChevronRight, Columns2, Copy, ExternalLink, Image as ImageIcon, Maximize2, PanelRight, PlayCircle, Star, X } from 'lucide-react'
import { useState } from 'react'
import type { DetailMode, Skill } from '../types'
import { daysFromNow, formatStars } from '../utils'
import { GithubMark } from './GithubMark'

const previewFallback = `${import.meta.env.BASE_URL}assets/illustrations/official-skills.png`

interface DetailPanelProps {
  skill?: Skill
  open: boolean
  isFavorite: boolean
  mode: DetailMode
  onFavorite: (skill: Skill) => void
  onClose: () => void
  onRestore: () => void
  onMode: (mode: DetailMode) => void
}

export function DetailPanel({ skill, open, isFavorite, mode, onFavorite, onClose, onRestore, onMode }: DetailPanelProps) {
  const [copied, setCopied] = useState(false)

  if (!open) {
    return (
      <aside className="detail-restore" aria-label="详情栏已收起">
        <button type="button" onClick={onRestore} disabled={!skill} aria-label="展开右侧详情栏"><ChevronLeft size={17} /><span>详情</span></button>
      </aside>
    )
  }

  if (!skill) return null

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(skill.installCommand)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <aside className="detail-shell" aria-label={`${skill.fullName} 详情`}>
      <div className="detail-panel">
        <div className="detail-toolbar">
          <button type="button" onClick={onClose} aria-label="收起右侧详情栏"><ChevronRight size={18} /><span>收起</span></button>
          <button className="detail-mobile-close" type="button" onClick={onClose} aria-label="关闭详情"><X size={20} /></button>
          <div className="detail-toolbar-actions">
            <div className="detail-mode-switch" role="group" aria-label="详情面板宽度">
              <button type="button" className={mode === 'side' ? 'active' : ''} onClick={() => onMode('side')} aria-pressed={mode === 'side'} aria-label="靠右显示" title="靠右"><PanelRight size={15} /></button>
              <button type="button" className={mode === 'half' ? 'active' : ''} onClick={() => onMode('half')} aria-pressed={mode === 'half'} aria-label="占一半" title="一半"><Columns2 size={15} /></button>
              <button type="button" className={mode === 'full' ? 'active' : ''} onClick={() => onMode('full')} aria-pressed={mode === 'full'} aria-label="全屏" title="全屏"><Maximize2 size={15} /></button>
            </div>
            <button className={isFavorite ? 'saved' : ''} onClick={() => onFavorite(skill)} aria-label={isFavorite ? '取消收藏' : '收藏'}><Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} /></button>
          </div>
        </div>

        <div className="detail-heading">
          <span>{skill.category}</span>
          <h2>{skill.fullName}</h2>
          <p>{skill.summary}</p>
          <div><strong><Star size={15} fill="currentColor" /> {formatStars(skill.stars)}</strong><span>{daysFromNow(skill.pushedAt)} 天前更新</span></div>
        </div>

        <a className="detail-preview" href={skill.url} target="_blank" rel="noreferrer">
          <img src={skill.media.socialPreview} alt={`${skill.fullName} GitHub 预览`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = previewFallback }} />
        </a>

        <dl className="detail-facts">
          <div><dt>语言</dt><dd>{skill.language || '—'}</dd></div>
          <div><dt>许可证</dt><dd>{skill.license || '未声明'}</dd></div>
          <div><dt>技能规模</dt><dd>{skill.skillCount > 1 ? `${skill.skillCount}+` : '单项 / 未标注'}</dd></div>
        </dl>

        <section className="detail-section">
          <h3>作者原始描述</h3>
          <p className="original-description">{skill.description || '仓库作者暂未填写 GitHub 简介，请查看 README。'}</p>
          <div className="classification-evidence"><span>分类置信度 · {skill.categoryConfidence}</span><small>依据仓库名称、作者描述与 GitHub Topics 综合判断</small></div>
        </section>
        <section className="detail-section">
          <h3>兼容平台</h3>
          <div className="tag-list">{skill.platforms.map((platform) => <span key={platform}>{platform}</span>)}</div>
        </section>
        <section className="detail-section">
          <h3>适用场景</h3>
          <ul>{skill.scenarios.map((scenario) => <li key={scenario}><Check size={15} /> {scenario}</li>)}</ul>
        </section>
        <section className="detail-section">
          <h3>安装与使用</h3>
          <p>{skill.howToUse}</p>
          <div className="install-command"><code>{skill.installCommand}</code><button type="button" onClick={copyInstall} aria-label="复制安装命令">{copied ? <Check size={16} /> : <Copy size={16} />}</button></div>
        </section>
        <section className="detail-section">
          <h3>媒体</h3>
          <div className="media-links"><a href={skill.media.socialPreview} target="_blank" rel="noreferrer"><ImageIcon size={16} /> 预览图</a>{skill.media.videoUrl ? <a href={skill.media.videoUrl} target="_blank" rel="noreferrer"><PlayCircle size={16} /> 演示视频</a> : <span><PlayCircle size={16} /> 暂无视频</span>}</div>
        </section>
        <section className="detail-section">
          <h3>GitHub Topics</h3>
          <div className="tag-list">{skill.sourceTopics.length ? skill.sourceTopics.map((topic) => <a key={topic} href={`https://github.com/topics/${topic}`} target="_blank" rel="noreferrer">#{topic}</a>) : <span>GitHub 搜索收录</span>}</div>
        </section>

        <div className="detail-actions">
          <a href={skill.url} target="_blank" rel="noreferrer"><GithubMark width={18} height={18} /> 在 GitHub 打开 <ExternalLink size={15} /></a>
          <button type="button" onClick={copyInstall}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? '已复制' : '复制安装命令'}</button>
        </div>
      </div>
    </aside>
  )
}
