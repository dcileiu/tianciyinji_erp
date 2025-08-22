<template>
  <Menu as="div" class="relative inline-block text-left" v-bind="$attrs">
    <slot />
  </Menu>
</template>

<script setup lang="ts">
import { Menu } from '@headlessui/vue'
</script> 