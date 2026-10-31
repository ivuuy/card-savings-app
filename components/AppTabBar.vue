<template>
  <view class="tab-shell" role="navigation" aria-label="主导航">
    <button v-for="item in tabs" :key="item.key" class="tab-item pressable" :class="{ active: active === item.key }" role="button" :aria-label="item.label" :aria-current="active === item.key ? 'page' : undefined" @tap="goTab(item.key)">
      <view class="tab-icon"><AppIcon :name="item.icon" :size="21" /></view>
      <text class="tab-label">{{ item.label }}</text>
    </button>
  </view>
</template>
<script setup>
import { goTab } from '../utils/nav'
import AppIcon from './AppIcon.vue'
defineProps({ active: { type: String, required: true } })
const tabs = [
  { key: 'home', label: '首页', icon: 'home' },
  { key: 'record', label: '同步', icon: 'arrows-exchange' },
  { key: 'tasks', label: '任务', icon: 'circle-check' },
  { key: 'members', label: '成员', icon: 'cards' },
  { key: 'profile', label: '我的', icon: 'user' }
]
</script>
<style scoped>
.tab-shell { position: fixed; left: 50%; transform: translateX(-50%); bottom: 0; z-index: 50; width: 100%; max-width: var(--page-width); height: calc(78px + env(safe-area-inset-bottom)); padding: 6px 12px calc(6px + env(safe-area-inset-bottom)); display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); background: var(--surface); border-top: 1px solid var(--line); border-radius: 22px 22px 0 0; box-shadow: 0 -4px 22px rgba(47,64,57,.035); }
.tab-shell .tab-item { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-width: 0; margin: 0; padding: 0; color: var(--surface-muted); border-radius: 14px; background: transparent; }
.tab-item.active { color: var(--surface-accent); }
.tab-icon { width: 44px; height: 31px; border-radius: 12px; display: flex; justify-content: center; align-items: center; opacity: .65; }
.active .tab-icon { background: var(--accent-soft); color: var(--soft-accent); opacity: 1; }
.tab-label { font-size: 11px; line-height: 17px; font-weight: 500; }
.active .tab-label { font-weight: 600; }
</style>
