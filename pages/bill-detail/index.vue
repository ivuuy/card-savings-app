<template><PageShell title="账单详情" active="record" back fallback="/pages/record/index"><template v-if="bill"><view class="row"><text>¥{{ formatMoney(bill.amount) }}</text><text class="pill">{{ locked?'已结算 · 锁定':'可纠正' }}</text></view><text class="muted">{{ bill.date }} · 演示账单</text><text class="muted divider">交易编号 {{ bill.externalId }}</text><view class="field"><text class="field-label">收支类型</text><picker :disabled="locked" :range="types" range-key="label" :value="types.findIndex(t=>t.key===form.type)" @change="changeType"><view class="field-input">{{ types.find(t=>t.key===form.type)?.label }} ▾</view></picker></view><view class="field"><text class="field-label">分类</text><input v-model="form.category" :disabled="locked" class="field-input" maxlength="30" /></view><view v-if="form.type==='refund'" class="field"><text class="field-label">对应的原支出</text><picker :disabled="locked" :range="originals" range-key="label" @change="form.relatedId=originals[$event.detail.value].id"><view class="field-input">{{ originals.find(t=>t.id===form.relatedId)?.label || '选择原支出' }} ▾</view></picker></view><view class="field"><text class="field-label">备注</text><textarea v-model="form.note" :disabled="locked" class="field-input note" maxlength="200" /></view><view class="row"><text>不计入预算和心愿进度</text><switch :checked="form.excluded" :disabled="locked" @change="form.excluded=$event.detail.value" :color="themeTokens['--accent']" /></view><text v-if="locked" class="muted">该日期已经结算或领取挑战奖励，账单保持锁定。</text><button v-else class="action" @tap="save">保存纠正</button></template><view v-else class="empty">账单不存在，请返回收支列表</view></PageShell></template>
<script setup>
import {computed,reactive,ref} from 'vue'
import {onLoad} from '@dcloudio/uni-app'
import PageShell from '../../components/PageShell.vue'
import { themeTokens } from '../../store/theme'
import {state,formatMoney,correctBill} from '../../store/app'
const id=ref(''),form=reactive({type:'expense',category:'',note:'',excluded:false,relatedId:''})
const bill=computed(()=>state.transactions.find(t=>t.id===id.value)),locked=computed(()=>bill.value&&(!!state.challenges[bill.value.date]||state.settlements.some(c=>bill.value.date>=c.start&&bill.value.date<=c.end)))
onLoad(q=>{id.value=q.id||'';if(bill.value)Object.assign(form,bill.value)})
const types=[{key:'expense',label:'支出'},{key:'income',label:'收入'},{key:'refund',label:'退款'},{key:'transfer',label:'内部转账'}]
const originals=computed(()=>state.transactions.filter(t=>t.type==='expense'&&!t.excluded&&t.id!==id.value&&t.date<=(bill.value?.date||'')).map(t=>({id:t.id,label:`${t.date} ${t.category} ¥${formatMoney(t.amount)}`})))
function changeType(e){const t=types[e.detail.value];form.type=t.key;form.category=t.label}
function save(){const r=correctBill(id.value,form);uni.showToast({title:r.reason,icon:'none'});if(r.ok)setTimeout(()=>uni.navigateBack(),400)}
</script>
<style scoped>.note { height: 120px; }</style>
