<script setup lang="ts">
// 页面权限
definePageMeta({
  layout: 'default',
  requiresAuth: true,
  permission: 'purchase-order:view',
});

import ComingSoon from '~/components/ComingSoon.vue';
</script>

<template>
  <ComingSoon
    title="采购订单"
    subtitle="Purchase Orders"
    icon="ShoppingBag"
  />
</template>
