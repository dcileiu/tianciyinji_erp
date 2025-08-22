<template>
  <TabList :class="cn(tabsListVariants(), className)" v-bind="$attrs">
    <slot />
  </TabList>
</template>

<script setup lang="ts">
import { TabList } from '@headlessui/vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tabsListVariants = cva(
  'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground'
)

interface TabsListProps {
  className?: string
}

defineProps<TabsListProps>()
</script> 