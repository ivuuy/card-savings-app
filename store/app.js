import { reactive, watch } from 'vue'
import * as domain from './domain.mjs'
export { rarityMap } from './domain.mjs'
const STORAGE_KEY = 'idol-budget-v2'
let initial = domain.createState()
let originalStored
try { originalStored = uni.getStorageSync(STORAGE_KEY); if (originalStored) initial = domain.validateBackup(typeof originalStored === 'string' ? JSON.parse(originalStored) : originalStored) } catch (e) { initial.storageError = '本地数据读取失败，原备份未覆盖，请先导出或恢复备份' }
export const state = reactive(initial)
let blockedWrite = !!initial.storageError
export function persist() {
  if (blockedWrite) return false
  try { const data = JSON.parse(JSON.stringify(state)); data.storageError = ''; uni.setStorageSync(STORAGE_KEY, data); if (state.storageError) state.storageError = ''; return true } catch (e) { state.storageError = '保存失败：本地空间不足，请先导出备份'; return false }
}
watch(state, persist, { deep: true, flush: 'post' })
function commit(action) {
  if (blockedWrite) return { ok: false, reason: '请先恢复有效备份，或导出原数据后重置' }
  const before = JSON.parse(JSON.stringify(state)), result = action()
  if (!result.ok || persist()) return result
  Object.assign(state, before, { storageError: '保存失败，操作已撤销。请导出备份或释放本地空间。' })
  return { ok: false, reason: state.storageError }
}
export function refreshApp() { domain.refresh(state); persist() }
export function notifyReminders() {
  if (!state.settings.notifications) return
  for (const alert of domain.reminders(state)) {
    if (state.alertsSeen.includes(alert.id)) continue
    let delivered = false
    // #ifdef H5
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') { try { new Notification('小卡攒钱记', { body: alert.text }); delivered = true } catch (e) { /* Mobile browsers may disallow direct notifications. */ } }
    // #endif
    // #ifdef APP-PLUS
    if (typeof plus !== 'undefined') { try { plus.push.createMessage(alert.text, '', { title: '小卡攒钱记' }); delivered = true } catch (e) { /* Keep in-app reminders available. */ } }
    // #endif
    if (delivered) state.alertsSeen.push(alert.id)
  }
}
export const formatMoney = value => domain.money(value).toFixed(2)
export const rarityLabel = rarity => domain.rarityMap[rarity]?.label || '普通'
export const weekStart = () => domain.range('weekly', state.currentDate).start
export const weekEnd = () => domain.range('weekly', state.currentDate).end
export const monthStart = () => domain.range('monthly', state.currentDate).start
export const monthEnd = () => domain.range('monthly', state.currentDate).end
export const weeklyTask = () => domain.task(state, 'weekly')
export const monthlyTask = () => domain.task(state, 'monthly')
export const weeklySpent = () => weeklyTask().spentAmount
export const monthlySpent = () => monthlyTask().spentAmount
export const todaySpent = () => domain.stats(state, state.currentDate, state.currentDate).spent
export const weeklyIncome = () => domain.stats(state, weekStart(), weekEnd()).income
export const monthlyIncome = () => domain.stats(state, monthStart(), monthEnd()).income
export const todayIncome = () => domain.stats(state, state.currentDate, state.currentDate).income
export const weeklyPercent = () => weeklyTask().percent
export const monthlyPercent = () => monthlyTask().percent
export const weeklyRemaining = () => weeklyTask().remaining
export const monthlyRemaining = () => monthlyTask().remaining
export const getChallenge = day => domain.challenge(state, day)
export const lowSpendLimit = () => getChallenge().limit
export const canCompleteLowSpend = () => getChallenge().canClaim
export const completeLowSpendChallenge = day => { refreshApp(); return commit(() => domain.claimChallenge(state, day)) }
export const syncBills = () => { try { const result = commit(() => domain.syncDemo(state)); notifyReminders(); return result } catch (e) { state.sync.status = 'error'; return { ok: false, reason: '演示同步失败，请重试' } } }
export const saveSettings = payload => { refreshApp(); return commit(() => domain.updateSettings(state, payload)) }
export const setWeeklyCover = path => commit(() => { state.settings.weeklyCover = path || ''; return { ok: true } }).ok
export const saveAppearance = appearance => commit(() => { state.settings.appearance = { ...appearance }; return { ok: true, reason: '配色已保存' } })
export const setMemberArtwork = (id, artwork) => commit(() => {
  const member = state.members.find(item => item.id === id)
  if (!member) return { ok: false, reason: '成员不存在' }
  member.artwork = artwork || ''
  return { ok: true }
})
export const memberUnlockReason = id => domain.unlockReason(state, id)
export const unlockMember = id => { refreshApp(); return commit(() => domain.unlock(state, id)) }
export const correctBill = (id, patch) => { refreshApp(); return commit(() => domain.correctTransaction(state, id, patch)) }
export const savingsProgress = () => domain.savingsProgress(state)
export const reminders = () => domain.reminders(state)
export const statusLabel = status => ({ active: '进行中', over: '已超支', pending: '待同步结算', success: '已成功', failed: '已失败' }[status] || '进行中')
export function exportBackup() { if (blockedWrite && originalStored) return typeof originalStored === 'string' ? originalStored : JSON.stringify(originalStored, null, 2); return JSON.stringify({ ...JSON.parse(JSON.stringify(state)), storageError: '' }, null, 2) }
export function restoreBackup(text) {
  try { const data = domain.validateBackup(JSON.parse(text)); const before = exportBackup(); uni.setStorageSync(`${STORAGE_KEY}-before-restore`, before); uni.setStorageSync(STORAGE_KEY, data); blockedWrite = false; Object.keys(state).forEach(k => delete state[k]); Object.assign(state, data, { storageError: '' }); refreshApp(); return { ok: true, reason: '备份已恢复，替换前的数据已保留' } } catch (e) { return { ok: false, reason: e.message || '备份恢复失败' } }
}
export function resetData() { try { uni.setStorageSync(`${STORAGE_KEY}-before-reset`, exportBackup()); const next = domain.createState(); uni.setStorageSync(STORAGE_KEY, next); blockedWrite = false; Object.keys(state).forEach(k => delete state[k]); Object.assign(state, next); refreshApp(); return { ok: true, reason: '已重置，原数据已备份' } } catch (e) { return { ok: false, reason: '备份失败，未执行重置' } } }
export function recoverPrevious() { const backup = uni.getStorageSync(`${STORAGE_KEY}-before-reset`) || uni.getStorageSync(`${STORAGE_KEY}-before-restore`); return backup ? restoreBackup(typeof backup === 'string' ? backup : JSON.stringify(backup)) : { ok: false, reason: '没有可撤销的备份' } }
export function saveSavings(payload) {
  if (!domain.validAmount(payload.target) || !Number.isFinite(Number(payload.startingAmount)) || Number(payload.startingAmount) < 0 || Number(payload.startingAmount) > 100000000 || !domain.validDate(payload.deadline) || payload.deadline < state.currentDate || !String(payload.title).trim()) return { ok: false, reason: '请填写目标名称、有效金额和未来日期' }
  return commit(() => { Object.assign(state.savings, payload, { target: Number(payload.target), startingAmount: domain.money(payload.startingAmount), title: payload.title.trim().slice(0, 30) }); return { ok: true, reason: '心愿已保存' } })
}
export async function enableNotifications(enabled) {
  if (!enabled) { state.settings.notifications = false; return '通知已关闭' }
  // #ifdef H5
  if (typeof Notification === 'undefined') return '当前浏览器不支持通知，预算提醒仍会在页面显示'
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return '未获得通知权限，预算提醒仍会在页面显示'
  // #endif
  state.settings.notifications = true; notifyReminders(); return '通知已开启'
}
refreshApp()
