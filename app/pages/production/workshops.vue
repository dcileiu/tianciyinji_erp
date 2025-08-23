<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">车间管理</h1>
        <p class="text-muted-color">管理生产车间和工作中心，监控设备状态和产能</p>
      </div>
      <div>
        <Button
          label="新建车间"
          icon="pi pi-plus"
          class="create-btn"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- 车间概览统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-blue-600 mb-1">{{ stats.totalWorkshops }}</div>
              <div class="text-sm text-muted-color mb-2">总车间数</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+2</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-home text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-green-600 mb-1">{{ stats.activeWorkshops }}</div>
              <div class="text-sm text-muted-color mb-2">运行中</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-check-circle"></i>
                <span>正常</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-check-circle text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-orange-600 mb-1">{{ stats.maintenanceWorkshops }}</div>
              <div class="text-sm text-muted-color mb-2">维护中</div>
              <div class="flex items-center gap-1 text-sm text-orange-600">
                <i class="pi pi-exclamation-triangle"></i>
                <span>需关注</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-exclamation-triangle text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-purple-600 mb-1">{{ stats.totalEquipment }}</div>
              <div class="text-sm text-muted-color mb-2">设备总数</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+5</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-cog text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 筛选器 -->
    <Card class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold text-color">筛选条件</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">车间状态</label>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="选择状态"
              show-clear
          />
        </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">车间类型</label>
            <Dropdown
              v-model="typeFilter"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="选择类型"
              show-clear
            />
        </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">负责人</label>
            <Dropdown
              v-model="managerFilter"
              :options="managerOptions"
              option-label="label"
              option-value="value"
              placeholder="选择负责人"
              show-clear
            />
        </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">搜索</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchQuery"
                placeholder="搜索车间名称、编码..."
          />
            </span>
          </div>
        </div>
      </template>
    </Card>

    <!-- 车间列表 -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-color">车间列表</h3>
          <span class="text-sm text-muted-color">共 {{ filteredWorkshops.length }} 个车间</span>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="filteredWorkshops"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :total-records="filteredWorkshops.length"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
          class="p-4"
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-home text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无车间数据</h3>
              <p class="mb-4">开始创建您的第一个车间</p>
              <Button
                label="新建车间"
                icon="pi pi-plus"
                @click="showCreateDialog = true"
              />
            </div>
          </template>

          <Column field="name" header="车间名称" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-100 rounded-border flex items-center justify-center">
                  <i class="pi pi-home text-primary"></i>
                </div>
                <div>
                  <div class="font-medium text-color mb-1">{{ slotProps.data.name }}</div>
                  <div class="text-sm text-muted-color font-mono">{{ slotProps.data.code }}</div>
                </div>
                </div>
            </template>
          </Column>

          <Column field="type" header="车间类型" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="getTypeText(slotProps.data.type)"
                :severity="getTypeSeverity(slotProps.data.type)"
              />
            </template>
          </Column>

          <Column field="manager" header="负责人" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <Avatar
                  :label="slotProps.data.manager?.charAt(0)"
                  shape="circle"
                  size="normal"
                  class="bg-surface-200 text-surface-700"
                />
                <span class="font-medium">{{ slotProps.data.manager || '未指定' }}</span>
                </div>
            </template>
          </Column>

          <Column field="equipment_count" header="设备数量" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-lg">{{ slotProps.data.equipment_count }}</span>
                <span class="text-sm text-muted-color">台</span>
                </div>
            </template>
          </Column>

          <Column field="capacity" header="设计产能" :sortable="true">
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.capacity }} 件/日</span>
            </template>
          </Column>

          <Column field="utilization" header="产能利用率" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <ProgressBar
                  :value="slotProps.data.utilization"
                  class="w-20"
                  :class="{
                    'bg-green-100': slotProps.data.utilization >= 80,
                    'bg-orange-100': slotProps.data.utilization >= 60 && slotProps.data.utilization < 80,
                    'bg-red-100': slotProps.data.utilization < 60,
                  }"
                />
                <span class="text-sm font-medium">{{ slotProps.data.utilization }}%</span>
                </div>
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
                  @click="viewWorkshop(slotProps.data)"
                />
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  outlined
                  rounded
                  size="small"
                  @click="editWorkshop(slotProps.data)"
                />
                <Button
                  v-tooltip="'设备管理'"
                  icon="pi pi-cog"
                  outlined
                  rounded
                  size="small"
                  @click="manageEquipment(slotProps.data)"
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

    <!-- 新建/编辑车间对话框 -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="editingWorkshop ? '编辑车间' : '新建车间'"
      modal
      :style="{ width: '600px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="workshopCode" class="text-sm font-medium text-color">车间编码</label>
            <InputText
              id="workshopCode"
              v-model="workshopForm.code"
              placeholder="输入车间编码"
              :disabled="!!editingWorkshop"
            />
                </div>
          <div class="flex flex-col gap-2">
            <label for="workshopName" class="text-sm font-medium text-color">车间名称</label>
            <InputText
              id="workshopName"
              v-model="workshopForm.name"
              placeholder="输入车间名称"
            />
                  </div>
                </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="workshopType" class="text-sm font-medium text-color">车间类型</label>
            <Dropdown
              id="workshopType"
              v-model="workshopForm.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="选择车间类型"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="workshopStatus" class="text-sm font-medium text-color">状态</label>
            <Dropdown
              id="workshopStatus"
              v-model="workshopForm.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="选择状态"
            />
      </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="workshopManager" class="text-sm font-medium text-color">负责人</label>
            <InputText
              id="workshopManager"
              v-model="workshopForm.manager"
              placeholder="输入负责人姓名"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="workshopCapacity" class="text-sm font-medium text-color">设计产能（件/日）</label>
            <InputNumber
              id="workshopCapacity"
              v-model="workshopForm.capacity"
              placeholder="输入设计产能"
              :min="0"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="workshopLocation" class="text-sm font-medium text-color">车间位置</label>
          <InputText
            id="workshopLocation"
            v-model="workshopForm.location"
            placeholder="输入车间位置"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="workshopDescription" class="text-sm font-medium text-color">描述</label>
          <Textarea
            id="workshopDescription"
            v-model="workshopForm.description"
            placeholder="输入车间描述"
            rows="3"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            outlined
            @click="closeCreateDialog"
          />
          <Button
            :label="editingWorkshop ? '更新' : '创建'"
            :loading="saving"
            @click="saveWorkshop"
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
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const statusFilter = ref('')
const typeFilter = ref('')
const managerFilter = ref('')
const searchQuery = ref('')

