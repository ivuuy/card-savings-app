<template>
  <view class="page">
    <view class="top">
      <view>
        <text class="title">成员收藏</text>
        <text class="subtitle">用守住预算的日子，慢慢解锁她们</text>
      </view>
      <view class="gem-pill" :class="{ negative: state.wallet.balance < 0 }">
        <AppIcon name="diamond" :size="17" /><text>{{ state.wallet.balance }}</text>
      </view>
    </view>

    <view v-if="state.wallet.balance < 0" class="freeze-note">解锁已冻结</view>

    <scroll-view scroll-x class="filter-scroll">
      <view class="filter-row">
        <view
          v-for="item in filters"
          :key="item.key"
          class="filter-pill pressable"
          role="button"
          tabindex="0"
          :aria-pressed="activeFilter === item.key"
          @keydown.enter="activeFilter = item.key"
          :class="{ active: activeFilter === item.key }"
          @tap="activeFilter = item.key"
        >
          <text>{{ item.label }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="collection-note"><AppIcon name="heart" :size="16" /><text>已经收藏 {{ state.members.filter(m => m.status !== 'locked').length }} / {{ state.members.length }} 张小卡</text><text class="collection-count">{{ visibleMembers.length }} 张</text></view>

    <view class="member-grid">
      <MemberCard v-for="member in visibleMembers" :key="member.id" :member="member" @detail="handleMember(member)" />
    </view>

    <view v-if="!visibleMembers.length" class="empty">这里还没有小卡，慢慢收集喜欢吧</view>

    <view class="unlock-note">
      <text>轻点卡片翻看正反面 · 解锁资格 {{ state.wallet.permits }} 次</text>
    </view>

    <AppTabBar active="members" />
  </view>
</template>

<script>
import AppIcon from '../../components/AppIcon.vue'
import AppTabBar from '../../components/AppTabBar.vue'
import MemberCard from '../../components/MemberCard.vue'
import { state } from '../../store/app'
import { goPage } from '../../utils/nav'

export default {
  components: {
    AppIcon,
    AppTabBar,
    MemberCard
  },
  data() {
    return {
      state,
      activeFilter: 'all',
      filters: [
        {
          key: 'all',
          label: '全部'
        },
        {
          key: 'unlocked',
          label: '已解锁'
        },
        {
          key: 'cooldown',
          label: '冷却中'
        },
        {
          key: 'locked',
          label: '未解锁'
        }
      ]
    }
  },
  computed: {
    visibleMembers() {
      if (this.activeFilter === 'all') return state.members
      return state.members.filter((member) => member.status === this.activeFilter)
    }
  },
  methods: {
    goPage,
    handleMember(member) {
      goPage(`/pages/member-detail/index?id=${member.id}`)
    }
  }
}
</script>

<style scoped>
.page { padding: 30px 24px 0; }
.top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.title { display: block; font-size: 25px; line-height: 36px; font-weight: 600; letter-spacing: .5px; }
.subtitle { display: block; margin-top: 6px; font-size: 12px; line-height: 20px; color: var(--muted); }
.freeze-note { margin-top: 20px; padding: 10px 14px; border-radius: 12px; color: var(--danger); background: var(--accent-soft); font-size: 12px; }
.filter-scroll { margin-top: 22px; white-space: nowrap; }
.filter-row { display: flex; gap: 8px; }
.filter-pill { display: inline-flex; min-width: 65px; height: 40px; padding: 0 14px; border-radius: 12px; align-items: center; justify-content: center; background: var(--surface); border: 1px solid var(--line); color: var(--surface-muted); font-size: 12px; }
.filter-pill.active { color: var(--soft-accent); background: var(--accent-soft); border-color: var(--accent-dark); font-weight: 600; }
.collection-note { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 11px; margin: 25px 0 15px; }
.collection-count { margin-left: auto; }
.member-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px 14px; }
.unlock-note { margin-top: 24px; text-align: center; color: var(--muted); font-size: 11px; line-height: 20px; }
@media (max-width: 360px) { .page { padding-left: 18px; padding-right: 18px; } .filter-row { gap: 6px; } .filter-pill { padding: 0 11px; min-width: 62px; } .member-grid { gap: 14px 10px; } }
</style>
