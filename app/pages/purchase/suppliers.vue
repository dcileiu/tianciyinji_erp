<script setup lang="ts">
// 页面权限
definePageMeta({
  layout: 'default',
  requiresAuth: true,
  permission: 'purchase-supplier:view',
});

import ComingSoon from '~/components/ComingSoon.vue';
</script>

<template>
  <ComingSoon
    title="供应商管理"
    subtitle="Supplier Management"
    icon="Building"
  />
</template>
