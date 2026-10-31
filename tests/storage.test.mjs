import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'

const compiler='/Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli-vite/package.json'
const require=createRequire(fs.existsSync(compiler)?compiler:new URL('../package.json',import.meta.url))
const vue=require('vue'), storage=new Map()
globalThis.__budgetTestVue=vue
globalThis.uni={getStorageSync:key=>storage.get(key)||'',setStorageSync:(key,value)=>storage.set(key,structuredClone(value))}
const source=fs.readFileSync(new URL('../store/app.js',import.meta.url),'utf8').replace("import { reactive, watch } from 'vue'",'const {reactive,watch}=globalThis.__budgetTestVue').replace("'./domain.mjs'",JSON.stringify(new URL('../store/domain.mjs',import.meta.url).href)).replace("'./domain.mjs'",JSON.stringify(new URL('../store/domain.mjs',import.meta.url).href))
let serial=0
async function load(){return import('data:text/javascript;base64,'+Buffer.from(source+`\n// instance ${serial++}`).toString('base64'))}

test('saved settings, photo, wallet, records and nickname survive reinitialization',async()=>{
  const app=await load();app.state.profile.nickname='小卡同学';app.state.settings.weeklyCover='data:image/png;base64,test';app.syncBills();app.persist();await vue.nextTick()
  assert.equal(app.setMemberArtwork('m1','data:image/jpeg;base64,portrait').ok,true)
  const before=JSON.parse(app.exportBackup()),again=await load()
  assert.equal(again.state.profile.nickname,'小卡同学');assert.equal(again.state.settings.weeklyCover,'data:image/png;base64,test')
  assert.equal(again.state.members[0].artwork,'data:image/jpeg;base64,portrait')
  assert.equal(again.state.transactions.length,before.transactions.length);assert.equal(again.state.wallet.balance,before.wallet.balance)
  assert.equal(again.syncBills().count,0)
})
test('backup restores and reset keeps a recoverable snapshot',async()=>{
  const app=await load(),backup=app.exportBackup();app.state.profile.nickname='新的名字';app.persist();await vue.nextTick()
  assert.equal(app.restoreBackup(backup).ok,true);assert.equal(app.state.profile.nickname,'小卡同学')
  assert.equal(app.resetData().ok,true);assert.equal(app.state.profile.nickname,'练习生 001')
  assert.equal(app.recoverPrevious().ok,true);assert.equal(app.state.profile.nickname,'小卡同学')
  const count=app.state.transactions.length
  assert.equal(app.restoreBackup('{invalid').ok,false);assert.equal(app.state.transactions.length,count)
  await vue.nextTick()
})
test('storage failure rolls back settings rather than reporting a saved budget',async()=>{
  const app=await load(),old=app.state.settings.weeklyLimit,save=uni.setStorageSync
  uni.setStorageSync=()=>{throw new Error('Quota exceeded')}
  const result=app.saveSettings({...app.state.settings,weeklyLimit:9999})
  assert.equal(result.ok,false);assert.equal(app.state.settings.weeklyLimit,old)
  const oldArtwork=app.state.members[0].artwork
  assert.equal(app.setMemberArtwork('m1','data:image/jpeg;base64,replacement').ok,false)
  assert.equal(app.state.members[0].artwork,oldArtwork)
  await vue.nextTick();uni.setStorageSync=save
})
test('custom colors survive reload and backup, and a failed save restores the previous theme',async()=>{
  const app=await load(), appearance={accent:'#aa66cc',background:'#151515',surface:'#eeeeee'}
  assert.equal(app.saveAppearance(appearance).ok,true)
  await vue.nextTick()
  const again=await load()
  assert.deepEqual(JSON.parse(JSON.stringify(again.state.settings.appearance)),appearance)
  const backup=app.exportBackup(), write=uni.setStorageSync
  uni.setStorageSync=()=>{throw new Error('Quota exceeded')}
  assert.equal(app.saveAppearance({...appearance,accent:'#ffffff'}).ok,false)
  assert.deepEqual(JSON.parse(JSON.stringify(app.state.settings.appearance)),appearance)
  await vue.nextTick();uni.setStorageSync=write
  assert.equal(app.resetData().ok,true)
  assert.equal(app.restoreBackup(backup).ok,true)
  assert.deepEqual(JSON.parse(JSON.stringify(app.state.settings.appearance)),appearance)
  await vue.nextTick()
})
test('unreadable data is preserved and can be exported without overwriting it',async()=>{
  storage.set('idol-budget-v2','broken original data')
  const app=await load();assert.equal(app.exportBackup(),'broken original data');assert.equal(app.persist(),false);assert.equal(storage.get('idol-budget-v2'),'broken original data')
})
