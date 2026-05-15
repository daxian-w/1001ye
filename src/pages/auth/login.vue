<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '../../store/auth'
import { consumeStoredRedirect, setStoredRedirect } from '../../utils/session'
import { goToPath } from '../../utils/navigation'

const auth = useAuthStore()
const wechatLoading = ref(false)
const guestLoading = ref(false)
const devLoading = ref(false)
const guestName = ref('植物朋友')
const canUseDevLogin = import.meta.env.DEV

function redirectAfterLogin() {
  const target = consumeStoredRedirect() || '/pages/index/index'
  goToPath(target, { replace: true })
}

async function handleWechatLogin() {
  wechatLoading.value = true
  auth.fetchQrCodeUrl()
    .then((qrCodeUrl) => {
      window.location.href = qrCodeUrl
    })
    .catch((err) => {
      uni.showToast({ title: err.message || '加载失败', icon: 'none' })
    })
    .finally(() => {
      wechatLoading.value = false
    })
}

async function handleGuestLogin() {
  guestLoading.value = true
  try {
    await auth.loginGuest(guestName.value || '植物朋友')
    uni.showToast({ title: '游客登录成功', icon: 'success' })
    redirectAfterLogin()
  } catch (error) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    guestLoading.value = false
  }
}

async function handleDevLogin() {
  devLoading.value = true
  try {
    await auth.loginDev(guestName.value || '开发测试用户')
    uni.showToast({ title: '开发登录成功', icon: 'success' })
    redirectAfterLogin()
  } catch (error) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    devLoading.value = false
  }
}

onLoad((options) => {
  if (options?.redirect) {
    setStoredRedirect(decodeURIComponent(String(options.redirect)))
  }
})

onShow(() => {
  if (auth.isLoggedIn) {
    redirectAfterLogin()
  }
})
</script>

<template>
  <view class="page-shell login-page">
    <view class="login-backdrop"></view>
    <view class="login-card card-surface">
      <view class="login-card__brand">
        <image class="login-card__logo" src="https://brave.wzznft.com/i/2026/03/22/t2z9wu.png" mode="aspectFit" />
        <text class="brand-pill">WELCOME TO 1001叶</text>
      </view>

      <text class="section-title login-card__title">登录后开始发布、交换和记录植物的流动。</text>
      <text class="section-subtitle login-card__subtitle">
        微信登录是正式入口，游客模式和开发登录用于本地体验与联调。
      </text>

      <view class="login-card__actions">
        <button
          class="primary-button login-card__button"
          :loading="wechatLoading"
          @click="handleWechatLogin"
        >
          微信登录
        </button>

        <view class="field-block">
          <text class="field-label">游客昵称</text>
          <input v-model="guestName" class="field-input" placeholder="例如：植物朋友" />
        </view>

        <button class="dark-button login-card__button" :loading="guestLoading" @click="handleGuestLogin">
          游客体验
        </button>

        <button
          v-if="canUseDevLogin"
          class="outline-button login-card__button"
          :loading="devLoading"
          @click="handleDevLogin"
        >
          开发登录
        </button>
      </view>

      <view class="login-card__footer">
        <text class="login-card__hint">登录即表示你愿意以礼貌、真实、友善的方式参与社区交换。</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(39, 174, 96, 0.08), transparent),
    linear-gradient(320deg, rgba(230, 249, 157, 0.24), transparent 42%);
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 40rpx 34rpx;
}

.login-card__brand {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.login-card__logo {
  width: 92rpx;
  height: 92rpx;
  flex-shrink: 0;
}

.login-card__title,
.login-card__subtitle,
.login-card__hint {
  display: block;
}

.login-card__title {
  margin-top: 24rpx;
}

.login-card__subtitle {
  margin-top: 16rpx;
}

.login-card__actions {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 28rpx;
}

.login-card__button {
  width: 100%;
}

.field-block {
  margin-top: 4rpx;
}

.login-card__footer {
  margin-top: 26rpx;
  padding-top: 22rpx;
  border-top: 1rpx solid var(--border-soft);
}

.login-card__hint {
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--text-muted);
}

@media screen and (min-width: 1024px) {
  .login-page {
    padding: 32px;
  }

  .login-backdrop {
    background:
      radial-gradient(circle at 12% 18%, rgba(39, 174, 96, 0.14), transparent 24%),
      radial-gradient(circle at 88% 22%, rgba(230, 249, 157, 0.34), transparent 26%),
      linear-gradient(180deg, rgba(252, 251, 249, 0.94), rgba(248, 246, 244, 0.98));
  }

  .login-card {
    width: min(1080px, 100%);
    padding: 44px;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(360px, 420px);
    gap: 36px;
    align-items: start;
  }

  .login-card__brand,
  .login-card__title,
  .login-card__subtitle,
  .login-card__footer {
    grid-column: 1;
  }

  .login-card__actions {
    grid-column: 2;
    grid-row: 1 / span 4;
    gap: 14px;
    padding: 24px;
    border-radius: 24px;
    background: rgba(248, 246, 244, 0.82);
    border: 1px solid rgba(92, 69, 61, 0.08);
  }

  .login-card__logo {
    width: 72px;
    height: 72px;
  }

  .login-card__title {
    margin-top: 18px;
    max-width: 560px;
  }

  .login-card__subtitle {
    margin-top: 14px;
    max-width: 520px;
  }

  .field-block {
    margin-top: 2px;
  }

  .login-card__footer {
    margin-top: 18px;
    padding-top: 18px;
    border-top-width: 1px;
  }

  .login-card__hint {
    max-width: 520px;
    font-size: 15px;
  }
}

@media screen and (max-width: 1140px) and (min-width: 1024px) {
  .login-card {
    grid-template-columns: 1fr;
  }

  .login-card__actions,
  .login-card__brand,
  .login-card__title,
  .login-card__subtitle,
  .login-card__footer {
    grid-column: auto;
    grid-row: auto;
  }
}
</style>
