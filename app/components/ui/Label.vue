<template>
  <label
    :class="cn(labelVariants(), $attrs.class ?? '')"
    v-bind="$attrs"
  >
    <slot />
  </label>
</template>

<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)

export interface LabelProps extends VariantProps<typeof labelVariants> {}

defineOptions({
  inheritAttrs: false,
})
</script> 