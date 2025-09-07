<template>
  <div class="min-h-screen bg-background">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 -right-32 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"
      ></div>
      <div
        class="absolute -bottom-40 -left-32 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full mix-blend-multiply filter blur-2xl opacity-50"
      ></div>
    </div>

    <!-- 头部 -->
    <header
      class="relative z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <!-- Logo -->
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg"
              >
                <AppLogo size="1.5rem" inverse />
              </div>
              <div>
                <h1 class="text-xl font-bold text-foreground">ERP系统</h1>
                <p class="text-xs text-muted-foreground">企业资源规划管理</p>
              </div>
            </div>
          </div>

          <!-- 主题切换按钮 -->
          <div class="flex items-center space-x-2">
            <Button variant="ghost" size="icon" @click="toggleTheme">
              <Sun v-if="isDark" class="h-4 w-4" />
              <Moon v-else class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="relative z-10 flex-1">
      <slot></slot>
    </main>

    <!-- 页脚 -->
    <footer class="relative z-10 border-t bg-card/50 backdrop-blur">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <p class="text-sm text-muted-foreground">
            © 2025 ERP 管理系统. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Building2, Moon, Sun } from 'lucide-vue-next';

// 主题管理
const { isDark, toggleTheme, initTheme } = useTheme();

// 初始化主题
onMounted(() => {
  initTheme();
});
</script>
