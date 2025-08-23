<template>
  <div v-if="hasPermission">
    <slot />
  </div>
  <div v-else-if="showFallback" class="flex items-center justify-center min-h-[200px]">
    <slot name="fallback">
      <div class="text-center">
        <div class="mb-4">
          <Lock class="h-12 w-12 text-muted-foreground mx-auto" />
        </div>
        <h3 class="text-lg font-semibold text-muted-foreground mb-2">访问受限</h3>
        <p class="text-sm text-muted-foreground">
          {{ fallbackMessage || '您没有权限执行此操作' }}
        </p>
        <Button 
          v-if="showBackButton" 
          variant="outline" 
          class="mt-4"
          @click="$router.back()"
        >
          返回
        </Button>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
import Button from 'primevue/button'

interface Props {
  /** 是否有权限 - 由父组件传入 */
  hasPermission?: boolean
  /** 是否显示无权限时的后备内容 */
  showFallback?: boolean
  /** 自定义无权限提示信息 */
  fallbackMessage?: string
  /** 是否显示返回按钮 */
  showBackButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasPermission: true,
  showFallback: true,
  showBackButton: true
})
</script> 
