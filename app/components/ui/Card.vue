<template>
  <div :class="cn('rounded-lg border bg-card text-card-foreground shadow-sm', $props.class)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  class?: string
}

withDefaults(defineProps<Props>(), {})
</script>

<script lang="ts">
// Card子组件
export const CardHeader = defineComponent({
  name: 'CardHeader',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('flex flex-col space-y-1.5 p-6', props.class)
    }, slots.default?.())
  }
})

export const CardTitle = defineComponent({
  name: 'CardTitle',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('h3', {
      class: cn('text-2xl font-semibold leading-none tracking-tight', props.class)
    }, slots.default?.())
  }
})

export const CardDescription = defineComponent({
  name: 'CardDescription',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('p', {
      class: cn('text-sm text-muted-foreground', props.class)
    }, slots.default?.())
  }
})

export const CardContent = defineComponent({
  name: 'CardContent',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('p-6 pt-0', props.class)
    }, slots.default?.())
  }
})

export const CardFooter = defineComponent({
  name: 'CardFooter',
  props: {
    class: String
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: cn('flex items-center p-6 pt-0', props.class)
    }, slots.default?.())
  }
})
</script> 