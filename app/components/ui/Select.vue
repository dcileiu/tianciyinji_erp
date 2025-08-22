<template>
  <div class="relative">
    <!-- Select Trigger -->
    <button
      type="button"
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        $props.class
      )"
      :disabled="disabled"
      @click="toggleOpen"
      v-bind="$attrs"
    >
      <span v-if="selectedOption" class="block truncate">{{ selectedOption.label }}</span>
      <span v-else class="block truncate text-muted-foreground">{{ placeholder }}</span>
      <ChevronDown class="h-4 w-4 opacity-50" />
    </button>

    <!-- Select Content -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50"
        @click="closeSelect"
      >
        <div
          ref="contentRef"
          class="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          :style="contentStyle"
          @click.stop
        >
          <div class="max-h-60 overflow-auto">
            <div
              v-for="option in options"
              :key="option.value"
              class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              :class="{
                'bg-accent text-accent-foreground': option.value === modelValue
              }"
              @click="selectOption(option)"
            >
              <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Check v-if="option.value === modelValue" class="h-4 w-4" />
              </span>
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Check } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

interface SelectOption {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const contentRef = ref<HTMLElement>()
const contentStyle = ref({})

const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue)
})

const toggleOpen = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      updateContentPosition()
    })
  }
}

const closeSelect = () => {
  isOpen.value = false
}

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value)
  closeSelect()
}

const updateContentPosition = () => {
  // Simple positioning logic - can be enhanced
  contentStyle.value = {
    top: '100%',
    left: '0',
    width: '100%'
  }
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      closeSelect()
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>