<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-color">生产计划管理</h1>
        <p class="text-muted-color mt-1">
          制定和调整生产计划，优化生产资源配置
        </p>
      </div>
      <Button 
        label="新建生产计划"
        icon="pi pi-plus"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- 计划概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
        <div class="flex items-center">
          <div class="p-3 bg-blue-500/10 rounded-full">
              <i class="pi pi-calendar text-blue-600 text-xl"></i>
          </div>
          <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">
              本周计划
            </p>
              <p class="text-2xl font-semibold text-color">
              {{ planStats?.thisWeekPlans || 0 }}
            </p>
          </div>
        </div>
        </template>
      </Card>

      <Card>
        <template #content>
        <div class="flex items-center">
          <div class="p-3 bg-green-500/10 rounded-full">
              <i class="pi pi-check-circle text-green-600 text-xl"></i>
          </div>
          <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">
              执行中
            </p>
              <p class="text-2xl font-semibold text-color">
              {{ planStats?.executing || 0 }}
            </p>
          </div>
        </div>
        </template>
      </Card>

      <Card>
        <template #content>
        <div class="flex items-center">
          <div class="p-3 bg-yellow-500/10 rounded-full">
              <i class="pi pi-clock text-yellow-600 text-xl"></i>
          </div>
          <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">
              待审核
            </p>
              <p class="text-2xl font-semibold text-color">
              {{ planStats?.pending || 0 }}
            </p>
          </div>
        </div>
        </template>
      </Card>

      <Card>
        <template #content>
        <div class="flex items-center">
          <div class="p-3 bg-purple-500/10 rounded-full">
              <i class="pi pi-chart-line text-purple-600 text-xl"></i>
          </div>
          <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">
              产能利用率
            </p>
              <p class="text-2xl font-semibold text-color">
              {{ planStats?.capacityUtilization || 0 }}%
            </p>
          </div>
        </div>
        </template>
      </Card>
    </div>

    <!-- 筛选和搜索 -->
    <Card>
      <template #content>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
            <label class="text-sm font-medium text-color mb-2 block">
            计划名称
          </label>
            <InputText
            v-model="searchQuery"
            placeholder="输入计划名称搜索"
            class="w-full"
          />
        </div>
        <div>
            <label class="text-sm font-medium text-color mb-2 block">
            计划状态
          </label>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
        </div>
        <div>
            <label class="text-sm font-medium text-color mb-2 block">
              车间
          </label>
            <Dropdown
              v-model="workshopFilter"
              :options="workshopOptions"
              option-label="label"
              option-value="value"
              placeholder="全部车间"
              show-clear
              class="w-full"
            />
          </div>
          <div class="flex items-end">
            <Button
              label="重置筛选"
              icon="pi pi-filter-slash"
              outlined
              class="w-full"
              @click="resetFilters"
            />
        </div>
        </div>
      </template>
    </Card>

    <!-- 生产计划表格 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">生产计划列表</h3>
          <div class="flex items-center gap-2">
            <Button
              label="批量操作"
              icon="pi pi-cog"
              outlined
              size="small"
            />
            <Button
              label="导出计划"
              icon="pi pi-download"
              outlined
              size="small"
            />
                  </div>
                </div>
      </template>

      <template #content>
        <DataTable
          v-model:selection="selectedPlans"
          :value="filteredPlans"
          :loading="loading"
          :paginator="true"
          :rows="15"
          :rows-per-page-options="[10, 15, 25]"
          data-key="id"
          class="p-datatable-sm"
          selection-mode="multiple"
        >
          <Column selection-mode="multiple" :exportable="false"></Column>
          
          <Column field="plan_name" header="计划名称" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <Avatar
                  :label="slotProps.data.plan_name.charAt(0)"
                  shape="circle"
                  size="small"
                />
                <span class="font-medium">{{ slotProps.data.plan_name }}</span>
                </div>
            </template>
          </Column>
          
          <Column field="workshop_name" header="车间" sortable>
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.workshop_name"
                severity="info"
              />
            </template>
          </Column>
          
          <Column field="start_date" header="开始日期" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.start_date) }}
              </span>
            </template>
          </Column>
          
          <Column field="end_date" header="结束日期" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.end_date) }}
              </span>
            </template>
          </Column>
          
          <Column field="total_orders" header="订单数量" sortable>
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.total_orders }}</span>
            </template>
          </Column>
          
          <Column field="completed_orders" header="已完成" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <span class="font-medium">{{ slotProps.data.completed_orders }}</span>
                <ProgressBar 
                  :value="(slotProps.data.completed_orders / slotProps.data.total_orders) * 100"
                  class="w-20"
                  :show-value="false"
                />
                </div>
            </template>
          </Column>
          
          <Column field="capacity_utilization" header="产能利用率" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <span class="font-medium">{{ slotProps.data.capacity_utilization }}%</span>
                <ProgressBar 
                  :value="slotProps.data.capacity_utilization"
                  class="w-16"
                  :show-value="false"
                />
      </div>
            </template>
          </Column>
          
          <Column field="status" header="状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="getStatusDisplayName(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
          
          <Column header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex items-center space-x-1">
                <Button
                  v-tooltip="'查看详情'"
                  icon="pi pi-eye"
                  rounded
                  text
                  size="small"
                  @click="viewPlan(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft' || slotProps.data.status === 'pending'"
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="editPlan(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  v-tooltip="'提交审核'"
                  icon="pi pi-send"
                  rounded
                  text
                  size="small"
                  @click="submitPlan(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'pending'"
                  v-tooltip="'审核通过'"
                  icon="pi pi-check"
                  rounded
                  text
                  size="small"
                  @click="approvePlan(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'approved'"
                  v-tooltip="'开始执行'"
                  icon="pi pi-play"
                  rounded
                  text
                  size="small"
                  @click="startPlan(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status !== 'completed' && slotProps.data.status !== 'cancelled'"
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  @click="confirmDeletePlan(slotProps.data)"
        />
      </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 生产计划对话框 -->
    <Dialog
      v-model:visible="showCreateDialog"
      header="新建生产计划"
      :style="{ width: '900px' }"
      modal
      class="p-fluid"
    >
      <template #default>
          <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">计划名称 *</label>
              <InputText
                v-model="planForm.plan_name"
                placeholder="请输入计划名称"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">车间 *</label>
              <Dropdown
                v-model="planForm.workshop_id"
                :options="workshopOptions"
                option-label="label"
                option-value="value"
                placeholder="选择车间"
                required
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">开始日期 *</label>
              <Calendar
                v-model="planForm.start_date"
                placeholder="选择开始日期"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">结束日期 *</label>
              <Calendar
                v-model="planForm.end_date"
                placeholder="选择结束日期"
                required
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">计划说明</label>
            <Textarea
              v-model="planForm.description"
              placeholder="请输入计划说明"
              :rows="4"
              />
            </div>
          
          <!-- 计划订单列表 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-color">计划订单</label>
              <Button
                label="添加订单"
                icon="pi pi-plus"
                text
                size="small"
                @click="addPlanOrder"
              />
            </div>
            
            <DataTable
              :value="planForm.orders"
              class="p-datatable-sm"
            >
              <Column field="order_no" header="订单号">
                <template #body="slotProps">
                  <Dropdown
                    v-model="slotProps.data.order_no"
                    :options="availableOrders"
                    option-label="label"
                    option-value="value"
                    placeholder="选择订单"
                    class="w-full"
                />
                </template>
              </Column>
              
              <Column field="quantity" header="计划数量">
                <template #body="slotProps">
                  <InputNumber
                    v-model="slotProps.data.quantity"
                    :min="1"
                    show-buttons
                />
                </template>
              </Column>
              
              <Column field="priority" header="优先级">
                <template #body="slotProps">
                  <Dropdown
                    v-model="slotProps.data.priority"
                    :options="priorityOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="选择优先级"
                    class="w-full"
                  />
                </template>
              </Column>
              
              <Column header="操作" :exportable="false">
                <template #body="slotProps">
                  <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    size="small"
                    severity="danger"
                    @click="removePlanOrder(slotProps.index)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
      </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            icon="pi pi-times"
            outlined
            @click="showCreateDialog = false"
          />
          <Button
            label="保存"
            icon="pi pi-check"
            :loading="saving"
            @click="savePlan"
          />
        </div>
      </template>
    </Dialog>
    
    <!-- 确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '生产计划管理 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const selectedPlans = ref([])
const confirm = useConfirm()

// 筛选条件
const searchQuery = ref('')
const statusFilter = ref('')
const workshopFilter = ref('')

// 表单数据
const planForm = ref({
  plan_name: '',
  workshop_id: '',
  start_date: new Date(),
  end_date: null as Date | null,
  description: '',
  orders: [] as any[]
})

// 统计数据
const planStats = ref({
  thisWeekPlans: 12,
  executing: 8,
  pending: 3,
  capacityUtilization: 85
})

// 选项数据
const statusOptions = ref([
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已审核', value: 'approved' },
  { label: '执行中', value: 'executing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
])

const workshopOptions = ref([
  { label: '装配车间', value: 'assembly' },
  { label: '机加工车间', value: 'machining' },
  { label: '喷涂车间', value: 'painting' },
  { label: '包装车间', value: 'packaging' }
])

const priorityOptions = ref([
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
])

const availableOrders = ref([
  { label: 'PO-2024-001', value: 'PO-2024-001' },
  { label: 'PO-2024-002', value: 'PO-2024-002' },
  { label: 'PO-2024-003', value: 'PO-2024-003' }
])

// 模拟数据
const mockPlans = ref([
  {
    id: '1',
    plan_name: '第一季度生产计划',
    workshop_name: '装配车间',
    start_date: new Date('2024-01-15'),
    end_date: new Date('2024-03-31'),
    total_orders: 25,
    completed_orders: 18,
    capacity_utilization: 85,
    status: 'executing'
  },
  {
    id: '2',
    plan_name: '紧急订单生产计划',
    workshop_name: '机加工车间',
    start_date: new Date('2024-01-20'),
    end_date: new Date('2024-02-15'),
    total_orders: 8,
    completed_orders: 8,
    capacity_utilization: 95,
    status: 'completed'
  }
])

// 计算属性
const filteredPlans = computed(() => {
  let result = mockPlans.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(plan =>
      plan.plan_name.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    result = result.filter(plan => plan.status === statusFilter.value)
  }

  if (workshopFilter.value) {
    result = result.filter(plan => plan.workshop_name === workshopFilter.value)
  }

  return result
})

// 映射对象
const statusMap: Record<string, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已审核',
  executing: '执行中',
  completed: '已完成',
  cancelled: '已取消'
}

const statusSeverityMap: Record<string, string> = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'info',
  executing: 'success',
  completed: 'success',
  cancelled: 'danger'
}

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'info'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  workshopFilter.value = ''
}

