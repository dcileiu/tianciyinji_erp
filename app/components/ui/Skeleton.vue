<template>
  <div :class="skeletonClass" />
</template>

<script setup lang="ts">
import { cva } from 'class-variance-authority'

interface Props {
  variant?: 'default' | 'text' | 'circle' | 'rounded'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  width?: string
  height?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md'
})

const skeletonVariants = cva(
  'animate-pulse bg-muted',
  {
    variants: {
      variant: {
        default: 'rounded-md',
        text: 'rounded-sm',
        circle: 'rounded-full',
        rounded: 'rounded-lg'
      },
      size: {
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-8', 
        xl: 'h-12'
      }
    }
  }
)

const skeletonClass = computed(() => {
  const baseClass = skeletonVariants({
    variant: props.variant,
    size: props.size
  })
  
  let customStyle = ''
  if (props.width) {
    customStyle += ` w-[${props.width}]`
  }
  if (props.height) {
    customStyle += ` h-[${props.height}]`
  }
  
  return `${baseClass}${customStyle} ${props.className || ''}`
})
</script> 