<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { reactiveOmit } from '@vueuse/core'
import { AlertDialogAction, type AlertDialogActionProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const props = defineProps<AlertDialogActionProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <AlertDialogAction v-bind="delegatedProps" :class="cn(buttonVariants(), props.class)">
    <slot></slot>
  </AlertDialogAction>
</template>
