<script lang="ts" setup>
  import { reactiveOmit } from "@vueuse/core";
  import type { PinInputRootEmits, PinInputRootProps } from "reka-ui";
  import { PinInputRoot, useForwardPropsEmits } from "reka-ui";
  import type { HTMLAttributes } from "vue";
  import { cn } from "@/lib/utils";

  const props = withDefaults(
    defineProps<PinInputRootProps & { class?: HTMLAttributes["class"] }>(),
    {
      modelValue: () => [],
    }
  );
  const emits = defineEmits<PinInputRootEmits>();

  const delegatedProps = reactiveOmit(props, "class");

  const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <PinInputRoot
    v-bind="forwarded"
    :class="cn('flex gap-2 items-center', props.class)"
  >
    <slot />
  </PinInputRoot>
</template>
