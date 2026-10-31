export const tabPages = {
  home: '/pages/home/index',
  record: '/pages/record/index',
  tasks: '/pages/tasks/index',
  members: '/pages/members/index',
  profile: '/pages/profile/index'
}

export function goTab(key) {
  const url = tabPages[key]
  if (!url) return
  uni.reLaunch({ url })
}

export function goPage(url) {
  uni.navigateTo({ url })
}

export function goBack(fallback = '/pages/home/index') {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }
  uni.reLaunch({ url: fallback })
}
