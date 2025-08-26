<template>
  <div class="flex flex-column gap-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-color">仓库管理</h1>
        <p class="text-muted-color mt-2">管理仓库基础信息和库位设置</p>
      </div>
      <Button @click="openWarehouseDialog()" />
    </div>

    <!-- 筛选区域 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block text-color">仓库类型</label>
            <Select
              v-model="filters.type"
              :options="typeOptions"
              option-option-value="value"
              placeholder="全部类型"
              show-clear
              class="w-full"
            />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block text-color">状态</label>
            <Select
              v-model="filters.status"
              :options="statusOptions"
              option-option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block text-color">搜索</label>
            <!-- IconField 已移除 -->
            <!-- InputIcon 已移除 -->
            <i class="pi pi-search"></i>
            <!-- /InputIcon -->
            <Input v-model="filters.search" placeholder="搜索仓库名称、编码..." class="w-full" />
            <!-- /IconField -->
          </div>
          <div class="flex items-end gap-2">
            <Button @click="loadWarehouses" />
            <Button @click="exportWarehouses" />
          </div>
        </div>
      </template>
    </Card>

    <!-- 仓库列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">仓库列表</h3>
          <div class="flex items-center gap-2 text-sm text-muted-color">
            共 {{ totalCount }} 个仓库
          </div>
        </div>
      </template>

      <template #content>
        <Table
          :value="filteredWarehouses"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
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
              </div>
            </div>
          </template>
          <TableHead field="warehouse_no" header="仓库编码" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 text-sm font-mono">
                {{ slotProps.data.warehouse_no }}
              </code>
            </template>
          </TableHead>

          <TableHead field="name" header="仓库名称" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <i class="pi pi-home text-primary"></i>
                <span class="font-medium">{{ slotProps.data.name }}</span>
              </div>
            </template>
          </TableHead>

          <TableHead field="type" header="类型" sortable>
            <template #body="slotProps">
              <Tag
                :value="getTypeDisplayName(slotProps.data.type)"
                :severity="getTypeSeverity(slotProps.data.type)"
              />
            </template>
          </TableHead>

          <TableHead field="location" header="位置">
            <template #body="slotProps">
              <div class="flex items-center space-x-1">
                <i class="pi pi-map-marker text-muted-color"></i>
                <span class="text-sm">{{ slotProps.data.location || '-' }}</span>
              </div>
            </template>
          </TableHead>

          <TableHead field="manager" header="负责人">
            <template #body="slotProps">
              <span class="text-sm">{{ slotProps.data.manager || '-' }}</span>
            </template>
          </TableHead>

          <TableHead field="status" header="状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="getStatusDisplayName(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </TableHead>

          <TableHead header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex items-center space-x-1">
                <Button text size="sm" @click="viewWarehouse(slotProps.data)" />
                <Button text size="sm" @click="editWarehouse(slotProps.data)" />
                <Button text size="sm" @click="manageLocations(slotProps.data)" />
                <Button
                  text
                  size="sm"
                  severity="danger"
                  @click="confirmDeleteWarehouse(slotProps.data)"
                />
              </div>
            </template>
          </TableHead>
        </Table>
      </template>
    </Card>

    <!-- 仓库对话框 -->
    <Dialog
      v-model:visible="showDialog"
      :header="editingWarehouse ? '编辑仓库' : '新建仓库'"
      :style="{ width: '600px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">仓库编码 *</label>
              <Input v-model="warehouseForm.warehouse_no" placeholder="请输入仓库编码" required />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">仓库名称 *</label>
              <Input v-model="warehouseForm.name" placeholder="请输入仓库名称" required />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">仓库类型 *</label>
              <Select
                v-model="warehouseForm.type"
                :options="typeOptions"
                option-option-value="value"
                placeholder="选择类型"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">状态</label>
              <Select
                v-model="warehouseForm.status"
                :options="statusOptions"
                option-option-value="value"
                placeholder="选择状态"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">仓库地址</label>
            <Input v-model="warehouseForm.location" placeholder="请输入仓库地址" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">负责人</label>
            <Input v-model="warehouseForm.manager" placeholder="请输入负责人姓名" />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeDialog" />
          <Button :loading="saving" @click="saveWarehouse" />
        </div>
      </template>
    </Dialog>

    <!-- 确认对话框 -->
    <!-- ConfirmDialog 已移除，需要手动实现确认对话框 -->
  </div>
</template>

<script setup lang="ts">
// import Card from 'primevue/card' // 已移除PrimeVue导入
// import Button from 'primevue/button' // 已移除PrimeVue导入
// import InputText from 'primevue/inputtext' // 已移除PrimeVue导入
// import InputNumber from 'primevue/inputnumber' // 已移除PrimeVue导入
// import IconField from 'primevue/iconfield' // 已移除PrimeVue导入
// import InputIcon from 'primevue/inputicon' // 已移除PrimeVue导入
// import Dropdown from 'primevue/dropdown' // 已移除PrimeVue导入
// import Textarea from 'primevue/textarea' // 已移除PrimeVue导入
// import DataTable from 'primevue/datatable' // 已移除PrimeVue导入
// import Column from 'primevue/column' // 已移除PrimeVue导入
// import Tag from 'primevue/tag' // 已移除PrimeVue导入
// import Dialog from 'primevue/dialog' // 已移除PrimeVue导入
// import ConfirmDialog from 'primevue/confirmdialog' // 已移除PrimeVue导入
// import { useConfirm } from 'primevue/useconfirm' // 已移除PrimeVue导入
// import Skeleton from 'primevue/skeleton' // 已移除PrimeVue导入
import type { Warehouse } from '~/types/database'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '仓库管理 - ERP 管理系统',
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingWarehouse = ref(null as any)
// const confirm = useConfirm() // 已移除
// 筛选条件
const filters = ref({
  type: '',
  status: '',
  search: '',
})

// 表单数据
const warehouseForm = ref({
  warehouse_no: '',
  name: '',
  type: 'raw_material' as 'main' | 'raw_material' | 'finished_goods' | 'backup',
  location: '',
  manager: '',
  status: 'active' as 'active' | 'inactive',
})

// 选项数据
const typeOptions = ref([
  { label: '主仓库', value: 'main' },
  { label: '原料仓', value: 'raw_material' },
  { label: '成品仓', value: 'finished_goods' },
  { label: '备用仓', value: 'backup' },
])

const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
])

