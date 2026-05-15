<script>
export default {}
</script>

<style lang="scss">
page {
  background: var(--bg-canvas);
  color: var(--text-primary);
  font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

button::after {
  border: none;
}

.page-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(39, 174, 96, 0.08), transparent 34%),
    radial-gradient(circle at bottom right, rgba(153, 204, 147, 0.12), transparent 26%),
    var(--bg-canvas);
}

.page-content {
  width: 100%;
  margin: 0 auto;
  padding: 32rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 12rpx 22rpx;
  border-radius: var(--radius-pill);
  background: rgba(39, 174, 96, 0.08);
  color: var(--brand-green);
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.card-surface {
  background: var(--surface-base);
  border: 1rpx solid var(--border-soft);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-soft);
}

.section-title {
  font-family: "Zilla Slab", "Times New Roman", serif;
  font-size: 48rpx;
  line-height: 1.1;
  font-weight: 700;
  color: var(--text-strong);
}

.section-subtitle {
  font-size: 26rpx;
  line-height: 1.7;
  color: var(--text-muted);
}

.primary-button,
.dark-button,
.ghost-button,
.outline-button {
  height: 92rpx;
  border-radius: var(--radius-pill);
  padding: 0 34rpx;
  font-size: 28rpx;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-button {
  color: #ffffff;
  background: var(--brand-green);
  box-shadow: var(--shadow-strong);
}

.dark-button {
  color: #ffffff;
  background: var(--brand-black);
}

.ghost-button {
  color: var(--text-strong);
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(76, 58, 52, 0.12);
}

.outline-button {
  color: var(--brand-black);
  background: transparent;
  border: 1.5rpx solid rgba(26, 26, 26, 0.18);
}

.field-label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--text-label);
  letter-spacing: 1rpx;
}

.field-input,
.field-textarea {
  width: 100%;
  background: rgba(248, 246, 244, 0.92);
  border: 1rpx solid var(--border-soft);
  border-radius: var(--radius-xl);
  color: var(--text-primary);
  font-size: 28rpx;
}

.field-input {
  height: 96rpx;
  padding: 0 28rpx;
}

.field-textarea {
  min-height: 220rpx;
  padding: 24rpx 28rpx;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 10rpx 18rpx;
  border-radius: var(--radius-pill);
  font-size: 22rpx;
  font-weight: 700;
}

.status-chip.pending {
  background: rgba(230, 249, 157, 0.6);
  color: var(--earth-900);
}

.status-chip.confirmed {
  background: rgba(39, 174, 96, 0.12);
  color: var(--brand-green);
}

.status-chip.completed {
  background: rgba(153, 204, 147, 0.2);
  color: var(--leaf-700);
}

.status-chip.cancelled {
  background: rgba(148, 116, 94, 0.12);
  color: var(--earth-600);
}

.empty-panel,
.loading-panel {
  padding: 64rpx 36rpx;
  text-align: center;
  border-radius: var(--radius-2xl);
  background: rgba(255, 255, 255, 0.84);
  border: 1rpx solid var(--border-soft);
}

.empty-panel__title,
.loading-panel__title {
  display: block;
  margin-top: 16rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--text-strong);
}

.empty-panel__desc,
.loading-panel__desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: var(--text-muted);
}

@media screen and (min-width: 1024px) {
  page {
    background:
      radial-gradient(circle at top left, rgba(39, 174, 96, 0.08), transparent 28%),
      radial-gradient(circle at bottom right, rgba(153, 204, 147, 0.12), transparent 22%),
      var(--bg-canvas);
  }

  .page-shell {
    min-height: 100vh;
    padding: 24px 0 56px;
  }

  .page-content {
    width: min(1280px, calc(100vw - 48px));
    padding: 0 8px 40px;
  }

  .brand-pill {
    gap: 8px;
    padding: 10px 18px;
    font-size: 13px;
    letter-spacing: 0.08em;
  }

  .card-surface {
    border-width: 1px;
    border-radius: 28px;
    backdrop-filter: blur(8px);
  }

  .section-title {
    font-size: clamp(42px, 4vw, 60px);
    line-height: 1.02;
  }

  .section-subtitle {
    font-size: 18px;
    line-height: 1.75;
  }

  .primary-button,
  .dark-button,
  .ghost-button,
  .outline-button {
    height: 54px;
    padding: 0 28px;
    font-size: 16px;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease;
    cursor: pointer;
  }

  .primary-button:hover,
  .dark-button:hover,
  .ghost-button:hover,
  .outline-button:hover {
    transform: translateY(-1px);
  }

  .field-label {
    margin-bottom: 10px;
    font-size: 14px;
  }

  .field-input,
  .field-textarea {
    border-width: 1px;
    border-radius: 22px;
    font-size: 16px;
  }

  .field-input {
    height: 56px;
    padding: 0 18px;
  }

  .field-textarea {
    min-height: 180px;
    padding: 18px;
  }

  .status-chip {
    padding: 8px 14px;
    font-size: 13px;
  }

  .empty-panel,
  .loading-panel {
    padding: 48px 36px;
    border-width: 1px;
  }

  .empty-panel__title,
  .loading-panel__title {
    margin-top: 12px;
    font-size: 28px;
  }

  .empty-panel__desc,
  .loading-panel__desc {
    margin-top: 10px;
    font-size: 16px;
    line-height: 1.7;
  }
}
</style>
