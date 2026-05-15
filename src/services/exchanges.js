import { request } from './api'

export async function getExchanges(params = {}) {
  const payload = await request({
    url: '/api/exchanges',
    method: 'GET',
    params,
  })
  return {
    data: payload.data || [],
    pagination: payload.pagination || null,
  }
}

export async function claimPlant(data) {
  const payload = await request({
    url: '/api/exchanges',
    method: 'POST',
    data,
  })
  return payload.data
}

export async function confirmExchange(id) {
  const payload = await request({
    url: `/api/exchanges/${id}/confirm`,
    method: 'PUT',
  })
  return payload.data
}

export async function completeExchange(id) {
  const payload = await request({
    url: `/api/exchanges/${id}/complete`,
    method: 'PUT',
  })
  return payload.data
}

export async function cancelExchange(id) {
  const payload = await request({
    url: `/api/exchanges/${id}/cancel`,
    method: 'PUT',
  })
  return payload.data
}
