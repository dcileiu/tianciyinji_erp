<template>
  <div class="customers-container p-6 flex flex-column gap-6 bg-surface-50 min-h-full">
    <!-- 页面头部 -->
    <div class="page-header bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-2xl p-8 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-black opacity-10"></div>
      <div class="absolute -top-4 -right-4 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-white opacity-5 rounded-full"></div>
      <div class="relative z-10">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2 flex items-center">
              <i class="pi pi-users mr-3 text-4xl"></i>
              客户管理
            </h1>
            <p class="text-green-100 text-lg">管理客户信息、联系方式和业务关系，维护客户档案</p>
          </div>
          <div class="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <Button
              label="导入客户"
              icon="pi pi-upload"
              severity="secondary"
              outlined
              class="text-white border-white hover:bg-white hover:text-green-600"
              @click="importCustomers"
            />
            <Button
              label="新建客户"
              icon="pi pi-plus"
              class="bg-white text-green-600 hover:bg-green-50 border-0 shadow-lg"
              @click="openCustomerModal"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="shadow-lg border-0">
      <template #header>
        <div class="p-6 pb-0">
          <h3 class="text-lg font-bold text-surface-900 mb-1 flex items-center">
            <i class="pi pi-search mr-2 text-primary-600"></i>
            搜索与筛选
          </h3>
          <p class="text-surface-600">快速找到您需要的客户信息</p>
        </div>
      </template>
      <template #content>
        <div class="p-6 pt-0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-surface-900">搜索客户</label>
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search"></i>
                </InputIcon>
                <InputText
                  v-model="searchKeyword"
                  placeholder="搜索客户名称、编号..."
                  class="w-full"
                />
              </IconField>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-surface-900">状态筛选</label>
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
              <label class="text-sm font-semibold text-surface-900">地区筛选</label>
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
              <label class="text-sm font-semibold text-surface-900 opacity-0">操作</label>
              <div class="flex gap-2">
                <Button
                  label="重置"
                  icon="pi pi-refresh"
                  outlined
                  class="flex-1"
                  @click="resetFilters"
                />
                <Button
                  v-tooltip="'导出数据'"
                  icon="pi pi-download"
                  outlined
                  @click="exportData"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- 统计信息卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card class="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-users text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-blue-100">
                    <i class="pi pi-arrow-up mr-1"></i>
                    +12.5%
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">{{ filteredCustomers.length }}</div>
                <div class="text-blue-100">总客户数</div>
                <div class="text-xs text-blue-200 mt-2">本月新增 {{ Math.floor(filteredCustomers.length * 0.2) }} 个</div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-check-circle text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-green-100">
                    <i class="pi pi-arrow-up mr-1"></i>
                    +8.5%
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">{{ activeCustomersCount }}</div>
                <div class="text-green-100">活跃客户</div>
                <div class="text-xs text-green-200 mt-2">近30天有业务往来</div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-plus-circle text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-purple-100">
                    <i class="pi pi-arrow-up mr-1"></i>
                    +15.2%
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">{{ newCustomersCount }}</div>
                <div class="text-purple-100">新增客户</div>
                <div class="text-xs text-purple-200 mt-2">本月新注册客户</div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
            
    <!-- 客户列表 -->
    <Card class="shadow-lg border-0">
      <template #header>
        <div class="p-6 pb-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-surface-900 mb-1 flex items-center">
                <i class="pi pi-list mr-2 text-primary-600"></i>
                客户列表
              </h3>
              <p class="text-surface-600">当前共有 {{ filteredCustomers.length }} 个客户</p>
            </div>
            <div class="flex items-center gap-2">
              <Dropdown
                v-model="pageSize"
                :options="pageSizeOptions"
                option-label="label"
                option-value="value"
                class="w-32"
                size="small"
              />
              <Button
                v-tooltip="'刷新数据'"
                icon="pi pi-refresh"
                outlined
                rounded
                size="small"
                @click="refreshData"
              />
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div class="p-6 pt-0">
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
            :sort-field="'created_at'"
            :sort-order="-1"
          >
            <template #loading>
              <div class="p-6">
                <div v-for="i in 5" :key="i" class="flex align-items-center gap-4 mb-4">
                  <Skeleton shape="circle" size="3rem" />
                  <div class="flex-1">
                    <Skeleton width="100%" height="1.5rem" class="mb-2" />
                    <Skeleton width="70%" height="1rem" />
                  </div>
                  <Skeleton width="8rem" height="1.5rem" />
                  <Skeleton width="6rem" height="1.5rem" />
                  <Skeleton width="5rem" height="2rem" />
                </div>
              </div>
            </template>

            <template #empty>
              <div class="text-center py-16 text-surface-500">
                <div class="mb-6">
                  <i class="pi pi-users text-8xl text-surface-300"></i>
                </div>
                <h3 class="text-xl font-semibold mb-4">暂无客户记录</h3>
                <p class="text-surface-600 mb-6 max-w-md mx-auto">
                  您还没有添加任何客户。点击下方按钮开始添加您的第一个客户。
                </p>
                <Button
                  label="新建客户"
                  icon="pi pi-plus"
                  class="px-6 py-3"
                  @click="openCustomerModal"
                />
              </div>
            </template>

            <Column field="customer" header="客户信息" :sortable="true" style="min-width: 250px">
              <template #body="slotProps">
                <div class="flex items-center gap-4">
                  <div class="relative">
                    <Avatar
                      :label="slotProps.data.name.charAt(0)"
                      shape="circle"
                      size="large"
                      class="bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg"
                    />
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <div class="font-bold text-lg text-surface-900">{{ slotProps.data.name }}</div>
                    <div class="text-sm text-primary-600 font-mono bg-primary-50 px-2 py-1 rounded">{{ slotProps.data.code }}</div>
                    <div class="text-xs text-surface-500 mt-1">创建于 {{ formatDate(slotProps.data.created_at) }}</div>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="contact" header="联系方式" :sortable="true" style="min-width: 200px">
              <template #body="slotProps">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-user text-primary-600"></i>
                    <span class="font-semibold text-surface-900">{{ slotProps.data.contactName }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-phone text-green-600"></i>
                    <a :href="`tel:${slotProps.data.contactPhone}`" class="text-green-600 hover:underline">
                      {{ slotProps.data.contactPhone }}
                    </a>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="email" header="邮箱地址" :sortable="true" style="min-width: 200px">
              <template #body="slotProps">
                <div v-if="slotProps.data.email" class="flex items-center gap-2">
                  <i class="pi pi-envelope text-blue-600"></i>
                  <a :href="`mailto:${slotProps.data.email}`" class="text-blue-600 hover:underline">
                    {{ slotProps.data.email }}
                  </a>
                </div>
                <span v-else class="text-surface-400 italic">未设置邮箱</span>
              </template>
            </Column>

            <Column field="address" header="地址信息" :sortable="true" style="min-width: 250px">
              <template #body="slotProps">
                <div class="flex items-start gap-2">
                  <i class="pi pi-map-marker text-red-600 mt-1"></i>
                  <div>
                    <div class="text-surface-900 leading-relaxed">{{ slotProps.data.address }}</div>
                    <div class="text-xs text-surface-500 mt-1">详细地址</div>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="status" header="客户状态" :sortable="true" style="min-width: 120px">
              <template #body="slotProps">
                <div class="flex flex-col items-center gap-2">
                  <Tag
                    :value="getStatusText(slotProps.data.status)"
                    :severity="getStatusSeverity(slotProps.data.status)"
                    class="font-semibold px-3 py-1"
                  />
                  <div class="text-xs text-surface-500">{{ getStatusDescription(slotProps.data.status) }}</div>
                </div>
              </template>
            </Column>

            <Column header="操作" style="min-width: 180px" :exportable="false">
              <template #body="slotProps">
                <div class="flex gap-1 justify-center">
                  <Button
                    v-tooltip="'查看详情'"
                    icon="pi pi-eye"
                    outlined
                    rounded
                    size="small"
                    class="p-button-info"
                    @click="viewCustomer(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'编辑客户'"
                    icon="pi pi-pencil"
                    outlined
                    rounded
                    size="small"
                    class="p-button-warning"
                    @click="editCustomer(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'发送邮件'"
                    icon="pi pi-send"
                    outlined
                    rounded
                    size="small"
                    class="p-button-secondary"
                    :disabled="!slotProps.data.email"
                    @click="sendEmail(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'客户订单'"
                    icon="pi pi-shopping-cart"
                    outlined
                    rounded
                    size="small"
                    class="p-button-primary"
                    @click="viewOrders(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'删除客户'"
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
        </div>
      </template>
    </Card>

    <!-- 客户详情/编辑对话框 -->
    <Dialog
      v-model:visible="showCustomerModal"
      :header="modalTitle"
      modal
      :style="{ width: '800px' }"
      class="p-fluid customer-dialog"
      :draggable="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-users text-green-600 text-lg"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-surface-900">{{ modalTitle }}</h3>
            <p class="text-surface-600 text-sm">{{ isEditing ? '编辑客户信息' : '创建新的客户档案' }}</p>
          </div>
        </div>
      </template>

      <div class="space-y-6 py-4">
        <!-- 基本信息 -->
        <Card class="shadow-sm">
          <template #header>
            <div class="p-4 pb-0">
              <h4 class="font-semibold text-surface-900 flex items-center">
                <i class="pi pi-info-circle mr-2 text-primary-600"></i>
                基本信息
              </h4>
            </div>
          </template>
          <template #content>
            <div class="p-4 pt-0">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">客户编号</label>
                  <InputText
                    v-model="currentCustomer.code"
                    placeholder="系统自动生成"
                    :disabled="isEditing"
                    class="font-mono"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">客户名称 *</label>
                  <InputText
                    v-model="currentCustomer.name"
                    placeholder="输入客户名称"
                    :class="{ 'p-invalid': !currentCustomer.name && showValidation }"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 联系信息 -->
        <Card class="shadow-sm">
          <template #header>
            <div class="p-4 pb-0">
              <h4 class="font-semibold text-surface-900 flex items-center">
                <i class="pi pi-phone mr-2 text-primary-600"></i>
                联系信息
              </h4>
            </div>
          </template>
          <template #content>
            <div class="p-4 pt-0">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">联系人</label>
                  <InputText
                    v-model="currentCustomer.contactName"
                    placeholder="输入联系人姓名"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">联系电话</label>
                  <InputText
                    v-model="currentCustomer.contactPhone"
                    placeholder="输入联系电话"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">邮箱地址</label>
                  <InputText
                    v-model="currentCustomer.email"
                    placeholder="输入邮箱地址"
                    type="email"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">客户状态</label>
                  <Dropdown
                    v-model="currentCustomer.status"
                    :options="statusOptions.filter(s => s.value !== '')"
                    option-label="label"
                    option-value="value"
                    placeholder="选择状态"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 地址信息 -->
        <Card class="shadow-sm">
          <template #header>
            <div class="p-4 pb-0">
              <h4 class="font-semibold text-surface-900 flex items-center">
                <i class="pi pi-map-marker mr-2 text-primary-600"></i>
                地址信息
              </h4>
            </div>
          </template>
          <template #content>
            <div class="p-4 pt-0">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-surface-900">详细地址</label>
                <Textarea 
                  v-model="currentCustomer.address"
                  placeholder="输入详细地址信息..."
                  :rows="3"
                  class="w-full"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
            
      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-surface-200">
          <Button
            label="取消"
            icon="pi pi-times"
            outlined
            @click="closeCustomerModal"
          />
          <Button
            :label="isEditing ? '更新客户' : '创建客户'"
            :icon="isEditing ? 'pi pi-check' : 'pi pi-plus'"
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
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Skeleton from 'primevue/skeleton'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '客户管理 - 智能ERP管理系统'
})

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')
const selectedRegion = ref('')
const pageSize = ref(10)
const showValidation = ref(false)

