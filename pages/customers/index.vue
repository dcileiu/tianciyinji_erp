<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        客户管理
      </h1>
      <UButton icon="i-heroicons-plus" size="lg" @click="showCreateModal = true">
        新增客户
      </UButton>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="搜索客户名称、联系人或电话..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
          @input="debouncedSearch"
        />
        <UButton variant="outline" @click="loadCustomers">
          搜索
        </UButton>
      </div>
    </div>

    <!-- 客户列表 -->
    <div class="bg-white rounded-lg shadow">
      <UTable
        :rows="customers"
        :columns="columns"
        :loading="loading"
        class="w-full"
      >
        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-pencil"
              size="sm"
              variant="outline"
              @click="editCustomer(row)"
            />
            <UButton
              icon="i-heroicons-trash"
              size="sm"
              color="red"
              variant="outline"
              @click="deleteCustomer(row)"
            />
          </div>
        </template>
      </UTable>

      <!-- 分页 -->
      <div class="flex justify-between items-center p-4 border-t">
        <div class="text-sm text-gray-500">
          共 {{ pagination.total }} 条记录
        </div>
        <UPagination
          v-model="pagination.page"
          :page-count="pagination.limit"
          :total="pagination.total"
          @update:model-value="loadCustomers"
        />
      </div>
    </div>

    <!-- 创建/编辑客户模态框 -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingCustomer ? '编辑客户' : '新增客户' }}
          </h3>
        </template>

        <UForm
          :schema="customerSchema"
          :state="customerForm"
          class="space-y-4"
          @submit="submitCustomer"
        >
          <UFormGroup label="客户名称" name="name" required>
            <UInput v-model="customerForm.name" placeholder="请输入客户名称" />
          </UFormGroup>

          <UFormGroup label="联系人" name="contact_person">
            <UInput v-model="customerForm.contact_person" placeholder="请输入联系人" />
          </UFormGroup>

          <UFormGroup label="联系电话" name="phone">
            <UInput v-model="customerForm.phone" placeholder="请输入联系电话" />
          </UFormGroup>

          <UFormGroup label="邮箱" name="email">
            <UInput v-model="customerForm.email" placeholder="请输入邮箱" type="email" />
          </UFormGroup>

          <UFormGroup label="地址" name="address">
            <UTextarea v-model="customerForm.address" placeholder="请输入地址" />
          </UFormGroup>

          <div class="flex justify-end gap-3 pt-4">
            <UButton variant="outline" @click="showCreateModal = false">
              取消
            </UButton>
            <UButton type="submit" :loading="submitting">
              {{ editingCustomer ? '更新' : '创建' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { debounce } from 'lodash-es'

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()

// 表格列定义
const columns = [
  { key: 'name', label: '客户名称' },
  { key: 'contact_person', label: '联系人' },
  { key: 'phone', label: '联系电话' },
  { key: 'email', label: '邮箱' },
  { key: 'created_at', label: '创建时间' },
  { key: 'actions', label: '操作' }
]

// 客户表单验证
const customerSchema = z.object({
  name: z.string().min(1, '客户名称不能为空'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  address: z.string().optional()
})

// 响应式数据
const customers = ref([])
const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const editingCustomer = ref(null)
const searchQuery = ref('')

// 分页数据
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// 客户表单数据
const customerForm = ref({
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: ''
})

// 防抖搜索
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  loadCustomers()
}, 500)

// 加载客户列表
const loadCustomers = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/customers', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value
      }
    })

    customers.value = data.data.map(customer => ({
      ...customer,
      created_at: new Date(customer.created_at).toLocaleDateString()
    }))

    pagination.value = data.pagination
  } catch (error) {
    toast.add({
      title: '加载失败',
      description: error.data?.message || '获取客户列表失败',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

// 提交客户表单
const submitCustomer = async () => {
  submitting.value = true
  try {
    if (editingCustomer.value) {
      // 更新客户
      await $fetch(`/api/customers/${editingCustomer.value.id}`, {
        method: 'PUT',
        body: customerForm.value
      })
      toast.add({
        title: '更新成功',
        description: '客户信息已更新',
        color: 'green'
      })
    } else {
      // 创建客户
      await $fetch('/api/customers', {
        method: 'POST',
        body: customerForm.value
      })
      toast.add({
        title: '创建成功',
        description: '客户已创建',
        color: 'green'
      })
    }

    showCreateModal.value = false
    resetForm()
    loadCustomers()
  } catch (error) {
    toast.add({
      title: '操作失败',
      description: error.data?.message || '操作失败',
      color: 'red'
    })
  } finally {
    submitting.value = false
  }
}

// 编辑客户
const editCustomer = (customer) => {
  editingCustomer.value = customer
  customerForm.value = {
    name: customer.name,
    contact_person: customer.contact_person || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || ''
  }
  showCreateModal.value = true
}

// 删除客户
const deleteCustomer = async (customer) => {
  if (!confirm(`确定要删除客户 "${customer.name}" 吗？`)) {
    return
  }

  try {
    await $fetch(`/api/customers/${customer.id}`, {
      method: 'DELETE'
    })

    toast.add({
      title: '删除成功',
      description: '客户已删除',
      color: 'green'
    })

    loadCustomers()
  } catch (error) {
    toast.add({
      title: '删除失败',
      description: error.data?.message || '删除客户失败',
      color: 'red'
    })
  }
}

// 重置表单
const resetForm = () => {
  editingCustomer.value = null
  customerForm.value = {
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  }
}

// 监听模态框关闭
watch(showCreateModal, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// 页面加载时获取数据
onMounted(() => {
  loadCustomers()
})
</script>
