export default defineNuxtPlugin(() => {
  const { initTheme } = useTheme();

  // 在客户端立即初始化主题
  if (process.client) {
    initTheme();
  }
});
