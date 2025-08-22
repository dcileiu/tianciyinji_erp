<template>
  <form @submit="onSubmit" :class="formClass">
    <slot :errors="errors" :is-submitting="isSubmitting" :values="values" />
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import type { GenericObject } from 'vee-validate'

interface Props {
  validationSchema?: any
  initialValues?: Record<string, any>
  formClass?: string
}

interface Emits {
  submit: [values: GenericObject, actions: { setFieldError: (field: string, message: string) => void }]
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({}),
  formClass: 'space-y-4'
})

const emit = defineEmits<Emits>()

// 使用 vee-validate 表单
const { handleSubmit, errors, isSubmitting, values, setFieldError } = useForm({
  validationSchema: props.validationSchema,
  initialValues: props.initialValues
})

// 处理表单提交
const onSubmit = handleSubmit((values) => {
  emit('submit', values, { setFieldError })
})

// 暴露表单方法供父组件使用
defineExpose({
  errors,
  isSubmitting,
  values,
  setFieldError,
  handleSubmit: onSubmit
})
</script> 