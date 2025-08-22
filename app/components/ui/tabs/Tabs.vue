<template>
  <TabGroup :defaultIndex="defaultValue" :selectedIndex="modelValue" @change="$emit('update:modelValue', $event)" v-bind="$attrs">
    <slot />
  </TabGroup>
</template>

<script setup lang="ts">
import { TabGroup } from '@headlessui/vue'

interface TabsProps {
  defaultValue?: number
  modelValue?: number
}

withDefaults(defineProps<TabsProps>(), {
  defaultValue: 0,
})

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script> 