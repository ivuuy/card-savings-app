<template><PageShell title="宝石记录" active="profile" back><view class="row"><text>当前宝石 {{ state.wallet.balance }}</text><text>解锁资格 {{ state.wallet.permits }}</text></view><text v-if="state.wallet.balance<0" class="muted">宝石为负，成员解锁冻结</text><picker :range="filters" range-key="label" @change="filter=filters[$event.detail.value].key"><text class="pill">{{ filters.find(f=>f.key===filter).label }} ▾</text></picker><view v-for="h in records" :key="h.id" class="row divider"><view><text>{{ h.title }}</text><text class="muted">{{ h.date }} · 余额 {{ h.balanceAfter }}</text></view><text>{{ h.delta>0?'+':'' }}{{ h.delta }}</text></view><view v-if="!records.length" class="empty">没有符合条件的宝石记录</view></PageShell></template>
<script setup>
import {computed,ref} from 'vue'
import PageShell from '../../components/PageShell.vue'
import {state} from '../../store/app'
const filter=ref('all'),filters=[{key:'all',label:'全部记录'},{key:'cycle',label:'周期奖惩'},{key:'challenge',label:'低消费挑战'},{key:'member',label:'成员解锁'}],records=computed(()=>state.wallet.history.filter(h=>filter.value==='all'||h.kind===filter.value))
</script>
