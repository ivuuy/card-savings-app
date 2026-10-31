<template>
  <view class="page home-page" :style="themeStyle">
    <view class="hero">
      <view><text class="brand-note">MY LITTLE SAVINGS</text><text class="title">小卡攒钱记</text><text class="subtitle">今天也在守住自己的小金库</text></view>
      <view class="hero-actions"><button class="gem-pill pressable" :class="{ negative: state.wallet.balance < 0 }" role="button" aria-label="查看宝石记录" @tap="goPage('/pages/gem-history/index')"><AppIcon name="diamond" :size="17" /><text>{{ state.wallet.balance }}</text></button><button role="button" class="theme-entry pressable" aria-label="自定义配色" @tap="goPage('/pages/appearance/index')"><AppIcon name="palette" :size="15" /><text>配色</text></button></view>
    </view>

    <view class="budget-card" :class="{ hasCover: state.settings.weeklyCover && !coverError }">
      <image v-if="state.settings.weeklyCover && !coverError" class="budget-cover" :src="state.settings.weeklyCover" mode="aspectFill" @error="coverError = true" />
      <view v-if="state.settings.weeklyCover && !coverError" class="budget-mask" />
      <view class="budget-content">
        <view class="budget-top"><view class="budget-label"><AppIcon name="wallet" :size="18" /><text>本周的小金库</text></view><button role="button" class="cover-btn pressable" @tap="chooseWeeklyCover"><AppIcon name="photo" :size="14" /><text>{{ state.settings.weeklyCover ? '换封面' : '添张封面' }}</text></button></view>
        <view class="balance-area pressable" role="button" tabindex="0" aria-label="查看预算任务" @tap="goTab('tasks')" @keydown.enter="goTab('tasks')"><text class="balance-label">本周还可以花</text><view class="big-money"><text class="currency">¥</text><text>{{ formatMoney(weeklyRemaining) }}</text></view></view>
        <ProgressBar :percent="weeklyPercent" />
        <view class="stats-row">
          <view><text class="stat-label">本周预算</text><text class="stat-value">¥{{ formatMoney(weekTask.budgetLimit) }}</text></view>
          <view><text class="stat-label">本周已花</text><text class="stat-value">¥{{ formatMoney(weeklySpent) }}</text></view>
          <view><text class="stat-label">本周增加</text><text class="stat-value">+¥{{ formatMoney(weeklyIncome) }}</text></view>
        </view>
      </view>
    </view>

    <view class="overview-grid">
      <view class="overview-card"><view class="overview-heading"><AppIcon name="calendar" :size="17" /><text>本月预算</text></view><text class="overview-money">¥{{ formatMoney(monthlySpent) }}</text><text class="mini-note">总额度 ¥{{ formatMoney(monthTask.effectiveLimit) }}</text><view class="overview-foot"><StatusPill :label="statusLabel(monthTask.status)" :tone="monthTask.over ? 'pink' : 'blue'" /><text class="mini-note">守住每一周</text></view></view>
      <view class="overview-card wish-card pressable" role="button" tabindex="0" aria-label="查看心愿进度" @tap="goPage('/pages/savings/index')" @keydown.enter="goPage('/pages/savings/index')"><view class="overview-heading"><AppIcon name="heart" :size="17" /><text>{{ state.savings.title }}</text></view><text class="overview-money">¥{{ formatMoney(savings.saved) }}</text><text class="mini-note">目标 ¥{{ formatMoney(state.savings.target) }}</text><view class="overview-foot"><text class="wish-link">心愿进度</text><AppIcon name="chevron-right" :size="15" /></view></view>
    </view>

    <view class="notices"><view v-for="alert in alerts" :key="alert.id" class="notice" :class="alert.tone"><AppIcon name="bell" :size="15" /><text>{{ alert.text }}</text></view><view v-if="!alerts.length" class="notice calm"><AppIcon name="circle-check" :size="15" /><text>当前节奏稳定，继续慢慢积累</text></view></view>

    <view class="quick-grid"><button role="button" class="primary-btn pressable" @tap="goTab('record')"><AppIcon name="arrows-exchange" :size="19" />同步账单</button><button role="button" class="ghost-btn pressable" @tap="goPage('/pages/task-detail/index?focus=challenge')"><AppIcon name="circle-check" :size="19" />低消费挑战</button></view>

    <view class="section-head"><view><text class="section-title">今日小卡</text><text class="section-caption">每一点坚持，都靠近喜欢一点</text></view><button role="button" class="section-link pressable" @tap="goTab('members')">查看全部<AppIcon name="chevron-right" :size="14" /></button></view>
    <scroll-view scroll-x class="member-strip"><view class="member-row"><view v-for="member in previewMembers" :key="member.id" class="preview-wrap"><MemberCard :member="member" @detail="goPage(`/pages/member-detail/index?id=${member.id}`)" /></view></view></scroll-view>
    <AppTabBar active="home" />
  </view>
</template>

<script>
import AppIcon from '../../components/AppIcon.vue'
import AppTabBar from '../../components/AppTabBar.vue'
import MemberCard from '../../components/MemberCard.vue'
import ProgressBar from '../../components/ProgressBar.vue'
import StatusPill from '../../components/StatusPill.vue'
import { goPage, goTab } from '../../utils/nav'
import { formatMoney, monthlySpent, setWeeklyCover, state, weeklyIncome, weeklyPercent, weeklyRemaining, weeklySpent, weeklyTask, monthlyTask, statusLabel, savingsProgress, reminders } from '../../store/app'
import { chooseCover } from '../../utils/cover'
import { themeStyle } from '../../store/theme'

