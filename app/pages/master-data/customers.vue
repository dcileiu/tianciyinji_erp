<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">客户管理</h1>
        <p class="text-muted-color">管理客户信息、联系方式和业务关系</p>
      </div>
      <Button
        label="新建客户"
        icon="pi pi-plus"
        @click="openCustomerModal"
      />
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">搜索</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchKeyword"
                placeholder="搜索客户名称、编号..."
                class="w-full"
              />
            </span>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">状态筛选</label>
            <Dropdown
              v-model="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              class="w-full"
              show-clear
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">地区筛选</label>
            <Dropdown
              v-model="selectedRegion"
              :options="regionOptions"
              option-label="label"
              option-value="value"
              placeholder="全部地区"
              class="w-full"
              show-clear
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color opacity-0">操作</label>
            <Button
              label="重置"
              icon="pi pi-refresh"
              outlined
              class="w-full"
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card class="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <div class="text-2xl font-bold text-blue-600 mb-1">{{ filteredCustomers.length }}</div>
              <div class="text-sm text-blue-700">总客户数</div>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-users text-blue-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-green-50 dark:bg-green-900/20 border-green-200">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <div class="text-2xl font-bold text-green-600 mb-1">{{ activeCustomersCount }}</div>
              <div class="text-sm text-green-700">活跃客户</div>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i class="pi pi-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <div class="text-2xl font-bold text-purple-600 mb-1">{{ newCustomersCount }}</div>
              <div class="text-sm text-purple-700">新增客户</div>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-plus-circle text-purple-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>
            
    <!-- 客户列表 -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-color">客户列表</h3>
          <span class="text-sm text-muted-color">共 {{ filteredCustomers.length }} 个客户</span>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="filteredCustomers"
          :loading="loading"
          :paginator="true"
          :rows="pageSize"
          :total-records="filteredCustomers.length"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-users text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无客户记录</h3>
              <p class="mb-4">开始添加您的第一个客户</p>
              <Button
                label="新建客户"
                icon="pi pi-plus"
                @click="openCustomerModal"
              />
            </div>
          </template>

          <Column field="customer" header="客户信息" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :label="slotProps.data.name.charAt(0)"
                  shape="circle"
                  size="normal"
                  class="bg-primary-100 text-primary"
                />
                <div>
                  <div class="font-medium text-color">{{ slotProps.data.name }}</div>
                  <div class="text-sm text-muted-color font-mono">{{ slotProps.data.code }}</div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="contact" header="联系方式" :sortable="true">
            <template #body="slotProps">
              <div>
                <div class="font-medium text-color mb-1">{{ slotProps.data.contactName }}</div>
                <div class="text-sm text-muted-color">{{ slotProps.data.contactPhone }}</div>
              </div>
            </template>
          </Column>

          <Column field="email" header="邮箱" :sortable="true">
            <template #body="slotProps">
              <a v-if="slotProps.data.email" :href="`mailto:${slotProps.data.email}`" class="text-primary hover:underline">
                {{ slotProps.data.email }}
              </a>
              <span v-else class="text-muted-color">-</span>
            </template>
          </Column>

          <Column field="address" header="地址" :sortable="true">
            <template #body="slotProps">
              <span class="max-w-xs truncate text-sm text-muted-color" :title="slotProps.data.address">
                {{ slotProps.data.address }}
              </span>
            </template>
          </Column>

          <Column field="status" header="状态" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="getStatusText(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>

          <Column header="操作" class="w-40">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button
                  v-tooltip="'查看详情'"
                  icon="pi pi-eye"
                  outlined
                  rounded
                  size="small"
                  @click="viewCustomer(slotProps.data)"
                />
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  outlined
                  rounded
                  size="small"
                  @click="editCustomer(slotProps.data)"
                />
                <Button
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  outlined
                  rounded
                  size="small"
                  severity="danger"
                  @click="confirmDelete(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 客户详情/编辑对话框 -->
    <Dialog
      v-model:visible="showCustomerModal"
      :header="modalTitle"
      modal
      :style="{ width: '700px' }"
      class="p-fluid"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">客户编号</label>
            <InputText
              v-model="currentCustomer.code"
              placeholder="系统自动生成"
              :disabled="isEditing"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">客户名称 *</label>
            <InputText
              v-model="currentCustomer.name"
              placeholder="输入客户名称"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">联系人</label>
            <InputText
              v-model="currentCustomer.contactName"
              placeholder="输入联系人姓名"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">联系电话</label>
            <InputText
              v-model="currentCustomer.contactPhone"
              placeholder="输入联系电话"
            />
          </div>
        </div>
            
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">邮箱</label>
            <InputText
              v-model="currentCustomer.email"
              placeholder="输入邮箱地址"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">状态</label>
            <Dropdown
              v-model="currentCustomer.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="选择状态"
            />
          </div>
        </div>
            
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-color">地址</label>
          <Textarea 
            v-model="currentCustomer.address"
            placeholder="输入详细地址"
            :rows="3"
          />
        </div>
      </div>
            
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            outlined
            @click="closeCustomerModal"
          />
          <Button
            :label="isEditing ? '更新' : '创建'"
            :loading="saving"
            @click="saveCustomer"
          />
        </div>
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')
const selectedRegion = ref('')
const pageSize = ref(10)

