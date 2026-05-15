export function ensureH5CallbackBridge() {
  if (typeof window === 'undefined') return

  const { pathname, search, hash, origin } = window.location

  if (pathname === '/auth/wechat/callback' && !hash.startsWith('#/pages/auth/callback')) {
    window.location.replace(`${origin}/#/pages/auth/callback${search}`)
  }
}
