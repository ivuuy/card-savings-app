<template>
  <view class="back-header">
    <button class="back-button pressable" aria-label="返回" @tap="goBack(fallback)"><AppIcon name="chevron-left" :size="22" /></button>
    <text class="back-title">{{ title }}</text>
  </view>
</template>
<script setup>
import { goBack } from '../utils/nav'
import AppIcon from './AppIcon.vue'
defineProps({ title: { type: String, required: true }, fallback: { type: String, default: '/pages/home/index' } })
</script>
<style scoped>
.back-header { min-height: 90px; padding: 20px 24px; display: flex; align-items: center; gap: 14px; }
.back-header .back-button { width: 44px; height: 44px; padding: 0; flex-shrink: 0; border-radius: 14px; background: var(--surface); border: 1px solid var(--surface-line); color: var(--surface-ink); }
.back-title { font-size: 21px; line-height: 30px; font-weight: 600; color: var(--ink); letter-spacing: .5px; }
</style>
