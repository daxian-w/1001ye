import { clearAuthSession, getAuthSession, setAuthSession } from '../utils/session'

const FALLBACK_API_ORIGIN = typeof window !== 'undefined'
  ? window.location.origin
  : 'http://localhost:3001'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_ORIGIN).replace(/\/$/, '')
const REQUEST_BASE = typeof window !== 'undefined' ? '' : API_ORIGIN

let refreshPromise = null

function buildQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.append(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

function buildRequestUrl(url, params) {
  if (/^https?:\/\//.test(url)) {
    return `${url}${buildQuery(params)}`
  }
  return `${REQUEST_BASE}${url}${buildQuery(params)}`
}

function parsePayload(data) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch (_) {
      return data
    }
  }
  return data
}

function getErrorMessage(payload, fallback = '请求失败，请稍后重试') {
  if (typeof payload === 'string') return payload
  return payload?.error || payload?.message || fallback
}

function hasRequestSupport() {
  return typeof uni !== 'undefined' && uni && typeof uni.request === 'function'
}

async function rawRequest(options) {
  const {
    url,
    method = 'GET',
    params,
    data,
    headers = {},
    withAuth = true,
  } = options

  const session = getAuthSession()
  const finalHeaders = { ...headers }

  if (!finalHeaders['Content-Type'] && method !== 'GET') {
    finalHeaders['Content-Type'] = 'application/json'
  }

  if (withAuth && session.token) {
    finalHeaders.Authorization = `Bearer ${session.token}`
  }

  const finalUrl = buildRequestUrl(url, params)

  if (hasRequestSupport()) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: finalUrl,
        method,
        data,
        header: finalHeaders,
        success: resolve,
        fail: reject,
      })
    })
  }

  const response = await fetch(finalUrl, {
    method,
    headers: finalHeaders,
    body: method === 'GET' ? undefined : JSON.stringify(data),
  })

  return {
    statusCode: response.status,
    data: await response.json(),
  }
}

async function refreshSessionToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const session = getAuthSession()
    if (!session.refreshToken) throw new Error('登录状态已过期')

    const response = await rawRequest({
      url: '/api/auth/refresh',
      method: 'POST',
      data: { refreshToken: session.refreshToken },
      withAuth: false,
    })

    const payload = parsePayload(response.data)

    if (response.statusCode >= 400 || payload?.success === false) {
      throw new Error(getErrorMessage(payload, '登录状态已过期'))
    }

    setAuthSession({
      token: payload.data.token,
      refreshToken: payload.data.refreshToken,
      user: session.user,
    })

    return payload.data.token
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

export async function request(options) {
  const { skipAuthRetry = false } = options
  const response = await rawRequest(options)
  const payload = parsePayload(response.data)

  if (response.statusCode === 401 && !skipAuthRetry && options.withAuth !== false) {
    try {
      await refreshSessionToken()
      return request({ ...options, skipAuthRetry: true })
    } catch (_) {
      clearAuthSession()
    }
  }

  if (response.statusCode >= 400 || payload?.success === false) {
    throw new Error(getErrorMessage(payload))
  }

  return payload
}

async function doUpload(filePaths, fieldName, retry = true) {
  if (!(typeof uni !== 'undefined' && uni && typeof uni.uploadFile === 'function')) {
    throw new Error('当前环境不支持上传文件')
  }

  const session = getAuthSession()
  const uploadUrl = `${REQUEST_BASE}/api/upload/${fieldName === 'image' ? 'image' : 'images'}`

  const files = fieldName === 'images'
    ? filePaths.map((filePath) => ({ name: 'images', uri: filePath }))
    : undefined

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: uploadUrl,
      filePath: fieldName === 'image' ? filePaths[0] : undefined,
      files,
      name: fieldName,
      header: session.token ? { Authorization: `Bearer ${session.token}` } : {},
      success: async (res) => {
        const payload = parsePayload(res.data)

        if (res.statusCode === 401 && retry) {
          try {
            await refreshSessionToken()
            const retryResult = await doUpload(filePaths, fieldName, false)
            resolve(retryResult)
            return
          } catch (error) {
            clearAuthSession()
            reject(error)
            return
          }
        }

        if (res.statusCode >= 400 || payload?.success === false) {
          reject(new Error(getErrorMessage(payload, '上传失败')))
          return
        }

        resolve(payload)
      },
      fail: reject,
    })
  })
}

export function uploadImages(filePaths) {
  return doUpload(filePaths, 'images')
}

export function resolveAssetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  if (path.startsWith('//')) {
    return `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}${path}`
  }
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

export { API_ORIGIN }
