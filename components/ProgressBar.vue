<template>
  <view class="progress-wrap">
    <view class="progress-track">
      <view class="progress-fill" :class="tone" :style="{ width: width }" />
    </view>
    <text v-if="showLabel" class="progress-label">{{ percent }}%</text>
  </view>
</template>

<script>
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    width() {
      return `${Math.min(Math.max(this.percent, 0), 100)}%`
    },
    tone() {
      if (this.percent > 100) return 'danger'
      if (this.percent >= 80) return 'warning'
      return 'calm'
    }
  }
}
</script>

<style scoped>
.progress-wrap { display: flex; align-items: center; gap: 10px; }
.progress-track { flex: 1; height: 6px; overflow: hidden; border-radius: 99px; background: var(--accent-soft); }
.progress-fill { height: 100%; border-radius: 99px; transition: width .2s ease; }
.progress-fill.calm { background: var(--accent); }
.progress-fill.warning { background: var(--accent); }
.progress-fill.danger { background: var(--danger); }
.progress-label { min-width: 38px; text-align: right; font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; }
</style>
