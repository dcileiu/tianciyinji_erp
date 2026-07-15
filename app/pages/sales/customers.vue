<script lang="ts" setup>
  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "customer:view",
  });

  await navigateTo("/master-data/customers");
</script>

<template>
  <div />
</template>
