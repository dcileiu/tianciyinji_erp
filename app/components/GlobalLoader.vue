<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 z-[9999] flex items-center justify-center"
  >
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
    >
      <div
        class="flex flex-col items-center gap-4 p-8 bg-background border border-border rounded-lg shadow-xl"
      >
        <Loader2 class="h-8 w-8 animate-spin text-primary" />
        <div class="text-foreground text-sm font-medium">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

const { isLoading } = useGlobalLoading();
</script>
