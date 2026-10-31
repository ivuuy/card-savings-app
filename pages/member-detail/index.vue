<template>
  <PageShell title="成员详情" active="members" back fallback="/pages/members/index">
    <template v-if="member">
      <MemberCard ref="memberCard" :member="member" :show-details="false" />
      <view class="row"><text>{{ member.name }} · {{ rarityLabel(member.rarity) }}</text><text class="pill">{{ state.wallet.balance }} 宝石</text></view>
      <text class="muted">{{ member.description }}</text>
      <text v-if="member.unlockedAt" class="muted">收藏日期 {{ member.unlockedAt }}</text>
      <text class="muted divider">{{ reason || `需要 ${member.cost} 宝石及 1 次解锁资格` }}</text>
      <text class="muted">当前解锁资格 {{ state.wallet.permits }} 次</text>
      <button v-if="member.status === 'locked'" class="action" :disabled="!!reason" @tap="tryUnlock">解锁成员 · {{ member.cost }} 宝石</button>
      <button v-if="member.status === 'locked'" class="secondary" @tap="setTarget">{{ state.targetMemberId === member.id ? '取消心愿成员' : '设为心愿成员' }}</button>
      <button v-if="member.status === 'cooldown'" class="action" @tap="goPage('/pages/task-detail/index?focus=challenge')">前往恢复挑战</button>
      <button class="secondary" @tap="chooseArtwork">{{ member.artwork ? '更换人物照片' : '设置人物照片' }}</button>
      <text class="muted photo-note">照片用于小卡正面，轻点卡片可以翻回卡背</text>
      <button v-if="member.artwork" class="secondary" @tap="removeArtwork">{{ originalPortrait(member.id) ? '恢复原创人物照片' : '移除人物照片' }}</button>
    </template>
    <view v-else class="empty">成员不存在，请返回收藏页</view>
  </PageShell>
</template>
<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageShell from '../../components/PageShell.vue'
import MemberCard from '../../components/MemberCard.vue'
import { state, rarityLabel, memberUnlockReason, unlockMember, setMemberArtwork, persist } from '../../store/app'
import { choosePortrait } from '../../utils/cover'
import { originalPortrait } from '../../utils/member-portraits'
import { goPage } from '../../utils/nav'
const id = ref(''), memberCard = ref(null)
onLoad(q => id.value = q.id || '')
const member = computed(() => state.members.find(m => m.id === id.value))
const reason = computed(() => memberUnlockReason(id.value))
function setTarget() { state.targetMemberId = state.targetMemberId === id.value ? '' : id.value; persist() }
function tryUnlock() {
  uni.showModal({ title: '解锁成员', content: `消耗 ${member.value.cost} 宝石和 1 次解锁资格，收藏${member.value.name}？`, success: r => {
    if (!r.confirm) return
    const result = unlockMember(id.value)
    if (result.ok) uni.showModal({ title: '收藏成功', content: `${member.value.name}已加入你的小卡收藏。`, showCancel: false })
    else uni.showToast({ title: result.reason, icon: 'none' })
  } })
}
async function chooseArtwork() {
  try {
    const path = await choosePortrait(), result = setMemberArtwork(id.value, path)
    if (!result.ok) throw new Error(result.reason)
    memberCard.value?.showFront()
    uni.showToast({ title: '人物照片已保存', icon: 'none' })
  } catch (e) { uni.showToast({ title: e.message, icon: 'none' }) }
}
function removeArtwork() {
  const result = setMemberArtwork(id.value, '')
  if (!result.ok) uni.showToast({ title: result.reason, icon: 'none' })
}
</script>
<style scoped>
:deep(.member-card) { max-width: 290px; margin: 4px auto 28px; padding: 10px; }
:deep(.member-meta) { padding-bottom: 6px; }
:deep(.art-name) { font-size: 36px; margin-top: 20px; }
:deep(.card-series) { margin-bottom: 30px; }
.photo-note { text-align: center; }
</style>
