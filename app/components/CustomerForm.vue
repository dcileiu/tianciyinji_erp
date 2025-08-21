<template>
  <div class="space-y-6">
    <!-- 表单头部 -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-foreground">
        {{ isEdit ? '编辑客户' : '新增客户' }}
      </h3>
      <Button variant="ghost" size="sm" @click="$emit('close')">
        <X class="h-4 w-4" />
      </Button>
    </div>

    <!-- 表单内容 -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 客户编号 -->
      <div>
        <label for="customer_no" class="block text-sm font-medium text-foreground mb-2">
          客户编号 <span class="text-destructive">*</span>
        </label>
        <Input
          id="customer_no"
          v-model="form.customer_no"
          :disabled="isEdit"
          :class="errors.customer_no ? 'border-destructive' : ''"
          placeholder="请输入客户编号（如：CUS-001）"
          @blur="validateSingleField('customer_no', form.customer_no)"
        />
        <p v-if="errors.customer_no" class="mt-1 text-sm text-destructive">
          {{ errors.customer_no }}
        </p>
      </div>

      <!-- 客户名称 -->
      <div>
        <label for="name" class="block text-sm font-medium text-foreground mb-2">
          客户名称 <span class="text-destructive">*</span>
        </label>
        <Input
          id="name"
          v-model="form.name"
          :class="errors.name ? 'border-destructive' : ''"
          placeholder="请输入客户名称"
          @blur="validateSingleField('name', form.name)"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-destructive">
          {{ errors.name }}
        </p>
      </div>

      <!-- 联系人 -->
      <div>
        <label for="contact_person" class="block text-sm font-medium text-foreground mb-2">
          联系人 <span class="text-destructive">*</span>
        </label>
        <Input
          id="contact_person"
          v-model="form.contact_person"
          :class="errors.contact_person ? 'border-destructive' : ''"
          placeholder="请输入联系人姓名"
          @blur="validateSingleField('contact_person', form.contact_person)"
        />
        <p v-if="errors.contact_person" class="mt-1 text-sm text-destructive">
          {{ errors.contact_person }}
        </p>
      </div>

      <!-- 联系电话 -->
      <div>
        <label for="contact_phone" class="block text-sm font-medium text-foreground mb-2">
          联系电话 <span class="text-destructive">*</span>
        </label>
        <Input
          id="contact_phone"
          v-model="form.contact_phone"
          :class="errors.contact_phone ? 'border-destructive' : ''"
          placeholder="请输入手机号码或固定电话"
          @blur="validateSingleField('contact_phone', form.contact_phone)"
        />
        <p v-if="errors.contact_phone" class="mt-1 text-sm text-destructive">
          {{ errors.contact_phone }}
        </p>
      </div>

      <!-- 邮箱地址 -->
      <div>
        <label for="email" class="block text-sm font-medium text-foreground mb-2">
          邮箱地址
        </label>
        <Input
          id="email"
          v-model="form.email"
          type="email"
          :class="errors.email ? 'border-destructive' : ''"
          placeholder="请输入邮箱地址（可选）"
          @blur="validateSingleField('email', form.email)"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-destructive">
          {{ errors.email }}
        </p>
      </div>

      <!-- 客户类型 -->
      <div>
        <label for="customer_type" class="block text-sm font-medium text-foreground mb-2">
          客户类型 <span class="text-destructive">*</span>
        </label>
        <select
          id="customer_type"
          v-model="form.customer_type"
          :class="[
            'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            errors.customer_type ? 'border-destructive' : 'border-input'
          ]"
          @change="validateSingleField('customer_type', form.customer_type)"
        >
          <option value="">请选择客户类型</option>
          <option value="enterprise">企业客户</option>
          <option value="individual">个人客户</option>
          <option value="government">政府机构</option>
          <option value="other">其他</option>
        </select>
        <p v-if="errors.customer_type" class="mt-1 text-sm text-destructive">
          {{ errors.customer_type }}
        </p>
      </div>

      <!-- 所在地区 -->
      <div>
        <label for="region" class="block text-sm font-medium text-foreground mb-2">
          所在地区 <span class="text-destructive">*</span>
        </label>
        <Input
          id="region"
          v-model="form.region"
          :class="errors.region ? 'border-destructive' : ''"
          placeholder="请输入所在地区"
          @blur="validateSingleField('region', form.region)"
        />
        <p v-if="errors.region" class="mt-1 text-sm text-destructive">
          {{ errors.region }}
        </p>
      </div>

      <!-- 详细地址 -->
      <div>
        <label for="address" class="block text-sm font-medium text-foreground mb-2">
          详细地址
        </label>
        <textarea
          id="address"
          v-model="form.address"
          rows="3"
          :class="[
            'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none',
            errors.address ? 'border-destructive' : 'border-input'
          ]"
          placeholder="请输入详细地址（可选）"
          @blur="validateSingleField('address', form.address)"
        ></textarea>
        <p v-if="errors.address" class="mt-1 text-sm text-destructive">
          {{ errors.address }}
        </p>
      </div>

      <!-- 客户状态 -->
      <div v-if="isEdit">
        <label for="status" class="block text-sm font-medium text-foreground mb-2">
          客户状态
        </label>
        <select
          id="status"
          v-model="form.status"
          class="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="active">活跃</option>
          <option value="inactive">非活跃</option>
          <option value="suspended">暂停</option>
        </select>
      </div>

      <!-- 全局错误提示 -->
      <div v-if="submitError" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <AlertTriangle class="h-5 w-5 text-destructive" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-destructive">
              {{ submitError }}
            </p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" @click="$emit('close')">
          取消
        </Button>
        <Button type="submit" :disabled="isSubmitting || !isFormValid">
          <span v-if="!isSubmitting">{{ isEdit ? '更新' : '创建' }}</span>
          <span v-else class="flex items-center">
            <Loader2 class="animate-spin mr-2 h-4 w-4" />
            {{ isEdit ? '更新中...' : '创建中...' }}
          </span>
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { X, AlertTriangle, Loader2 } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import type { Customer } from '~/types/database'
import { useFormValidation } from '~/composables/useFormValidation'
import { useCustomers } from '~/composables/useCustomers'

