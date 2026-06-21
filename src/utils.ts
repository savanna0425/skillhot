export function formatStars(stars: number) {
  if (stars >= 100_000) return `${Math.round(stars / 1000)}k`
  if (stars >= 10_000) return `${(stars / 1000).toFixed(1).replace('.0', '')}k`
  if (stars >= 1000) return `${(stars / 1000).toFixed(1).replace('.0', '')}k`
  return String(stars)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(iso))
}

export function formatUpdatedAt(iso: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function daysFromNow(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}
