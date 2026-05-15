const STORAGE_KEYS = {
  token: 'auth_token',
  refreshToken: 'auth_refresh_token',
  user: 'auth_user',
  redirect: 'auth_redirect',
  publishTab: 'publish_default_tab',
}

function hasUniStorage() {
  return typeof uni !== 'undefined' && uni && typeof uni.getStorageSync === 'function'
}

export function readStorage(key, fallback = '') {
  try {
    if (hasUniStorage()) {
      const value = uni.getStorageSync(key)
      return value === undefined || value === null ? fallback : value
    }
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem(key)
      return value === null ? fallback : value
    }
  } catch (_) {}
  return fallback
}

export function writeStorage(key, value) {
  try {
    if (hasUniStorage()) {
      uni.setStorageSync(key, value)
      return
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value)
    }
  } catch (_) {}
}

export function removeStorage(key) {
  try {
    if (hasUniStorage()) {
      uni.removeStorageSync(key)
      return
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
  } catch (_) {}
}

export function getAuthSession() {
  const token = readStorage(STORAGE_KEYS.token, '')
  const refreshToken = readStorage(STORAGE_KEYS.refreshToken, '')
  const rawUser = readStorage(STORAGE_KEYS.user, '')

  let user = null
  if (rawUser) {
    try {
      user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser
    } catch (_) {
      user = null
    }
  }

  return { token, refreshToken, user }
}

export function setAuthSession({ token = '', refreshToken = '', user = null }) {
  writeStorage(STORAGE_KEYS.token, token)
  writeStorage(STORAGE_KEYS.refreshToken, refreshToken)
  if (user) {
    writeStorage(STORAGE_KEYS.user, JSON.stringify(user))
  } else {
    removeStorage(STORAGE_KEYS.user)
  }
}

export function clearAuthSession() {
  removeStorage(STORAGE_KEYS.token)
  removeStorage(STORAGE_KEYS.refreshToken)
  removeStorage(STORAGE_KEYS.user)
}

export function setStoredRedirect(url) {
  if (url) writeStorage(STORAGE_KEYS.redirect, url)
}

export function consumeStoredRedirect() {
  const value = readStorage(STORAGE_KEYS.redirect, '')
  removeStorage(STORAGE_KEYS.redirect)
  return value || ''
}

export function setPublishDefaultTab(tab) {
  if (tab) writeStorage(STORAGE_KEYS.publishTab, tab)
}

export function consumePublishDefaultTab() {
  const value = readStorage(STORAGE_KEYS.publishTab, '')
  removeStorage(STORAGE_KEYS.publishTab)
  return value || ''
}

export { STORAGE_KEYS }
