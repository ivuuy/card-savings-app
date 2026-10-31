<template>
  <view class="task-card pressable" :class="accent" role="button" tabindex="0" :aria-label="title + '，查看任务详情'" @tap="$emit('tap')" @keydown.enter="$emit('tap')">
    <view class="task-top">
      <view>
        <text class="task-title">{{ title }}</text>
        <text class="task-rule">{{ rule }}</text>
      </view>
      <StatusPill :label="statusLabel" :tone="statusTone" />
    </view>
    <view class="task-amount">
      <text class="spent">¥{{ formatMoney(spent) }}</text>
      <text class="limit"> / ¥{{ formatMoney(limit) }}</text>
    </view>
    <ProgressBar :percent="percent" />
    <view class="task-foot">
      <text>成功 +{{ reward }} 宝石</text>
      <text>失败 {{ penalty }} 宝石</text>
    </view>
  </view>
</template>

<script>
import { formatMoney } from '../store/app'
import ProgressBar from './ProgressBar.vue'
import StatusPill from './StatusPill.vue'

export default {
  components: {
    ProgressBar,
    StatusPill
  },
  props: {
    status: { type: String, default: 'active' },
    title: {
      type: String,
      required: true
    },
    rule: {
      type: String,
      default: ''
    },
    spent: {
      type: Number,
      required: true
    },
    limit: {
      type: Number,
      required: true
    },
    reward: {
      type: Number,
      required: true
    },
    penalty: {
      type: Number,
      required: true
    },
    accent: {
      type: String,
      default: 'blue'
    }
  },
  methods: { formatMoney },
  computed: {
    percent() {
      return Math.round((this.spent / this.limit) * 100)
    },
    statusLabel() {
      return { active: '进行中', over: '已超支', pending: '待同步结算', success: '已成功', failed: '已失败' }[this.status] || '进行中'
    },
    statusTone() {
      return ['over', 'failed'].includes(this.status) ? 'pink' : 'blue'
    }
  }
}
</script>

<style scoped>
.task-card { position: relative; padding: 22px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow); }
.task-card.pink { background: var(--accent-light); color: var(--light-ink); --ink: var(--light-ink); --muted: var(--light-muted); --line: var(--light-line); --accent-dark: var(--light-accent); }
.task-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.task-top > view { min-width: 0; }
.task-title { display: block; font-size: 17px; line-height: 24px; font-weight: 600; color: var(--ink); }
.task-rule { display: block; margin-top: 7px; font-size: 11px; line-height: 18px; color: var(--muted); }
.task-amount { margin: 22px 0 13px; font-variant-numeric: tabular-nums; }
.spent { font-size: 29px; line-height: 36px; font-weight: 500; letter-spacing: -.8px; color: var(--ink); }
.limit { font-size: 13px; color: var(--muted); }
.task-foot { display: flex; gap: 8px; justify-content: space-between; margin-top: 17px; padding-top: 14px; border-top: 1px dashed var(--line); font-size: 11px; line-height: 18px; color: var(--muted); }
</style>
