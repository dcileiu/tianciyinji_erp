<template>
  <Tab :class="cn(tabsTriggerVariants(), className)" v-bind="$attrs">
    <slot />
  </Tab>
</template>

<script setup lang="ts">
import { Tab } from '@headlessui/vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm hover:bg-muted/50'
)

interface TabsTriggerProps {
  className?: string
}

defineProps<TabsTriggerProps>()
</script> 