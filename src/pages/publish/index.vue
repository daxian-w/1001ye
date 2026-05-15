<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '../../store/auth'
import { createDiary } from '../../services/diaries'
import { createPlant } from '../../services/plants'
import { uploadImages } from '../../services/upload'
import { consumePublishDefaultTab, setStoredRedirect } from '../../utils/session'
import { goToPath } from '../../utils/navigation'

const auth = useAuthStore()
const activeTab = ref('plant')
const submitting = ref(false)

const plantImages = ref([])
const diaryImages = ref([])

const plantForm = ref({
  title: '',
  description: '',
  stock: 1,
  species: '',
  city: '',
  address: '',
  exchangeMethods: ['free'],
})

const diaryForm = ref({
  plantName: '',
  content: '',
})

const exchangeOptions = [
  { id: 'free', label: '免费自取' },
  { id: 'exchange', label: '只交换' },
]

const currentImageList = computed(() => (activeTab.value === 'plant' ? plantImages.value : diaryImages.value))

function requireLogin() {
  setStoredRedirect('/pages/publish/index')
  goToPath('/pages/auth/login')
}

function toggleExchangeMethod(method) {
  const methods = plantForm.value.exchangeMethods
  if (methods.includes(method)) {
    plantForm.value.exchangeMethods = methods.filter((item) => item !== method)
  } else {
    plantForm.value.exchangeMethods = [...methods, method]
  }

  if (!plantForm.value.exchangeMethods.length) {
    plantForm.value.exchangeMethods = ['free']
  }
}

function pickImages() {
  const target = activeTab.value === 'plant' ? plantImages : diaryImages
  const remain = 4 - target.value.length
  if (remain <= 0) {
    uni.showToast({ title: '最多上传 4 张图片', icon: 'none' })
    return
  }

  uni.chooseImage({
    count: remain,
    success: (res) => {
      target.value = [...target.value, ...res.tempFilePaths]
    },
  })
}

function removeImage(index) {
  const target = activeTab.value === 'plant' ? plantImages : diaryImages
  target.value = target.value.filter((_, currentIndex) => currentIndex !== index)
}

function resetPlantForm() {
  plantForm.value = {
    title: '',
    description: '',
    stock: 1,
    species: '',
    city: '',
    address: '',
    exchangeMethods: ['free'],
  }
  plantImages.value = []
}

function resetDiaryForm() {
  diaryForm.value = {
    plantName: '',
    content: '',
  }
  diaryImages.value = []
}

