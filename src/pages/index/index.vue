<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { getPlantCities, getPlants } from '../../services/plants'
import { goToPath } from '../../utils/navigation'
import { mapPlantCardViewModel } from '../../utils/view-models'

const search = ref('')
const loading = ref(false)
const errorMessage = ref('')
const plants = ref([])
const activePlantTotal = ref(0)
const cityCount = ref(0)
const successfulExchangeCount = ref(0)
const cityHighlights = ref([])

let timer = null

const featuredPlants = computed(() => plants.value.slice(0, 8))
const communityStats = computed(() => [
  {
    label: '正在交换',
    value: `${activePlantTotal.value}+`,
    note: '社区里仍在等待新主人的植物',
  },
  {
    label: '参与城市',
    value: `${cityCount.value}+`,
    note: '不同城市正在持续分享绿意',
  },
  {
    label: '交换成功',
    value: `${successfulExchangeCount.value}+`,
    note: '已经完成流转并留下新的成长故事',
  },
])

const editorialNotes = computed(() => [
  {
    title: '真实描述',
    body: '更清楚的状态说明，会让植物更快遇到愿意认真接手的人。',
  },
  {
    title: '礼貌沟通',
    body: '发布者与领取者都能在温和的节奏里确认交接时间与地点。',
  },
  {
    title: '持续生长',
    body: '交换不是终点，社区日记会继续记录它们去往新家的样子。',
  },
])

async function loadPlants() {
  loading.value = true
  errorMessage.value = ''

  try {
    const keyword = search.value.trim() || undefined
    const [activeResult, citiesResult, completedResult] = await Promise.all([
      getPlants({
        page: 1,
        limit: 24,
        search: keyword,
        status: 'active',
      }),
      getPlantCities(),
      getPlants({
        page: 1,
        limit: 100,
        status: 'completed',
      }),
    ])

    plants.value = activeResult.data.map(mapPlantCardViewModel)
    activePlantTotal.value = activeResult.pagination?.total || activeResult.data.length || 0
    cityCount.value = Array.isArray(citiesResult) ? citiesResult.length : 0
    cityHighlights.value = Array.isArray(citiesResult) ? citiesResult.slice(0, 5) : []

    const activeClaimedCount = activeResult.data.reduce((sum, item) => {
      const stock = Number(item.stock || 0)
      const remaining = Number(item.remainingQuantity || 0)
      return sum + Math.max(stock - remaining, 0)
    }, 0)

    const completedClaimedCount = completedResult.data.reduce((sum, item) => {
      const stock = Number(item.stock || 0)
      return sum + Math.max(stock, 0)
    }, 0)

    successfulExchangeCount.value = activeClaimedCount + completedClaimedCount
  } catch (error) {
    plants.value = []
    activePlantTotal.value = 0
    cityCount.value = 0
    successfulExchangeCount.value = 0
    cityHighlights.value = []
    errorMessage.value = error.message || '加载植物列表失败'
  } finally {
    loading.value = false
  }
}

function openPlant(id) {
  goToPath(`/pages/plant/detail?id=${id}`)
}

function openPublish() {
  goToPath('/pages/publish/index')
}

function openDiary() {
  goToPath('/pages/diary/list')
}

function openMine() {
  goToPath('/pages/mine/index')
}

watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    loadPlants()
  }, 280)
})