// Props
interface Props {
  customer?: Customer | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  customer: null,
  isEdit: false
})

// Emits
interface Emits {
  close: []
  success: [customer: Customer]
}

const emit = defineEmits<Emits>()

// Composables
const { customerValidationRules, createFormValidation } = useFormValidation()
const { createCustomer, updateCustomer, checkCustomerNoExists, checkEmailExists } = useCustomers()

// 表单数据
const form = reactive({
  customer_no: '',
  name: '',
  contact_person: '',
  contact_phone: '',
  email: '',
  address: '',
  customer_type: '',
  region: '',
  status: 'active' as 'active' | 'inactive' | 'suspended'
})

// 表单验证
const { errors, isValid, validateSingleField, validateAllFields, clearErrors } = createFormValidation(customerValidationRules)

// 状态管理
const isSubmitting = ref(false)
const submitError = ref('')

// 计算属性
const isFormValid = computed(() => {
  return isValid.value && form.customer_no && form.name && form.contact_person && form.contact_phone && form.customer_type && form.region
})

// 初始化表单数据
const initializeForm = () => {
  if (props.isEdit && props.customer) {
    Object.assign(form, {
      customer_no: props.customer.customer_no,
      name: props.customer.name,
      contact_person: props.customer.contact_person,
      contact_phone: props.customer.contact_phone,
      email: props.customer.email || '',
      address: props.customer.address || '',
      customer_type: props.customer.customer_type,
      region: props.customer.region,
      status: props.customer.status
    })
  } else {
    // 新增模式，重置表单
    Object.assign(form, {
      customer_no: '',
      name: '',
      contact_person: '',
      contact_phone: '',
      email: '',
      address: '',
      customer_type: '',
      region: '',
      status: 'active'
    })
  }
  clearErrors()
  submitError.value = ''
}

// 提交表单
const handleSubmit = async () => {
  submitError.value = ''
  
  // 验证表单
  if (!validateAllFields(form)) {
    return
  }

  isSubmitting.value = true

  try {
    if (props.isEdit && props.customer) {
      // 更新客户
      const updatedCustomer = await updateCustomer(props.customer.id, {
        name: form.name,
        contact_person: form.contact_person,
        contact_phone: form.contact_phone,
        email: form.email || undefined,
        address: form.address || undefined,
        customer_type: form.customer_type as 'enterprise' | 'individual' | 'government' | 'other',
        region: form.region,
        status: form.status
      })
      emit('success', updatedCustomer)
    } else {
      // 检查客户编号是否已存在
      const customerNoExists = await checkCustomerNoExists(form.customer_no)
      if (customerNoExists) {
        errors.customer_no = '客户编号已存在，请使用其他编号'
        return
      }

      // 检查邮箱是否已存在（如果提供了邮箱）
      if (form.email) {
        const emailExists = await checkEmailExists(form.email)
        if (emailExists) {
          errors.email = '邮箱地址已存在，请使用其他邮箱'
          return
        }
      }

      // 创建新客户
      const newCustomer = await createCustomer({
        customer_no: form.customer_no,
        name: form.name,
        contact_person: form.contact_person,
        contact_phone: form.contact_phone,
        email: form.email || undefined,
        address: form.address || undefined,
        customer_type: form.customer_type as 'enterprise' | 'individual' | 'government' | 'other',
        region: form.region,
        status: 'active'
      })
      emit('success', newCustomer)
    }
  } catch (error: any) {
    console.error('Submit error:', error)
    submitError.value = error.message || '操作失败，请重试'
  } finally {
    isSubmitting.value = false
  }
}

// 监听 props 变化
watch(() => [props.customer, props.isEdit], () => {
  initializeForm()
}, { immediate: true })

// 组件挂载时初始化
onMounted(() => {
  initializeForm()
})
</script>