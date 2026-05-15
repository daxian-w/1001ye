import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchCurrentUser,
  fetchWechatQrCode,
  loginAsDev,
  loginAsGuest,
  loginWithWechatCode,
  logout as logoutRequest,
} from '../services/auth'
import { clearAuthSession, getAuthSession, setAuthSession } from '../utils/session'

export const useAuthStore = defineStore('auth', () => {
  const session = getAuthSession()
  const token = ref(session.token || '')
  const refreshToken = ref(session.refreshToken || '')
  const user = ref(session.user || null)
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  async function fetchQrCodeUrl() {
    const data = await fetchWechatQrCode()
    return data.qrCodeUrl
  }

  function applySession(nextSession) {
    token.value = nextSession.token || ''
    refreshToken.value = nextSession.refreshToken || ''
    user.value = nextSession.user || null
    setAuthSession({
      token: token.value,
      refreshToken: refreshToken.value,
      user: user.value,
    })
  }

  async function loginWithCode(code) {
    const nextSession = await loginWithWechatCode(code)
    applySession(nextSession)
    return nextSession
  }

  async function loginGuest(displayName) {
    const nextSession = await loginAsGuest(displayName)
    applySession(nextSession)
    return nextSession
  }

  async function loginDev(displayName) {
    const nextSession = await loginAsDev(displayName)
    applySession(nextSession)
    return nextSession
  }

  async function fetchCurrentProfile() {
    if (!token.value) return null
    const profile = await fetchCurrentUser()
    applySession({
      token: token.value,
      refreshToken: refreshToken.value,
      user: profile,
    })
    return profile
  }

  async function logout() {
    try {
      if (token.value) {
        await logoutRequest()
      }
    } catch (_) {}

    token.value = ''
    refreshToken.value = ''
    user.value = null
    clearAuthSession()
  }

  return {
    token,
    refreshToken,
    user,
    isLoggedIn,
    fetchQrCodeUrl,
    loginWithCode,
    loginGuest,
    loginDev,
    applySession,
    logout,
    fetchCurrentUser: fetchCurrentProfile,
  }
})
