const TAB_PATHS = [
  '/pages/index/index',
  '/pages/diary/list',
  '/pages/publish/index',
  '/pages/mine/index',
]

function normalizeUrl(url) {
  return String(url || '').split('?')[0]
}

export function goToPath(url, options = {}) {
  const { replace = false } = options
  if (!url) return

  const path = normalizeUrl(url)

  if (TAB_PATHS.includes(path)) {
    uni.switchTab({ url: path })
    return
  }

  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []

  if (replace) {
    if (pages.length > 0) {
      uni.redirectTo({ url })
    } else {
      uni.reLaunch({ url })
    }
    return
  }

  uni.navigateTo({ url })
}

export function getCurrentHashPath() {
  if (typeof window === 'undefined') return ''
  const hash = window.location.hash || ''
  return hash.startsWith('#') ? hash.slice(1) : hash
}
