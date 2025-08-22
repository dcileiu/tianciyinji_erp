<template>
  <div class="relative inline-block">
    <div 
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      @focus="showTooltip = true"
      @blur="showTooltip = false"
    >
      <slot />
    </div>
    
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="showTooltip && content"
        :class="tooltipClass"
        role="tooltip"
      >
        {{ content }}
        <div :class="arrowClass" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { cva } from 'class-variance-authority'

interface Props {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  variant?: 'default' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  variant: 'default',
  size: 'md'
})

const showTooltip = ref(false)

const tooltipVariants = cva(
  'absolute z-50 px-3 py-1.5 text-sm font-medium rounded-md shadow-md pointer-events-none whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-popover text-popover-foreground border',
        dark: 'bg-gray-900 text-white'
      },
      placement: {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
      }
    }
  }
)

const arrowVariants = cva(
  'absolute w-2 h-2 transform rotate-45',
  {
    variants: {
      variant: {
        default: 'bg-popover border-l border-t',
        dark: 'bg-gray-900'
      },
      placement: {
        top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
        left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
        right: 'right-full top-1/2 -translate-y-1/2 -mr-1'
      }
    }
  }
)

const tooltipClass = computed(() => tooltipVariants({
  variant: props.variant,
  placement: props.placement,
  size: props.size
}))

const arrowClass = computed(() => arrowVariants({
  variant: props.variant,
  placement: props.placement
}))
</script> 