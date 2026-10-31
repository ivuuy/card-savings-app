<template>
  <PageShell title="预算任务" subtitle="每一次坚持，都会留下记录" active="tasks">
    <TaskCard v-for="t in tasks" :key="t.id" :title="t.title" :rule="t.start + ' 至 ' + t.end" :spent="t.spentAmount" :limit="t.effectiveLimit" :reward="t.rewardGem" :penalty="t.failurePenalty" :status="t.status" :accent="t.type === 'weekly' ? 'blue' : 'pink'" @tap="goPage('/pages/task-detail/index?type=' + t.type)" />
    <view class="challenge-card panel pressable" @tap="goPage('/pages/task-detail/index?focus=challenge')"><view class="row"><text>低消费日挑战</text><text class="pill">{{ challenge.completed ? '已领取' : challenge.canClaim ? '可领取' : '待达标' }}</text></view><text class="muted">{{ challenge.day }} · {{ challenge.reason }} · 成功 +5 宝石</text></view>
    <view class="row"><text>解锁资格 {{ state.wallet.permits }} 次</text><text class="muted">每次周/月成功 +1 次</text></view>
    <view class="row"><text>最近结算</text><text class="pill pressable" @tap="goPage('/pages/cycle-history/index')">全部记录 ›</text></view>
    <view v-for="item in state.settlements.slice(0,4)" :key="item.id" class="divider pressable" @tap="goPage('/pages/task-detail/index?cycle=' + encodeURIComponent(item.id))"><view class="row"><text>{{ item.type === 'weekly' ? '周任务' : '月任务' }} · {{ statusLabel(item.status) }}</text><text>{{ item.delta > 0 ? '+' : '' }}{{ item.delta }} 宝石</text></view><text class="muted">{{ item.start }} 至 {{ item.end }} · {{ item.reason }}</text></view>
    <view v-if="!state.settlements.length" class="empty">周期结束、账单完整后自动结算</view>
  </PageShell>
</template>
<script setup>
import { computed } from 'vue'
import PageShell from '../../components/PageShell.vue'
import TaskCard from '../../components/TaskCard.vue'
import { state, weeklyTask, monthlyTask, getChallenge, statusLabel } from '../../store/app'
import { goPage } from '../../utils/nav'
const tasks = computed(() => [weeklyTask(), monthlyTask()]), challenge = computed(() => getChallenge())
</script>
<style scoped>
:deep(.task-card) { margin-bottom: 16px; }
.challenge-card { margin: 24px 0; border-style: dashed; box-shadow: none; }
.challenge-card .row { margin: 0 0 10px; }
</style>
