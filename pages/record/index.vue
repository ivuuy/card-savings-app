<template>
  <PageShell title="账单同步" subtitle="演示账单 · 收支自动归类" active="record">
    <view class="row"><text>{{ state.sync.provider }}</text><text class="pill">{{ state.sync.status === 'error' ? '同步失败' : '演示模式' }}</text></view>
    <text class="muted">{{ lastSync }} · 完整账单截至 {{ state.sync.completedThrough }}</text>
    <view class="row totals panel"><view><text class="muted">今日净支出</text><text>¥{{ formatMoney(todaySpent()) }}</text></view><view><text class="muted">今日收入</text><text class="income">+¥{{ formatMoney(todayIncome()) }}</text></view></view>
    <button class="action pressable" :disabled="busy" @tap="handleSync">{{ busy ? '同步中…' : '同步演示账单' }}</button>
    <text class="muted">本次新增 {{ state.sync.newCount }} 笔。退款抵扣支出，内部转账不计收支。</text>
    <view v-for="alert in reminders()" :key="alert.id" class="divider muted">{{ alert.text }}</view>
    <view class="field"><input v-model="search" class="field-input" placeholder="搜索分类、备注或金额" @input="visibleCount = 20" /></view>
    <view class="row"><picker mode="date" fields="month" :value="month || state.currentDate.slice(0,7)" @change="month = $event.detail.value; visibleCount = 20"><text class="pill">{{ month || '全部月份' }} ▾</text></picker><button v-if="month" size="mini" @tap="month = ''; visibleCount = 20">清除月份</button><picker :range="filters" range-key="label" @change="filter = filters[$event.detail.value].key; visibleCount = 20"><text class="pill">{{ filters.find(f => f.key === filter).label }} ▾</text></picker></view>
    <text class="muted">筛选结果 {{ filtered.length }} 笔</text><text class="muted">{{ month || '全部月份' }}汇总 · 收入 ¥{{ formatMoney(summary.income) }} · 净支出 ¥{{ formatMoney(summary.spent) }} · 退款 ¥{{ formatMoney(summary.refund) }}</text>
    <view v-for="bill in filtered.slice(0, visibleCount)" :key="bill.id" class="row divider pressable" @tap="goPage('/pages/bill-detail/index?id=' + encodeURIComponent(bill.id))"><view><text>{{ bill.category }}{{ bill.excluded ? ' · 已排除' : '' }}</text><text class="muted">{{ bill.date }} · {{ bill.note }}</text></view><text class="bill-value" :class="{income: bill.type === 'income' || bill.type === 'refund'}">{{ bill.type === 'expense' ? '−' : bill.type === 'transfer' ? '⇄' : '+' }}¥{{ formatMoney(bill.amount) }}</text></view>
    <view v-if="!filtered.length" class="empty">没有符合条件的账单</view>
    <button v-if="visibleCount < filtered.length" class="secondary" @tap="visibleCount += 20">加载更多</button>
  </PageShell>
</template>
<script setup>
import { computed, ref } from 'vue'
import PageShell from '../../components/PageShell.vue'
import { state, syncBills, todaySpent, todayIncome, formatMoney, reminders } from '../../store/app'
import { stats } from '../../store/domain.mjs'
import { goPage } from '../../utils/nav'
const search = ref(''), month = ref(''), filter = ref('all'), visibleCount = ref(20), busy = ref(false)
const filters = [{key:'all',label:'全部收支'},{key:'expense',label:'支出'},{key:'income',label:'收入'},{key:'refund',label:'退款'},{key:'transfer',label:'内部转账'},{key:'excluded',label:'已排除'}]
const lastSync = computed(() => state.sync.lastSync ? new Date(state.sync.lastSync).toLocaleString() : '尚未同步')
const filtered = computed(() => state.transactions.filter(t => (!month.value || t.date.startsWith(month.value)) && (filter.value === 'all' || (filter.value === 'excluded' ? t.excluded : t.type === filter.value)) && `${t.category} ${t.note} ${t.amount}`.toLowerCase().includes(search.value.toLowerCase())).sort((a,b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)))
const summary = computed(() => stats(state, month.value ? month.value + '-01' : '0000-00-00', month.value ? month.value + '-31' : '9999-12-31'))
async function handleSync() { if(busy.value) return; busy.value = true; await new Promise(resolve => setTimeout(resolve, 250)); try { const r=syncBills(); uni.showToast({title:r.reason,icon:'none'}) } finally { busy.value=false } }
</script>
<style scoped>
.totals { padding: 22px 20px; margin: 22px 0; font-size: 24px; font-variant-numeric: tabular-nums; background: var(--accent-light); }
.totals .muted { margin-bottom: 8px; }
.income { color: var(--accent-dark); }
.bill-value { flex-shrink: 0; font-size: 14px; font-variant-numeric: tabular-nums; }
.divider > view { flex: 1; }
</style>
