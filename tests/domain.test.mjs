import test from 'node:test'
import assert from 'node:assert/strict'
import * as d from '../store/domain.mjs'

function empty(day='2026-01-05') { const s=d.createState(day); s.transactions=[]; return s }
function bill(s, type, amount, date, extra={}) { const id=`t${s.transactions.length}`;s.transactions.push({id,externalId:id,type,amount,date,category:type,note:'',excluded:false,...extra});return id }

test('date ranges handle Monday, Sunday, leap years and year rollover',()=>{
  assert.deepEqual(d.range('weekly','2026-01-04'),{start:'2025-12-29',end:'2026-01-04'})
  assert.deepEqual(d.range('monthly','2024-02-29'),{start:'2024-02-01',end:'2024-02-29'})
  assert.equal(d.shiftDay('2025-12-31',1),'2026-01-01')
  assert.equal(d.validDate('2026-02-30'),false)
})
test('sync is incremental and deduplicates across reloads and corrected records',()=>{
  const s=empty();assert.equal(d.syncDemo(s,'2026-01-05').count,6)
  assert.equal(d.syncDemo(s,'2026-01-05').count,0)
  const restored=JSON.parse(JSON.stringify(s));restored.transactions[0].excluded=true
  assert.equal(d.syncDemo(restored,'2026-01-06').count,6)
  assert.equal(new Set(restored.transactions.map(t=>t.externalId)).size,12)
  assert.equal(restored.transactions[0].excluded,true)
})
test('refunds reduce expense, transfers never count as income, cents remain exact',()=>{
  const s=empty(),id=bill(s,'expense',100.15,s.currentDate)
  bill(s,'refund',20.05,s.currentDate,{relatedId:id});bill(s,'income',10.1,s.currentDate);bill(s,'transfer',500,s.currentDate)
  const st=d.stats(s,s.currentDate,s.currentDate)
  assert.equal(st.spent,80.1);assert.equal(st.income,10.1);assert.equal(st.net,-70)
})
test('refunds are capped at original amount and unlinked refunds do not reduce spending',()=>{
  const s=empty(),id=bill(s,'expense',100,s.currentDate)
  bill(s,'refund',80,s.currentDate,{relatedId:id});bill(s,'refund',80,s.currentDate,{relatedId:id});bill(s,'refund',100,s.currentDate)
  assert.equal(d.stats(s,s.currentDate,s.currentDate).refund,100)
})
test('weekly success settles once, grants permit and restores a cooled card',()=>{
  const s=empty();bill(s,'expense',100,'2026-01-06');s.sync.completedThrough='2026-01-11'
  d.refresh(s,'2026-01-12');assert.equal(s.wallet.balance,0);assert.equal(s.wallet.permits,1);assert.equal(s.members[2].status,'unlocked')
  d.refresh(s,'2026-01-12');assert.equal(s.wallet.balance,0);assert.equal(s.settlements.length,1)
})
test('missing bills cannot award zero-spend success; catch-up settles after complete sync',()=>{
  const s=empty();d.refresh(s,'2026-01-19');assert.equal(s.settlements.length,0)
  d.syncDemo(s,'2026-01-19');assert.equal(s.settlements.length,2)
  const balance=s.wallet.balance;d.syncDemo(s,'2026-01-19');assert.equal(s.wallet.balance,balance)
})
test('weekly failure deducts exactly once and cools one unlocked member',()=>{
  const s=empty();bill(s,'expense',1001,'2026-01-06');s.sync.completedThrough='2026-01-11'
  d.refresh(s,'2026-01-12');assert.equal(s.wallet.balance,-30);assert.equal(s.members.filter(m=>m.status==='cooldown').length,2)
  d.refresh(s,'2026-01-12');assert.equal(s.wallet.balance,-30)
})
test('floor mode never increases existing debt or goes below zero',()=>{
  for(const balance of [5,-10]){const s=empty();s.wallet.balance=balance;s.revisions.weekly[0].penaltyMode='floor';bill(s,'expense',1001,'2026-01-06');s.sync.completedThrough='2026-01-11';d.refresh(s,'2026-01-12');assert.equal(s.wallet.balance,balance===5?0:-10)}
})
test('budget changes are deferred and cannot erase current overspending',()=>{
  const s=empty();bill(s,'expense',1100,s.currentDate);d.refresh(s,s.currentDate)
  assert.equal(d.updateSettings(s,{weeklyLimit:2000,monthlyLimit:4000,penaltyMode:'floor',incomeAddsBudget:true}).ok,true)
  assert.equal(d.task(s,'weekly').budgetLimit,1000);assert.equal(d.task(s,'weekly').status,'over')
  d.refresh(s,'2026-01-12');assert.equal(d.task(s,'weekly').budgetLimit,2000)
  assert.equal(d.task(s,'weekly').penaltyMode,'floor')
})
test('invalid budgets reject NaN, infinity, extra cents and zero',()=>{
  for(const value of ['no',Infinity,0,-1,1.001,100000001]){const s=empty();assert.equal(d.updateSettings(s,{weeklyLimit:value,monthlyLimit:1000}).ok,false)}
})
test('monthly failure follows a failed week even when monthly total is within limit',()=>{
  const s=empty();bill(s,'expense',1100,'2026-01-06');s.sync.completedThrough='2026-01-31';d.refresh(s,'2026-02-01')
  const c=s.settlements.find(c=>c.type==='monthly');assert.equal(c.status,'failed');assert.equal(c.weekFailed,true)
})
test('cross-month weekly segments use only dates inside the month',()=>{
  const s=empty();bill(s,'expense',900,'2026-01-30');bill(s,'expense',900,'2026-02-01')
  assert.equal(d.task(s,'monthly','2026-01-15').over,false)
  assert.equal(d.task(s,'weekly','2026-01-30').over,true)
})
test('income adds allowance only when the period snapshot explicitly enables it',()=>{
  const s=empty();bill(s,'expense',1100,s.currentDate);bill(s,'income',200,s.currentDate)
  assert.equal(d.task(s,'weekly').over,true);s.cycles[d.cycleId('weekly',s.currentDate)].incomeAddsBudget=true
  assert.equal(d.task(s,'weekly').effectiveLimit,1200);assert.equal(d.task(s,'weekly').over,false)
})
test('daily challenge requires ended complete day, strict threshold and claims once',()=>{
  const s=empty();s.revisions.weekly[0].limit=140;bill(s,'expense',10,s.currentDate)
  assert.equal(d.claimChallenge(s,s.currentDate).ok,false);d.refresh(s,'2026-01-06');s.sync.completedThrough='2026-01-05'
  assert.equal(d.claimChallenge(s,'2026-01-05').ok,false);s.transactions[0].amount=9.99
  assert.equal(d.claimChallenge(s,'2026-01-05').ok,true);assert.equal(s.wallet.balance,-5)
  assert.equal(d.claimChallenge(s,'2026-01-05').ok,false)
  assert.equal(d.correctTransaction(s,s.transactions[0].id,{excluded:true}).ok,false)
})
test('member requires both a successful-cycle permit and sufficient gems',()=>{
  const s=empty();s.wallet.balance=100
  assert.equal(d.unlock(s,'m4').ok,false);s.wallet.permits=1;s.targetMemberId='m4'
  assert.equal(d.unlock(s,'m4').ok,true);assert.equal(s.wallet.balance,50);assert.equal(s.wallet.permits,0);assert.equal(s.targetMemberId,'');assert.equal(d.unlock(s,'m4').ok,false)
})
test('negative wallet freezes unlocking even with a permit',()=>{
  const s=empty();s.wallet.permits=10;assert.match(d.unlockReason(s,'m4'),/冻结/)
})
test('corrections validate refund links and protect settled periods',()=>{
  const s=empty(),id=bill(s,'expense',100,s.currentDate),refund=bill(s,'income',120,s.currentDate)
  assert.equal(d.correctTransaction(s,refund,{type:'refund',relatedId:id}).ok,false)
  assert.equal(d.correctTransaction(s,refund,{type:'transfer',category:'内部转账'}).ok,true)
  s.sync.completedThrough='2026-01-11';d.refresh(s,'2026-01-12');assert.equal(d.correctTransaction(s,id,{excluded:true}).ok,false)
})
test('backup roundtrip verifies ledger and rejects malformed balances',()=>{
  const s=empty();d.refresh(s,'2026-01-05');assert.equal(d.validateBackup(JSON.parse(JSON.stringify(s))).wallet.balance,-10)
  const bad=JSON.parse(JSON.stringify(s));bad.wallet.balance=99;assert.throws(()=>d.validateBackup(bad),/对账/)
})
test('savings uses net cash flow and initial savings, not transfers',()=>{
  const s=empty();s.savings.startingAmount=500;bill(s,'income',100,s.currentDate);bill(s,'expense',25.5,s.currentDate);bill(s,'transfer',999,s.currentDate)
  assert.equal(d.savingsProgress(s).saved,574.5)
})
test('monthly success awards fifty exactly once with a balanced ledger',()=>{
  const s=empty('2026-01-26');s.sync.completedThrough='2026-01-31';d.refresh(s,'2026-02-01')
  assert.equal(s.settlements.find(c=>c.type==='monthly').delta,50);assert.equal(s.wallet.balance,40)
  d.refresh(s,'2026-02-01');assert.equal(s.wallet.balance,40);assert.equal(d.validateBackup(JSON.parse(JSON.stringify(s))).wallet.balance,40)
})
test('warning threshold uses actual cents and includes monthly warnings',()=>{
  const s=empty();bill(s,'expense',799.99,s.currentDate);assert.equal(d.reminders(s).some(r=>r.id.endsWith(':80')),false)
  s.transactions[0].amount=800;assert.equal(d.reminders(s).some(r=>r.id.startsWith('weekly:')&&r.id.endsWith(':80')),true)
  bill(s,'expense',1700,'2026-01-01');assert.equal(d.reminders(s).some(r=>r.id.startsWith('monthly:')),true)
})
test('refund belongs to its receipt day rather than rewriting a closed week',()=>{
  const s=empty(),id=bill(s,'expense',100,'2026-01-06');s.sync.completedThrough='2026-01-11';d.refresh(s,'2026-01-12')
  bill(s,'refund',50,'2026-01-12',{relatedId:id});assert.equal(d.stats(s,'2026-01-05','2026-01-11').spent,100)
  assert.equal(d.stats(s,'2026-01-12','2026-01-12').spent,-50);assert.equal(s.settlements[0].spentAmount,100)
})
