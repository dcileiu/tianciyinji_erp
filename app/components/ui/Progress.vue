<template>
  <div :class="cn(progressVariants(), className)" v-bind="$attrs">
    <div
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ transform: `translateX(-${100 - (modelValue || 0)}%)` }"
    />
  </div>
</template>

<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressVariants = cva(
  'relative h-4 w-full overflow-hidden rounded-full bg-secondary'
)

interface ProgressProps {
  modelValue?: number
  className?: string
}

withDefaults(defineProps<ProgressProps>(), {
  modelValue: 0,
})
</script> 