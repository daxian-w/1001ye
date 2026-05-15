<script setup>
import { onMounted, ref } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getDiaries } from '../../services/diaries'
import { goToPath } from '../../utils/navigation'
import { setPublishDefaultTab } from '../../utils/session'
import { mapDiaryFeedItemViewModel } from '../../utils/view-models'

const diaries = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)

async function loadDiaries(options = {}) {
  const { reset = false } = options

  if (loading.value) return
  loading.value = true

  try {
    const nextPage = reset ? 1 : page.value
    const result = await getDiaries({ page: nextPage, limit: 10 })
    const mapped = result.data.map(mapDiaryFeedItemViewModel)

    diaries.value = reset ? mapped : [...diaries.value, ...mapped]

    const totalPages = result.pagination?.totalPages || 1
    hasMore.value = nextPage < totalPages
    page.value = nextPage + 1
  } catch (error) {
    uni.showToast({ title: error.message || '加载日记失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goPublishDiary() {
  setPublishDefaultTab('diary')
  goToPath('/pages/publish/index')
}

onMounted(() => {
  loadDiaries({ reset: true })
})

onPullDownRefresh(async () => {
  await loadDiaries({ reset: true })
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (!hasMore.value) return
  loadDiaries()
})
</script>

<template>
  <view class="page-shell">
    <view class="page-content diary-page">
      <view class="diary-hero card-surface">
        <text class="brand-pill">COMMUNITY JOURNAL</text>
        <text class="section-title diary-hero__title">植物在流动，故事也在流动。</text>
        <text class="section-subtitle diary-hero__subtitle">
          这里记录的是社区里的新芽、交接、养护心得和每一次真诚分享。
        </text>
        <button class="dark-button diary-hero__button" @click="goPublishDiary">写一篇社区日记</button>
      </view>

      <view v-if="loading && diaries.length === 0" class="loading-panel">
        <text class="loading-panel__emoji">📖</text>
        <text class="loading-panel__title">正在翻开社区日记</text>
        <text class="loading-panel__desc">请稍等，我们正在整理大家的更新。</text>
      </view>

      <view v-else-if="diaries.length === 0" class="empty-panel">
        <text class="empty-panel__emoji">🍀</text>
        <text class="empty-panel__title">还没有社区日记</text>
        <text class="empty-panel__desc">成为第一个写下植物故事的人吧。</text>
        <button class="primary-button empty-panel__button" @click="goPublishDiary">开始记录</button>
      </view>

      <view v-else class="diary-list">
        <view v-for="item in diaries" :key="item.id" class="diary-card card-surface">
          <view class="diary-card__top">
            <view class="diary-card__author">
              <image class="diary-card__avatar" :src="item.userPhoto" mode="aspectFill" />
              <view>
                <text class="diary-card__name">{{ item.userName }}</text>
                <text class="diary-card__meta">{{ item.createdAtText }} · 关于 {{ item.plantName }}</text>
              </view>
            </view>
          </view>

          <text class="diary-card__content">{{ item.content }}</text>

          <view v-if="item.images.length" class="diary-card__gallery">
            <image
              v-for="(image, index) in item.images"
              :key="`${item.id}-${index}`"
              class="diary-card__image"
              :src="image"
              mode="aspectFill"
            />
          </view>
        </view>
      </view>

      <view v-if="loading && diaries.length" class="loading-tail">
        <text>正在加载更多社区内容...</text>
      </view>
      <view v-else-if="!hasMore && diaries.length" class="loading-tail">
        <text>已经看到最后一篇了。</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.diary-page {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.diary-hero,
.diary-card {
  padding: 30rpx;
}

.diary-hero__title,
.diary-hero__subtitle,
.diary-card__name,
.diary-card__meta,
.diary-card__content {
  display: block;
}

.diary-hero__title {
  margin-top: 18rpx;
}

.diary-hero__subtitle {
  margin-top: 14rpx;
}

.diary-hero__button {
  width: 100%;
  margin-top: 22rpx;
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.diary-card__top,
.diary-card__author {
  display: flex;
  align-items: center;
}

.diary-card__author {
  gap: 16rpx;
}

.diary-card__avatar {
  width: 74rpx;
  height: 74rpx;
  border-radius: 50%;
}

.diary-card__name {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.diary-card__meta {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: var(--text-muted);
}

.diary-card__content {
  margin-top: 20rpx;
  font-size: 28rpx;
  line-height: 1.8;
  color: var(--text-primary);
}

.diary-card__gallery {
  display: flex;
  gap: 14rpx;
  margin-top: 20rpx;
  overflow-x: auto;
}

.diary-card__image {
  width: 220rpx;
  height: 220rpx;
  border-radius: var(--radius-xl);
  flex-shrink: 0;
}

.loading-tail {
  padding: 20rpx 0 8rpx;
  text-align: center;
  font-size: 22rpx;
  color: var(--text-muted);
}

@media screen and (min-width: 1024px) {
  .diary-page {
    gap: 20px;
  }

  .diary-hero,
  .diary-card {
    padding: 30px;
  }

  .diary-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: 24px;
  }

  .diary-hero__title {
    margin-top: 14px;
    max-width: 760px;
  }

  .diary-hero__subtitle {
    margin-top: 14px;
    max-width: 760px;
  }

  .diary-hero__button {
    width: auto;
    min-width: 190px;
    margin-top: 0;
  }

  .diary-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .diary-card {
    min-height: 100%;
  }

  .diary-card__author {
    gap: 14px;
  }

  .diary-card__avatar {
    width: 56px;
    height: 56px;
  }

  .diary-card__name {
    font-size: 18px;
  }

  .diary-card__meta {
    margin-top: 5px;
    font-size: 13px;
  }

  .diary-card__content {
    margin-top: 18px;
    font-size: 16px;
    line-height: 1.8;
  }

  .diary-card__gallery {
    gap: 12px;
    margin-top: 18px;
    overflow: visible;
    flex-wrap: wrap;
  }

  .diary-card__image {
    width: calc(50% - 6px);
    height: 200px;
    border-radius: 22px;
  }

  .loading-tail {
    padding: 12px 0 2px;
    font-size: 14px;
  }
}
</style>
