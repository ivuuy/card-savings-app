<template>
  <PageShell title="预算设置" active="profile" back>
    <text class="muted divider">本周当前预算 ¥{{ formatMoney(weeklyTask().budgetLimit) }}；本月 ¥{{ formatMoney(monthlyTask().budgetLimit) }}。新设置分别从 {{ nextWeek }}、{{ nextMonth }} 生效。</text>
    <view class="field"><text class="field-label">下周预算（元）</text><input v-model="form.weeklyLimit" type="digit" class="field-input" /></view>
    <view class="field"><text class="field-label">下月预算（元）</text><input v-model="form.monthlyLimit" type="digit" class="field-input" /></view>
    <view class="row"><text>周开始日</text><text>周一</text></view><view class="row"><text>预算预警</text><text>80%</text></view>
    <view class="row"><view><text>收入增加可花额度</text><text class="muted">下周期生效，退款不算收入</text></view><switch :checked="form.incomeAddsBudget" :color="themeTokens['--accent']" @change="form.incomeAddsBudget=$event.detail.value" /></view>
    <view class="row"><text>失败扣分方式</text><picker :range="['允许宝石为负','最低扣到零']" :value="form.penaltyMode === 'floor' ? 1 : 0" @change="form.penaltyMode=Number($event.detail.value)===1?'floor':'debt'"><text class="pill">{{ form.penaltyMode === 'floor' ? '最低扣到零' : '允许宝石为负' }} ▾</text></picker></view>
    <view class="field"><text class="field-label">预算封面</text><image v-if="form.weeklyCover && !imageError" :src="form.weeklyCover" class="cover" mode="aspectFill" @error="imageError=true" /><text v-if="imageError" class="muted">图片无法读取，请重新选择</text><view class="row"><button class="secondary" @tap="selectCover">{{ form.weeklyCover?'更换图片':'选择图片' }}</button><button v-if="form.weeklyCover" class="secondary" @tap="form.weeklyCover='';imageError=false">移除图片</button></view></view>
    <button class="action" @tap="save">保存设置</button>
  </PageShell>
</template>
<script setup>
import { reactive, ref } from 'vue'
import PageShell from '../../components/PageShell.vue'
import { themeTokens } from '../../store/theme'
import { state, saveSettings, weeklyTask, monthlyTask, formatMoney } from '../../store/app'
import { shiftDay } from '../../store/domain.mjs'
import { chooseCover } from '../../utils/cover'
import { goTab } from '../../utils/nav'
const form=reactive({...state.settings}),imageError=ref(false),nextWeek=shiftDay(weeklyTask().end,1),nextMonth=shiftDay(monthlyTask().end,1)
async function selectCover(){try{form.weeklyCover=await chooseCover();imageError.value=false}catch(e){uni.showToast({title:e.message,icon:'none'})}}
function save(){const r=saveSettings(form);uni.showToast({title:r.reason,icon:'none'});if(r.ok)setTimeout(()=>goTab('profile'),500)}
</script>
<style scoped>.cover { width: 100%; height: 170px; border-radius: 12px; }</style>
