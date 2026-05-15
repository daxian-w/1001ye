import { request } from './api'

export async function getMyPlants(params = {}) {
  const payload = await request({
    url: '/api/users/plants',
    method: 'GET',
    params,
  })
  return {
    data: payload.data || [],
    pagination: payload.pagination || null,
  }
}
