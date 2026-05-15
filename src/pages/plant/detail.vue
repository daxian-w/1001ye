<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAuthStore } from '../../store/auth'
import { claimPlant } from '../../services/exchanges'
import { getPlant } from '../../services/plants'
import { goToPath } from '../../utils/navigation'
import { setStoredRedirect } from '../../utils/session'
import { mapPlantDetailViewModel } from '../../utils/view-models'

const auth = useAuthStore()
const plantId = ref('')
const loading = ref(true)
const claiming = ref(false)
const errorMessage = ref('')
const plant = ref(null)

const isOwnPlant = computed(() => {
  return !!(auth.user && plant.value && auth.user.id === plant.value.userId)
})

const canClaim = computed(() => {
  if (!plant.value) return false
  return !isOwnPlant.value && Number(plant.value.remainingQuantity || 0) > 0
})

const claimLabel = computed(() => {
  if (!auth.isLoggedIn) return '登录后领取植物'
  if (isOwnPlant.value) return '这是你发布的植物'
  if (!canClaim.value) return '这株植物已领完'
  return '立即领取'
})

async function loadPlantDetail() {
  if (!plantId.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const data = await getPlant(plantId.value)
    plant.value = mapPlantDetailViewModel(data)
  } catch (error) {
    plant.value = null
    errorMessage.value = error.message || '加载植物详情失败'
  } finally {
    loading.value = false
  }
}

function goLogin() {
  setStoredRedirect(`/pages/plant/detail?id=${plantId.value}`)
  goToPath('/pages/auth/login')
}

async function handleClaim() {
  if (!plant.value) return

  if (!auth.isLoggedIn) {
    goLogin()
    return
  }

  if (!canClaim.value) return

  claiming.value = true
  try {
    await claimPlant({
      plantId: plant.value.id,
      message: `你好，我想领取「${plant.value.title}」，方便的话我们可以聊聊交接时间。`,
    })
    uni.showToast({ title: '领取成功，请等待发布者确认', icon: 'success' })
    await auth.fetchCurrentUser()
    await loadPlantDetail()
  } catch (error) {
    uni.showToast({ title: error.message || '领取失败', icon: 'none' })
  } finally {
    claiming.value = false
  }
}

onLoad((options) => {
  plantId.value = String(options?.id || '')
  loadPlantDetail()
})
</script>

<template>
  <view class="page-shell">
    <view class="page-content detail-page">
      <view v-if="loading" class="loading-panel">
        <text class="loading-panel__emoji">🪴</text>
        <text class="loading-panel__title">正在打开这株植物的故事</text>
        <text class="loading-panel__desc">请稍等，我们正在整理发布者留下的描述与图片。</text>
      </view>

      <view v-else-if="errorMessage || !plant" class="empty-panel">
        <text class="empty-panel__emoji">🍂</text>
        <text class="empty-panel__title">暂时没有找到这株植物</text>
        <text class="empty-panel__desc">{{ errorMessage || '它可能已经下架或被移走了。' }}</text>
        <button class="outline-button empty-panel__button" @click="goToPath('/pages/index/index', { replace: true })">
          返回首页
        </button>
      </view>

      <template v-else>
        <scroll-view class="gallery" scroll-x>
          <view class="gallery__track">
            <image
              v-for="(image, index) in plant.images"
              :key="`${plant.id}-${index}`"
              class="gallery__image"
              :src="image"
              mode="aspectFill"
            />
          </view>
        </scroll-view>

        <view class="detail-hero card-surface">
          <view class="detail-hero__meta">
            <text class="brand-pill">{{ plant.species }}</text>
            <text class="detail-hero__time">{{ plant.createdAtText }}</text>
          </view>

          <text class="section-title detail-hero__title">{{ plant.title }}</text>
          <text class="section-subtitle detail-hero__desc">{{ plant.fullDescription }}</text>

          <view class="detail-hero__facts">
            <view class="fact-chip">
              <text class="fact-chip__label">城市</text>
              <text class="fact-chip__value">{{ plant.city }}</text>
            </view>
            <view class="fact-chip">
              <text class="fact-chip__label">库存</text>
              <text class="fact-chip__value">{{ plant.remainingText }}</text>
            </view>
            <view class="fact-chip">
              <text class="fact-chip__label">方式</text>
              <text class="fact-chip__value">{{ plant.exchangeMethods.join(' / ') }}</text>
            </view>
          </view>
        </view>

        <view class="publisher card-surface">
          <view class="publisher__info">
            <image class="publisher__avatar" :src="plant.userPhoto" mode="aspectFill" />
            <view>
              <text class="publisher__name">{{ plant.userName }}</text>
              <text class="publisher__hint">发布者建议线下礼貌沟通，确认交接地点。</text>
            </view>
          </view>
          <text class="publisher__address">{{ plant.address }}</text>
        </view>

        <view class="cta card-surface">
          <view class="cta__copy">
            <text class="cta__title">喜欢这株植物，就发起一次交换申请。</text>
            <text class="cta__desc">
              领取会消耗积分；如果交换被取消，积分会自动退回。
            </text>
          </view>
          <button
            class="primary-button cta__button"
            :disabled="claiming || (auth.isLoggedIn && !canClaim)"
            @click="handleClaim"
          >
            {{ claiming ? '正在提交申请...' : claimLabel }}
          </button>
        </view>
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.gallery {
  width: 100%;
  white-space: nowrap;
}

