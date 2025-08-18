<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        供应商管理
      </h1>
      <UButton icon="i-heroicons-plus" size="lg" @click="openCreateModal">
        新增供应商
      </UButton>
    </div>

    <!-- 搜索栏 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="搜索供应商名称、联系人或电话..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
          @input="debouncedSearch"
        />
        <UButton variant="outline" @click="loadSuppliers">
          搜索
        </UButton>
      </div>
    </div>

    <!-- 供应商列表 -->
    <div class="bg-white rounded-lg shadow">
      <UTable
        :rows="suppliers"
        :columns="columns"
        :loading="loading"
        class="w-full"
      >
        <template #status-data="{ row }">
          <UBadge :color="row.status === 'active' ? 'green' : 'red'" variant="subtle">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-pencil"
              size="sm"
              variant="outline"
              @click="editSupplier(row)"
            />
            <UButton
              :icon="row.status === 'active' ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              :color="row.status === 'active' ? 'orange' : 'green'"
              size="sm"
              variant="outline"
              @click="toggleSupplierStatus(row)"
            />
            <UButton
              icon="i-heroicons-trash"
              color="red"
              size="sm"
              variant="outline"
              @click="deleteSupplier(row)"
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
          @update:model-value="loadSuppliers"
        />
      </div>
    </div>

    <!-- 创建/编辑供应商模态框 -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ isEditing ? '编辑供应商' : '新增供应商' }}
          </h3>
        </template>

        <UForm
          :schema="supplierSchema"
          :state="supplierForm"
          class="space-y-4"
          @submit="submitSupplier"
        >
          <UFormGroup label="供应商名称" name="name" required>
            <UInput
              v-model="supplierForm.name"
              placeholder="请输入供应商名称"
            />
          </UFormGroup>

          <UFormGroup label="联系人" name="contact_person" required>
            <UInput
              v-model="supplierForm.contact_person"
              placeholder="请输入联系人姓名"
            />
          </UFormGroup>

          <UFormGroup label="联系电话" name="phone" required>
            <UInput
              v-model="supplierForm.phone"
              placeholder="请输入联系电话"
            />
          </UFormGroup>

          <UFormGroup label="邮箱" name="email">
            <UInput
              v-model="supplierForm.email"
              type="email"
              placeholder="请输入邮箱地址"
            />
          </UFormGroup>

          <UFormGroup label="地址" name="address">
            <UTextarea
              v-model="supplierForm.address"
              placeholder="请输入详细地址"
              :rows="3"
            />
          </UFormGroup>

          <UFormGroup label="状态" name="status">
            <USelect
              v-model="supplierForm.status"
              :options="statusOptions"
            />
          </UFormGroup>

          <div class="flex justify-end gap-3 pt-4">
            <UButton variant="outline" @click="closeModal">
              取消
            </UButton>
            <UButton type="submit" :loading="submitting">
              {{ isEditing ? '更新' : '创建' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- 删除确认模态框 -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-600">
            确认删除
          </h3>
        </template>

        <p class="mb-4">
          确定要删除供应商 <strong>{{ supplierToDelete?.name }}</strong> 吗？
          此操作不可撤销。
        </p>

        <div class="flex justify-end gap-3">
          <UButton variant="outline" @click="showDeleteModal = false">
            取消
          </UButton>
          <UButton color="red" :loading="deleting" @click="confirmDelete">
            删除
          </UButton>
        </div>
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
  { key: 'name', label: '供应商名称' },
  { key: 'contact_person', label: '联系人' },
  { key: 'phone', label: '联系电话' },
  { key: 'email', label: '邮箱' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

// 供应商表单验证
const supplierSchema = z.object({
  name: z.string().min(1, '供应商名称不能为空'),
  contact_person: z.string().min(1, '联系人不能为空'),
  phone: z.string().min(1, '联系电话不能为空'),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive'])
})

// 响应式数据
const suppliers = ref([])
const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const supplierToDelete = ref(null)

// 分页数据
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// 供应商表单数据
const supplierForm = ref({
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  status: 'active'
})

// 状态选项
const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
]

// 防抖搜索
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  loadSuppliers()
}, 500)

// 加载供应商列表
const loadSuppliers = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/suppliers', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value
      }
    })

    suppliers.value = data.data
    pagination.value = data.pagination
  } catch (error) {
    toast.add({
      title: '加载失败',
      description: error.data?.message || '获取供应商列表失败',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

// 打开创建模态框
const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

// 编辑供应商
const editSupplier = (supplier) => {
  isEditing.value = true
  supplierForm.value = { ...supplier }
  showModal.value = true
}

// 提交供应商表单
const submitSupplier = async () => {
  submitting.value = true
  try {
    if (isEditing.value) {
      await $fetch(`/api/suppliers/${supplierForm.value.id}`, {
        method: 'PUT',
        body: supplierForm.value
      })

      toast.add({
        title: '更新成功',
        description: '供应商信息已更新',
        color: 'green'
      })
    } else {
      await $fetch('/api/suppliers', {
        method: 'POST',
        body: supplierForm.value
      })

      toast.add({
        title: '创建成功',
        description: '供应商已创建',
        color: 'green'
      })
    }

    closeModal()
    loadSuppliers()
  } catch (error) {
    toast.add({
      title: isEditing.value ? '更新失败' : '创建失败',
      description: error.data?.message || '操作失败',
      color: 'red'
    })
  } finally {
    submitting.value = false
  }
}

// 切换供应商状态
const toggleSupplierStatus = async (supplier) => {
  try {
    const newStatus = supplier.status === 'active' ? 'inactive' : 'active'

    await $fetch(`/api/suppliers/${supplier.id}`, {
      method: 'PUT',
      body: {
        ...supplier,
        status: newStatus
      }
    })

    toast.add({
      title: '状态更新成功',
      description: `供应商已${newStatus === 'active' ? '启用' : '禁用'}`,
      color: 'green'
    })

    loadSuppliers()
  } catch (error) {
    toast.add({
      title: '状态更新失败',
      description: error.data?.message || '更新状态失败',
      color: 'red'
    })
  }
}

// 删除供应商
const deleteSupplier = (supplier) => {
  supplierToDelete.value = supplier
  showDeleteModal.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!supplierToDelete.value) { return }

  deleting.value = true
  try {
    await $fetch(`/api/suppliers/${supplierToDelete.value.id}`, {
      method: 'DELETE'
    })

    toast.add({
      title: '删除成功',
      description: '供应商已删除',
      color: 'green'
    })

    showDeleteModal.value = false
    supplierToDelete.value = null
    loadSuppliers()
  } catch (error) {
    toast.add({
      title: '删除失败',
      description: error.data?.message || '删除供应商失败',
      color: 'red'
    })
  } finally {
    deleting.value = false
  }
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  supplierForm.value = {
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadSuppliers()
})
</script>
