<template>
  <div>
    <!-- Dialog Trigger -->
    <slot name="trigger" :open="open" :setOpen="setOpen" />
    
    <!-- Dialog Overlay and Content -->
    <Teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="handleOverlayClick"
      >
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/80" />
        
        <!-- Dialog Content -->
        <div
          class="relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
          @click.stop
        >
          <slot :open="open" :setOpen="setOpen" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const open = computed({
  get: () => props.open,
  set: (value) => {
    emit('update:open', value)
    props.onOpenChange?.(value)
  }
})

const setOpen = (value: boolean) => {
  open.value = value
}

const handleOverlayClick = () => {
  setOpen(false)
}

// Watch for external changes
watch(() => props.open, (newValue) => {
  if (newValue !== open.value) {
    open.value = newValue
  }
}, { immediate: true })
</script>

<script lang="ts">
import { cn } from '~/lib/utils'

// Dialog子组件
export const DialogContent = defineComponent({
  name: 'DialogContent',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg', props.class)
    }, slots.default?.())
  }
})

export const DialogHeader = defineComponent({
  name: 'DialogHeader',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('flex flex-col space-y-1.5 text-center sm:text-left', props.class)
    }, slots.default?.())
  }
})

export const DialogTitle = defineComponent({
  name: 'DialogTitle',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('h2', {
      class: cn('text-lg font-semibold leading-none tracking-tight', props.class)
    }, slots.default?.())
  }
})

export const DialogDescription = defineComponent({
  name: 'DialogDescription',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('p', {
      class: cn('text-sm text-muted-foreground', props.class)
    }, slots.default?.())
  }
})

export const DialogFooter = defineComponent({
  name: 'DialogFooter',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', props.class)
    }, slots.default?.())
  }
})
</script>