<template>
  <!-- #ifdef H5 -->
  <view class="app-icon themed-icon" :style="{ width: size + 'px', height: size + 'px', '--icon-url': `url('/static/icons/${name}.svg')` }" aria-hidden="true" />
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <image class="app-icon" :src="iconSource" :style="{ width: size + 'px', height: size + 'px' }" mode="aspectFit" aria-hidden="true" />
  <!-- #endif -->
</template>

<script setup>
import { computed } from 'vue'
import { themeTokens } from '../store/theme'
const props = defineProps({ name: { type: String, required: true }, size: { type: Number, default: 20 } })
// #ifndef H5
const icons = import.meta.glob('../static/icons/*.svg', { eager: true, query: '?raw', import: 'default' })
const iconSource = computed(() => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent((icons[`../static/icons/${props.name}.svg`] || '').replace(/stroke="#[\da-f]+"/gi, `stroke="${themeTokens.value['--accent-dark']}"`)))
// #endif
</script>

<style scoped>
.app-icon { display: inline-block; flex-shrink: 0; vertical-align: middle; }
.themed-icon { background-color: currentColor; -webkit-mask: var(--icon-url) center / contain no-repeat; mask: var(--icon-url) center / contain no-repeat; }
</style>
