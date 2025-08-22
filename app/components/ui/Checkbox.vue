<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :disabled="disabled"
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      checked ? 'bg-primary text-primary-foreground' : 'bg-background',
      $attrs.class ?? ''
    )"
    @click="toggle"
    v-bind="$attrs"
  >
    <Check v-if="checked" class="h-4 w-4" />
  </button>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  checked: false,
  disabled: false
})

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

const toggle = () => {
  if (!props.disabled) {
    emit('update:checked', !props.checked)
  }
}

defineOptions({
  inheritAttrs: false,
})
</script> 