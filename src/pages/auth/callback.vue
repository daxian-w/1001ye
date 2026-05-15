<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { consumeStoredRedirect } from '../../utils/session'
import { goToPath } from '../../utils/navigation'

const auth = useAuthStore()

function parseSearchParams() {
  if (typeof window === 'undefined') return new URLSearchParams()
  const hash = window.location.hash || ''
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?')) : window.location.search
  return new URLSearchParams(query)
}

function redirectAfterLogin() {
  const target = consumeStoredRedirect() || '/pages/index/index'
  goToPath(target, { replace: true })
}

onMounted(async () => {
  const params = parseSearchParams()
  const code = params.get('code')
  const error = params.get('error')

  if (error) {
    uni.showToast({ title: `授权失败：${error}`, icon: 'none' })
    setTimeout(() => {
      goToPath('/pages/auth/login', { replace: true })
    }, 1200)
    return
  }

  if (!code) {
    goToPath('/pages/auth/login', { replace: true })
    return
  }

  try {
    uni.showLoading({ title: '登录中...' })
    await auth.loginWithCode(code)
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      redirectAfterLogin()
    }, 800)
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
    setTimeout(() => {
      goToPath('/pages/auth/login', { replace: true })
    }, 1200)
  }
})
</script>

<template>
  <view class="page-shell callback-page">
    <view class="callback-card card-surface">
      <image class="callback-card__logo" src="https://brave.wzznft.com/i/2026/03/22/t2z9wu.png" mode="aspectFit" />
      <text class="section-title callback-card__title">正在完成登录</text>
      <text class="section-subtitle callback-card__subtitle">请稍等，我们正在把你带回刚才的页面。</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.callback-card {
  width: 100%;
  padding: 40rpx 34rpx;
  text-align: center;
}

.callback-card__logo {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto;
}

.callback-card__title,
.callback-card__subtitle {
  display: block;
}

.callback-card__title {
  margin-top: 22rpx;
}

.callback-card__subtitle {
  margin-top: 12rpx;
}
</style>
