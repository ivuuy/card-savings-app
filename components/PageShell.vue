<template>
  <view class="page shell" :style="appearance ? themeToStyle(appearance) : themeStyle">
    <BackHeader v-if="back" :title="title" :fallback="fallback" />
    <view v-else class="shell-heading">
      <view><text class="shell-title">{{ title }}</text><text v-if="subtitle" class="muted">{{ subtitle }}</text></view>
      <view class="heading-mark"><AppIcon :name="headingIcon" :size="24" /></view>
    </view>
    <view class="shell-main"><slot /></view>
    <AppTabBar :active="active" />
  </view>
</template>
<script setup>
import { computed } from 'vue'
import AppTabBar from './AppTabBar.vue'
import BackHeader from './BackHeader.vue'
import AppIcon from './AppIcon.vue'
import { themeStyle } from '../store/theme'
import { themeToStyle } from '../utils/theme.mjs'
const props = defineProps({ title: String, subtitle: String, active: String, back: Boolean, appearance: Object, fallback: { type: String, default: '/pages/profile/index' } })
const headingIcon = computed(() => ({ record: 'arrows-exchange', tasks: 'circle-check', members: 'cards', profile: 'heart' }[props.active] || 'flower'))
</script>
<style scoped>
.shell-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 32px 24px 24px; }
.shell-title { display: block; font-size: 25px; line-height: 35px; font-weight: 600; letter-spacing: .5px; margin-bottom: 5px; }
.heading-mark { width: 46px; height: 46px; flex-shrink: 0; background: var(--accent-soft); color: var(--soft-accent); border-radius: 16px; display: flex; align-items: center; justify-content: center; transform: rotate(5deg); }
.shell-main { padding: 0 24px 20px; }
@media (max-width: 360px) { .shell-heading { padding-left: 18px; padding-right: 18px; } .shell-main { padding-left: 18px; padding-right: 18px; } }
</style>
