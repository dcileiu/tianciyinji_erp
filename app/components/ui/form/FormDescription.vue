<script lang="ts" setup>
  import type { HTMLAttributes } from "vue";
  import { cn } from "@/lib/utils";
  import { useFormField } from "./useFormField";

  const props = defineProps<{
    class?: HTMLAttributes["class"];
  }>();

  const { formDescriptionId } = useFormField();
</script>

<template>
  <p
    :class="cn('text-sm text-muted-foreground', props.class)"
    :id="formDescriptionId"
  >
    <slot />
  </p>
</template>
