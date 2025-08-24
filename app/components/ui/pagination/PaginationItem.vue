<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import { type ButtonVariants, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { reactiveOmit } from '@vueuse/core'
import { PaginationListItem, type PaginationListItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const props = withDefaults(
  defineProps<
    PaginationListItemProps & {
      size?: ButtonVariants['size']
      class?: HTMLAttributes['class']
      isActive?: boolean
    }
  >(),
  {
    size: 'icon',
  },
)

const delegatedProps = reactiveOmit(props, 'class', 'size', 'isActive')
</script>

<template>
  <PaginationListItem
    data-slot="pagination-item"
    v-bind="delegatedProps"
    :class="
      cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        props.class,
      )
    "
  >
    <slot></slot>
  </PaginationListItem>
</template>