// 模拟数据
const mockWarehouses = ref<Warehouse[]>([
  {
    id: '1',
    warehouse_no: 'WH001',
    name: '原料仓库A',
    type: 'raw_material',
    location: '工业园区A栋1层',
    manager: '张三',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    warehouse_no: 'WH002',
    name: '成品仓库B',
    type: 'finished_goods',
    location: '工业园区B栋2层',
    manager: '李四',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    warehouse_no: 'WH003',
    name: '工具仓库C',
    type: 'backup',
    location: '工业园区C栋1层',
    manager: '王五',
    status: 'inactive',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
])

// 计算属性
const filteredWarehouses = computed(() => {
  let result = mockWarehouses.value

  if (filters.value.search) {
    const query = filters.value.search.toLowerCase()
    result = result.filter(
      warehouse =>
        warehouse.name.toLowerCase().includes(query)
        || warehouse.warehouse_no.toLowerCase().includes(query),
    )
  }

  if (filters.value.type) {
    result = result.filter(warehouse => warehouse.type === filters.value.type)
  }

  if (filters.value.status) {
    result = result.filter(warehouse => warehouse.status === filters.value.status)
  }

  return result
})

const totalCount = computed(() => mockWarehouses.value.length)

// 类型映射
const typeMap: Record<string, string> = {
  main: '主仓库',
  raw_material: '原料仓',
  finished_goods: '成品仓',
  backup: '备用仓',
}

const statusMap: Record<string, string> = {
  active: '启用',
  inactive: '停用',
}

const typeSeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  main: 'secondary',
  raw_material: 'secondary',
  finished_goods: 'default',
  backup: 'secondary',
}

const statusSeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  active: 'default',
  inactive: 'destructive',
}

// 方法
const getTypeDisplayName = (type: string) => typeMap[type] || type

const getTypeSeverity = (type: string) => typeSeverityMap[type] || 'secondary'

const getStatusDisplayName = (status: string) => statusMap[status] || status

const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'secondary'

const loadWarehouses = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  catch (error) {
    console.error('加载仓库失败:', error)
  }
  finally {
    loading.value = false
  }
}

const openWarehouseDialog = (warehouse: any = null) => {
  if (warehouse) {
    editingWarehouse.value = warehouse
    Object.assign(warehouseForm.value, {
      warehouse_no: warehouse.warehouse_no,
      name: warehouse.name,
      type: warehouse.type,
      location: warehouse.location,
      manager: warehouse.manager,
      status: warehouse.status,
    })
  }
  else {
    editingWarehouse.value = null
    Object.assign(warehouseForm.value, {
      warehouse_no: '',
      name: '',
      type: 'raw_material',
      location: '',
      manager: '',
      status: 'active',
    })
  }
  showDialog.value = true
}

const viewWarehouse = (warehouse: any) => {
  console.log('查看仓库详情:', warehouse)
}

const editWarehouse = (warehouse: any) => {
  openWarehouseDialog(warehouse)
}

const manageLocations = (warehouse: any) => {
  console.log('管理库位:', warehouse)
}

const closeDialog = () => {
  showDialog.value = false
  editingWarehouse.value = null
}

const saveWarehouse = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingWarehouse.value) {
      // 更新仓库
      const index = mockWarehouses.value.findIndex(w => w.id === editingWarehouse.value.id)
      if (index !== -1) {
        const existingWarehouse = mockWarehouses.value[index]
        if (existingWarehouse) {
          mockWarehouses.value[index] = {
            id: existingWarehouse.id, // 确保 id 始终存在
            warehouse_no: warehouseForm.value.warehouse_no,
            name: warehouseForm.value.name,
            type: warehouseForm.value.type,
            location: warehouseForm.value.location,
            manager: warehouseForm.value.manager,
            status: warehouseForm.value.status,
            created_at: existingWarehouse.created_at, // 保持原创建时间
            updated_at: new Date().toISOString(),
          }
        }
      }
    }
    else {
      // 新增仓库
      const newWarehouse: Warehouse = {
        id: Date.now().toString(),
        warehouse_no: warehouseForm.value.warehouse_no,
        name: warehouseForm.value.name,
        type: warehouseForm.value.type,
        location: warehouseForm.value.location,
        manager: warehouseForm.value.manager,
        status: warehouseForm.value.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockWarehouses.value.push(newWarehouse)
    }

    closeDialog()
  }
  catch (error) {
    console.error('保存仓库失败:', error)
  }
  finally {
    saving.value = false
  }
}

const confirmDeleteWarehouse = (_warehouse: any) => {
  // TODO: 需要重新实现确认对话框
}

const exportWarehouses = () => {
  console.log('导出仓库数据')
}

// 初始化
onMounted(() => {
  loadWarehouses()
})
</script>