// 分页选项
const pageSizeOptions = [
  { label: '10条/页', value: 10 },
  { label: '20条/页', value: 20 },
  { label: '50条/页', value: 50 }
]

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
    address: '江苏省苏州市工业园区科技大道100号华智科技园A座',
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
    address: '上海市浦东新区张江高科技园区创新大厦15楼',
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
    address: '北京市海淀区中关村软件园二期8号楼',
    status: 'inactive',
    created_at: new Date('2025-01-03'),
    updated_at: new Date('2025-01-03')
  },
  {
    id: '4',
    code: 'CUST-004',
    name: '深圳创新科技有限公司',
    contactName: '陈总经理',
    contactPhone: '137-0000-0004',
    email: 'chen@szcx.com',
    address: '深圳市南山区科技园南区深圳湾科技生态园10栋A座',
    status: 'active',
    created_at: new Date('2025-01-04'),
    updated_at: new Date('2025-01-04')
  },
  {
    id: '5',
    code: 'CUST-005',
    name: '广州精密制造有限公司',
    contactName: '刘工程师',
    contactPhone: '136-0000-0005',
    email: 'liu@gzjm.com',
    address: '广州市天河区珠江新城国际金融中心南塔36楼',
    status: 'active',
    created_at: new Date('2025-01-05'),
    updated_at: new Date('2025-01-05')
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

const getStatusDescription = (status: string) => {
  const descMap: Record<string, string> = {
    active: '正常交易',
    inactive: '暂无业务',
    suspended: '业务暂停'
  }
  return descMap[status] || ''
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedStatus.value = ''
  selectedRegion.value = ''
}

const refreshData = async () => {
  loading.value = true
  try {
    // 模拟刷新数据
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

const exportData = () => {
  console.log('导出客户数据')
  // 这里可以实现数据导出功能
}

const importCustomers = () => {
  console.log('导入客户')
  // 这里可以实现客户导入功能
}

const openCustomerModal = () => {
  isEditing.value = false
  showValidation.value = false
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
  showValidation.value = false
  currentCustomer.value = { ...customer }
  showCustomerModal.value = true
}

const viewCustomer = (customer: any) => {
  editCustomer(customer)
  // 可以设置为只读模式
}

const sendEmail = (customer: any) => {
  if (customer.email) {
    window.open(`mailto:${customer.email}`, '_blank')
  }
}

const viewOrders = (customer: any) => {
  // 跳转到该客户的订单页面
  navigateTo(`/sales/orders?customer=${customer.id}`)
}

const confirmDelete = (customer: any) => {
  confirm.require({
    message: `确定要删除客户 "${customer.name}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '确认删除',
    rejectLabel: '取消',
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
  } catch (error) {
    console.error('删除客户失败:', error)
  } finally {
    loading.value = false
  }
}

const saveCustomer = async () => {
  showValidation.value = true
  
  // 简单验证
  if (!currentCustomer.value.name) {
    return
  }
  
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
    } else {
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
  } catch (error) {
    console.error('保存客户失败:', error)
  } finally {
    saving.value = false
  }
}

const closeCustomerModal = () => {
  showCustomerModal.value = false
  isEditing.value = false
  showValidation.value = false
}
</script>

 
