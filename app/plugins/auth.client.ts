export default defineNuxtPlugin(async () => {
  const { initAuth, watchAuthState } = useAuth()

  // 初始化认证状态
  await initAuth()

  // 监听认证状态变化
  watchAuthState()
})
