<template>
  <PageShell title="任务详情" active="tasks" back fallback="/pages/tasks/index">
    <template v-if="currentTask">
      <view class="row"><text>{{ currentTask.type === 'weekly' ? '周任务' : '月任务' }}</text><text class="pill">{{ statusLabel(currentTask.status) }}</text></view>
      <text class="muted">{{ currentTask.start }} 至 {{ currentTask.end }}</text>
      <view class="row"><text>净支出 ¥{{ formatMoney(currentTask.spentAmount) }}</text><text>额度 ¥{{ formatMoney(currentTask.effectiveLimit) }}</text></view>
      <ProgressBar :percent="currentTask.percent" />
      <text v-if="currentTask.weekFailed" class="muted">本月有周区间超支，月任务不达标。</text>
      <text class="muted divider">成功 +{{ currentTask.rewardGem }} 宝石及 1 次解锁资格；失败扣 20 宝石。{{ currentTask.penaltyMode === 'floor' ? '扣分最低到零，已有欠额不再增加。' : '允许负数。' }}周/月分别结算，失败随机冷却一张已收藏卡片。</text>
      <text v-if="currentTask.status === 'pending'" class="muted">账单完整截至 {{ state.sync.completedThrough }}，同步后补结算。</text>
      <view id="challenge" class="divider"><view class="row"><text>低消费日挑战</text><picker mode="date" :value="challengeDay" :start="state.startedAt" :end="yesterday" @change="challengeDay = $event.detail.value"><text class="pill">{{ challengeDay }} ▾</text></picker></view><text class="muted">净支出 ¥{{ formatMoney(challenge.spent) }} · 须低于 ¥{{ formatMoney(challenge.limit) }}</text><text class="muted">{{ challenge.reason }}</text><button class="action" :disabled="!challenge.canClaim" @tap="claim">{{ challenge.completed ? '已领取' : '领取 +5 宝石' }}</button></view>
      <view class="row"><text>本周期收支</text><text class="muted">{{ bills.length }} 笔</text></view>
      <view v-for="bill in bills" :key="bill.id" class="row divider pressable" @tap="goPage('/pages/bill-detail/index?id=' + encodeURIComponent(bill.id))"><view><text>{{ bill.category }}{{ bill.excluded ? ' · 已排除' : '' }}</text><text class="muted">{{ bill.date }} · {{ bill.note }}</text></view><text>¥{{ formatMoney(bill.amount) }}</text></view>
      <view v-if="!bills.length" class="empty">本周期还没有账单</view>
    </template><view v-else class="empty">任务不存在，请返回任务页</view>
  </PageShell>
</template>
<script setup>
import { computed, ref } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import PageShell from '../../components/PageShell.vue'
import ProgressBar from '../../components/ProgressBar.vue'
import { state, weeklyTask, monthlyTask, getChallenge, completeLowSpendChallenge, statusLabel, formatMoney } from '../../store/app'
import { shiftDay, task } from '../../store/domain.mjs'
import { goPage } from '../../utils/nav'
const type=ref('weekly'), cycle=ref(''), focus=ref(false), challengeDay=ref(shiftDay(state.currentDate,-1))
const yesterday=computed(()=>shiftDay(state.currentDate,-1))
onLoad(q=>{type.value=q.type==='monthly'?'monthly':'weekly';cycle.value=q.cycle||'';focus.value=q.focus==='challenge'})
onReady(()=>{if(focus.value)uni.pageScrollTo({selector:'#challenge',duration:200})})
const currentTask=computed(()=>{if(cycle.value){const c=state.cycles[cycle.value];return c ? state.settlements.find(s=>s.id===cycle.value) || task(state,c.type,c.start) : null}return type.value==='monthly'?monthlyTask():weeklyTask()})
const challenge=computed(()=>getChallenge(challengeDay.value))
const bills=computed(()=>currentTask.value?state.transactions.filter(t=>t.date>=currentTask.value.start&&t.date<=currentTask.value.end).sort((a,b)=>b.date.localeCompare(a.date)):[])
function claim(){const r=completeLowSpendChallenge(challengeDay.value);uni.showToast({title:r.reason,icon:'none'})}
</script>
