<template>
  <PageShell title="自由配色" active="profile" back :appearance="draft">
    <view class="appearance-intro"><text class="intro-title">把小金库，调成喜欢的颜色</text><text class="muted">先在本页预览，保存后应用到所有页面。</text></view>

    <view class="theme-preview panel" aria-label="配色效果预览">
      <view class="preview-heading"><text>我的小金库</text><text class="preview-tag">实时预览</text></view>
      <text class="preview-amount">¥ 1,000.00</text><text class="muted">每一点坚持，都靠近喜欢一点</text>
      <view class="preview-bottom"><view class="preview-progress"><view /></view><button role="button" class="preview-action" @tap="previewFeedback">开始积累</button></view>
    </view>

    <view class="section-label"><text>灵感配色</text><text class="muted">选一组，再慢慢调整</text></view>
    <view class="preset-grid"><button role="button" v-for="preset in THEME_PRESETS" :key="preset.name" class="preset pressable" :class="{ selected: isPreset(preset) }" :aria-label="`${preset.name}配色`" :aria-pressed="isPreset(preset)" @tap="choosePreset(preset)"><view class="preset-colors"><view :style="{ background: preset.accent }" /><view :style="{ background: preset.background }" /><view :style="{ background: preset.surface }" /></view><text>{{ preset.name }}</text></button></view>

    <view class="section-label"><text>自由搭配</text><text class="muted">全色系 · 支持自填色号</text></view>
    <view class="editor panel">
      <view class="color-targets" role="group" aria-label="选择要调整的颜色"><button role="button" v-for="target in targets" :key="target.key" class="color-target pressable" :class="{ selected: activeTarget === target.key }" :aria-label="`调整${target.label}`" :aria-pressed="activeTarget === target.key" @tap="selectTarget(target.key)"><view class="target-swatch" :style="{ background: draft[target.key] }" /><text>{{ target.label }}</text></button></view>
      <view class="current-color"><view class="large-swatch" :style="{ background: draft[activeTarget] }" /><view><text class="color-name">{{ activeLabel }}</text><text class="muted">{{ draft[activeTarget].toUpperCase() }}</text></view></view>

      <view class="channel"><view class="channel-label"><text>色相</text><text>{{ channels.h }}°</text></view><slider class="color-slider hue-slider" role="slider" tabindex="0" aria-label="色相" :aria-valuenow="channels.h" aria-valuemin="0" aria-valuemax="359" :min="0" :max="359" :step="1" :value="channels.h" :block-size="24" :block-color="draft[activeTarget]" active-color="transparent" background-color="transparent" @keydown="adjustChannel('h', $event)" @changing="setChannel('h', $event)" @change="setChannel('h', $event)" /></view>
      <view class="channel"><view class="channel-label"><text>饱和度</text><text>{{ channels.s }}%</text></view><slider class="color-slider" role="slider" tabindex="0" aria-label="饱和度" :aria-valuenow="channels.s" aria-valuemin="0" aria-valuemax="100" :style="{ '--slider-gradient': saturationGradient }" :min="0" :max="100" :step="1" :value="channels.s" :block-size="24" :block-color="draft[activeTarget]" active-color="transparent" background-color="transparent" @keydown="adjustChannel('s', $event)" @changing="setChannel('s', $event)" @change="setChannel('s', $event)" /></view>
      <view class="channel"><view class="channel-label"><text>明度</text><text>{{ channels.l }}%</text></view><slider class="color-slider" role="slider" tabindex="0" aria-label="明度" :aria-valuenow="channels.l" aria-valuemin="0" aria-valuemax="100" :style="{ '--slider-gradient': lightnessGradient }" :min="0" :max="100" :step="1" :value="channels.l" :block-size="24" :block-color="draft[activeTarget]" active-color="transparent" background-color="transparent" @keydown="adjustChannel('l', $event)" @changing="setChannel('l', $event)" @change="setChannel('l', $event)" /></view>

      <view class="hex-heading"><text>色号 HEX</text><text class="muted">例如 #4F796D</text></view>
      <view class="hex-row"><input v-model="hexInput" class="field-input hex-input" aria-label="颜色色号" maxlength="7" :adjust-position="true" placeholder="#4F796D" @input="error = ''" @confirm="applyHex" /><button role="button" class="secondary" @tap="applyHex">应用色号</button></view>
      <text v-if="error" class="input-error" role="alert">{{ error }}</text>
      <text class="muted editor-note">主色用于按钮、进度条和小卡；背景与卡片可分别搭配。文字会自动适配深浅。</text>
    </view>

    <view class="appearance-actions"><button role="button" class="restore-button pressable" @tap="restoreDefault">恢复薄荷灰</button><button role="button" class="action pressable" @tap="save">{{ hasChanges ? '保存配色' : '已保存' }}</button></view>
    <text class="save-note muted">{{ hasChanges ? '当前为预览，保存后会记住你的选择。' : '配色已保存在此设备，下次打开依然保留。' }}</text>
  </PageShell>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import PageShell from '../../components/PageShell.vue'
