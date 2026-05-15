import { resolveAssetUrl } from '../services/api'
import { formatDate, formatDateTime, formatExchangeStatus, formatExchangeTone, truncateText } from './format'

const FALLBACK_PLANT_IMAGE = 'https://picsum.photos/seed/zhiwu-fallback/960/720'
const FALLBACK_AVATAR = 'https://picsum.photos/seed/zhiwu-avatar/160/160'

export function mapPlantCardViewModel(plant) {
  return {
    id: plant.id,
    title: plant.title || '未命名植物',
    species: plant.species || '未注明品种',
    city: plant.city || '未注明城市',
    coverImage: resolveAssetUrl(plant.images?.[0]) || FALLBACK_PLANT_IMAGE,
    description: truncateText(plant.description || '发布者还没有补充植物故事。', 70),
    remainingQuantity: Number(plant.remainingQuantity || 0),
    stock: Number(plant.stock || 0),
    remainingText: `剩余 ${Number(plant.remainingQuantity || 0)} / 共 ${Number(plant.stock || 0)}`,
    userName: plant.userName || '植物朋友',
    userPhoto: resolveAssetUrl(plant.userPhoto) || FALLBACK_AVATAR,
    createdAtText: formatDate(plant.createdAt),
    userId: plant.userId || '',
  }
}

export function mapPlantDetailViewModel(plant) {
  const images = Array.isArray(plant.images) && plant.images.length
    ? plant.images.map((image) => resolveAssetUrl(image))
    : [FALLBACK_PLANT_IMAGE]

  return {
    ...mapPlantCardViewModel({ ...plant, images }),
    images,
    address: plant.address || '建议与发布者私聊确认交接地点',
    exchangeMethods: Array.isArray(plant.exchangeMethods) && plant.exchangeMethods.length
      ? plant.exchangeMethods
      : ['free'],
    fullDescription: plant.description || '发布者暂未填写更多描述。',
  }
}

export function mapDiaryFeedItemViewModel(diary) {
  return {
    id: diary.id,
    userName: diary.userName || '植物朋友',
    userPhoto: resolveAssetUrl(diary.userPhoto) || FALLBACK_AVATAR,
    plantName: diary.plantName || '植物更新',
    content: diary.content || '',
    images: Array.isArray(diary.images) ? diary.images.map((item) => resolveAssetUrl(item)).filter(Boolean) : [],
    createdAtText: formatDateTime(diary.createdAt),
  }
}

export function mapProfileSummaryViewModel(user) {
  if (!user) {
    return {
      displayName: '欢迎来到 1001叶',
      photoURL: FALLBACK_AVATAR,
      bio: '登录后发布植物、发起交换、查看个人记录。',
      points: 0,
      email: '',
    }
  }

  return {
    displayName: user.displayName || '植物朋友',
    photoURL: resolveAssetUrl(user.photoURL) || FALLBACK_AVATAR,
    bio: user.bio || '在这个社区里分享绿意、交换美好。',
    points: Number(user.points || 0),
    email: user.email || '',
  }
}

export function mapExchangeListItemViewModel(exchange) {
  const status = String(exchange.status || '').toLowerCase()
  return {
    id: exchange.id,
    plantId: exchange.plantId,
    plantTitle: exchange.plantTitle || '植物交换',
    plantImage: resolveAssetUrl(exchange.plantImage) || FALLBACK_PLANT_IMAGE,
    giverId: exchange.giverId,
    giverName: exchange.giverName || '发布者',
    receiverId: exchange.receiverId,
    receiverName: exchange.receiverName || '领取者',
    status,
    statusText: formatExchangeStatus(status),
    statusTone: formatExchangeTone(status),
    createdAtText: formatDateTime(exchange.createdAt),
    message: exchange.message || '',
  }
}
