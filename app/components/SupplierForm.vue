<template>
  <div class="space-y-6">
    <!-- 表单头部 -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-foreground">
        {{ isEdit ? '编辑供应商' : '新增供应商' }}
      </h3>
      <Button variant="ghost" size="sm" @click="$emit('close')">
        <X class="h-4 w-4" />
      </Button>
    </div>

    <!-- 表单内容 -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 供应商编号 -->
      <div>
        <label for="supplier_no" class="block text-sm font-medium text-foreground mb-2">
          供应商编号 <span class="text-destructive">*</span>
        </label>
        <Input
          id="supplier_no"
          v-model="form.supplier_no"
          :disabled="isEdit"
          :class="errors.supplier_no ? 'border-destructive' : ''"
          placeholder="请输入供应商编号（如：SUP-001）"
          @blur="validateSingleField('supplier_no', form.supplier_no)"
        />
        <p v-if="errors.supplier_no" class="mt-1 text-sm text-destructive">
          {{ errors.supplier_no }}
        </p>
      </div>

      <!-- 供应商名称 -->
      <div>
        <label for="name" class="block text-sm font-medium text-foreground mb-2">
          供应商名称 <span class="text-destructive">*</span>
        </label>
        <Input
          id="name"
          v-model="form.name"
          :class="{
            'border-destructive': errors.name
          }"
          placeholder="请输入供应商名称"
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
          :class="{
            'border-destructive': errors.contact_person
          }"
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
          :class="{
            'border-destructive': errors.contact_phone
          }"
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
          :class="{
            'border-destructive': errors.email
          }"
          placeholder="请输入邮箱地址（可选）"
          @blur="validateSingleField('email', form.email)"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-destructive">
          {{ errors.email }}
        </p>
      </div>

      <!-- 供应商类型 -->
      <div>
        <label for="supplier_type" class="block text-sm font-medium text-foreground mb-2">
          供应商类型 <span class="text-destructive">*</span>
        </label>
        <select
          id="supplier_type"
          v-model="form.supplier_type"
          :class="[
            'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            errors.supplier_type ? 'border-destructive' : 'border-input'
          ]"
          @change="validateSingleField('supplier_type', form.supplier_type)"
        >
          <option value="">请选择供应商类型</option>
          <option value="manufacturer">制造商</option>
          <option value="distributor">分销商</option>
          <option value="service">服务商</option>
          <option value="other">其他</option>
        </select>
        <p v-if="errors.supplier_type" class="mt-1 text-sm text-destructive">
          {{ errors.supplier_type }}
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
          :class="{
            'border-destructive': errors.region
          }"
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

      <!-- 供应商评级 -->
      <div>
        <label for="rating" class="block text-sm font-medium text-foreground mb-2">
          供应商评级
        </label>
        <select
          id="rating"
          v-model="form.rating"
          class="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="A">A级（优秀）</option>
          <option value="B">B级（良好）</option>
          <option value="C">C级（一般）</option>
          <option value="D">D级（较差）</option>
        </select>
      </div>

      <!-- 供应商状态 -->
      <div v-if="isEdit">
        <label for="status" class="block text-sm font-medium text-foreground mb-2">
          供应商状态
        </label>
        <select
          id="status"
          v-model="form.status"
          class="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="active">合作中</option>
          <option value="inactive">暂停合作</option>
          <option value="suspended">终止合作</option>
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
import type { Supplier } from '~/types/database'
import { useFormValidation } from '~/composables/useFormValidation'
import { useSuppliers } from '~/composables/useSuppliers'

// Props
interface Props {
  supplier?: Supplier | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  supplier: null,
  isEdit: false
})

// Emits
interface Emits {
  close: []
  success: [supplier: Supplier]
}

const emit = defineEmits<Emits>()

// Composables
const { supplierValidationRules, createFormValidation } = useFormValidation()
const { createSupplier, updateSupplier, checkSupplierNoExists, checkEmailExists } = useSuppliers()

// 表单数据
const form = reactive({
  supplier_no: '',
  name: '',
  contact_person: '',
  contact_phone: '',
  email: '',
  address: '',
  supplier_type: '',
  region: '',
  rating: 'B' as 'A' | 'B' | 'C' | 'D',
  status: 'active' as 'active' | 'inactive' | 'suspended'
})

// 表单验证
const { errors, isValid, validateSingleField, validateAllFields, clearErrors } = createFormValidation(supplierValidationRules)

// 状态管理
const isSubmitting = ref(false)
const submitError = ref('')

// 计算属性
const isFormValid = computed(() => {
  return isValid.value && form.supplier_no && form.name && form.contact_person && form.contact_phone && form.supplier_type && form.region
})

// 初始化表单数据
const initializeForm = () => {
  if (props.isEdit && props.supplier) {
    Object.assign(form, {
      supplier_no: props.supplier.supplier_no,
      name: props.supplier.name,
      contact_person: props.supplier.contact_person,
      contact_phone: props.supplier.contact_phone,
      email: props.supplier.email || '',
      address: props.supplier.address || '',
      supplier_type: props.supplier.supplier_type,
      region: props.supplier.region,
      rating: props.supplier.rating,
      status: props.supplier.status
    })
  } else {
    // 新增模式，重置表单
    Object.assign(form, {
      supplier_no: '',
      name: '',
      contact_person: '',
      contact_phone: '',
      email: '',
      address: '',
      supplier_type: '',
      region: '',
      rating: 'B',
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
    if (props.isEdit && props.supplier) {
      // 更新供应商
      const updatedSupplier = await updateSupplier(props.supplier.id, {
        name: form.name,
        contact_person: form.contact_person,
        contact_phone: form.contact_phone,
        email: form.email || null,
        address: form.address || null,
        supplier_type: form.supplier_type as 'manufacturer' | 'distributor' | 'service' | 'other',
        region: form.region,
        rating: form.rating,
        status: form.status
      })
      emit('success', updatedSupplier)
    } else {
      // 检查供应商编号是否已存在
      const supplierNoExists = await checkSupplierNoExists(form.supplier_no)
      if (supplierNoExists) {
        errors.supplier_no = '供应商编号已存在，请使用其他编号'
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

      // 创建新供应商
      const newSupplier = await createSupplier({
        supplier_no: form.supplier_no,
        name: form.name,
        contact_person: form.contact_person,
        contact_phone: form.contact_phone,
        email: form.email || null,
        address: form.address || null,
        supplier_type: form.supplier_type as 'manufacturer' | 'distributor' | 'service' | 'other',
        region: form.region,
        rating: form.rating,
        status: 'active'
      })
      emit('success', newSupplier)
    }
  } catch (error: any) {
    console.error('Submit error:', error)
    submitError.value = error.message || '操作失败，请重试'
  } finally {
    isSubmitting.value = false
  }
}

// 监听 props 变化
watch(() => [props.supplier, props.isEdit], () => {
  initializeForm()
}, { immediate: true })

// 组件挂载时初始化
onMounted(() => {
  initializeForm()
})
</script>