const viewPlan = (plan: any) => {
  console.log('查看计划:', plan.plan_name)
}

const editPlan = (plan: any) => {
  console.log('编辑计划:', plan.plan_name)
}

const submitPlan = async (plan: any) => {
  confirm.require({
    message: `确定要提交计划 ${plan.plan_name} 进行审核吗？`,
    header: '提交审核',
    icon: 'pi pi-send',
    accept: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const index = mockPlans.value.findIndex(p => p.id === plan.id)
        if (index !== -1) {
          mockPlans.value[index].status = 'pending'
        }
      }
      catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

const approvePlan = async (plan: any) => {
  confirm.require({
    message: `确定要审核通过计划 ${plan.plan_name} 吗？`,
    header: '审核通过',
    icon: 'pi pi-check',
    accept: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const index = mockPlans.value.findIndex(p => p.id === plan.id)
        if (index !== -1) {
          mockPlans.value[index].status = 'approved'
        }
      }
      catch (error) {
        console.error('审核失败:', error)
      }
    }
  })
}

const startPlan = async (plan: any) => {
  confirm.require({
    message: `确定要开始执行计划 ${plan.plan_name} 吗？`,
    header: '开始执行',
    icon: 'pi pi-play',
    accept: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const index = mockPlans.value.findIndex(p => p.id === plan.id)
        if (index !== -1) {
          mockPlans.value[index].status = 'executing'
        }
      }
      catch (error) {
        console.error('开始执行失败:', error)
      }
    }
  })
}

