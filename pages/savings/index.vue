<template><PageShell title="我的心愿" active="profile" back><view class="row"><text>{{ state.savings.title }}</text><text>{{ Math.round(progress.percent) }}%</text></view><ProgressBar :percent="progress.percent" /><view class="row"><text>已攒 ¥{{ formatMoney(progress.saved) }}</text><text>还差 ¥{{ formatMoney(progress.remaining) }}</text></view><text class="muted">起始存款加已保存账单的净收入；演示数据不代表银行余额。</text><view class="field"><text class="field-label">心愿名称</text><input v-model="form.title" class="field-input" maxlength="30" /></view><view class="field"><text class="field-label">目标金额（元）</text><input v-model="form.target" class="field-input" type="digit" /></view><view class="field"><text class="field-label">起始存款（不包含账单中的收入）</text><input v-model="form.startingAmount" class="field-input" type="digit" /></view><view class="field"><text class="field-label">目标日期</text><picker mode="date" :value="form.deadline" :start="state.currentDate" @change="form.deadline=$event.detail.value"><view class="field-input">{{ form.deadline }} ▾</view></picker></view><text v-if="state.savings.deadline<state.currentDate&&progress.remaining>0" class="muted">目标日期已过，可以调整计划，继续积累。</text><button class="action" @tap="save">保存心愿</button></PageShell></template>
<script setup>
import {computed,reactive} from 'vue'
import PageShell from '../../components/PageShell.vue'
import ProgressBar from '../../components/ProgressBar.vue'
import {state,savingsProgress,saveSavings,formatMoney} from '../../store/app'
const form=reactive({...state.savings}),progress=computed(()=>savingsProgress())
function save(){const r=saveSavings(form);uni.showToast({title:r.reason,icon:'none'})}
</script>