async function submitPlant() {
  if (!plantForm.value.title.trim() || !plantForm.value.description.trim() || !plantForm.value.city.trim()) {
    uni.showToast({ title: '请补全标题、描述和城市', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const uploaded = await uploadImages(plantImages.value)
    await createPlant({
      title: plantForm.value.title.trim(),
      description: plantForm.value.description.trim(),
      images: uploaded.map((item) => item.url),
      stock: Number(plantForm.value.stock || 1),
      species: plantForm.value.species.trim() || undefined,
      city: plantForm.value.city.trim(),
      address: plantForm.value.address.trim() || undefined,
      exchangeMethods: plantForm.value.exchangeMethods,
    })
    resetPlantForm()
    uni.showToast({ title: '发布成功', icon: 'success' })
    goToPath('/pages/index/index', { replace: true })
  } catch (error) {
    uni.showToast({ title: error.message || '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

async function submitDiaryEntry() {
  if (!diaryForm.value.plantName.trim() || !diaryForm.value.content.trim()) {
    uni.showToast({ title: '请填写植物名和日记内容', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const uploaded = await uploadImages(diaryImages.value)
    await createDiary({
      plantName: diaryForm.value.plantName.trim(),
      content: diaryForm.value.content.trim(),
      images: uploaded.map((item) => item.url),
    })
    resetDiaryForm()
    uni.showToast({ title: '发布日记成功', icon: 'success' })
    goToPath('/pages/diary/list', { replace: true })
  } catch (error) {
    uni.showToast({ title: error.message || '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

async function handleSubmit() {
  if (!auth.isLoggedIn) {
    requireLogin()
    return
  }

  if (activeTab.value === 'plant') {
    await submitPlant()
    return
  }

  await submitDiaryEntry()
}

onShow(() => {
  const preferredTab = consumePublishDefaultTab()
  if (preferredTab) {
    activeTab.value = preferredTab
  }
})
</script>

<template>
  <view class="page-shell">
    <view class="page-content publish-page">
      <view class="publish-hero card-surface">
        <text class="brand-pill">SHARE YOUR GREEN</text>
        <text class="section-title publish-hero__title">把你的植物或交换故事，温柔地分享给社区。</text>
        <text class="section-subtitle publish-hero__subtitle">
          发布时尽量真实描述状态、数量和交接方式，社区会因此更可信。
        </text>
      </view>

      <view v-if="!auth.isLoggedIn" class="gate card-surface">
        <text class="gate__title">登录后即可发布植物和社区日记。</text>
        <text class="gate__desc">你也可以先以游客身份体验，再决定是否使用微信登录。</text>
        <button class="primary-button gate__button" @click="requireLogin">前往登录</button>
      </view>

      <template v-else>
        <view class="tab-switch card-surface">
          <view
            :class="['tab-switch__item', activeTab === 'plant' ? 'is-active' : '']"
            @click="activeTab = 'plant'"
          >
            发布植物
          </view>
          <view
            :class="['tab-switch__item', activeTab === 'diary' ? 'is-active' : '']"
            @click="activeTab = 'diary'"
          >
            社区日记
          </view>
        </view>

        <view class="form-shell card-surface">
          <template v-if="activeTab === 'plant'">
            <view class="form-block">
              <text class="field-label">植物照片</text>
              <view class="image-grid">
                <view v-for="(image, index) in plantImages" :key="image" class="image-grid__item">
                  <image class="image-grid__preview" :src="image" mode="aspectFill" />
                  <view class="image-grid__remove" @click="removeImage(index)">×</view>
                </view>
                <view v-if="currentImageList.length < 4" class="image-grid__picker" @click="pickImages">
                  <text class="image-grid__plus">＋</text>
                  <text class="image-grid__tip">添加照片</text>
                </view>
              </view>
            </view>

            <view class="form-block">
              <text class="field-label">植物名称</text>
              <input v-model="plantForm.title" class="field-input" placeholder="例如：健康多肉 - 姬秋丽" />
            </view>

            <view class="form-row">
              <view class="form-col">
                <text class="field-label">品种</text>
                <input v-model="plantForm.species" class="field-input" placeholder="例如：龟背竹、多肉" />
              </view>
              <view class="form-col">
                <text class="field-label">城市</text>
                <input v-model="plantForm.city" class="field-input" placeholder="例如：上海" />
              </view>
            </view>

            <view class="form-row">
              <view class="form-col">
                <text class="field-label">交接地点</text>
                <input v-model="plantForm.address" class="field-input" placeholder="建议填写附近地铁或公共地点" />
              </view>
              <view class="form-col form-col--stock">
                <text class="field-label">数量</text>
                <view class="stock-stepper">
                  <view class="stock-stepper__btn" @click="plantForm.stock = Math.max(1, plantForm.stock - 1)">-</view>
                  <text class="stock-stepper__value">{{ plantForm.stock }}</text>
                  <view class="stock-stepper__btn" @click="plantForm.stock = plantForm.stock + 1">+</view>
                </view>
              </view>
            </view>

            <view class="form-block">
              <text class="field-label">交换方式</text>
              <view class="option-row">
                <view
                  v-for="option in exchangeOptions"
                  :key="option.id"
                  :class="['option-chip', plantForm.exchangeMethods.includes(option.id) ? 'is-active' : '']"
                  @click="toggleExchangeMethod(option.id)"
                >
                  {{ option.label }}
                </view>
              </view>
            </view>

            <view class="form-block">
              <text class="field-label">详细描述</text>
              <textarea
                v-model="plantForm.description"
                class="field-textarea"
                maxlength="500"
                placeholder="写一下植物状态、养护情况，或者你希望怎样交换。"
              />
            </view>
          </template>

          <template v-else>
            <view class="form-block">
              <text class="field-label">关联植物名称</text>
              <input v-model="diaryForm.plantName" class="field-input" placeholder="例如：龟背竹小苗" />
            </view>

            <view class="form-block">
              <text class="field-label">日记图片</text>
              <view class="image-grid">
                <view v-for="(image, index) in diaryImages" :key="image" class="image-grid__item">
                  <image class="image-grid__preview" :src="image" mode="aspectFill" />
                  <view class="image-grid__remove" @click="removeImage(index)">×</view>
                </view>
                <view v-if="currentImageList.length < 4" class="image-grid__picker" @click="pickImages">
                  <text class="image-grid__plus">＋</text>
                  <text class="image-grid__tip">添加照片</text>
                </view>
              </view>
            </view>

            <view class="form-block">
              <text class="field-label">日记内容</text>
              <textarea
                v-model="diaryForm.content"
                class="field-textarea"
                maxlength="500"
                placeholder="记录这株植物的新变化，或者分享这次交换的心情。"
              />
            </view>
          </template>

          <view class="submit-bar">
            <text class="submit-bar__hint">
              {{ activeTab === 'plant' ? '发布成功后，其他用户可以向你发起领取申请。' : '一篇真实的日记，会让社区更有温度。' }}
            </text>
            <button class="primary-button submit-bar__button" :disabled="submitting" @click="handleSubmit">
              {{ submitting ? '正在提交...' : activeTab === 'plant' ? '确认发布植物' : '发布社区日记' }}
            </button>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.publish-page {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.publish-hero,
.gate,
.form-shell {
  padding: 30rpx;
}

.publish-hero__title,
.publish-hero__subtitle,
.gate__title,
.gate__desc,
.submit-bar__hint {
  display: block;
}

.publish-hero__title {
  margin-top: 18rpx;
}

.publish-hero__subtitle {
  margin-top: 14rpx;
}

.gate__title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.gate__desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--text-muted);
}

.gate__button {
  width: 100%;
  margin-top: 20rpx;
}

.tab-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 10rpx;
}

.tab-switch__item {
  text-align: center;
  padding: 22rpx 0;
  border-radius: var(--radius-xl);
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-muted);
}

.tab-switch__item.is-active {
  background: var(--brand-green);
  color: #ffffff;
}

.form-shell {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}

.form-row {
  display: flex;
  gap: 18rpx;
}

.form-col {
  flex: 1;
}

.form-col--stock {
  max-width: 240rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
}

.image-grid__item,
.image-grid__picker {
  position: relative;
  width: calc(50% - 9rpx);
  height: 220rpx;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: rgba(248, 246, 244, 0.88);
}

.image-grid__preview {
  width: 100%;
  height: 100%;
}

.image-grid__picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1rpx dashed rgba(92, 69, 61, 0.22);
}

.image-grid__plus {
  font-size: 48rpx;
  color: var(--brand-green);
}

.image-grid__tip {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: var(--text-muted);
}

.image-grid__remove {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: rgba(26, 26, 26, 0.64);
  color: #ffffff;
  text-align: center;
  line-height: 44rpx;
  font-size: 28rpx;
}

.stock-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 96rpx;
  padding: 0 16rpx;
  border-radius: var(--radius-xl);
  background: rgba(248, 246, 244, 0.92);
  border: 1rpx solid var(--border-soft);
}

.stock-stepper__btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #ffffff;
  text-align: center;
  line-height: 52rpx;
  font-size: 30rpx;
  color: var(--text-strong);
}

.stock-stepper__value {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.option-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.option-chip {
  padding: 18rpx 26rpx;
  border-radius: var(--radius-pill);
  background: rgba(248, 246, 244, 0.92);
  border: 1rpx solid var(--border-soft);
  color: var(--text-muted);
  font-size: 24rpx;
  font-weight: 700;
}

.option-chip.is-active {
  background: var(--brand-green);
  color: #ffffff;
}

.submit-bar {
  padding-top: 10rpx;
  border-top: 1rpx solid var(--border-soft);
}

.submit-bar__hint {
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--text-muted);
}

.submit-bar__button {
  width: 100%;
  margin-top: 18rpx;
}

@media screen and (min-width: 1024px) {
  .publish-page {
    gap: 20px;
  }

  .publish-hero,
  .gate,
  .form-shell {
    padding: 30px;
  }

  .publish-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: end;
  }

  .publish-hero__title {
    margin-top: 14px;
    max-width: 760px;
  }

  .publish-hero__subtitle {
    margin-top: 14px;
    max-width: 720px;
  }

  .gate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .gate__title {
    font-size: 24px;
  }

  .gate__desc {
    margin-top: 8px;
    max-width: 720px;
    font-size: 15px;
  }

  .gate__button {
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

  .form-shell {
    gap: 22px;
  }

  .form-row {
    gap: 16px;
  }

  .form-col--stock {
    max-width: 220px;
  }

  .image-grid {
    gap: 16px;
  }

  .image-grid__item,
  .image-grid__picker {
    width: calc(25% - 12px);
    height: 180px;
    border-radius: 22px;
  }

  .image-grid__picker {
    border-width: 1px;
  }

  .image-grid__plus {
    font-size: 36px;
  }

  .image-grid__tip {
    margin-top: 8px;
    font-size: 13px;
  }

  .image-grid__remove {
    top: 10px;
    right: 10px;
    width: 34px;
    height: 34px;
    line-height: 34px;
    font-size: 20px;
  }

  .stock-stepper {
    min-height: 56px;
    padding: 0 12px;
    border-width: 1px;
    border-radius: 22px;
  }

  .stock-stepper__btn {
    width: 34px;
    height: 34px;
    line-height: 34px;
    font-size: 20px;
  }

  .stock-stepper__value {
    font-size: 16px;
  }

  .option-row {
    gap: 12px;
  }

  .option-chip {
    padding: 12px 18px;
    font-size: 14px;
  }

  .submit-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding-top: 18px;
    border-top-width: 1px;
  }

  .submit-bar__hint {
    flex: 1;
    font-size: 14px;
  }

  .submit-bar__button {
    width: auto;
    min-width: 220px;
    margin-top: 0;
  }
}

@media screen and (max-width: 1180px) and (min-width: 1024px) {
  .image-grid__item,
  .image-grid__picker {
    width: calc(33.333% - 11px);
  }
}
</style>