const confirmDeletePlan = (plan: any) => {
  confirm.require({
    message: `确定要删除计划 ${plan.plan_name} 吗？`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deletePlan(plan.id)
    }
  })
}

const deletePlan = (planId: string) => {
  mockPlans.value = mockPlans.value.filter(plan => plan.id !== planId)
}

const addPlanOrder = () => {
  planForm.value.orders.push({
    order_no: '',
    quantity: 1,
    priority: 'medium'
  })
}

const removePlanOrder = (index: number) => {
  planForm.value.orders.splice(index, 1)
}

const savePlan = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newPlan = {
      id: Date.now().toString(),
      ...planForm.value,
      workshop_name: workshopOptions.value.find(w => w.value === planForm.value.workshop_id)?.label || '',
      total_orders: planForm.value.orders.length,
      completed_orders: 0,
      capacity_utilization: 0,
      status: 'draft'
    }
    
    mockPlans.value.push(newPlan as any)
    showCreateDialog.value = false
    
    // 重置表单
    planForm.value = {
      plan_name: '',
      workshop_id: '',
      start_date: new Date(),
      end_date: null,
      description: '',
      orders: []
    }
  }
  catch (error) {
    console.error('保存计划失败:', error)
  }
  finally {
    saving.value = false
  }
}

// 初始化
onMounted(() => {
  // 加载数据
})
</script>
