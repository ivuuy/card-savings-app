<template>
  <view class="pill" :class="tone">
    <text class="pill-text">{{ label }}</text>
  </view>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    tone: {
      type: String,
      default: 'neutral'
    }
  }
}
</script>

<style scoped>
.pill { min-height: 26px; padding: 5px 10px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; align-self: flex-start; }
.pill-text { font-size: 11px; line-height: 16px; font-weight: 500; }
.neutral { color: var(--light-muted); background: var(--accent-light); }
.blue { color: var(--soft-accent); background: var(--accent-soft); }
.pink { color: var(--light-danger); background: var(--accent-light); }
.dark { color: var(--on-accent); background: var(--accent); }
</style>
