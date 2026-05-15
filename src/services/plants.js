import { request } from './api'

export async function getPlants(params = {}) {
  const payload = await request({
    url: '/api/plants',
    method: 'GET',
    params,
    withAuth: false,
  })
  return {
    data: payload.data || [],
    pagination: payload.pagination || null,
  }
}

export async function getPlantCities() {
  const payload = await request({
    url: '/api/plants/meta/cities',
    method: 'GET',
    withAuth: false,
  })
  return payload.data || []
}

export async function getPlant(id) {
  const payload = await request({
    url: `/api/plants/${id}`,
    method: 'GET',
    withAuth: false,
  })
  return payload.data
}

export async function createPlant(data) {
  const payload = await request({
    url: '/api/plants',
    method: 'POST',
    data,
  })
  return payload.data
}
