<template>
  <view class="member-card" :class="[member.status, member.rarity]">
    <view
      class="portrait"
      :class="{ 'is-flipped': flipped }"
      role="button"
      tabindex="0"
      :aria-label="`${member.name}，${flipped ? '翻回卡背' : '翻看人物正面'}`"
      :aria-pressed="flipped"
      @tap="flip"
      @keydown.enter.prevent="flip"
      @keydown.space.prevent="flip"
    >
      <view class="flip-inner">
        <view class="card-face card-back" :aria-hidden="flipped">
          <view class="card-art">
            <text class="card-series">little collection</text>
            <AppIcon :name="member.rarity === 'limited' ? 'sparkles' : member.rarity === 'rare' ? 'heart' : 'flower'" :size="64" />
            <text class="art-name">{{ member.name }}</text>
            <text class="card-caption">把喜欢，慢慢收藏</text>
          </view>
          <text class="flip-hint">轻点翻开</text>
        </view>
        <view class="card-face card-front" :aria-hidden="!flipped">
          <image v-if="artwork && !artError" :src="artwork" class="artwork" mode="aspectFill" :alt="`${member.name}的人物卡面`" @error="artError = true" />
          <view v-else class="portrait-empty">
            <AppIcon name="photo" :size="32" />
            <text class="portrait-empty-title">{{ artError ? '照片暂时无法显示' : '人物照片待添加' }}</text>
            <text class="portrait-empty-caption">{{ artError ? '可在详情中重新设置照片' : '可在详情中设置人物照片' }}</text>
          </view>
          <text class="flip-hint front-hint">轻点翻回</text>
        </view>
      </view>
    </view>
    <view class="member-meta">
      <view class="member-heading"><text class="member-name">{{ member.name }}</text><text class="rarity">{{ rarityLabel(member.rarity) }}</text></view>
      <view class="member-status">
        <text v-if="member.status === 'unlocked'" class="cost">已收藏</text>
        <text v-else-if="member.status === 'cooldown'" class="cost">冷却中 · {{ member.cost }} 宝石</text>
        <text v-else class="cost">{{ state.wallet.balance < 0 ? '解锁已冻结' : '未解锁' }} · {{ member.cost }} 宝石</text>
        <AppIcon :name="member.status === 'unlocked' ? 'heart' : member.status === 'cooldown' ? 'clock' : 'lock'" :size="13" />
      </view>
      <text v-if="state.targetMemberId === member.id" class="wish-label">心愿成员</text>
      <button v-if="showDetails" class="detail-link" :aria-label="`查看${member.name}的成员详情`" @tap.stop="$emit('detail', member)"><text>成员详情</text><AppIcon name="chevron-right" :size="12" /></button>
    </view>
  </view>
</template>
<script>
import { rarityLabel, state } from '../store/app'
import { originalPortrait } from '../utils/member-portraits'
import AppIcon from './AppIcon.vue'
export default {
  components: { AppIcon },
  emits: ['detail', 'flip'],
  data() { return { state, artError: false, flipped: false } },
  watch: {
    artwork() { this.artError = false },
    'member.id'() { this.flipped = false; this.artError = false }
  },
  props: { member: { type: Object, required: true }, showDetails: { type: Boolean, default: true } },
  computed: { artwork() { return this.member.artwork || originalPortrait(this.member.id) } },
  methods: {
    rarityLabel,
    showFront() { this.flipped = true },
    flip(event) {
      if (event && event.repeat) return
      this.flipped = !this.flipped
      this.$emit('flip', this.flipped)
    }
  }
}
</script>
<style scoped>
.member-card { padding: 7px; overflow: hidden; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); box-shadow: 0 5px 14px rgba(47,64,57,.04); white-space: normal; }
.portrait { position: relative; width: 100%; aspect-ratio: 2 / 3; border-radius: 9px; perspective: 1000px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.flip-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .6s cubic-bezier(.2,.7,.25,1); }
.is-flipped .flip-inner { transform: rotateY(180deg); }
.card-face { position: absolute; inset: 0; overflow: hidden; border-radius: 9px; backface-visibility: hidden; -webkit-backface-visibility: hidden; background: var(--card-base); }
.rare .card-face { background: var(--card-rare); --card-ink: var(--card-rare-ink); --card-muted: var(--card-rare-muted); }
.limited .card-face { background: var(--card-limited); --card-ink: var(--card-limited-ink); --card-muted: var(--card-limited-muted); }
.card-front { transform: rotateY(180deg); }
.artwork { display: block; width: 100%; height: 100%; }
.card-art { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--card-ink); background-image: repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255,255,255,.12) 23px, rgba(255,255,255,.12) 24px); }
.card-series { font-size: 10px; line-height: 16px; letter-spacing: 1.2px; color: var(--card-muted); margin-bottom: 14px; }
.art-name { font-size: 24px; line-height: 34px; font-weight: 500; letter-spacing: 5px; padding-left: 5px; margin-top: 9px; color: var(--card-ink); }
.card-caption { margin-top: 5px; font-size: 9px; color: var(--card-muted); letter-spacing: 1px; }
.flip-hint { position: absolute; bottom: 10px; left: 0; right: 0; text-align: center; font-size: 10px; letter-spacing: 1px; color: var(--card-muted); }
.front-hint { left: 50%; right: auto; transform: translateX(-50%); padding: 4px 10px; border-radius: 20px; background: var(--surface); color: var(--surface-accent); white-space: nowrap; }
.portrait-empty { height: 100%; display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: center; padding: 16px; text-align: center; color: var(--card-ink); }
.portrait-empty-title { font-size: 12px; color: var(--card-ink); }
.portrait-empty-caption { font-size: 10px; color: var(--card-muted); }
.member-meta { padding: 12px 5px 0; }
.member-heading, .member-status { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.member-name { font-size: 14px; font-weight: 600; color: var(--ink); }
.rarity { font-size: 10px; color: var(--muted); }
.member-status { margin-top: 7px; }
.cost { font-size: 10px; color: var(--muted); }
.wish-label { display: block; color: var(--accent-dark); font-size: 10px; margin-top: 6px; }
.member-card .detail-link { width: 100%; min-height: 44px; padding: 10px 0 0; justify-content: space-between; color: var(--accent-dark); font-size: 11px; }
@media (prefers-reduced-motion: reduce) { .flip-inner { transition: none; } }
</style>
