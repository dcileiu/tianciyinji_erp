<template>
  <TabPanels>
    <TabPanel :class="cn(tabsContentVariants(), className)" v-bind="$attrs">
      <slot />
    </TabPanel>
  </TabPanels>
</template>

<script setup lang="ts">
import { TabPanels, TabPanel } from '@headlessui/vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tabsContentVariants = cva(
  'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
)

interface TabsContentProps {
  className?: string
}

defineProps<TabsContentProps>()
</script> 