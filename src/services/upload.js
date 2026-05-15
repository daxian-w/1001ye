import { uploadImages as uploadImagesRequest } from './api'

export async function uploadImages(filePaths = []) {
  if (!filePaths.length) return []
  const payload = await uploadImagesRequest(filePaths)
  return payload.data || []
}