import { currentTheme, saveTheme } from '../../store/theme'
import { DEFAULT_THEME, THEME_PRESETS, normalizeHex, normalizeTheme, hexToHsl, hslToHex } from '../../utils/theme.mjs'

const draft = reactive({ ...currentTheme.value })
const targets = [{ key: 'accent', label: '主色' }, { key: 'background', label: '背景' }, { key: 'surface', label: '卡片' }]
const activeTarget = ref('accent'), hexInput = ref(draft.accent.toUpperCase()), error = ref('')
const channels = reactive(hexToHsl(draft.accent))
const activeLabel = computed(() => targets.find(t => t.key === activeTarget.value).label)
const hasChanges = computed(() => JSON.stringify(draft) !== JSON.stringify(currentTheme.value) || hexInput.value !== draft[activeTarget.value].toUpperCase())
const saturationGradient = computed(() => `linear-gradient(to right, ${hslToHex({ ...channels, s: 0 })}, ${hslToHex({ ...channels, s: 100 })})`)
const lightnessGradient = computed(() => `linear-gradient(to right, #000000, ${hslToHex({ ...channels, l: 50 })}, #ffffff)`)

function syncEditor() { Object.assign(channels, hexToHsl(draft[activeTarget.value])); hexInput.value = draft[activeTarget.value].toUpperCase(); error.value = '' }
function selectTarget(key) { activeTarget.value = key; syncEditor() }
function choosePreset(preset) { Object.assign(draft, normalizeTheme(preset)); syncEditor() }
function isPreset(preset) { return targets.every(t => draft[t.key] === preset[t.key]) }
function setChannel(key, event) { channels[key] = Number(event.detail.value); draft[activeTarget.value] = hslToHex(channels); hexInput.value = draft[activeTarget.value].toUpperCase(); error.value = '' }
function adjustChannel(key, event) {
  const directions = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }
  if (!(event.key in directions) && event.key !== 'Home' && event.key !== 'End') return
  event.preventDefault()
  const max = key === 'h' ? 359 : 100
  const value = event.key === 'Home' ? 0 : event.key === 'End' ? max : Math.max(0, Math.min(max, channels[key] + directions[event.key]))
  setChannel(key, { detail: { value } })
}
function applyHex() {
  const color = normalizeHex(hexInput.value)
  if (!color) { error.value = '请输入有效色号，如 #4F796D 或 #ABC'; return false }
  draft[activeTarget.value] = color; syncEditor(); return true
}
function restoreDefault() { Object.assign(draft, DEFAULT_THEME); syncEditor() }
function previewFeedback() { uni.showToast({ title: '这是你的配色预览', icon: 'none' }) }
function save() {
  if (!applyHex()) return
  const result = saveTheme(draft)
  if (!result.ok) error.value = result.reason
  uni.showToast({ title: result.reason, icon: 'none' })
}
</script>

