<template>
  <div :class="avatarClass">
    <img 
      v-if="src && !imageError"
      :src="src" 
      :alt="alt"
      :class="imageClass"
      @error="handleImageError"
    />
    <div v-else-if="fallback" :class="fallbackClass">
      {{ fallbackText }}
    </div>
    <div v-else :class="fallbackClass">
      <User class="h-4 w-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { User } from 'lucide-vue-next'
import { cva } from 'class-variance-authority'

interface Props {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'circular' | 'square'
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Avatar',
  size: 'md',
  variant: 'circular'
})

const imageError = ref(false)

const avatarVariants = cva(
  'inline-flex items-center justify-center font-medium bg-muted text-muted-foreground overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg'
      },
      variant: {
        circular: 'rounded-full',
        square: 'rounded-md'
      }
    }
  }
)

const avatarClass = computed(() => avatarVariants({
  size: props.size,
  variant: props.variant
}))

const imageClass = computed(() => 
  `h-full w-full object-cover ${props.variant === 'circular' ? 'rounded-full' : 'rounded-md'}`
)

const fallbackClass = computed(() => 
  'h-full w-full flex items-center justify-center bg-muted text-muted-foreground'
)

const fallbackText = computed(() => {
  if (!props.fallback) return ''
  
  // 如果是中文名字，取最后一个字
  if (/[\u4e00-\u9fa5]/.test(props.fallback)) {
    return props.fallback.slice(-1)
  }
  
  // 如果是英文名字，取首字母
  return props.fallback
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const handleImageError = () => {
  imageError.value = true
}
</script> 