import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'

const THROTTLE_KEY = 'skillhot:lastFeedbackAt'
const THROTTLE_MS = 30_000
const MAX_MESSAGE = 2000
const MAX_CONTACT = 200

interface FeedbackDialogProps {
  open: boolean
  onClose: () => void
}

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [trap, setTrap] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    setStatus('idle')
    setErrorMsg('')
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const focus = window.setTimeout(() => textareaRef.current?.focus(), 40)
    return () => { window.removeEventListener('keydown', onKey); window.clearTimeout(focus) }
  }, [open, onClose])

  if (!open) return null

  const trimmed = message.trim()

  const submit = async () => {
    if (!trimmed) return
    if (trap) { setStatus('done'); return } // honeypot tripped — drop silently
    const last = Number(window.localStorage.getItem(THROTTLE_KEY) || 0)
    if (Date.now() - last < THROTTLE_MS) {
      setStatus('error')
      setErrorMsg('提交太频繁了，过一会儿再试吧。')
      return
    }
    if (!supabase) {
      setStatus('error')
      setErrorMsg('反馈服务暂未配置，请稍后再试。')
      return
    }
    setStatus('sending')
    const { error } = await supabase.from('feedback').insert({
      message: trimmed.slice(0, MAX_MESSAGE),
      contact: contact.trim() ? contact.trim().slice(0, MAX_CONTACT) : null,
      user_id: user?.id ?? null,
      page: (window.location.hash || window.location.pathname || '').slice(0, 200),
      user_agent: navigator.userAgent.slice(0, 500),
    })
    if (error) {
      setStatus('error')
      setErrorMsg('提交失败了，请稍后再试。')
      return
    }
    window.localStorage.setItem(THROTTLE_KEY, String(Date.now()))
    setMessage('')
    setContact('')
    setStatus('done')
  }

  return (
    <div
      className="feedback-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="反馈"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="feedback-dialog">
        <div className="feedback-head">
          <h2>反馈</h2>
          <button type="button" onClick={onClose} aria-label="关闭反馈"><X size={18} /></button>
        </div>

        {status === 'done' ? (
          <div className="feedback-done">
            <p>谢谢你的反馈，我会认真看。</p>
            <button type="button" onClick={onClose}>关闭</button>
          </div>
        ) : (
          <>
            <p className="feedback-intro">用得不顺、想要的功能、希望收录的 Skill，都可以告诉我。无需登录。</p>
            <textarea
              ref={textareaRef}
              className="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, MAX_MESSAGE))}
              maxLength={MAX_MESSAGE}
              rows={5}
              placeholder="想说点什么…"
            />
            <div className="feedback-count">{message.length}/{MAX_MESSAGE}</div>
            <input
              className="feedback-contact"
              value={contact}
              onChange={(event) => setContact(event.target.value.slice(0, MAX_CONTACT))}
              maxLength={MAX_CONTACT}
              placeholder="联系方式（选填：邮箱 / 微信，方便我回复）"
            />
            <input
              className="feedback-trap"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={trap}
              onChange={(event) => setTrap(event.target.value)}
            />
            {status === 'error' ? <div className="feedback-error">{errorMsg}</div> : null}
            <button className="feedback-submit" type="button" onClick={submit} disabled={!trimmed || status === 'sending'}>
              {status === 'sending' ? '提交中…' : '提交反馈'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
