<template>
  <div class="space-y-2">
    <Label v-if="label" :for="fieldId" :class="{ 'text-destructive': !!errorMessage }">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </Label>
    
    <div class="relative">
      <slot 
        :field="field" 
        :error-message="errorMessage" 
        :has-error="!!errorMessage"
        :field-id="fieldId"
      />
    </div>
    
    <div v-if="description" class="text-sm text-muted-foreground">
      {{ description }}
    </div>
    
    <div v-if="errorMessage" class="text-sm text-destructive">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate'
import Label from '~/components/ui/Label.vue'

interface Props {
  name: string
  label?: string
  description?: string
  required?: boolean
  rules?: any
}

const props = defineProps<Props>()

// 生成唯一的字段ID
const fieldId = computed(() => `field-${props.name}-${Math.random().toString(36).substr(2, 9)}`)

// 使用 vee-validate 字段
const { value: field, errorMessage } = useField(() => props.name, props.rules)

// 暴露字段值供父组件使用
defineExpose({
  field,
  errorMessage,
  hasError: computed(() => !!errorMessage.value)
})
</script> 