export const VERSION = 2
export const rarityMap = { normal: { label: '普通', cost: 50 }, rare: { label: '稀有', cost: 150 }, limited: { label: '限定', cost: 300 } }
export const money = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100
export const validAmount = value => Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= 100000000 && Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) < 0.00001
export function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export const asDate = value => new Date(`${value}T12:00:00`)
export function validDate(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(asDate(value).getTime()) && dateKey(asDate(value)) === value }
export function shiftDay(value, days) { const d = asDate(value); d.setDate(d.getDate() + days); return dateKey(d) }
export function range(type, value) {
  const d = asDate(value)
  if (type === 'weekly') { const start = shiftDay(value, -((d.getDay() + 6) % 7)); return { start, end: shiftDay(start, 6) } }
  return { start: dateKey(new Date(d.getFullYear(), d.getMonth(), 1)), end: dateKey(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }
}
export function daysBetween(start, end) { const result = []; for (let d = start; d <= end; d = shiftDay(d, 1)) result.push(d); return result }
const memberNames = ['柳银', '瑞白', '泫月', '奈林', '夏允', '知恩', '采律', '素禾']
const memberRarities = ['normal', 'rare', 'rare', 'normal', 'limited', 'normal', 'rare', 'limited']
export function createState(today = dateKey()) {
  const week = range('weekly', today), month = range('monthly', today)
  const transactions = [120, 95, 180, 225, 60, 320, 480, 400].map((amount, i) => ({ id: `seed-e${i}`, externalId: `seed-e${i}`, type: 'expense', amount, date: i < 5 ? (shiftDay(week.start, i) < today ? shiftDay(week.start, i) : today) : month.start, category: ['餐饮', '交通', '购物', '娱乐', '餐饮', '学习', '购物', '其他'][i], note: '示例账单', source: 'demo', excluded: false }))
  transactions.push({ id: 'seed-i1', externalId: 'seed-i1', type: 'income', amount: 1200, date: today, category: '工资', note: '兼职收入 · 示例', source: 'demo', excluded: false }, { id: 'seed-r1', externalId: 'seed-r1', type: 'refund', amount: 88, date: today, category: '退款', note: '购物退款 · 示例', relatedId: 'seed-e2', source: 'demo', excluded: false })
  return { version: VERSION, currentDate: today, startedAt: today, profile: { nickname: '练习生 001' }, settings: { weeklyLimit: 1000, monthlyLimit: 3000, weekStartDay: 'monday', warningThreshold: 0.8, weeklyCover: '', penaltyMode: 'debt', incomeAddsBudget: false, notifications: false }, revisions: { weekly: [{ effective: week.start, limit: 1000, penaltyMode: 'debt', incomeAddsBudget: false }], monthly: [{ effective: month.start, limit: 3000, penaltyMode: 'debt', incomeAddsBudget: false }] }, transactions, sync: { connected: false, provider: '演示账单', status: 'ready', lastSync: '', completedThrough: shiftDay(today, -1), newCount: 0 }, wallet: { balance: -10, permits: 0, history: [{ id: 'opening', title: '初始示例余额', delta: -10, balanceAfter: -10, date: today, kind: 'opening' }] }, cycles: {}, settlements: [], challenges: {}, members: memberNames.map((name, i) => ({ id: `m${i + 1}`, name, rarity: memberRarities[i], cost: rarityMap[memberRarities[i]].cost, status: i < 2 ? 'unlocked' : i === 2 ? 'cooldown' : 'locked', unlockedAt: i < 3 ? today : '', description: ['清冷主唱 · 银灰练习室', '柔雾领舞 · 珍珠耳返', '冷感门面 · 月光摄影棚', '甜酷忙内 · 淡粉训练服', '限定队长 · 冰蓝舞台', '温柔副唱 · 白色针织', '银发说唱 · 极简舞台', '限定主舞 · 珍珠白灯幕'][i] })), targetMemberId: '', savings: { title: '我的小心愿', target: 5000, startingAmount: 0, deadline: shiftDay(today, 90) }, alertsSeen: [], storageError: '' }
}
export const cycleId = (type, start) => `${type}:${start}`
export function ensureCycle(s, type, day) {
  const { start, end } = range(type, day), id = cycleId(type, start)
  if (!s.cycles[id]) {
    const revision = [...s.revisions[type]].reverse().find(r => r.effective <= start) || s.revisions[type][0]
    s.cycles[id] = { id, type, start, end, budgetLimit: revision.limit, penaltyMode: revision.penaltyMode, incomeAddsBudget: revision.incomeAddsBudget, status: 'active', rewardGem: type === 'weekly' ? 10 : 50, failurePenalty: -20 }
  }
  return s.cycles[id]
}
export function stats(s, start, end) {
  const rows = s.transactions.filter(t => !t.excluded && t.date >= start && t.date <= end)
  const sum = type => money(rows.filter(t => t.type === type).reduce((n, t) => n + t.amount, 0))
  const refunds = money(rows.filter(t => t.type === 'refund').reduce((n, t) => {
    const original = s.transactions.find(o => o.id === t.relatedId && o.type === 'expense' && !o.excluded)
    if (!original) return n
    const all = s.transactions.filter(r => r.type === 'refund' && r.relatedId === original.id && !r.excluded).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
    const preceding = all.slice(0, all.findIndex(r => r.id === t.id)).reduce((v, r) => v + r.amount, 0)
    return n + Math.max(0, Math.min(t.amount, original.amount - preceding))
  }, 0))
  return { expense: sum('expense'), refund: refunds, spent: money(sum('expense') - refunds), income: sum('income'), transfer: sum('transfer'), net: money(sum('income') - sum('expense') + refunds) }
}
export function task(s, type, day = s.currentDate) {
  const c = ensureCycle(s, type, day), st = stats(s, c.start, c.end)
  const limit = money(c.budgetLimit + (c.incomeAddsBudget ? st.income : 0))
  let weekFailed = false
  if (type === 'monthly') {
    for (let d = c.start; d <= c.end;) {
      const w = ensureCycle(s, 'weekly', d), end = w.end < c.end ? w.end : c.end, part = stats(s, d, end)
      if (part.spent > w.budgetLimit + (w.incomeAddsBudget ? part.income : 0)) weekFailed = true
      d = shiftDay(end, 1)
    }
  }
  const over = st.spent > limit || weekFailed
  return { ...c, title: type === 'weekly' ? '本周任务' : '本月任务', spentAmount: st.spent, effectiveLimit: limit, income: st.income, refund: st.refund, percent: Math.max(0, Math.round(st.spent / limit * 100)), remaining: money(limit - st.spent), over, weekFailed, status: c.status !== 'active' ? c.status : c.end < s.currentDate ? 'pending' : over ? 'over' : 'active' }
}
export function addGem(s, title, delta, kind, reference, date = s.currentDate) {
  if (s.wallet.history.some(h => h.id === reference)) return 0
  s.wallet.balance += delta
  s.wallet.history.unshift({ id: reference, title, delta, balanceAfter: s.wallet.balance, kind, reference, date })
  return delta
}
function recover(s) { const m = s.members.find(m => m.status === 'cooldown'); if (m) m.status = 'unlocked'; return m?.name || '' }
export function refresh(s, today = dateKey()) {
  if (!validDate(today)) return
  s.currentDate = today
  const candidates = []
  for (const type of ['weekly', 'monthly']) for (let d = range(type, s.startedAt).start; d <= today;) { const c = ensureCycle(s, type, d); candidates.push(c); d = shiftDay(c.end, 1) }
  candidates.sort((a, b) => a.end.localeCompare(b.end) || (a.type === 'weekly' ? -1 : 1))
  for (const c of candidates) {
    if (c.end >= today || c.status !== 'active' || s.sync.completedThrough < c.end) continue
    const result = task(s, c.type, c.start), success = !result.over
    c.status = success ? 'success' : 'failed'; c.closedAt = today
    let affectedMember = ''
    if (success) { s.wallet.permits++; if (c.type === 'weekly') affectedMember = recover(s) }
    else { const choices = s.members.filter(m => m.status === 'unlocked'); const m = choices[Math.floor(Math.random() * choices.length)]; if (m) { m.status = 'cooldown'; affectedMember = m.name } }
    const delta = success ? c.rewardGem : c.penaltyMode === 'floor' ? -Math.min(20, Math.max(0, s.wallet.balance)) : -20
    addGem(s, `${c.type === 'weekly' ? '周' : '月'}任务${success ? '成功' : '失败'}`, delta, 'cycle', c.id)
    s.settlements.unshift({ ...result, status: c.status, delta, balanceAfter: s.wallet.balance, affectedMember, reason: success ? '预算达标，获得一次解锁资格' : result.weekFailed ? '月内周区间超支' : '消费超过预算', settledAt: today })
  }
  return s
}
export function syncDemo(s, today = dateKey()) {
  if (s.sync.status === 'syncing') return { ok: false, reason: '正在同步中' }
  refresh(s, today); s.sync.status = 'syncing'; let count = 0
  for (const date of daysBetween(s.startedAt, today)) {
    const bills = [{ type: 'expense', amount: 18, category: '交通', note: '地铁出行' }, { type: 'expense', amount: 36, category: '餐饮', note: '午餐' }, { type: 'expense', amount: 22, category: '购物', note: '便利店' }, { type: 'income', amount: 200, category: '转账收入', note: '家人转入' }, { type: 'refund', amount: 9, category: '退款', note: '便利店退款', relatedId: `demo:${date}:2` }, { type: 'transfer', amount: 100, category: '内部转账', note: '自己的账户间转账' }]
    bills.forEach((b, i) => { const id = `demo:${date}:${i}`; if (!s.transactions.some(t => t.externalId === id)) { s.transactions.push({ ...b, id, externalId: id, date, source: 'demo', excluded: false }); count++ } })
  }
  s.sync.status = 'ready'; s.sync.lastSync = new Date().toISOString(); s.sync.newCount = count; s.sync.completedThrough = shiftDay(today, -1)
  refresh(s, today)
  return { ok: true, reason: count ? `新增 ${count} 笔演示账单` : '没有新增账单，已跳过重复记录', count }
}
export function challenge(s, day = shiftDay(s.currentDate, -1)) {
  const c = ensureCycle(s, 'weekly', day), limit = money(c.budgetLimit / 14), spent = stats(s, day, day).spent, completed = !!s.challenges[day]
  const eligible = day >= s.startedAt && day < s.currentDate && day <= s.sync.completedThrough
  const canClaim = eligible && !completed && spent < c.budgetLimit / 14
  return { day, limit, spent, completed, canClaim, reason: completed ? '奖励已领取' : day < s.startedAt ? '该日期早于开始使用日期' : day >= s.currentDate ? '当天结束后确认结果' : day > s.sync.completedThrough ? '等待完整账单' : !canClaim ? '当日消费未低于挑战线' : '已达标，可领取 +5 宝石' }
}
export function claimChallenge(s, day) {
  const c = challenge(s, day)
  if (!c.canClaim) return { ok: false, reason: c.reason }
  s.challenges[c.day] = { day: c.day, spent: c.spent, limit: c.limit }
  addGem(s, `${c.day} 低消费挑战`, 5, 'challenge', `challenge:${c.day}`)
  const name = recover(s)
  return { ok: true, reason: `+5 宝石${name ? `，${name}已恢复` : ''}` }
}
export function unlockReason(s, id) {
  const m = s.members.find(m => m.id === id)
  if (!m) return '成员不存在'
  if (m.status === 'unlocked') return '已加入收藏'
  if (m.status === 'cooldown') return '完成周任务或低消费挑战恢复'
  if (s.wallet.balance < 0) return '宝石为负，解锁已冻结'
  if (!s.wallet.permits) return '完成周或月任务，获得解锁资格'
  if (s.wallet.balance < m.cost) return `还差 ${m.cost - s.wallet.balance} 宝石`
  return ''
}
export function unlock(s, id) {
  const reason = unlockReason(s, id)
  if (reason) return { ok: false, reason }
  const m = s.members.find(m => m.id === id)
  addGem(s, `解锁${m.name}`, -m.cost, 'member', `unlock:${id}`)
  s.wallet.permits--; m.status = 'unlocked'; m.unlockedAt = s.currentDate
  if (s.targetMemberId === id) s.targetMemberId = ''
  return { ok: true, reason: `${m.name}已加入收藏` }
}
export function updateSettings(s, payload) {
  if (!validAmount(payload.weeklyLimit) || !validAmount(payload.monthlyLimit)) return { ok: false, reason: '预算须大于 0，最多两位小数，且不超过一亿元' }
  const next = { ...s.settings, ...payload, penaltyMode: payload.penaltyMode === 'floor' ? 'floor' : 'debt', incomeAddsBudget: !!payload.incomeAddsBudget }
  for (const type of ['weekly', 'monthly']) {
    const effective = shiftDay(range(type, s.currentDate).end, 1), key = type === 'weekly' ? 'weeklyLimit' : 'monthlyLimit'
    const r = { effective, limit: Number(next[key]), penaltyMode: next.penaltyMode, incomeAddsBudget: next.incomeAddsBudget }
    s.revisions[type] = s.revisions[type].filter(v => v.effective !== effective).concat(r).sort((a, b) => a.effective.localeCompare(b.effective))
    Object.keys(s.cycles).forEach(id => { if (s.cycles[id].type === type && s.cycles[id].start >= effective && s.cycles[id].status === 'active') delete s.cycles[id] })
  }
  Object.assign(s.settings, next, { weeklyLimit: Number(next.weeklyLimit), monthlyLimit: Number(next.monthlyLimit) })
  return { ok: true, reason: '已保存，预算与奖惩设置从下个周期生效' }
}
export function correctTransaction(s, id, patch) {
  const t = s.transactions.find(t => t.id === id)
  if (!t) return { ok: false, reason: '账单不存在' }
  if (s.settlements.some(c => t.date >= c.start && t.date <= c.end) || s.challenges[t.date]) return { ok: false, reason: '该日期已经结算，记录已锁定' }
  const next = { ...t, ...patch }
  if (!['expense', 'income', 'refund', 'transfer'].includes(next.type)) return { ok: false, reason: '收支类型无效' }
  if (!String(next.category).trim()) return { ok: false, reason: '请选择分类' }
  if (next.type === 'refund' && !next.excluded) {
    const original = s.transactions.find(o => o.id === next.relatedId && o.type === 'expense' && !o.excluded && o.date <= t.date)
    const refunded = s.transactions.filter(r => r.id !== id && r.type === 'refund' && r.relatedId === next.relatedId && !r.excluded).reduce((n, r) => n + r.amount, 0)
    if (!original || next.amount + refunded > original.amount) return { ok: false, reason: '请选择原支出，退款合计不能超过原金额' }
  }
  if ((next.type !== 'expense' || next.excluded) && s.transactions.some(r => r.type === 'refund' && r.relatedId === id && !r.excluded)) return { ok: false, reason: '此支出关联了退款，请先处理退款记录' }
  Object.assign(t, { type: next.type, category: String(next.category).trim().slice(0, 30), note: String(next.note || '').slice(0, 200), excluded: !!next.excluded, relatedId: next.type === 'refund' ? next.relatedId : '' })
  return { ok: true, reason: '账单已纠正' }
}
export function savingsProgress(s) { const saved = money(s.savings.startingAmount + stats(s, '0000-00-00', s.currentDate).net); return { saved, percent: Math.max(0, Math.min(100, saved / s.savings.target * 100)), remaining: Math.max(0, money(s.savings.target - saved)) } }
export function reminders(s) {
  const list = []
  for (const type of ['weekly', 'monthly']) { const t = task(s, type); if (t.spentAmount >= t.effectiveLimit * .8 || t.over) list.push({ id: `${t.id}:${t.over ? 'over' : '80'}`, tone: t.over ? 'danger' : 'warning', text: `${type === 'weekly' ? '本周' : '本月'}${t.over ? '预算已超支' : `预算已用 ${t.percent}%`}，剩余 ¥${t.remaining.toFixed(2)}` }) }
  if (!s.sync.lastSync || dateKey(new Date(s.sync.lastSync)) < s.currentDate) list.push({ id: `sync:${s.currentDate}`, tone: 'warning', text: '演示账单尚未更新，任务结果等待账单完整后确认' })
  if (s.sync.status === 'error') list.push({ id: 'sync-error', tone: 'danger', text: '账单同步失败，请重试；已有记录已保留' })
  if (s.storageError) list.push({ id: 'storage', tone: 'danger', text: s.storageError })
  return list
}
export function validateBackup(value) {
  if (!value || value.version !== VERSION || !validDate(value.startedAt) || !validDate(value.currentDate) || value.startedAt > dateKey() || !value.settings || !validAmount(value.settings.weeklyLimit) || !validAmount(value.settings.monthlyLimit)) throw new Error('备份版本或预算无效')
  if (!Array.isArray(value.transactions) || value.transactions.length > 100000 || new Set(value.transactions.map(t => t.id)).size !== value.transactions.length || value.transactions.some(t => !t.id || !t.externalId || !validDate(t.date) || !validAmount(t.amount) || !['expense', 'income', 'refund', 'transfer'].includes(t.type) || typeof t.category !== 'string' || typeof t.note !== 'string')) throw new Error('账单数据无效')
  if (!value.wallet || !Number.isSafeInteger(value.wallet.balance) || !Number.isSafeInteger(value.wallet.permits) || value.wallet.permits < 0 || !Array.isArray(value.wallet.history) || !value.wallet.history.length) throw new Error('宝石数据无效')
  let balance = 0
  const ledger = [...value.wallet.history].reverse()
  for (const h of ledger) { balance += h.delta; if (!Number.isSafeInteger(h.delta) || balance !== h.balanceAfter || !validDate(h.date)) throw new Error('宝石流水对账失败') }
  if (balance !== value.wallet.balance || new Set(ledger.map(h => h.id)).size !== ledger.length) throw new Error('宝石余额对账失败')
  if (!Array.isArray(value.members) || value.members.length !== 8 || value.members.some((m, i) => m.id !== `m${i + 1}` || m.cost !== rarityMap[memberRarities[i]].cost || !['locked', 'unlocked', 'cooldown'].includes(m.status))) throw new Error('成员数据无效')
  for (const type of ['weekly', 'monthly']) { if (!value.revisions || !Array.isArray(value.revisions[type]) || !value.revisions[type].length || value.revisions[type].some(r => !validDate(r.effective) || !validAmount(r.limit) || !['debt', 'floor'].includes(r.penaltyMode))) throw new Error('预算历史无效') }
  if (!value.cycles || !Array.isArray(value.settlements) || !value.challenges || !value.sync || !validDate(value.sync.completedThrough) || !value.profile || typeof value.profile.nickname !== 'string' || !value.savings || !validAmount(value.savings.target) || !Number.isFinite(value.savings.startingAmount) || !validDate(value.savings.deadline) || !Array.isArray(value.alertsSeen)) throw new Error('备份结构不完整')
  for (const c of Object.values(value.cycles)) { if (!['weekly', 'monthly'].includes(c.type) || !validDate(c.start) || !validDate(c.end) || !validAmount(c.budgetLimit) || !['active', 'success', 'failed'].includes(c.status) || c.id !== cycleId(c.type, c.start)) throw new Error('周期记录无效') }
  if (new Set(value.settlements.map(c => c.id)).size !== value.settlements.length) throw new Error('周期重复结算')
  for (const c of value.settlements) { const snapshot = value.cycles[c.id], entry = value.wallet.history.find(h => h.id === c.id); if (!snapshot || !['success', 'failed'].includes(c.status) || snapshot.status !== c.status || !entry || entry.delta !== c.delta || !Number.isFinite(c.spentAmount) || !validAmount(c.effectiveLimit)) throw new Error('结算记录与宝石流水不一致') }
  for (const [day, c] of Object.entries(value.challenges)) if (!validDate(day) || c.day !== day || !value.wallet.history.some(h => h.id === `challenge:${day}` && h.delta === 5)) throw new Error('挑战记录无效')
  return value
}
