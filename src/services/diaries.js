import { request } from './api'

export async function getDiaries(params = {}) {
  const payload = await request({
    url: '/api/diaries',
    method: 'GET',
    params,
    withAuth: false,
  })
  return {
    data: payload.data || [],
    pagination: payload.pagination || null,
  }
}

export async function createDiary(data) {
  const payload = await request({
    url: '/api/diaries',
    method: 'POST',
    data,
  })
  return payload.data
}