// 对话框状态
const showCreateDialog = ref(false)
const editingWorkshop = ref<any>(null)
const confirm = useConfirm()

// 车间表单
const workshopForm = ref({
  code: '',
  name: '',
  type: '',
  status: 'active',
  manager: '',
  capacity: 0,
  location: '',
  description: ''
})

// 统计数据
const stats = ref({
  totalWorkshops: 12,
  activeWorkshops: 8,
  maintenanceWorkshops: 2,
  totalEquipment: 156
})

// 状态选项
const statusOptions = ref([
  { label: '运行中', value: 'active' },
  { label: '维护中', value: 'maintenance' },
  { label: '停产', value: 'inactive' }
])

// 类型选项
const typeOptions = ref([
  { label: '机械加工', value: 'machining' },
  { label: '装配', value: 'assembly' },
  { label: '检测', value: 'testing' },
  { label: '包装', value: 'packaging' },
  { label: '喷涂', value: 'painting' }
])

// 负责人选项
const managerOptions = ref([
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' }
])

// 模拟车间数据
const workshops = ref([
  {
    id: '1',
    code: 'WS001',
    name: '机械加工车间A',
    type: 'machining',
    status: 'active',
    manager: '张三',
    equipment_count: 25,
    capacity: 500,
    utilization: 85,
    location: '1号厂房',
    description: '主要负责金属零件的精密加工'
  },
  {
    id: '2',
    code: 'WS002',
    name: '装配车间B',
    type: 'assembly',
    status: 'active',
    manager: '李四',
    equipment_count: 18,
    capacity: 300,
    utilization: 72,
    location: '2号厂房',
    description: '产品最终装配和调试'
  },
  {
    id: '3',
    code: 'WS003',
    name: '检测车间C',
    type: 'testing',
    status: 'maintenance',
    manager: '王五',
    equipment_count: 12,
    capacity: 200,
    utilization: 45,
    location: '3号厂房',
    description: '产品质量检测和认证'
  },
  {
    id: '4',
    code: 'WS004',
    name: '包装车间D',
    type: 'packaging',
    status: 'active',
    manager: '赵六',
    equipment_count: 8,
    capacity: 800,
    utilization: 90,
    location: '4号厂房',
    description: '产品包装和发货准备'
  }
])