.gallery__track {
  display: inline-flex;
  gap: 18rpx;
}

.gallery__image {
  width: 620rpx;
  height: 460rpx;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-soft);
}

.detail-hero,
.publisher,
.cta {
  padding: 30rpx;
}

.detail-hero__meta,
.detail-hero__facts,
.publisher__info {
  display: flex;
  align-items: center;
}

.detail-hero__meta,
.publisher__info {
  justify-content: space-between;
  gap: 16rpx;
}

.detail-hero__time {
  font-size: 22rpx;
  color: var(--text-muted);
}

.detail-hero__title,
.detail-hero__desc {
  display: block;
}

.detail-hero__title {
  margin-top: 22rpx;
}

.detail-hero__desc {
  margin-top: 18rpx;
}

.detail-hero__facts {
  gap: 16rpx;
  margin-top: 26rpx;
  flex-wrap: wrap;
}

.fact-chip {
  min-width: 200rpx;
  padding: 22rpx 20rpx;
  border-radius: var(--radius-xl);
  background: rgba(248, 246, 244, 0.88);
}

.fact-chip__label,
.fact-chip__value,
.publisher__name,
.publisher__hint,
.publisher__address,
.cta__title,
.cta__desc {
  display: block;
}

.fact-chip__label {
  font-size: 22rpx;
  color: var(--text-muted);
}

.fact-chip__value {
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.publisher__info {
  justify-content: flex-start;
}

.publisher__avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.publisher__name {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.publisher__hint {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--text-muted);
}

.publisher__address {
  margin-top: 18rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-primary);
}

.cta__title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.cta__desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-muted);
}

.cta__button {
  width: 100%;
  margin-top: 24rpx;
}

@media screen and (min-width: 1024px) {
  .detail-page {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(340px, 0.8fr);
    gap: 20px;
    align-items: start;
  }

  .gallery {
    grid-column: 1 / -1;
  }

  .gallery__track {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    width: 100%;
  }

  .gallery__image {
    width: 100%;
    height: 280px;
    border-radius: 28px;
  }

  .detail-hero,
  .publisher,
  .cta {
    padding: 28px;
  }

  .detail-hero {
    grid-column: 1;
  }

  .publisher,
  .cta {
    grid-column: 2;
  }

  .detail-hero__meta {
    gap: 14px;
  }

  .detail-hero__time {
    font-size: 13px;
  }

  .detail-hero__title {
    margin-top: 18px;
  }

  .detail-hero__desc {
    margin-top: 14px;
  }

  .detail-hero__facts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 22px;
  }

  .fact-chip {
    min-width: 0;
    padding: 18px;
    border-radius: 22px;
  }

  .fact-chip__label {
    font-size: 13px;
  }

  .fact-chip__value {
    margin-top: 6px;
    font-size: 17px;
  }

  .publisher__avatar {
    width: 70px;
    height: 70px;
  }

  .publisher__name {
    font-size: 20px;
  }

  .publisher__hint {
    margin-top: 6px;
    font-size: 14px;
  }

  .publisher__address {
    margin-top: 16px;
    font-size: 15px;
  }

  .cta {
    position: sticky;
    top: 24px;
  }

  .cta__title {
    font-size: 24px;
  }

  .cta__desc {
    margin-top: 10px;
    font-size: 15px;
  }

  .cta__button {
    margin-top: 18px;
  }
}

@media screen and (max-width: 1240px) and (min-width: 1024px) {
  .detail-page {
    grid-template-columns: 1fr;
  }

  .gallery,
  .detail-hero,
  .publisher,
  .cta {
    grid-column: auto;
  }

  .cta {
    position: static;
  }
}
</style>
