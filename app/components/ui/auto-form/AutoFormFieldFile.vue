<script lang="ts" setup>
  import { Trash } from "lucide-vue-next";
  import { ref } from "vue";
  import { Button } from "@/components/ui/button";
  import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage,
  } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import AutoFormLabel from "./AutoFormLabel.vue";
  import type { FieldProps } from "./interface";
  import { beautifyObjectName } from "./utils";

  defineProps<FieldProps>();

  const inputFile = ref<File>();
  async function parseFileAsString(file: File | undefined): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (err) => {
          reject(err);
        };
        reader.readAsDataURL(file);
      }
    });
  }
</script>

<template>
  <FormField v-slot="slotProps" :name="fieldName">
    <FormItem v-bind="$attrs">
      <AutoFormLabel v-if="!config?.hideLabel" :required="required">
        {{ config?.label || beautifyObjectName(label ?? fieldName) }}
      </AutoFormLabel>
      <FormControl>
        <slot v-bind="slotProps">
          <Input
            type="file"
            v-if="!inputFile"
            v-bind="{ ...config?.inputProps }"
            :disabled="config?.inputProps?.disabled ?? disabled"
            @change="async (ev: InputEvent) => {
              const file = (ev.target as HTMLInputElement).files?.[0]
              inputFile = file
              const parsed = await parseFileAsString(file)
              slotProps.componentField.onInput(parsed)
            }"
          />
          <div
            class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent pl-3 pr-1 py-1 text-sm shadow-sm transition-colors"
            v-else
          >
            <p>{{ inputFile?.name }}</p>
            <Button
              aria-label="Remove file"
              class="h-[26px] w-[26px]"
              type="button"
              :size="'icon'"
              :variant="'ghost'"
              @click="() => {
                inputFile = undefined
                slotProps.componentField.onInput(undefined)
              }"
            >
              <Trash />
            </Button>
          </div>
        </slot>
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