// 计算属性
const filteredWorkshops = computed(() => {
  let result = workshops.value

  if (searchQuery.value) {
    result = result.filter(workshop =>
      workshop.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || workshop.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    result = result.filter(workshop => workshop.status === statusFilter.value)
  }

  if (typeFilter.value) {
    result = result.filter(workshop => workshop.type === typeFilter.value)
  }

  if (managerFilter.value) {
    result = result.filter(workshop => workshop.manager === managerFilter.value)
  }

  return result
})

// 方法
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    machining: '机械加工',
    assembly: '装配',
    testing: '检测',
    packaging: '包装',
    painting: '喷涂'
  }
  return typeMap[type] || type
}

const getTypeSeverity = (type: string) => {
  const severityMap: Record<string, string> = {
    machining: 'info',
    assembly: 'success',
    testing: 'warn',
    packaging: 'secondary',
    painting: 'help'
  }
  return severityMap[type] || 'secondary'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '运行中',
    maintenance: '维护中',
    inactive: '停产'
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    active: 'success',
    maintenance: 'warn',
    inactive: 'danger'
  }
  return severityMap[status] || 'secondary'
}

const viewWorkshop = (workshop: any) => {
  console.log('查看车间详情:', workshop)
  // 这里可以实现查看详情功能
}

const editWorkshop = (workshop: any) => {
  editingWorkshop.value = workshop
  Object.assign(workshopForm.value, {
    code: workshop.code,
    name: workshop.name,
    type: workshop.type,
    status: workshop.status,
    manager: workshop.manager,
    capacity: workshop.capacity,
    location: workshop.location,
    description: workshop.description
  })
  showCreateDialog.value = true
}

const manageEquipment = (workshop: any) => {
  console.log('管理车间设备:', workshop)
  // 这里可以实现设备管理功能
}

const confirmDelete = (workshop: any) => {
  confirm.require({
    message: `确定要删除车间 "${workshop.name}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteWorkshop(workshop.id)
    }
  })
}

const deleteWorkshop = async (id: string) => {
  const index = workshops.value.findIndex(w => w.id === id)
  if (index !== -1) {
    workshops.value.splice(index, 1)
  }
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  editingWorkshop.value = null
  workshopForm.value = {
    code: '',
    name: '',
    type: '',
    status: 'active',
    manager: '',
    capacity: 0,
    location: '',
    description: ''
  }
}

const saveWorkshop = async () => {
  saving.value = true
  try {
    if (editingWorkshop.value) {
      // 更新车间
      const index = workshops.value.findIndex(w => w.id === editingWorkshop.value?.id)
      if (index !== -1) {
        workshops.value[index] = {
          ...workshops.value[index],
          code: workshopForm.value.code,
          name: workshopForm.value.name,
          type: workshopForm.value.type,
          status: workshopForm.value.status,
          manager: workshopForm.value.manager,
          capacity: workshopForm.value.capacity,
          location: workshopForm.value.location,
          description: workshopForm.value.description
        }
      }
    }
    else {
      // 新增车间
      const newWorkshop = {
        id: Date.now().toString(),
        code: workshopForm.value.code,
        name: workshopForm.value.name,
        type: workshopForm.value.type,
        status: workshopForm.value.status,
        manager: workshopForm.value.manager,
        equipment_count: 0,
        capacity: workshopForm.value.capacity,
        utilization: 0,
        location: workshopForm.value.location,
        description: workshopForm.value.description
      }
      workshops.value.push(newWorkshop)
    }
    
    closeCreateDialog()
  }
  finally {
    saving.value = false
  }
}
</script>


