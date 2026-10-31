<template><PageShell title="备份与恢复" active="profile" back><text class="muted divider">备份包含账单、预算、宝石流水、小卡和心愿。恢复前会校验，并保留替换前的数据。</text><button class="action" @tap="exportData">导出完整备份</button><button class="secondary" @tap="copyBackup">复制备份文本</button><button class="secondary" @tap="selectFile">选择备份文件</button><view class="field"><text class="field-label">备份文本</text><textarea v-model="text" class="field-input backup-text" :maxlength="-1" placeholder="粘贴备份文本，或选择备份文件" /></view><text v-if="preview" class="muted">{{ preview }}</text><button class="secondary" :disabled="!text.trim()" @tap="check">检查备份</button><button class="action" :disabled="!text.trim()" @tap="restore">恢复备份</button><button class="secondary" @tap="undo">恢复上一次替换前的数据</button></PageShell></template>
<script setup>
import {ref} from 'vue'
import PageShell from '../../components/PageShell.vue'
import {exportBackup,restoreBackup} from '../../store/app'
import {validateBackup} from '../../store/domain.mjs'
const text=ref(''),preview=ref('')
function check(){try{const d=validateBackup(JSON.parse(text.value));preview.value=`${d.profile.nickname} · ${d.transactions.length} 笔账单 · ${d.wallet.balance} 宝石 · ${d.settlements.length} 个周期`;return true}catch(e){preview.value='';uni.showToast({title:e.message||'备份无效',icon:'none'});return false}}
function copyBackup(){text.value=exportBackup();uni.setClipboardData({data:text.value})}
function exportData(){text.value=exportBackup();
  // #ifdef H5
  const blob=new Blob([text.value],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`小卡攒钱记-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return
  // #endif
  // #ifndef H5
  uni.setClipboardData({data:text.value})
  // #endif
}
function selectFile(){
  // #ifdef H5
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{const file=input.files[0];if(!file)return;if(file.size>20000000)return uni.showToast({title:'备份文件不能超过 20 MB',icon:'none'});text.value=await file.text();check()};input.click();return
  // #endif
  // #ifndef H5
  uni.showToast({title:'请在下方粘贴完整备份文本',icon:'none'})
  // #endif
}
function restore(){if(!check())return;uni.showModal({title:'恢复这份备份？',content:preview.value+'。当前数据会先备份，再被替换。',success:r=>{if(r.confirm){const result=restoreBackup(text.value);uni.showToast({title:result.reason,icon:'none'})}}})}
function undo(){const backup=uni.getStorageSync('idol-budget-v2-before-restore');if(!backup)return uni.showToast({title:'没有可恢复的数据',icon:'none'});text.value=typeof backup==='string'?backup:JSON.stringify(backup);restore()}
</script>
<style scoped>.backup-text { height: 240px; font-size: 12px; }</style>
