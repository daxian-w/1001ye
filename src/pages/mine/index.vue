<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '../../store/auth'
import { cancelExchange, completeExchange, confirmExchange, getExchanges } from '../../services/exchanges'
import { getMyPlants } from '../../services/users'
import { goToPath } from '../../utils/navigation'
import {
  mapExchangeListItemViewModel,
  mapPlantCardViewModel,
  mapProfileSummaryViewModel,
} from '../../utils/view-models'

const auth = useAuthStore()
const loading = ref(false)
const activeTab = ref('plants')
const myPlants = ref([])
const exchanges = ref([])

const profile = computed(() => mapProfileSummaryViewModel(auth.user))

function goLogin() {
  goToPath('/pages/auth/login')
}

async function loadDashboard() {
  if (!auth.isLoggedIn) return

  loading.value = true
  try {
    await auth.fetchCurrentUser()
    const [plantsResult, exchangesResult] = await Promise.all([
      getMyPlants({ page: 1, limit: 20 }),
      getExchanges({ page: 1, limit: 20 }),
    ])
    myPlants.value = plantsResult.data.map(mapPlantCardViewModel)
    exchanges.value = exchangesResult.data.map(mapExchangeListItemViewModel)
  } catch (error) {
    uni.showToast({ title: error.message || '加载个人中心失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function openPlant(id) {
  goToPath(`/pages/plant/detail?id=${id}`)
}

function getExchangeActions(item) {
  if (!auth.user) return []

  const isGiver = auth.user.id === item.giverId
  const actions = []

  if (item.status === 'pending' && isGiver) {
    actions.push({ key: 'confirm', label: '确认交换' })
  }

  if (item.status === 'confirmed') {
    actions.push({ key: 'complete', label: '完成交换' })
  }

  if (['pending', 'confirmed'].includes(item.status)) {
    actions.push({ key: 'cancel', label: '取消交换' })
  }

  return actions
}

async function handleExchangeAction(action, item) {
  try {
    if (action === 'confirm') {
      await confirmExchange(item.id)
    }
    if (action === 'complete') {
      await completeExchange(item.id)
    }
    if (action === 'cancel') {
      await cancelExchange(item.id)
    }
    uni.showToast({ title: '操作成功', icon: 'success' })
    await loadDashboard()
  } catch (error) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' })
  }
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '退出后仍可浏览社区，但需要重新登录才能发布和交换。',
    success: async (res) => {
      if (!res.confirm) return
      await auth.logout()
      myPlants.value = []
      exchanges.value = []
      uni.showToast({ title: '已退出登录', icon: 'success' })
    },
  })
}

onShow(() => {
  loadDashboard()
})
</script>

