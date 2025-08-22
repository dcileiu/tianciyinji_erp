<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">仓库管理</h1>
        <p class="text-muted-foreground mt-2">管理仓库基础信息和库位设置</p>
      </div>
      <Button @click="openWarehouseDialog()" class="gap-2">
        <Plus class="h-4 w-4" />
        新建仓库
      </Button>
    </div>

    <!-- 筛选区域 -->
    <Card class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="text-sm font-medium mb-2 block">仓库类型</label>
          <select v-model="filters.type" class="w-full p-2 border rounded-md">
            <option value="">全部类型</option>
            <option value="raw_materials">原料仓</option>
            <option value="finished_goods">成品仓</option>
            <option value="semi_finished">半成品仓</option>
            <option value="tools">工具仓</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium mb-2 block">状态</label>
          <select v-model="filters.status" class="w-full p-2 border rounded-md">
            <option value="">全部状态</option>
            <option value="active">启用</option>
            <option value="inactive">停用</option>
            <option value="maintenance">维护中</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium mb-2 block">搜索</label>
          <div class="relative">
            <Search class="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              v-model="filters.search"
              placeholder="搜索仓库名称、编码..."
              class="pl-10"
            />
          </div>
        </div>
        <div class="flex items-end gap-2">
          <Button @click="loadWarehouses" variant="outline" class="gap-2">
            <RefreshCw class="h-4 w-4" />
            刷新
          </Button>
          <Button @click="exportWarehouses" variant="outline" class="gap-2">
            <Download class="h-4 w-4" />
            导出
          </Button>
        </div>
      </div>
    </Card>

    <!-- 仓库列表 -->
    <Card>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">仓库列表</h3>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            共 {{ totalCount }} 个仓库
          </div>
        </div>
        
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4 font-medium">仓库编码</th>
                <th class="text-left py-3 px-4 font-medium">仓库名称</th>
                <th class="text-left py-3 px-4 font-medium">类型</th>
                <th class="text-left py-3 px-4 font-medium">地址</th>
                <th class="text-left py-3 px-4 font-medium">负责人</th>
                <th class="text-left py-3 px-4 font-medium">容量</th>
                <th class="text-left py-3 px-4 font-medium">状态</th>
                <th class="text-left py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="warehouse in warehouses" :key="warehouse.id" class="border-b hover:bg-muted/50">
                <td class="py-3 px-4">
                  <div class="font-medium">{{ warehouse.code }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="font-medium">{{ warehouse.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ warehouse.description }}</div>
                </td>
                <td class="py-3 px-4">
                  <span :class="{
                    'bg-blue-100 text-blue-800': warehouse.type === 'raw_materials',
                    'bg-green-100 text-green-800': warehouse.type === 'finished_goods',
                    'bg-yellow-100 text-yellow-800': warehouse.type === 'semi_finished',
                    'bg-purple-100 text-purple-800': warehouse.type === 'tools'
                  }" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getTypeText(warehouse.type) }}
                  </span>
                </td>
                <td class="py-3 px-4">{{ warehouse.address }}</td>
                <td class="py-3 px-4">
                  <div>{{ warehouse.manager_name }}</div>
                  <div class="text-sm text-muted-foreground">{{ warehouse.manager_phone }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-sm">
                    <div>{{ warehouse.capacity }} 平方米</div>
                    <div class="text-muted-foreground">{{ warehouse.location_count }} 个库位</div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span :class="{
                    'bg-green-100 text-green-800': warehouse.status === 'active',
                    'bg-red-100 text-red-800': warehouse.status === 'inactive',
                    'bg-yellow-100 text-yellow-800': warehouse.status === 'maintenance'
                  }" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusText(warehouse.status) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <Button @click="viewWarehouse(warehouse)" size="sm" variant="ghost">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button @click="editWarehouse(warehouse)" size="sm" variant="ghost">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button @click="manageLocations(warehouse)" size="sm" variant="ghost">
                      <MapPin class="h-4 w-4" />
                    </Button>
                    <Button @click="deleteWarehouse(warehouse)" size="sm" variant="ghost" class="text-red-500 hover:text-red-700">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="warehouses.length === 0" class="text-center py-8 text-muted-foreground">
            暂无仓库数据
          </div>
        </div>
      </div>
    </Card>

    <!-- 仓库对话框 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card class="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold">
              {{ editingWarehouse ? '编辑仓库' : '新建仓库' }}
            </h2>
            <Button @click="closeDialog" variant="ghost" size="sm">
              <X class="h-4 w-4" />
            </Button>
          </div>
          
          <form @submit.prevent="saveWarehouse" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">仓库编码</label>
                <Input v-model="form.code" placeholder="WH001" required />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">仓库名称</label>
                <Input v-model="form.name" placeholder="主仓库" required />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">仓库类型</label>
                <select v-model="form.type" class="w-full p-2 border rounded-md" required>
                  <option value="">选择类型</option>
                  <option value="raw_materials">原料仓</option>
                  <option value="finished_goods">成品仓</option>
                  <option value="semi_finished">半成品仓</option>
                  <option value="tools">工具仓</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">状态</label>
                <select v-model="form.status" class="w-full p-2 border rounded-md" required>
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                  <option value="maintenance">维护中</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium mb-2 block">地址</label>
              <Input v-model="form.address" placeholder="详细地址" required />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">负责人</label>
                <Input v-model="form.manager_name" placeholder="负责人姓名" required />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">联系电话</label>
                <Input v-model="form.manager_phone" placeholder="手机号码" required />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">仓库容量 (平方米)</label>
                <Input v-model="form.capacity" type="number" placeholder="1000" required />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">库位数量</label>
                <Input v-model="form.location_count" type="number" placeholder="100" required />
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium mb-2 block">描述</label>
              <textarea v-model="form.description" class="w-full p-2 border rounded-md" rows="3" placeholder="仓库描述信息"></textarea>
            </div>
            
            <div class="flex justify-end gap-2 pt-4">
              <Button type="button" @click="closeDialog" variant="outline">
                取消
              </Button>
              <Button type="submit" :disabled="saving">
                {{ saving ? '保存中...' : '保存' }}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Card from '~/components/ui/Card.vue'