onMounted(() => {
  loadPlants()
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<template>
  <view class="page-shell">
    <view class="page-content home-page">
      <view class="hero card-surface">
        <image
          class="hero__image"
          src="https://i.imgs.ovh/2026/03/22/O9mloL.jpeg"
          mode="aspectFill"
        />
        <view class="hero__veil"></view>

        <view class="hero__layout">
          <view class="hero__content">
            <view class="hero__brand">
              <image class="hero__logo" src="https://brave.wzznft.com/i/2026/03/22/t2z9wu.png" mode="aspectFit" />
              <view>
                <text class="hero__eyebrow">1001叶植物交换社区</text>
                <text class="hero__tagline">分享绿意，交换美好，记录成长。</text>
              </view>
            </view>

            <text class="section-title hero__title">
              让每一盆植物，
              都能在新的窗边继续生长。
            </text>
            <text class="section-subtitle hero__subtitle">
              浏览邻里正在交换的植物，发布闲置绿植，在真实、礼貌、轻松的社区里完成交接。
            </text>

            <view class="hero__actions">
              <button class="primary-button hero__button" @click="openPublish">发布我的植物</button>
              <button class="ghost-button hero__button" @click="openDiary">浏览社区日记</button>
            </view>

            <view class="hero__search">
              <text class="hero__search-icon">搜</text>
              <input
                v-model="search"
                class="hero__search-input"
                placeholder="搜索植物名称、品种或城市"
                confirm-type="search"
              />
            </view>
          </view>

          <view class="hero__panel">
            <text class="hero__panel-label">本周活跃城市</text>
            <view v-if="cityHighlights.length" class="hero__city-list">
              <view v-for="city in cityHighlights" :key="city.name" class="hero__city-chip">
                <text class="hero__city-name">{{ city.name }}</text>
                <text class="hero__city-count">{{ city.count || 0 }} 株</text>
              </view>
            </view>
            <view v-else class="hero__city-empty">
              <text>城市数据会在接口恢复后自动展示</text>
            </view>
            <view class="hero__panel-divider"></view>
            <text class="hero__panel-note">
              发布时写清植物状态、数量与交接方式，会让交换更顺畅，也更容易建立信任。
            </text>
          </view>
        </view>
      </view>

      <view class="stats-row">
        <view v-for="item in communityStats" :key="item.label" class="stat-card card-surface">
          <text class="stat-card__value">{{ item.value }}</text>
          <text class="stat-card__label">{{ item.label }}</text>
          <text class="stat-card__note">{{ item.note }}</text>
        </view>
      </view>

      <view class="editorial-strip card-surface">
        <view v-for="item in editorialNotes" :key="item.title" class="editorial-strip__item">
          <text class="editorial-strip__title">{{ item.title }}</text>
          <text class="editorial-strip__body">{{ item.body }}</text>
        </view>
      </view>

      <view class="section-header">
        <view>
          <text class="brand-pill">DISCOVER PLANTS</text>
          <text class="section-title section-header__title">发现正在交换的植物</text>
          <text class="section-subtitle">
            每张卡片都保留关键信息，让你能更快判断植物状态、发布者与交接城市。
          </text>
        </view>
        <text class="section-header__link" @click="openMine">前往个人中心</text>
      </view>

      <view v-if="loading" class="loading-panel">
        <text class="loading-panel__emoji">🌿</text>
        <text class="loading-panel__title">正在整理今天的植物更新</text>
        <text class="loading-panel__desc">我们正在把社区里的绿色故事加载给你。</text>
      </view>

      <view v-else-if="errorMessage" class="empty-panel">
        <text class="empty-panel__emoji">📭</text>
        <text class="empty-panel__title">暂时没能读到社区内容</text>
        <text class="empty-panel__desc">{{ errorMessage }}</text>
        <button class="outline-button empty-panel__button" @click="loadPlants">重新加载</button>
      </view>

      <view v-else-if="featuredPlants.length === 0" class="empty-panel">
        <text class="empty-panel__emoji">🪴</text>
        <text class="empty-panel__title">还没有匹配的植物</text>
        <text class="empty-panel__desc">换个关键词，或者成为今天第一个发布植物的人。</text>
        <button class="primary-button empty-panel__button" @click="openPublish">立即发布</button>
      </view>

      <view v-else class="plant-grid">
        <view
          v-for="plant in featuredPlants"
          :key="plant.id"
          class="plant-card card-surface"
          @click="openPlant(plant.id)"
        >
          <image class="plant-card__image" :src="plant.coverImage" mode="aspectFill" />
          <view class="plant-card__body">
            <view class="plant-card__meta">
              <text class="plant-card__species">{{ plant.species }}</text>
              <text class="plant-card__date">{{ plant.createdAtText }}</text>
            </view>

            <text class="plant-card__title">{{ plant.title }}</text>
            <text class="plant-card__desc">{{ plant.description }}</text>

            <view class="plant-card__facts">
              <view class="plant-card__fact">
                <text class="plant-card__fact-label">城市</text>
                <text class="plant-card__fact-value">{{ plant.city }}</text>
              </view>
              <view class="plant-card__fact">
                <text class="plant-card__fact-label">库存</text>
                <text class="plant-card__fact-value">{{ plant.remainingText }}</text>
              </view>
            </view>

            <view class="plant-card__foot">
              <view class="plant-card__user">
                <image class="plant-card__avatar" :src="plant.userPhoto" mode="aspectFill" />
                <view>
                  <text class="plant-card__name">{{ plant.userName }}</text>
                  <text class="plant-card__hint">发布于 {{ plant.city }}</text>
                </view>
              </view>
              <text class="plant-card__cta">查看详情</text>
            </view>
          </view>
        </view>
      </view>

      <view class="home-footer card-surface">
        <view class="home-footer__copy">
          <text class="brand-pill">COMMUNITY NOTES</text>
          <text class="section-title home-footer__title">这是一个简约、温和、可信赖的植物交换角落。</text>
          <text class="section-subtitle">
            你可以发布多余的绿植，也可以记录交换后的故事。我们更看重真实描述、礼貌沟通和持续生长。
          </text>
        </view>
        <view class="home-footer__actions">
          <button class="dark-button" @click="openDiary">去看社区日记</button>
          <button class="outline-button" @click="openMine">查看我的记录</button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.hero {
  position: relative;
  overflow: hidden;
  min-height: 760rpx;
  padding: 40rpx;
}

.hero__image,
.hero__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero__veil {
  background:
    linear-gradient(130deg, rgba(20, 18, 16, 0.74), rgba(39, 174, 96, 0.28)),
    linear-gradient(0deg, rgba(20, 18, 16, 0.24), rgba(20, 18, 16, 0.24));
}

.hero__layout {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.hero__content {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}

.hero__brand {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.hero__logo {
  width: 88rpx;
  height: 88rpx;
  flex-shrink: 0;
}

.hero__eyebrow,
.hero__tagline,
.hero__title,
.hero__subtitle,
.hero__panel-label,
.hero__panel-note,
.hero__city-name,
.hero__city-count,
.section-header__title,
.stat-card__value,
.stat-card__label,
.stat-card__note,
.editorial-strip__title,
.editorial-strip__body,
.plant-card__title,
.plant-card__desc,
.plant-card__fact-label,
.plant-card__fact-value,
.plant-card__name,
.plant-card__hint,
.plant-card__cta,
.home-footer__title {
  display: block;
}

.hero__eyebrow,
.hero__tagline,
.hero__title,
.hero__subtitle,
.hero__panel-label,
.hero__panel-note,
.hero__city-name,
.hero__city-count {
  color: #ffffff;
}

.hero__eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.hero__tagline {
  margin-top: 8rpx;
  font-size: 24rpx;
  opacity: 0.8;
}

.hero__title {
  max-width: 600rpx;
}

.hero__subtitle {
  max-width: 580rpx;
  opacity: 0.92;
}

.hero__actions {
  display: flex;
  gap: 18rpx;
  flex-wrap: wrap;
}

.hero__button {
  min-width: 240rpx;
}

.hero__search {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.92);
  border-radius: var(--radius-pill);
  padding: 0 28rpx;
  min-height: 98rpx;
}

.hero__search-icon {
  font-size: 30rpx;
  color: var(--text-muted);
}

.hero__search-input {
  flex: 1;
  height: 98rpx;
  font-size: 28rpx;
}

.hero__panel {
  padding: 28rpx;
  border-radius: var(--radius-2xl);
  background: rgba(255, 255, 255, 0.14);
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(14rpx);
}

.hero__panel-label {
  font-size: 24rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.hero__city-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 18rpx;
}

.hero__city-chip {
  min-width: 180rpx;
  padding: 18rpx 20rpx;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.12);
}

.hero__city-name {
  font-size: 26rpx;
  font-weight: 700;
}

.hero__city-count {
  margin-top: 8rpx;
  font-size: 22rpx;
  opacity: 0.78;
}

.hero__city-empty {
  margin-top: 18rpx;
  color: rgba(255, 255, 255, 0.76);
  font-size: 24rpx;
}

.hero__panel-divider {
  margin: 22rpx 0;
  height: 1rpx;
  background: rgba(255, 255, 255, 0.18);
}

.hero__panel-note {
  font-size: 24rpx;
  line-height: 1.8;
  opacity: 0.82;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18rpx;
}

.stat-card {
  padding: 28rpx 24rpx;
}

.stat-card__value {
  font-family: "Zilla Slab", "Times New Roman", serif;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.stat-card__label {
  margin-top: 10rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-label);
}

.stat-card__note {
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--text-muted);
}

.editorial-strip {
  display: grid;
  gap: 0;
  overflow: hidden;
}

.editorial-strip__item {
  padding: 26rpx 28rpx;
  border-bottom: 1rpx solid var(--border-soft);
}

.editorial-strip__item:last-child {
  border-bottom: none;
}

.editorial-strip__title {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.editorial-strip__body {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.75;
  color: var(--text-muted);
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
}

.section-header__title {
  margin-top: 18rpx;
  font-size: 42rpx;
}

.section-header__link {
  color: var(--brand-green);
  font-size: 24rpx;
  font-weight: 700;
}

.plant-grid {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.plant-card {
  overflow: hidden;
}

.plant-card__image {
  width: 100%;
  height: 360rpx;
}

.plant-card__body {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 28rpx;
}

.plant-card__meta,
.plant-card__foot,
.plant-card__user,
.plant-card__facts {
  display: flex;
  align-items: center;
}

.plant-card__meta,
.plant-card__foot {
  justify-content: space-between;
}

.plant-card__species {
  padding: 10rpx 18rpx;
  border-radius: var(--radius-pill);
  background: rgba(39, 174, 96, 0.08);
  color: var(--brand-green);
  font-size: 22rpx;
  font-weight: 700;
}

.plant-card__date {
  font-size: 22rpx;
  color: var(--text-muted);
}

.plant-card__title {
  font-family: "Zilla Slab", "Times New Roman", serif;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.18;
  color: var(--text-strong);
}

.plant-card__desc {
  font-size: 26rpx;
  line-height: 1.7;
  color: var(--text-muted);
}

.plant-card__facts {
  gap: 16rpx;
  flex-wrap: wrap;
}

.plant-card__fact {
  min-width: 200rpx;
  padding: 16rpx 18rpx;
  border-radius: var(--radius-xl);
  background: rgba(248, 246, 244, 0.92);
}

.plant-card__fact-label {
  font-size: 22rpx;
  color: var(--text-muted);
}

.plant-card__fact-value {
  margin-top: 8rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.plant-card__foot {
  gap: 18rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid var(--border-soft);
}

.plant-card__user {
  gap: 14rpx;
  justify-content: flex-start;
}

.plant-card__avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
}

.plant-card__name {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.plant-card__hint {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: var(--text-muted);
}

.plant-card__cta {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--brand-green);
}

.home-footer {
  padding: 34rpx;
}

.home-footer__title {
  margin-top: 18rpx;
  font-size: 40rpx;
}

.home-footer__actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
  flex-wrap: wrap;
}

.empty-panel__button {
  margin-top: 24rpx;
}

@media screen and (min-width: 1024px) {
  .home-page {
    gap: 24px;
  }

  .hero {
    min-height: 640px;
    padding: 56px;
    border-radius: 34px;
  }

  .hero__layout {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.74fr);
    gap: 28px;
    align-items: end;
    min-height: 528px;
  }

  .hero__content {
    gap: 22px;
    max-width: 720px;
  }

  .hero__brand {
    gap: 14px;
  }

  .hero__logo {
    width: 64px;
    height: 64px;
  }

  .hero__eyebrow {
    font-size: 14px;
    letter-spacing: 0.08em;
  }

  .hero__tagline {
    margin-top: 6px;
    font-size: 16px;
  }

  .hero__title,
  .hero__subtitle {
    max-width: 680px;
  }

  .hero__actions {
    gap: 14px;
  }

  .hero__button {
    min-width: 0;
  }

  .hero__search {
    gap: 12px;
    max-width: 540px;
    min-height: 60px;
    padding: 0 18px;
  }

  .hero__search-icon {
    font-size: 18px;
  }

  .hero__search-input {
    height: 60px;
    font-size: 16px;
  }

  .hero__panel {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 26px;
    border-width: 1px;
    border-radius: 28px;
    backdrop-filter: blur(12px);
  }

  .hero__panel-label {
    font-size: 15px;
    letter-spacing: 0.08em;
  }

  .hero__city-list {
    gap: 12px;
    margin-top: 14px;
  }

  .hero__city-chip {
    min-width: calc(50% - 6px);
    padding: 14px 16px;
    border-radius: 20px;
  }

  .hero__city-name {
    font-size: 17px;
  }

  .hero__city-count {
    margin-top: 6px;
    font-size: 13px;
  }

  .hero__city-empty {
    margin-top: 14px;
    font-size: 14px;
  }

  .hero__panel-divider {
    margin: 18px 0;
    height: 1px;
  }

  .hero__panel-note {
    font-size: 15px;
  }

  .stats-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .stat-card {
    padding: 24px;
  }

  .stat-card__value {
    font-size: 34px;
  }

  .stat-card__label {
    margin-top: 8px;
    font-size: 15px;
  }

  .stat-card__note {
    margin-top: 8px;
    font-size: 14px;
  }

  .editorial-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .editorial-strip__item {
    min-height: 100%;
    padding: 24px;
    border-right: 1px solid rgba(92, 69, 61, 0.12);
    border-bottom: none;
  }

  .editorial-strip__item:last-child {
    border-right: none;
  }

  .editorial-strip__title {
    font-size: 18px;
  }

  .editorial-strip__body {
    margin-top: 10px;
    font-size: 15px;
  }

  .section-header {
    align-items: end;
    gap: 24px;
  }

  .section-header__title {
    margin-top: 14px;
    font-size: 48px;
  }

  .section-header__link {
    font-size: 15px;
    white-space: nowrap;
  }

  .plant-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  .plant-card {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    cursor: pointer;
    transition:
      transform 0.24s ease,
      box-shadow 0.24s ease;
  }

  .plant-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 52px rgba(26, 26, 26, 0.08);
  }

  .plant-card__image {
    height: 236px;
  }

  .plant-card__body {
    flex: 1;
    gap: 14px;
    padding: 22px;
  }

  .plant-card__meta,
  .plant-card__foot,
  .plant-card__user,
  .plant-card__facts {
    gap: 12px;
  }

  .plant-card__species {
    padding: 8px 14px;
    font-size: 13px;
  }

  .plant-card__date {
    font-size: 13px;
  }

  .plant-card__title {
    font-size: 28px;
  }

  .plant-card__desc {
    font-size: 15px;
    line-height: 1.7;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .plant-card__fact {
    min-width: calc(50% - 6px);
    padding: 12px 14px;
    border-radius: 18px;
  }

  .plant-card__fact-label {
    font-size: 12px;
  }

  .plant-card__fact-value {
    margin-top: 6px;
    font-size: 14px;
  }

  .plant-card__foot {
    margin-top: auto;
    padding-top: 16px;
    border-top-width: 1px;
  }

  .plant-card__avatar {
    width: 48px;
    height: 48px;
  }

  .plant-card__name {
    font-size: 15px;
  }

  .plant-card__hint,
  .plant-card__cta {
    font-size: 13px;
  }

  .home-footer {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) auto;
    align-items: center;
    gap: 24px;
    padding: 32px;
  }

  .home-footer__title {
    margin-top: 14px;
    font-size: 42px;
  }

  .home-footer__actions {
    justify-content: flex-end;
    gap: 12px;
    margin-top: 0;
  }
}

@media screen and (min-width: 1440px) {
  .plant-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
