export const useTheme = () => {
  // 主题状态
  const isDark = ref(false)
  const theme = computed(() => isDark.value ? 'dark' : 'light')
  
  // 初始化主题
  const initTheme = () => {
    if (process.client) {
      // 优先从 localStorage 读取
      const stored = localStorage.getItem('theme')
      if (stored) {
        isDark.value = stored === 'dark'
      } else {
        // 如果没有存储的设置，检查系统偏好
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      
      // 应用主题
      applyTheme()
    }
  }
  
  // 应用主题到 DOM
  const applyTheme = () => {
    if (process.client) {
      const root = document.documentElement
      
      if (isDark.value) {
        root.classList.add('dark')
        root.setAttribute('data-theme', 'dark')
      } else {
        root.classList.remove('dark')
        root.setAttribute('data-theme', 'light')
      }
    }
  }
  
  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
    
    // 保存到 localStorage
    if (process.client) {
      localStorage.setItem('theme', theme.value)
    }
  }
  
  // 设置特定主题
  const setTheme = (newTheme: 'light' | 'dark') => {
    isDark.value = newTheme === 'dark'
    applyTheme()
    
    // 保存到 localStorage
    if (process.client) {
      localStorage.setItem('theme', theme.value)
    }
  }
  
  // 监听系统主题变化
  const watchSystemTheme = () => {
    if (process.client) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        // 只有在没有用户设置时才跟随系统
        const stored = localStorage.getItem('theme')
        if (!stored) {
          isDark.value = e.matches
          applyTheme()
        }
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      // 返回清理函数
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
    
    return () => {}
  }
  
  // 组件挂载时初始化
  onMounted(() => {
    initTheme()
    const cleanup = watchSystemTheme()
    
    // 组件卸载时清理
    onUnmounted(() => {
      cleanup()
    })
  })
  
  return {
    isDark: readonly(isDark),
    theme: readonly(theme),
    toggleTheme,
    setTheme
  }
} 