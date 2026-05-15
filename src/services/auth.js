import { request } from './api'

function normalizeSession(payload) {
  return {
    token: payload.token,
    refreshToken: payload.refreshToken,
    user: payload.user,
  }
}

export async function fetchWechatQrCode() {
  const payload = await request({
    url: '/api/auth/wechat/qrcode',
    method: 'GET',
    withAuth: false,
  })
  return payload.data
}

export async function loginWithWechatCode(code) {
  const payload = await request({
    url: '/api/auth/wechat/callback',
    method: 'POST',
    data: { code },
    withAuth: false,
  })
  return normalizeSession(payload.data)
}

export async function loginAsGuest(displayName) {
  const payload = await request({
    url: '/api/auth/guest-login',
    method: 'POST',
    data: { displayName },
    withAuth: false,
  })
  return normalizeSession(payload.data)
}

export async function loginAsDev(displayName) {
  const payload = await request({
    url: '/api/auth/dev-login',
    method: 'POST',
    data: { displayName },
    withAuth: false,
  })
  return normalizeSession(payload.data)
}

export async function fetchCurrentUser() {
  const payload = await request({
    url: '/api/auth/me',
    method: 'GET',
  })
  return payload.data
}

export async function logout() {
  return request({
    url: '/api/auth/logout',
    method: 'POST',
  })
}