<template>
  <view class="page-shell">
    <view class="page-content mine-page">
      <view class="profile-hero card-surface">
        <view class="profile-hero__top">
          <view class="profile-hero__info">
            <image class="profile-hero__avatar" :src="profile.photoURL" mode="aspectFill" />
            <view>
              <text class="profile-hero__name">{{ profile.displayName }}</text>
              <text class="profile-hero__bio">{{ profile.bio }}</text>
            </view>
          </view>
          <button v-if="auth.isLoggedIn" class="outline-button profile-hero__logout" @click="handleLogout">退出</button>
        </view>

        <view v-if="auth.isLoggedIn" class="profile-hero__stats">
          <view class="profile-stat">
            <text class="profile-stat__value">{{ profile.points }}</text>
            <text class="profile-stat__label">我的积分</text>
          </view>
          <view class="profile-stat">
            <text class="profile-stat__value">{{ myPlants.length }}</text>
            <text class="profile-stat__label">我的发布</text>
          </view>
          <view class="profile-stat">
            <text class="profile-stat__value">{{ exchanges.length }}</text>
            <text class="profile-stat__label">交换记录</text>
          </view>
        </view>

        <view v-else class="profile-hero__guest">
          <text class="profile-hero__guest-text">登录后可以查看积分、我的发布和每一条交换记录。</text>
          <button class="primary-button profile-hero__login" @click="goLogin">立即登录</button>
        </view>
      </view>

      <template v-if="auth.isLoggedIn">
        <view class="tab-switch card-surface">
          <view :class="['tab-switch__item', activeTab === 'plants' ? 'is-active' : '']" @click="activeTab = 'plants'">
            我的发布
          </view>
          <view :class="['tab-switch__item', activeTab === 'exchanges' ? 'is-active' : '']" @click="activeTab = 'exchanges'">
            交换记录
          </view>
        </view>

        <view v-if="loading" class="loading-panel">
          <text class="loading-panel__emoji">🌱</text>
          <text class="loading-panel__title">正在同步你的社区记录</text>
          <text class="loading-panel__desc">包括积分、发布植物和交换状态。</text>
        </view>

        <template v-else-if="activeTab === 'plants'">
          <view v-if="myPlants.length === 0" class="empty-panel">
            <text class="empty-panel__emoji">🪴</text>
            <text class="empty-panel__title">你还没有发布植物</text>
            <text class="empty-panel__desc">发布第一株植物，让它找到新的主人。</text>
            <button class="primary-button empty-panel__button" @click="goToPath('/pages/publish/index')">前往发布</button>
          </view>

          <view v-else class="stack-list">
            <view
              v-for="plant in myPlants"
              :key="plant.id"
              class="plant-item card-surface"
              @click="openPlant(plant.id)"
            >
              <image class="plant-item__image" :src="plant.coverImage" mode="aspectFill" />
              <view class="plant-item__body">
                <text class="plant-item__title">{{ plant.title }}</text>
                <text class="plant-item__desc">{{ plant.description }}</text>
                <text class="plant-item__meta">{{ plant.city }} · {{ plant.remainingText }}</text>
              </view>
            </view>
          </view>
        </template>

        <template v-else>
          <view v-if="exchanges.length === 0" class="empty-panel">
            <text class="empty-panel__emoji">🌿</text>
            <text class="empty-panel__title">还没有交换记录</text>
            <text class="empty-panel__desc">当你领取或发布的植物开始流转时，会在这里出现。</text>
          </view>

          <view v-else class="stack-list">
            <view v-for="item in exchanges" :key="item.id" class="exchange-item card-surface">
              <view class="exchange-item__top">
                <view class="exchange-item__info">
                  <image class="exchange-item__image" :src="item.plantImage" mode="aspectFill" />
                  <view>
                    <text class="exchange-item__title">{{ item.plantTitle }}</text>
                    <text class="exchange-item__meta">{{ item.createdAtText }}</text>
                  </view>
                </view>
                <text :class="['status-chip', item.statusTone]">{{ item.statusText }}</text>
              </view>

              <text class="exchange-item__desc">
                发布者：{{ item.giverName }} · 领取者：{{ item.receiverName }}
              </text>

              <view v-if="getExchangeActions(item).length" class="exchange-item__actions">
                <button
                  v-for="action in getExchangeActions(item)"
                  :key="action.key"
                  :class="action.key === 'cancel' ? 'outline-button exchange-item__button' : 'primary-button exchange-item__button'"
                  @click="handleExchangeAction(action.key, item)"
                >
                  {{ action.label }}
                </button>
              </view>
            </view>
          </view>
        </template>
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.mine-page {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.profile-hero,
.plant-item,
.exchange-item {
  padding: 30rpx;
}

.profile-hero__top,
.profile-hero__info,
.profile-hero__stats,
.exchange-item__top,
.exchange-item__info {
  display: flex;
}

.profile-hero__top,
.exchange-item__top {
  justify-content: space-between;
  gap: 20rpx;
}

.profile-hero__info,
.exchange-item__info {
  align-items: center;
  gap: 18rpx;
}

.profile-hero__avatar {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.profile-hero__name,
.profile-hero__bio,
.profile-stat__value,
.profile-stat__label,
.profile-hero__guest-text,
.plant-item__title,
.plant-item__desc,
.plant-item__meta,
.exchange-item__title,
.exchange-item__meta,
.exchange-item__desc {
  display: block;
}

.profile-hero__name {
  font-family: "Zilla Slab", "Times New Roman", serif;
  font-size: 42rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.profile-hero__bio {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-muted);
}

.profile-hero__logout {
  min-width: 120rpx;
}

.profile-hero__stats {
  gap: 18rpx;
  margin-top: 24rpx;
}

.profile-stat {
  flex: 1;
  padding: 22rpx 18rpx;
  border-radius: var(--radius-xl);
  background: rgba(248, 246, 244, 0.92);
}

.profile-stat__value {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.profile-stat__label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--text-muted);
}

.profile-hero__guest {
  margin-top: 26rpx;
}

.profile-hero__guest-text {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-muted);
}