export default {
  components: {
    AppIcon,
    AppTabBar,
    MemberCard,
    ProgressBar,
    StatusPill
  },
  data() {
    return {
      state, coverError: false
    }
  },
  computed: {
    themeStyle() { return themeStyle.value },
    weekTask() { return weeklyTask() },
    monthTask() { return monthlyTask() },
    savings() { return savingsProgress() },
    alerts() { return reminders() },
    weeklySpent() {
      return weeklySpent()
    },
    monthlySpent() {
      return monthlySpent()
    },
    weeklyPercent() {
      return weeklyPercent()
    },
    weeklyRemaining() {
      return weeklyRemaining()
    },
    weeklyIncome() {
      return weeklyIncome()
    },
    previewMembers() {
      return state.members.slice(0, 3)
    }
  },
  methods: {
    goPage,
    goTab,
    formatMoney,
    statusLabel,
    async chooseWeeklyCover() {
      try { const path = await chooseCover(); this.coverError = false; const saved = setWeeklyCover(path); uni.showToast({ title: saved ? '预算封面已保存' : '保存失败，请先导出备份', icon: 'none' }) } catch (e) { uni.showToast({ title: e.message, icon: 'none' }) }
    }
  }
}
</script>

<style scoped>
.home-page { padding: 24px 28px 0; }
.hero { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.brand-note { display: block; color: var(--accent-dark); font-size: 9px; letter-spacing: 2px; line-height: 16px; margin-bottom: 6px; }
.title { display: block; font-size: 27px; line-height: 38px; letter-spacing: 1px; font-weight: 600; }
.subtitle { display: block; margin-top: 4px; font-size: 12px; color: var(--muted); }
.hero .gem-pill { padding: 0 11px; min-height: 38px; }
.hero-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.hero-actions .theme-entry { min-height: 36px; padding: 5px 9px; gap: 5px; color: var(--muted); font-size: 11px; }
.budget-card { position: relative; overflow: hidden; border-radius: 20px; padding: 14px 18px 16px; background: var(--accent-soft); border: 1px solid var(--soft-line); color: var(--soft-ink); --accent-dark: var(--soft-accent); --muted: var(--soft-muted); }
.budget-cover, .budget-mask { position: absolute; inset: 0; width: 100%; height: 100%; }
.budget-mask { background: var(--cover-mask); }
.budget-content { position: relative; z-index: 1; }
.budget-top, .budget-label { display: flex; align-items: center; gap: 7px; }
.budget-top { justify-content: space-between; }
.budget-label { font-size: 13px; color: var(--accent-dark); font-weight: 500; }
.budget-top .cover-btn { min-height: 32px; padding: 6px 8px; gap: 5px; border-radius: 10px; font-size: 10px; background: var(--surface); color: var(--surface-accent); }
.balance-area { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; margin: 12px 0 10px; }
.balance-label { flex-shrink: 0; font-size: 12px; color: var(--accent-dark); }
.big-money { display: flex; align-items: baseline; gap: 4px; min-width: 0; max-width: 100%; font-size: clamp(28px, 8vw, 34px); line-height: 1.2; font-weight: 500; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
.currency { flex-shrink: 0; font-size: 19px; letter-spacing: 0; }
.stats-row { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--soft-line); }
.stat-value, .stat-label { display: block; }
.stat-value { font-size: 13px; font-weight: 500; margin-top: 3px; font-variant-numeric: tabular-nums; }
.stat-label { font-size: 10px; color: var(--accent-dark); }
.overview-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin-top: 16px; }
.overview-card { padding: 18px 16px 15px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); }
.overview-heading { display: flex; gap: 7px; align-items: center; font-size: 12px; color: var(--muted); }
.overview-money { display: block; margin-top: 12px; font-size: 22px; line-height: 30px; font-weight: 500; letter-spacing: -.5px; font-variant-numeric: tabular-nums; }
.mini-note { font-size: 10px; color: var(--muted); }
.overview-foot { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 7px; align-items: center; justify-content: space-between; min-height: 27px; }
.wish-card { background: var(--accent-light); color: var(--light-ink); --ink: var(--light-ink); --muted: var(--light-muted); --accent-dark: var(--light-accent); }
.wish-link { font-size: 11px; color: var(--accent-dark); }
.notices { margin: 15px 0 18px; }
.notice { display: flex; gap: 7px; align-items: flex-start; font-size: 11px; line-height: 19px; color: var(--muted); padding: 5px 2px; }
.notice .app-icon { margin-top: 2px; }
.notice.danger { color: var(--danger); }
.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.quick-grid button { width: 100%; height: 48px; border-radius: 14px; font-size: 13px; font-weight: 500; gap: 8px; }
.primary-btn { background: var(--accent); color: var(--on-accent); }
.ghost-btn { background: var(--surface); border: 1px solid var(--surface-line); color: var(--surface-accent); }
.section-head { margin-top: 30px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.section-title { display: block; font-size: 19px; font-weight: 600; letter-spacing: .5px; }
.section-caption { display: block; margin-top: 4px; font-size: 11px; color: var(--muted); }
.section-head .section-link { padding: 0; font-size: 11px; flex-shrink: 0; }
.member-strip { width: 100%; margin-top: 16px; white-space: nowrap; }
.member-row { display: flex; gap: 12px; padding-bottom: 10px; }
.preview-wrap { display: inline-block; width: 156px; flex: 0 0 156px; }
@media (max-width: 360px) { .home-page { padding-left: 18px; padding-right: 18px; } .budget-card { padding-left: 18px; padding-right: 18px; } .overview-card { padding: 15px 12px; } .overview-money { font-size: 19px; } .title { font-size: 24px; } }
</style>