// 对话框状态
const showCustomerModal = ref(false)
const isEditing = ref(false)
const confirm = useConfirm()

// 当前编辑的客户
const currentCustomer = ref({
  id: '',
  code: '',
  name: '',
  contactName: '',
  contactPhone: '',
  email: '',
  address: '',
  status: 'active',
  created_at: new Date(),
  updated_at: new Date()
})

// 模拟客户数据
const customers = ref([
  {
    id: '1',
    code: 'CUST-001',
    name: '苏州华智科技有限公司',
    contactName: '张经理',
    contactPhone: '138-0000-0001',
    email: 'zhang@huazhi.com',
    address: '江苏省苏州市工业园区科技大道100号',
    status: 'active',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01')
  },
  {
    id: '2',
    code: 'CUST-002',
    name: '上海浦东制造有限公司',
    contactName: '李总监',
    contactPhone: '139-0000-0002',
    email: 'li@pudong.com',
    address: '上海市浦东新区张江高科技园区',
    status: 'active',
    created_at: new Date('2025-01-02'),
    updated_at: new Date('2025-01-02')
  },
  {
    id: '3',
    code: 'CUST-003',
    name: '北京智能设备有限公司',
    contactName: '王主管',
    contactPhone: '135-0000-0003',
    email: 'wang@bjzn.com',
    address: '北京市海淀区中关村软件园',
    status: 'inactive',
    created_at: new Date('2025-01-03'),
    updated_at: new Date('2025-01-03')
  }
])

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '活跃', value: 'active' },
  { label: '非活跃', value: 'inactive' },
  { label: '暂停', value: 'suspended' }
]

// 地区选项
const regionOptions = [
  { label: '全部地区', value: '' },
  { label: '华东', value: 'east' },
  { label: '华南', value: 'south' },
  { label: '华北', value: 'north' },
  { label: '西部', value: 'west' }
]

// 计算属性
const filteredCustomers = computed(() => {
  let result = customers.value
  
  if (searchKeyword.value) {
    result = result.filter(customer =>
      customer.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
      || customer.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (selectedStatus.value) {
    result = result.filter(customer => customer.status === selectedStatus.value)
  }
  
  return result
})

const activeCustomersCount = computed(() => {
  return customers.value.filter(c => c.status === 'active').length
})

const newCustomersCount = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return customers.value.filter(c => new Date(c.created_at) > oneMonthAgo).length
})

const modalTitle = computed(() => {
  return isEditing.value ? '编辑客户' : '新建客户'
})

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    suspended: '暂停'
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    active: 'success',
    inactive: 'secondary',
    suspended: 'warn'
  }
  return severityMap[status] || 'secondary'
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedStatus.value = ''
  selectedRegion.value = ''
}

const openCustomerModal = () => {
  isEditing.value = false
  currentCustomer.value = {
    id: '',
    code: `CUST-${String(customers.value.length + 1).padStart(3, '0')}`,
    name: '',
    contactName: '',
    contactPhone: '',
    email: '',
    address: '',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  }
  showCustomerModal.value = true
}

const editCustomer = (customer: any) => {
  isEditing.value = true
  currentCustomer.value = { ...customer }
  showCustomerModal.value = true
}

const viewCustomer = (customer: any) => {
  editCustomer(customer)
  // 可以设置为只读模式
}

const confirmDelete = (customer: any) => {
  confirm.require({
    message: `确定要删除客户 "${customer.name}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteCustomer(customer.id)
    }
  })
}

const deleteCustomer = async (customerId: string) => {
  try {
    loading.value = true
    // 模拟删除操作
    const index = customers.value.findIndex(c => c.id === customerId)
    if (index !== -1) {
      customers.value.splice(index, 1)
    }
  }
  catch (error) {
    console.error('删除客户失败:', error)
  }
  finally {
    loading.value = false
  }
}

const saveCustomer = async () => {
  try {
    saving.value = true
    
    if (isEditing.value) {
      // 更新客户
      const index = customers.value.findIndex(c => c.id === currentCustomer.value.id)
      if (index !== -1) {
        customers.value[index] = {
          ...currentCustomer.value,
          updated_at: new Date()
        }
      }
    }
    else {
      // 创建新客户
      const newCustomer = {
        ...currentCustomer.value,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date()
      }
      customers.value.push(newCustomer)
    }
    
    closeCustomerModal()
  }
  catch (error) {
    console.error('保存客户失败:', error)
  }
  finally {
    saving.value = false
  }
}

const closeCustomerModal = () => {
  showCustomerModal.value = false
  isEditing.value = false
}
</script> 
