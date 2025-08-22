<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isLoading" 
        class="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex items-center justify-center"
        @click.self="handleBackdropClick"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm mx-4 min-w-[300px]">
          <div class="flex items-center space-x-4">
            <!-- 加载动画 -->
            <div class="relative">
              <div class="w-8 h-8 border-4 border-primary/20 rounded-full"></div>
              <div class="absolute top-0 left-0 w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <!-- 加载信息 -->
            <div class="flex-1">
              <p class="text-sm font-medium text-foreground">
                {{ currentMessage }}
              </p>
              <p v-if="showProgress" class="text-xs text-muted-foreground mt-1">
                {{ progress }}% 完成
              </p>
            </div>
          </div>
          
          <!-- 进度条 -->
          <div v-if="showProgress" class="mt-4">
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                class="bg-primary h-2 rounded-full transition-all duration-300"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
          </div>
          
          <!-- 取消按钮 -->
          <div v-if="cancellable" class="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              @click="handleCancel"
            >
              取消
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import { useGlobalLoading } from '~/composables/useGlobalLoading'

interface Props {
  cancellable?: boolean
  showProgress?: boolean
  progress?: number
  onCancel?: () => void
  backdropClickToClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cancellable: false,
  showProgress: false,
  progress: 0,
  backdropClickToClose: false
})

const emit = defineEmits<{
  cancel: []
  backdropClick: []
}>()

const { isLoading, currentMessage } = useGlobalLoading()

const handleCancel = () => {
  if (props.onCancel) {
    props.onCancel()
  }
  emit('cancel')
}

const handleBackdropClick = () => {
  emit('backdropClick')
  if (props.backdropClickToClose && props.cancellable) {
    handleCancel()
  }
}

// 防止页面滚动
watch(isLoading, (loading) => {
  if (process.client) {
    if (loading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})

// 组件卸载时恢复滚动
onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* 确保加载器在最顶层 */
.z-\[9999\] {
  z-index: 9999;
}
</style> 