import { Plus, Search, RefreshCw, Download, Eye, Edit, MapPin, Trash2, X } from 'lucide-vue-next'

// 页面元数据
definePageMeta({
  title: '仓库管理',
  description: '管理仓库基础信息和库位设置'
})

// 响应式数据
const warehouses = ref([])
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingWarehouse = ref(null)
const totalCount = ref(0)

// 筛选条件
const filters = reactive({
  type: '',
  status: '',
  search: ''
})

// 表单数据
const form = reactive({
  code: '',
  name: '',
  type: '',
  status: 'active',
  address: '',
  manager_name: '',
  manager_phone: '',
  capacity: '',
  location_count: '',
  description: ''
})

// 初始化表单
const initForm = () => {
  form.code = ''
  form.name = ''
  form.type = ''
  form.status = 'active'
  form.address = ''
  form.manager_name = ''
  form.manager_phone = ''
  form.capacity = ''
  form.location_count = ''
  form.description = ''
}

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    raw_materials: '原料仓',
    finished_goods: '成品仓',
    semi_finished: '半成品仓',
    tools: '工具仓'
  }
  return typeMap[type] || type
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '启用',
    inactive: '停用',
    maintenance: '维护中'
  }
  return statusMap[status] || status
}

// 加载仓库数据
const loadWarehouses = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        code: 'WH001',
        name: '主仓库',
        type: 'finished_goods',
        status: 'active',
        address: '北京市朝阳区工业园区A区1号',
        manager_name: '张仓管',
        manager_phone: '13800138001',
        capacity: 2000,
        location_count: 200,
        description: '主要存放成品和包装材料'
      },
      {
        id: 2,
        code: 'WH002',
        name: '原料仓库',
        type: 'raw_materials',
        status: 'active',
        address: '北京市朝阳区工业园区B区2号',
        manager_name: '李管理',
        manager_phone: '13800138002',
        capacity: 1500,
        location_count: 150,
        description: '存放生产原料和半成品'
      }
    ]
    
    warehouses.value = mockData
    totalCount.value = mockData.length
  } catch (error) {
    console.error('加载仓库失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开仓库对话框
const openWarehouseDialog = (warehouse = null) => {
  editingWarehouse.value = warehouse
  if (warehouse) {
    form.code = warehouse.code
    form.name = warehouse.name
    form.type = warehouse.type
    form.status = warehouse.status
    form.address = warehouse.address
    form.manager_name = warehouse.manager_name
    form.manager_phone = warehouse.manager_phone
    form.capacity = String(warehouse.capacity)
    form.location_count = String(warehouse.location_count)
    form.description = warehouse.description
  } else {
    initForm()
    // 生成仓库编码
    const count = warehouses.value.length + 1
    form.code = `WH${count.toString().padStart(3, '0')}`
  }
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
  editingWarehouse.value = null
  initForm()
}

// 保存仓库
const saveWarehouse = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingWarehouse.value) {
      // 更新现有仓库
      const index = warehouses.value.findIndex(w => w.id === editingWarehouse.value.id)
      if (index !== -1) {
        warehouses.value[index] = { 
          ...editingWarehouse.value, 
          ...form,
          capacity: Number(form.capacity),
          location_count: Number(form.location_count)
        }
      }
    } else {
      // 添加新仓库
      const newWarehouse = {
        id: Date.now(),
        code: form.code,
        name: form.name,
        type: form.type,
        status: form.status,
        address: form.address,
        manager_name: form.manager_name,
        manager_phone: form.manager_phone,
        capacity: Number(form.capacity),
        location_count: Number(form.location_count),
        description: form.description
      }
      warehouses.value.unshift(newWarehouse)
      totalCount.value++
    }
    
    closeDialog()
  } catch (error) {
    console.error('保存仓库失败:', error)
  } finally {
    saving.value = false
  }
}

// 查看仓库
const viewWarehouse = (warehouse) => {
  console.log('查看仓库:', warehouse)
}

// 编辑仓库
const editWarehouse = (warehouse) => {
  openWarehouseDialog(warehouse)
}

// 管理库位
const manageLocations = (warehouse) => {
  console.log('管理库位:', warehouse)
  // 这里可以跳转到库位管理页面
}

// 删除仓库
const deleteWarehouse = async (warehouse) => {
  if (confirm('确定要删除这个仓库吗？')) {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = warehouses.value.findIndex(w => w.id === warehouse.id)
      if (index !== -1) {
        warehouses.value.splice(index, 1)
        totalCount.value--
      }
    } catch (error) {
      console.error('删除仓库失败:', error)
    }
  }
}

// 导出仓库
const exportWarehouses = () => {
  console.log('导出仓库数据')
}

// 页面加载时获取数据
onMounted(() => {
  loadWarehouses()
})
</script> 