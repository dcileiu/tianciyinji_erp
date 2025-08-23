<template>
  <div v-if="isLoading" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      <div class="flex flex-col items-center gap-4 p-8 bg-surface-0 border border-surface rounded-border shadow-xl">
        <ProgressSpinner 
          style="width: 50px; height: 50px" 
          stroke-width="8" 
          fill="transparent"
          animation-duration=".5s"
        />
        <div class="text-color text-sm font-medium">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'

const { isLoading } = useGlobalLoading()
</script>

<style scoped>
/* 自定义 ProgressSpinner 样式 */
:deep(.p-progress-spinner-circle) {
  stroke: var(--p-primary-color);
}
</style> 
