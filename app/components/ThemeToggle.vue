<template>
  <Button 
    variant="ghost" 
    size="sm" 
    @click="toggleTheme"
    :aria-label="isDark ? '切换到明亮模式' : '切换到深色模式'"
    class="w-9 h-9 p-0"
  >
    <Sun 
      v-if="isDark" 
      class="h-4 w-4 transition-all" 
    />
    <Moon 
      v-else 
      class="h-4 w-4 transition-all" 
    />
  </Button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'

// 临时处理：直接使用基础实现
const isDark = ref(false)
const toggleTheme = () => {
  isDark.value = !isDark.value
  // 简单的主题切换实现
  if (process.client) {
    document.documentElement.classList.toggle('dark', isDark.value)
  }
}
</script> 