<style scoped>
.appearance-intro { padding: 0 0 20px; }
.intro-title { display: block; font-size: 17px; font-weight: 500; margin-bottom: 5px; }
.theme-preview { padding: 22px; }
.preview-heading { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 13px; }
.preview-tag { padding: 4px 9px; border-radius: 8px; color: var(--soft-accent); background: var(--accent-soft); font-size: 10px; }
.preview-amount { display: block; font-size: 30px; letter-spacing: -1px; line-height: 44px; font-weight: 500; margin-top: 16px; font-variant-numeric: tabular-nums; }
.preview-bottom { display: flex; gap: 20px; align-items: center; margin-top: 20px; }
.preview-progress { flex: 1; background: var(--accent-soft); height: 6px; border-radius: 99px; overflow: hidden; }
.preview-progress > view { width: 62%; height: 100%; background: var(--accent); }
.preview-bottom .preview-action { min-height: 40px; padding: 10px 13px; background: var(--accent); color: var(--on-accent); border-radius: 12px; font-size: 12px; }
.section-label { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 28px 0 13px; font-size: 15px; font-weight: 500; }
.section-label .muted { font-size: 11px; font-weight: 400; }
.preset-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px 5px; }
.preset-grid .preset { flex-direction: column; min-height: 66px; padding: 7px 2px; gap: 7px; border: 1px solid transparent; border-radius: 12px; color: var(--muted); font-size: 10px; }
.preset.selected { border-color: var(--accent-dark); color: var(--ink); }
.preset-colors { display: flex; width: 42px; height: 25px; border-radius: 7px; overflow: hidden; border: 1px solid rgba(100,110,105,.25); }
.preset-colors > view:first-child { width: 50%; }
.preset-colors > view { width: 25%; }
.editor { padding: 18px; }
.color-targets { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; padding-bottom: 18px; border-bottom: 1px solid var(--line); }
.color-targets .color-target { flex-direction: column; gap: 8px; min-height: 78px; padding: 10px 5px; border: 1px solid var(--line); border-radius: 12px; color: var(--muted); font-size: 12px; }
.color-target.selected { border-color: var(--accent-dark); color: var(--light-ink); background: var(--accent-light); }
.target-swatch { width: 30px; height: 30px; border-radius: 10px; border: 1px solid rgba(100,110,105,.3); }
.current-color { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
.large-swatch { width: 45px; height: 45px; border-radius: 14px; border: 1px solid rgba(100,110,105,.3); }
.color-name { display: block; font-size: 13px; }
.current-color .muted { font-size: 11px; letter-spacing: 1px; }
.channel { margin-top: 16px; }
.channel-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }
.color-slider { margin: 6px 12px 0; padding: 12px 0; background: var(--slider-gradient) center / 100% 8px no-repeat; }
.hue-slider { --slider-gradient: linear-gradient(to right,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000); }
.color-slider :deep(.uni-slider-thumb) { border: 3px solid var(--surface); box-shadow: 0 0 0 1px rgba(80,90,85,.45); }
.hex-heading { display: flex; align-items: center; justify-content: space-between; margin: 20px 0 9px; font-size: 12px; }
.hex-heading .muted { font-size: 10px; }
.hex-row { display: flex; gap: 10px; align-items: center; }
.hex-input { width: 0; flex: 1; font-size: 14px; letter-spacing: 1px; }
.hex-row .secondary { margin: 0; padding: 12px; font-size: 12px; flex-shrink: 0; }
.editor-note { font-size: 11px; margin-top: 17px; }
.input-error { display: block; color: var(--danger); font-size: 12px; line-height: 1.7; margin-top: 9px; }
.appearance-actions { display: grid; grid-template-columns: 1fr 1.5fr; gap: 12px; align-items: center; margin-top: 22px; }
.appearance-actions .action { margin: 0; min-height: 50px; }
.appearance-actions .restore-button { color: var(--muted); border: 1px solid var(--line); border-radius: 14px; min-height: 50px; font-size: 12px; }
.save-note { text-align: center; font-size: 11px; margin: 12px 0 6px; }
@media (max-width: 360px) { .editor { padding: 14px; } .section-label { flex-wrap: wrap; } .preview-bottom { gap: 12px; } }
</style>
