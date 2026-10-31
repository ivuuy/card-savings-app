<template><PageShell title="周期历史" active="tasks" back fallback="/pages/tasks/index"><picker :range="filters" range-key="label" @change="filter=filters[$event.detail.value].key"><text class="pill">{{ filters.find(f=>f.key===filter).label }} ▾</text></picker><view v-for="c in records" :key="c.id" class="divider pressable" @tap="goPage('/pages/task-detail/index?cycle='+encodeURIComponent(c.id))"><view class="row"><text>{{ c.type==='weekly'?'周任务':'月任务' }} · {{ statusLabel(c.status) }}</text><text>{{ c.delta>0?'+':'' }}{{ c.delta }} 宝石</text></view><text class="muted">{{ c.start }} 至 {{ c.end }}</text><text class="muted">净支出 ¥{{ formatMoney(c.spentAmount) }} / 额度 ¥{{ formatMoney(c.effectiveLimit) }}</text><text class="muted">{{ c.reason }} · 结算后宝石 {{ c.balanceAfter }}</text><text v-if="c.affectedMember" class="muted">{{ c.affectedMember }}{{ c.status==='success'?'恢复收藏':'进入冷却' }}</text></view><view v-if="!records.length" class="empty">还没有已结算的周期</view><view v-for="c in pending" :key="c.id" class="divider"><text>{{ c.type==='weekly'?'周任务':'月任务' }} · 待同步结算</text><text class="muted">{{ c.start }} 至 {{ c.end }}</text><button class="secondary" @tap="goTab('record')">更新账单</button></view></PageShell></template>
<script setup>
import {computed,ref} from 'vue'
import PageShell from '../../components/PageShell.vue'
import {state,formatMoney,statusLabel} from '../../store/app'
import {goPage,goTab} from '../../utils/nav'
const filter=ref('all'),filters=[{key:'all',label:'全部周期'},{key:'weekly',label:'周任务'},{key:'monthly',label:'月任务'}]
const records=computed(()=>state.settlements.filter(c=>filter.value==='all'||c.type===filter.value).slice().sort((a,b)=>b.end.localeCompare(a.end)))
const pending=computed(()=>Object.values(state.cycles).filter(c=>c.status==='active'&&c.end>=state.startedAt&&c.end<state.currentDate&&(filter.value==='all'||c.type===filter.value)))
</script>
