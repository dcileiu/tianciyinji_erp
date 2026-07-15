<script generic="T extends z.ZodAny" lang="ts" setup>
  import { PlusIcon, TrashIcon } from "lucide-vue-next";
  import { FieldArray, FieldContextKey, useField } from "vee-validate";
  import { computed, provide } from "vue";
  import { type ZodAny, ZodArray, ZodDefault, type z } from "zod";
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  import { Button } from "@/components/ui/button";
  import { FormItem, FormMessage } from "@/components/ui/form";
  import { Separator } from "@/components/ui/separator";
  import AutoFormField from "./AutoFormField.vue";
  import AutoFormLabel from "./AutoFormLabel.vue";
  import type { Config, ConfigItem } from "./interface";
  import { beautifyObjectName, getBaseType } from "./utils";

  const props = defineProps<{
    fieldName: string;
    required?: boolean;
    config?: Config<T>;
    schema?: ZodArray<T>;
    disabled?: boolean;
  }>();

  function isZodArray(
    item: ZodArray<any> | ZodDefault<any>
  ): item is ZodArray<any> {
    return item instanceof ZodArray;
  }

  function isZodDefault(
    item: ZodArray<any> | ZodDefault<any>
  ): item is ZodDefault<any> {
    return item instanceof ZodDefault;
  }

  const itemShape = computed(() => {
    if (!props.schema) {
      return;
    }

    const schema: ZodAny = isZodArray(props.schema)
      ? props.schema._def.type
      : isZodDefault(props.schema)
        ? // @ts-expect-error missing schema
          props.schema._def.innerType._def.type
        : null;

    return {
      type: getBaseType(schema),
      schema,
    };
  });

  const fieldContext = useField(props.fieldName);
  // @ts-expect-error ignore missing `id`
  provide(FieldContextKey, fieldContext);
</script>

<template>
  <FieldArray as="section" v-slot="{ fields, remove, push }" :name="fieldName">
    <slot v-bind="props">
      <Accordion
        as-child
        class="w-full"
        collapsible
        type="multiple"
        :disabled="disabled"
      >
        <FormItem>
          <AccordionItem class="border-none" :value="fieldName">
            <AccordionTrigger>
              <AutoFormLabel class="text-base" :required="required">
                {{ schema?.description || beautifyObjectName(fieldName) }}
              </AutoFormLabel>
            </AccordionTrigger>

            <AccordionContent>
              <template v-for="(field, index) of fields" :key="field.key">
                <div class="mb-4 p-1">
                  <AutoFormField
                    :config="config as ConfigItem"
                    :field-name="`${fieldName}[${index}]`"
                    :label="fieldName"
                    :shape="itemShape!"
                  />

                  <div class="!my-4 flex justify-end">
                    <Button
                      size="icon"
                      type="button"
                      variant="secondary"
                      @click="remove(index)"
                    >
                      <TrashIcon :size="16" />
                    </Button>
                  </div>
                  <Separator v-if="!field.isLast" />
                </div>
              </template>

              <Button
                class="mt-4 flex items-center"
                type="button"
                variant="secondary"
                @click="push(null)"
              >
                <PlusIcon class="mr-2" :size="16" />
                Add
              </Button>
            </AccordionContent>

            <FormMessage />
          </AccordionItem>
        </FormItem>
      </Accordion>
    </slot>
  </FieldArray>
</template>
