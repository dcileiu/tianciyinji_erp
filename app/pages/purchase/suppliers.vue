<script lang="ts" setup>
  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "supplier:view",
  });

  await navigateTo("/master-data/suppliers");
</script>

<template>
  <div />
</template>
