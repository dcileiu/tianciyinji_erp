<template>
  <div class="min-h-screen bg-surface-0">
    <!-- 顶部导航栏 -->
    <header class="border-b border-surface sticky top-0 z-50 bg-surface-0">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo 和系统名称 -->
          <div class="flex items-center space-x-4">
            <NuxtLink to="/dashboard" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary rounded-border flex items-center justify-center">
                <span class="text-primary-contrast font-bold text-lg">E</span>
                </div>
              <span class="text-xl font-bold text-color">ERP系统</span>
              </NuxtLink>
          </div>

          <!-- 右侧操作区 -->
          <div class="flex items-center space-x-4">
            <!-- 主题切换 -->
            <Button
              icon="pi pi-sun"
              severity="secondary"
              text
              rounded
              class="theme-toggle"
              @click="toggleTheme"
              />

            <!-- 用户菜单 -->
            <div class="relative">
              <Button
                :label="user?.email || '用户'"
                icon="pi pi-user"
                severity="secondary"
                text
                class="user-menu-trigger"
                @click="toggleUserMenu"
              />
              
              <OverlayPanel ref="userMenuPanel" class="user-menu-panel">
                <div class="p-4 space-y-2">
                  <div class="flex items-center space-x-2 p-2">
                    <i class="pi pi-user text-muted-color"></i>
                    <span class="text-sm text-muted-color">{{ user?.email }}</span>
                </div>
                  <Divider />
                  <Button
                    label="个人设置"
                    icon="pi pi-cog"
                    text
                    severity="secondary"
                    class="w-full justify-start"
                    @click="goToSettings"
                  />
                  <Button
                    label="退出登录"
                    icon="pi pi-sign-out"
                    text
                    severity="danger"
                    class="w-full justify-start"
                    @click="logout"
                  />
                </div>
              </OverlayPanel>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- 全局加载器 -->
    <GlobalLoader />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import Divider from 'primevue/divider'

// 获取用户信息
const user = useSupabaseUser()

// 主题管理
const isDark = ref(false)

// 用户菜单引用
const userMenuPanel = ref()

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  // 这里可以实现主题切换逻辑
  console.log('切换主题:', isDark.value ? '深色' : '浅色')
}

// 切换用户菜单
const toggleUserMenu = (event: Event) => {
  userMenuPanel.value.toggle(event)
}

// 前往设置页面
const goToSettings = () => {
  userMenuPanel.value.hide()
  navigateTo('/system/config')
}

// 退出登录
const logout = async () => {
  userMenuPanel.value.hide()
  const { auth } = useSupabaseClient()
  await auth.signOut()
  await navigateTo('/login')
}
</script>

<style scoped>
.theme-toggle :deep(.p-button) {
  color: var(--p-text-muted-color);
}

.theme-toggle :deep(.p-button:hover) {
  color: var(--p-text-color);
  background-color: var(--p-content-hover-background);
}

.user-menu-trigger :deep(.p-button) {
  color: var(--p-text-muted-color);
}

.user-menu-trigger :deep(.p-button:hover) {
  color: var(--p-text-color);
  background-color: var(--p-content-hover-background);
}
</style>
