import { Bookmark, CheckCircle2, Eye, EyeOff, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { Skill } from '../types'
import { SkillGrid } from './FeaturedRail'

function friendlyAuthError(message: string) {
  if (/invalid login credentials/i.test(message)) return '邮箱或密码不正确。'
  if (/email not confirmed/i.test(message)) return '请先打开验证邮件完成邮箱确认。'
  if (/user already registered/i.test(message)) return '这个邮箱已经注册，请直接登录。'
  if (/password should be at least/i.test(message)) return '密码至少需要 6 位。'
  if (/rate limit/i.test(message)) return '验证邮件发送过于频繁，请稍后再试。'
  return message
}

export function AuthView({ onContinue, onSuccess }: { onContinue: () => void; onSuccess: () => void }) {
  const { configured, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!configured) {
      setError('登录服务等待部署配置，访客浏览不受影响。')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('请输入有效的邮箱地址。')
      return
    }
    if (password.length < 6) {
      setError('密码至少需要 6 位。')
      return
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        onSuccess()
      } else {
        const needsConfirmation = await signUp(email, password)
        if (needsConfirmation) setMessage('验证邮件已发送，请完成邮箱验证后登录。')
        else onSuccess()
      }
    } catch (caught) {
      setError(friendlyAuthError(caught instanceof Error ? caught.message : '暂时无法完成操作。'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-tabs" role="tablist" aria-label="账号操作">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>登录</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>注册</button>
          </div>
          <div className="auth-intro">
            <span><ShieldCheck size={18} /> 收藏会安全地绑定到你的账号</span>
            <h1>{mode === 'login' ? '欢迎回来' : '创建 SkillHot 账号'}</h1>
            <p>{mode === 'login' ? '继续整理你的 Agent Skills 收藏。' : '验证邮箱后，即可在不同设备同步收藏。'}</p>
          </div>
          <label className="auth-field">
            <span>邮箱</span>
            <div><Mail size={17} /><input type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          </label>
          <label className="auth-field">
            <span>密码</span>
            <div><ShieldCheck size={17} /><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="至少 6 位" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? '隐藏密码' : '显示密码'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          </label>
          {error ? <p className="auth-notice error" role="alert">{error}</p> : null}
          {message ? <p className="auth-notice success" role="status">{message}</p> : null}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? '正在处理…' : mode === 'login' ? '登录' : '注册并验证邮箱'}</button>
          <button className="guest-button" type="button" onClick={onContinue}>继续浏览</button>
          <small>注册即表示你同意仅将账号用于同步 SkillHot 收藏。</small>
        </form>
        <div className="auth-illustration" aria-hidden="true">
          <img src={`${import.meta.env.BASE_URL}assets/illustrations/superpowers.png`} alt="" />
          <div><Bookmark size={20} /><strong>发现 · 收藏 · 随时回来</strong></div>
          <p>你的资料页保持简单：邮箱账号、验证状态与收藏，不开放上传和自定义文字。</p>
        </div>
      </div>
    </section>
  )
}

interface ProfileViewProps {
  favorites: Skill[]
  selected?: Skill
  onSelect: (skill: Skill) => void
  onFavorite: (skill: Skill) => void
  onSignOut: () => void
}

export function ProfileView({ favorites, selected, onSelect, onFavorite, onSignOut }: ProfileViewProps) {
  const { user, signOut } = useAuth()
  if (!user) return null
  const joinedAt = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.created_at))

  const leave = async () => {
    await signOut()
    onSignOut()
  }

  return (
    <section className="content-page profile-page">
      <div className="profile-card">
        <div className="profile-mark"><UserRound size={30} /></div>
        <div className="profile-identity">
          <span>个人主页</span>
          <h1>{user.email}</h1>
          <p><CheckCircle2 size={16} /> 已验证 · 加入于 {joinedAt}</p>
        </div>
        <dl>
          <div><dt>我的收藏</dt><dd>{favorites.length}</dd></div>
          <div><dt>账号类型</dt><dd>邮箱账号</dd></div>
        </dl>
        <button type="button" onClick={leave}><LogOut size={16} /> 退出登录</button>
      </div>
      <div className="profile-section-heading"><div><h2>我的收藏</h2><p>这些条目只对当前登录账号可见。</p></div><strong>{favorites.length}</strong></div>
      <SkillGrid skills={favorites} selected={selected} favorites={new Set(favorites.map((skill) => skill.fullName))} onSelect={onSelect} onFavorite={onFavorite} emptyText="还没有收藏任何 Skill" />
    </section>
  )
}
