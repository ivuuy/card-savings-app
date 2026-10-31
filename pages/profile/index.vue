<template>
  <PageShell title="我的小金库" subtitle="把每一点进步收好" active="profile">
    <view class="profile-card panel">
      <view class="profile-heading"><view class="avatar"><AppIcon name="flower" :size="32" /></view><view class="profile-copy"><text class="profile-name">{{ state.profile.nickname }}</text><text class="muted">喜欢的事，值得慢慢积累</text></view></view>
      <view class="profile-stats"><view><text class="stat-number">{{ collected }}<text class="stat-total"> / {{ state.members.length }}</text></text><text class="muted">小卡收藏</text></view><view><text class="stat-number">{{ state.wallet.balance }}</text><text class="muted">我的宝石</text></view><view><text class="stat-number">{{ state.wallet.permits }}</text><text class="muted">解锁资格</text></view></view>
    </view>
    <button role="button" class="appearance-entry pressable" @tap="goPage('/pages/appearance/index')"><view class="appearance-icon"><AppIcon name="palette" :size="24" /></view><view class="appearance-copy"><text>自定义配色</text><text class="muted">全色系任选，搭出自己的小金库</text></view><AppIcon name="chevron-right" :size="17" /></button>
    <view class="nickname-row"><input v-model="nickname" class="field-input" maxlength="20" placeholder="你的昵称" aria-label="你的昵称" /><button role="button" class="secondary" @tap="saveName">保存昵称</button></view>
    <view class="menu-list"><view v-for="menu in menus" :key="menu.path" class="menu-item pressable" role="button" tabindex="0" @tap="goPage(menu.path)" @keydown.enter="goPage(menu.path)"><view class="menu-icon"><AppIcon :name="menu.icon" :size="21" /></view><view class="menu-copy"><text>{{ menu.title }}</text><text class="muted">{{ menu.desc }}</text></view><AppIcon name="chevron-right" :size="17" /></view></view>
    <view class="row divider"><view><text>系统通知</text><text class="muted">预算预警 · 需系统授权</text></view><switch :checked="state.settings.notifications" :color="themeTokens['--accent']" @change="toggleNotifications" /></view>
    <text class="muted">关闭网页或退出 App 后，本地版不保证后台通知。</text><text v-if="state.storageError" class="muted divider">{{ state.storageError }}</text>
    <view class="reset-actions"><button role="button" class="secondary" @tap="reset">重置演示数据</button><button role="button" class="secondary" @tap="undo">撤销最近一次重置</button></view>
  </PageShell>
</template>
<script setup>
import {computed,ref} from 'vue'
import AppIcon from '../../components/AppIcon.vue'
import PageShell from '../../components/PageShell.vue'
import { themeTokens } from '../../store/theme'
import {state,persist,resetData,recoverPrevious,enableNotifications} from '../../store/app'
import {goPage} from '../../utils/nav'
const nickname=ref(state.profile.nickname),collected=computed(()=>state.members.filter(m=>m.status!=='locked').length)
const menus=[{icon:'wallet',title:'预算设置',desc:'预算、扣分方式与封面',path:'/pages/budget-settings/index'},{icon:'heart',title:'我的心愿',desc:'目标金额与攒钱进度',path:'/pages/savings/index'},{icon:'diamond',title:'宝石记录',desc:'每一次奖励与花费',path:'/pages/gem-history/index'},{icon:'calendar',title:'周期历史',desc:'周/月结果与判定原因',path:'/pages/cycle-history/index'},{icon:'cloud-download',title:'备份与恢复',desc:'导出数据，换设备也保留',path:'/pages/backup/index'},{icon:'book',title:'奖惩规则',desc:'了解结算与收藏条件',path:'/pages/rules/index'}]
function saveName(){if(!nickname.value.trim())return uni.showToast({title:'请填写昵称',icon:'none'});state.profile.nickname=nickname.value.trim();uni.showToast({title:persist()?'昵称已保存':'保存失败',icon:'none'})}
async function toggleNotifications(e){try{const text=await enableNotifications(e.detail.value);uni.showToast({title:text,icon:'none'})}catch(e){uni.showToast({title:'通知暂不可用，页面提醒仍然有效',icon:'none'})}}
function reset(){uni.showModal({title:'重置演示数据',content:'当前数据将保留为可撤销备份，然后恢复初始演示数据。',success:r=>{if(r.confirm){const result=resetData();nickname.value=state.profile.nickname;uni.showToast({title:result.reason,icon:'none'})}}})}
function undo(){uni.showModal({title:'恢复重置前的数据',content:'当前数据将自动备份，再恢复上一次重置前的数据。',success:r=>{if(r.confirm){const result=recoverPrevious();nickname.value=state.profile.nickname;uni.showToast({title:result.reason,icon:'none'})}}})}
</script>
<style scoped>
.profile-card { background: var(--accent-light); color: var(--light-ink); --ink: var(--light-ink); --muted: var(--light-muted); --line: var(--light-line); }
.appearance-entry { width: 100%; display: flex; gap: 12px; text-align: left; margin-top: 16px; padding: 16px !important; border: 1px solid var(--line); border-radius: 16px; background: var(--surface); color: var(--surface-ink); }
.appearance-icon { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 14px; background: var(--accent-soft); flex-shrink: 0; }
.appearance-copy { flex: 1; font-size: 14px; }
.appearance-copy .muted { color: var(--surface-muted); font-size: 11px; margin-top: 3px; }
.profile-heading { display: flex; gap: 14px; align-items: center; }
.avatar { display: flex; width: 57px; height: 57px; border-radius: 20px; background: var(--accent-soft); align-items: center; justify-content: center; flex-shrink: 0; }
.profile-copy { min-width: 0; }
.profile-name { font-size: 19px; font-weight: 500; }
.profile-stats { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); text-align: center; border-top: 1px dashed var(--line); padding-top: 18px; margin-top: 20px; }
.stat-number { display: block; font-size: 24px; font-weight: 500; line-height: 32px; }
.stat-total { font-size: 13px; color: var(--muted); }
.nickname-row { display: flex; align-items: center; gap: 10px; margin: 16px 0 22px; }
.nickname-row .field-input { flex: 1; width: 0; }
.nickname-row .secondary { flex-shrink: 0; font-size: 12px; margin: 0; min-height: 50px; }
.menu-list { padding: 0 17px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); }
.menu-item { display: flex; gap: 12px; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--line); }
.menu-item:last-child { border-bottom: 0; }
.menu-icon { width: 35px; height: 38px; display: flex; align-items: center; justify-content: center; }
.menu-copy { flex: 1; font-size: 14px; }
.menu-copy .muted { font-size: 11px; margin-top: 3px; }
.reset-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
.reset-actions .secondary { width: 100%; font-size: 11px; }
</style>
