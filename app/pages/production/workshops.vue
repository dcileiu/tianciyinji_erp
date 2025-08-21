<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">车间管理</h1>
        <p class="text-muted-foreground mt-1">
          管理生产车间和工作中心，监控设备状态和产能
        </p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="w-4 h-4 mr-2" />
        新建车间
      </Button>
    </div>

    <!-- 车间概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-blue-500/10 rounded-full">
            <Factory class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              总车间数
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ stats.totalWorkshops }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-green-500/10 rounded-full">
            <CheckCircle class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              运行中
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ stats.activeWorkshops }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-500/10 rounded-full">
            <AlertTriangle class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              维护中
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ stats.maintenanceWorkshops }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-500/10 rounded-full">
            <TrendingUp class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              平均产能利用率
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ stats.avgUtilization }}%
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- 筛选和搜索 -->
    <Card class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            车间名称
          </label>
          <Input
            v-model="searchQuery"
            placeholder="输入车间名称搜索"
            class="w-full"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            车间状态
          </label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">全部状态</option>
            <option value="active">运行中</option>
            <option value="maintenance">维护中</option>
            <option value="inactive">停用</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            车间类型
          </label>
          <select
            v-model="selectedType"
            class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">全部类型</option>
            <option value="assembly">装配车间</option>
            <option value="machining">机加工车间</option>
            <option value="painting">喷涂车间</option>
            <option value="packaging">包装车间</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            负责人
          </label>
          <Input
            v-model="selectedManager"
            placeholder="输入负责人姓名"
            class="w-full"
          />
        </div>
      </div>
    </Card>

    <!-- 车间列表 -->
    <Card class="p-6">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-4 font-medium text-foreground">
                车间信息
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                车间类型
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                负责人
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                设备数量
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                产能利用率
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                状态
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                创建时间
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="workshop in paginatedWorkshops"
              :key="workshop.id"
              class="border-b border-border hover:bg-accent/20 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="font-medium text-foreground">
                  {{ workshop.workshop_name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ workshop.workshop_code }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ workshop.location }}
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="text-sm text-foreground">
                  {{ getTypeText(workshop.workshop_type) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="font-medium text-foreground">
                  {{ workshop.manager_name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ workshop.manager_phone }}
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="font-medium text-foreground">
                  {{ workshop.equipment_count }}
                </div>
                <div class="text-sm text-muted-foreground">
                  运行: {{ workshop.active_equipment_count }}
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full" 
                    :style="{ width: `${workshop.capacity_utilization}%` }"
                  ></div>
                </div>
                <div class="text-sm text-muted-foreground mt-1">
                  {{ workshop.capacity_utilization }}%
                </div>
              </td>
              <td class="py-3 px-4">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getStatusColor(workshop.status)
                ]">
                  {{ getStatusText(workshop.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-sm text-foreground">
                  {{ formatDate(workshop.created_at) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" @click="viewWorkshop(workshop)">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" @click="editWorkshop(workshop)">
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" @click="manageEquipment(workshop)">
                    <Settings class="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    @click="deleteWorkshop(workshop.id)"
                    class="text-destructive hover:text-destructive"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-muted-foreground">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到 
          {{ Math.min(currentPage * pageSize, filteredWorkshops.length) }} 条，
          共 {{ filteredWorkshops.length }} 条记录
        </div>
        <div class="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </Button>
          <span class="text-sm text-muted-foreground">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <Button
            size="sm"
            variant="outline"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  Factory,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Edit,
  Settings,
  Trash2
} from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

// 响应式数据
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedType = ref('')
const selectedManager = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showCreateDialog = ref(false)

// 统计数据
const stats = ref({
  totalWorkshops: 5,
  activeWorkshops: 4,
  maintenanceWorkshops: 1,
  avgUtilization: 78
})

// 模拟车间数据
const workshops = ref([
  {
    id: 1,
    workshop_code: 'WS-001',
    workshop_name: '第一装配车间',
    workshop_type: 'assembly',
    location: 'A栋1楼',
    manager_name: '张三',
    manager_phone: '13800138001',
    equipment_count: 15,
    active_equipment_count: 14,
    capacity_utilization: 85,
    status: 'active',
    description: '主要负责电子产品的装配工作',
    created_at: new Date('2023-01-15')
  },
  {
    id: 2,
    workshop_code: 'WS-002',
    workshop_name: '机加工车间',
    workshop_type: 'machining',
    location: 'B栋2楼',
    manager_name: '李四',
    manager_phone: '13800138002',
    equipment_count: 20,
    active_equipment_count: 18,
    capacity_utilization: 92,
    status: 'active',
    description: '精密零件加工和机械加工',
    created_at: new Date('2023-02-01')
  },
  {
    id: 3,
    workshop_code: 'WS-003',
    workshop_name: '喷涂车间',
    workshop_type: 'painting',
    location: 'C栋1楼',
    manager_name: '王五',
    manager_phone: '13800138003',
    equipment_count: 8,
    active_equipment_count: 6,
    capacity_utilization: 65,
    status: 'maintenance',
    description: '产品表面处理和喷涂作业',
    created_at: new Date('2023-03-10')
  },
  {
    id: 4,
    workshop_code: 'WS-004',
    workshop_name: '包装车间',
    workshop_type: 'packaging',
    location: 'D栋1楼',
    manager_name: '赵六',
    manager_phone: '13800138004',
    equipment_count: 12,
    active_equipment_count: 12,
    capacity_utilization: 78,
    status: 'active',
    description: '产品包装和出库准备',
    created_at: new Date('2023-04-05')
  },
  {
    id: 5,
    workshop_code: 'WS-005',
    workshop_name: '质检车间',
    workshop_type: 'quality',
    location: 'E栋2楼',
    manager_name: '孙七',
    manager_phone: '13800138005',
    equipment_count: 10,
    active_equipment_count: 10,
    capacity_utilization: 70,
    status: 'active',
    description: '产品质量检测和控制',
    created_at: new Date('2023-05-20')
  }
])

// 筛选后的车间
const filteredWorkshops = computed(() => {
  return workshops.value.filter(workshop => {
    const matchesSearch = !searchQuery.value || 
      workshop.workshop_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !selectedStatus.value || workshop.status === selectedStatus.value
    const matchesType = !selectedType.value || workshop.workshop_type === selectedType.value
    const matchesManager = !selectedManager.value || 
      workshop.manager_name.toLowerCase().includes(selectedManager.value.toLowerCase())
    
    return matchesSearch && matchesStatus && matchesType && matchesManager
  })
})

// 分页后的车间
const paginatedWorkshops = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredWorkshops.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredWorkshops.value.length / pageSize.value)
})

// 辅助函数
const getTypeText = (type: string): string => {
  const types: Record<string, string> = {
    assembly: '装配车间',
    machining: '机加工车间',
    painting: '喷涂车间',
    packaging: '包装车间',
    quality: '质检车间'
  }
  return types[type] || '未知类型'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: '运行中',
    maintenance: '维护中',
    inactive: '停用'
  }
  return texts[status] || '未知状态'
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN')
}

// 操作函数
const viewWorkshop = (workshop: any) => {
  console.log('查看车间:', workshop)
}

const editWorkshop = (workshop: any) => {
  console.log('编辑车间:', workshop)
}

const manageEquipment = (workshop: any) => {
  console.log('管理设备:', workshop)
}

const deleteWorkshop = (workshopId: number) => {
  console.log('删除车间:', workshopId)
}

// 页面标题
useHead({
  title: '车间管理 - ERP 管理系统'
})

// 页面元数据
definePageMeta({
  middleware: 'auth'
})
</script>