.profile-hero__login {
  width: 100%;
  margin-top: 18rpx;
}

.tab-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 10rpx;
}

.tab-switch__item {
  padding: 22rpx 0;
  border-radius: var(--radius-xl);
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-muted);
}

.tab-switch__item.is-active {
  background: var(--brand-green);
  color: #ffffff;
}

.stack-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.plant-item {
  display: flex;
  gap: 18rpx;
}

.plant-item__image,
.exchange-item__image {
  width: 140rpx;
  height: 140rpx;
  border-radius: var(--radius-xl);
  flex-shrink: 0;
}

.plant-item__body {
  flex: 1;
}

.plant-item__title,
.exchange-item__title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.plant-item__desc,
.exchange-item__desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--text-muted);
}

.plant-item__meta,
.exchange-item__meta {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: var(--brand-green);
}

.exchange-item__actions {
  display: flex;
  gap: 14rpx;
  margin-top: 20rpx;
  flex-wrap: wrap;
}

.exchange-item__button {
  min-width: 200rpx;
}

@media screen and (min-width: 1024px) {
  .mine-page {
    gap: 20px;
  }

  .profile-hero,
  .plant-item,
  .exchange-item {
    padding: 28px;
  }

  .profile-hero__top {
    align-items: start;
    gap: 24px;
  }

  .profile-hero__avatar {
    width: 88px;
    height: 88px;
  }

  .profile-hero__name {
    font-size: 34px;
  }

  .profile-hero__bio {
    margin-top: 8px;
    font-size: 15px;
    max-width: 680px;
  }

  .profile-hero__logout {
    min-width: 108px;
  }

  .profile-hero__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 24px;
  }

  .profile-stat {
    padding: 20px;
    border-radius: 24px;
  }

  .profile-stat__value {
    font-size: 30px;
  }

  .profile-stat__label {
    margin-top: 8px;
    font-size: 14px;
  }

  .profile-hero__guest {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-top: 24px;
  }

  .profile-hero__guest-text {
    flex: 1;
    font-size: 16px;
  }

  .profile-hero__login {
    width: auto;
    min-width: 180px;
    margin-top: 0;
  }

  .tab-switch {
    max-width: 360px;
    padding: 8px;
  }

  .tab-switch__item {
    padding: 14px 0;
    font-size: 16px;
  }

  .stack-list {
    gap: 16px;
  }

  .plant-item {
    align-items: center;
    gap: 20px;
    cursor: pointer;
  }

  .plant-item__image,
  .exchange-item__image {
    width: 116px;
    height: 116px;
    border-radius: 22px;
  }

  .plant-item__title,
  .exchange-item__title {
    font-size: 22px;
  }

  .plant-item__desc,
  .exchange-item__desc {
    margin-top: 8px;
    font-size: 15px;
  }

  .plant-item__meta,
  .exchange-item__meta {
    margin-top: 10px;
    font-size: 13px;
  }

  .exchange-item__top {
    align-items: start;
  }

  .exchange-item__actions {
    gap: 10px;
    margin-top: 18px;
  }

  .exchange-item__button {
    min-width: 140px;
  }
}
</style>
