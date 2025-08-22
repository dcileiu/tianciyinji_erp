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
          <Select v-model="selectedStatus">
            <SelectTrigger>
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="active">运行中</SelectItem>
              <SelectItem value="maintenance">维护中</SelectItem>
              <SelectItem value="inactive">停用</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            车间类型
          </label>
          <Select v-model="selectedType">
            <SelectTrigger>
              <SelectValue placeholder="全部类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部类型</SelectItem>
              <SelectItem value="assembly">装配车间</SelectItem>
              <SelectItem value="machining">机加工车间</SelectItem>
              <SelectItem value="painting">喷涂车间</SelectItem>
              <SelectItem value="packaging">包装车间</SelectItem>
            </SelectContent>
          </Select>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>车间信息</TableHead>
              <TableHead>车间类型</TableHead>
              <TableHead>负责人</TableHead>
              <TableHead>设备数量</TableHead>
              <TableHead>产能利用率</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <!-- 加载状态 -->
            <TableRow v-if="isLoading" v-for="n in 5" :key="n">
              <TableCell v-for="m in 8" :key="m">
                <Skeleton class="h-4 w-full" />
              </TableCell>
            </TableRow>
            <!-- 空状态 -->
            <TableRow v-else-if="paginatedWorkshops.length === 0">
              <TableCell colspan="8" class="text-center py-8">
                <div class="flex flex-col items-center justify-center space-y-2">
                  <Factory class="w-12 h-12 text-muted-foreground" />
                  <p class="text-muted-foreground">暂无车间数据</p>
                  <Button @click="showCreateDialog = true" size="sm">
                    <Plus class="w-4 h-4 mr-2" />
                    新建车间
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <!-- 数据行 -->
            <TableRow v-else v-for="workshop in paginatedWorkshops" :key="workshop.id">
              <TableCell>
                <div class="font-medium text-foreground">
                  {{ workshop.workshop_name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ workshop.workshop_code }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ workshop.location }}
                </div>
              </TableCell>
              <TableCell>
                <span class="text-sm text-foreground">
                  {{ getTypeText(workshop.workshop_type) }}
                </span>
              </TableCell>
              <TableCell>
                <div class="font-medium text-foreground">
                  {{ workshop.manager_name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ workshop.manager_phone }}
                </div>
              </TableCell>
              <TableCell>
                <div class="font-medium text-foreground">
                  {{ workshop.equipment_count }}
                </div>
                <div class="text-sm text-muted-foreground">
                  运行: {{ workshop.active_equipment_count }}
                </div>
              </TableCell>
              <TableCell>
                <div class="w-24">
                  <Progress :value="workshop.capacity_utilization" class="h-2" />
                  <div class="text-sm text-muted-foreground mt-1">
                    {{ workshop.capacity_utilization }}%
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(workshop.status)">
                  {{ getStatusText(workshop.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <span class="text-sm text-foreground">
                  {{ formatDate(workshop.created_at) }}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewWorkshop(workshop)">
                      <Eye class="w-4 h-4 mr-2" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="editWorkshop(workshop)">
                      <Edit class="w-4 h-4 mr-2" />
                      编辑车间
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="manageEquipment(workshop)">
                      <Settings class="w-4 h-4 mr-2" />
                      管理设备
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      @click="deleteWorkshop(workshop.id)"
                      class="text-destructive focus:text-destructive"
                    >
                      <Trash2 class="w-4 h-4 mr-2" />
                      删除车间
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-muted-foreground">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到 
          {{ Math.min(currentPage * pageSize, filteredWorkshops.length) }} 条，
          共 {{ filteredWorkshops.length }} 条记录
        </div>
        <Pagination
          v-slot="{ page }"
          :total="filteredWorkshops.length"
          :sibling-count="1"
          :show-edges="true"
          :default-page="currentPage"
          @update:page="currentPage = $event"
        >
          <PaginationContent>
            <PaginationItem>
              <PaginationPrev />
            </PaginationItem>
            <PaginationItem v-for="(item, index) in page.items" :key="index">
              <PaginationEllipsis v-if="item.type === 'ellipsis'" :index="index" />
              <PaginationList v-else :value="item.value" :is-active="item.value === page.value" />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Card>

    <!-- 创建车间对话框 -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新建车间</DialogTitle>
          <DialogDescription>
            填写车间基本信息，创建新的生产车间。
          </DialogDescription>
        </DialogHeader>
        <Form @submit="handleCreateSubmit">
          <div class="grid gap-4 py-4">
            <FormField name="workshop_code">
              <FormItem>
                <FormLabel>车间编码</FormLabel>
                <FormControl>
                  <Input v-model="formData.workshop_code" placeholder="请输入车间编码" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="workshop_name">
              <FormItem>
                <FormLabel>车间名称</FormLabel>
                <FormControl>
                  <Input v-model="formData.workshop_name" placeholder="请输入车间名称" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="workshop_type">
              <FormItem>
                <FormLabel>车间类型</FormLabel>
                <FormControl>
                  <Select v-model="formData.workshop_type">
                    <SelectTrigger>
                      <SelectValue placeholder="选择车间类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assembly">装配车间</SelectItem>
                      <SelectItem value="machining">机加工车间</SelectItem>
                      <SelectItem value="painting">喷涂车间</SelectItem>
                      <SelectItem value="packaging">包装车间</SelectItem>
                      <SelectItem value="quality">质检车间</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="location">
              <FormItem>
                <FormLabel>车间位置</FormLabel>
                <FormControl>
                  <Input v-model="formData.location" placeholder="请输入车间位置" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="manager_name">
              <FormItem>
                <FormLabel>负责人姓名</FormLabel>
                <FormControl>
                  <Input v-model="formData.manager_name" placeholder="请输入负责人姓名" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="manager_phone">
              <FormItem>
                <FormLabel>负责人电话</FormLabel>
                <FormControl>
                  <Input v-model="formData.manager_phone" placeholder="请输入负责人电话" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="description">
              <FormItem>
                <FormLabel>车间描述</FormLabel>
                <FormControl>
                  <Textarea v-model="formData.description" placeholder="请输入车间描述" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showCreateDialog = false">
              取消
            </Button>
            <Button type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? '创建中...' : '创建车间' }}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>

    <!-- 编辑车间对话框 -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑车间</DialogTitle>
          <DialogDescription>
            修改车间信息。
          </DialogDescription>
        </DialogHeader>
        <Form @submit="handleEditSubmit">
          <div class="grid gap-4 py-4">
            <FormField name="workshop_code">
              <FormItem>
                <FormLabel>车间编码</FormLabel>
                <FormControl>
                  <Input v-model="formData.workshop_code" placeholder="请输入车间编码" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="workshop_name">
              <FormItem>
                <FormLabel>车间名称</FormLabel>
                <FormControl>
                  <Input v-model="formData.workshop_name" placeholder="请输入车间名称" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="workshop_type">
              <FormItem>
                <FormLabel>车间类型</FormLabel>
                <FormControl>
                  <Select v-model="formData.workshop_type">
                    <SelectTrigger>
                      <SelectValue placeholder="选择车间类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assembly">装配车间</SelectItem>
                      <SelectItem value="machining">机加工车间</SelectItem>
                      <SelectItem value="painting">喷涂车间</SelectItem>
                      <SelectItem value="packaging">包装车间</SelectItem>
                      <SelectItem value="quality">质检车间</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="location">
              <FormItem>
                <FormLabel>车间位置</FormLabel>
                <FormControl>
                  <Input v-model="formData.location" placeholder="请输入车间位置" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="manager_name">
              <FormItem>
                <FormLabel>负责人姓名</FormLabel>
                <FormControl>
                  <Input v-model="formData.manager_name" placeholder="请输入负责人姓名" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="manager_phone">
              <FormItem>
                <FormLabel>负责人电话</FormLabel>
                <FormControl>
                  <Input v-model="formData.manager_phone" placeholder="请输入负责人电话" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField name="description">
              <FormItem>
                <FormLabel>车间描述</FormLabel>
                <FormControl>
                  <Textarea v-model="formData.description" placeholder="请输入车间描述" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showEditDialog = false">
              取消
            </Button>
            <Button type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? '保存中...' : '保存修改' }}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationList,
  PaginationNext,
  PaginationPrev
} from '@/components/ui/pagination'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { MoreHorizontal } from 'lucide-vue-next'

// 响应式数据
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedType = ref('')
const selectedManager = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)

// 表单数据
const formData = ref({
  workshop_code: '',
  workshop_name: '',
  workshop_type: '',
  location: '',
  manager_name: '',
  manager_phone: '',
  description: ''
})

const editingWorkshop = ref(null)

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

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default'
    case 'maintenance':
      return 'secondary'
    case 'inactive':
      return 'destructive'
    default:
      return 'outline'
  }
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

// 表单处理函数
const resetForm = () => {
  formData.value = {
    workshop_code: '',
    workshop_name: '',
    workshop_type: '',
    location: '',
    manager_name: '',
    manager_phone: '',
    description: ''
  }
}

const handleCreateSubmit = async (event: Event) => {
  event.preventDefault()
  isSubmitting.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 添加新车间到列表
    const newWorkshop = {
      id: workshops.value.length + 1,
      ...formData.value,
      equipment_count: 0,
      active_equipment_count: 0,
      capacity_utilization: 0,
      status: 'active',
      created_at: new Date()
    }
    
    workshops.value.push(newWorkshop)
    showCreateDialog.value = false
    resetForm()
    
    // 更新统计数据
    stats.value.totalWorkshops++
    stats.value.activeWorkshops++
  } catch (error) {
    console.error('创建车间失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleEditSubmit = async (event: Event) => {
  event.preventDefault()
  isSubmitting.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新车间信息
    const index = workshops.value.findIndex(w => w.id === editingWorkshop.value?.id)
    if (index !== -1) {
      workshops.value[index] = {
        ...workshops.value[index],
        ...formData.value
      }
    }
    
    showEditDialog.value = false
    resetForm()
    editingWorkshop.value = null
  } catch (error) {
    console.error('更新车间失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 操作函数
const viewWorkshop = (workshop: any) => {
  console.log('查看车间:', workshop)
  // 这里可以导航到车间详情页面
}

const editWorkshop = (workshop: any) => {
  editingWorkshop.value = workshop
  formData.value = {
    workshop_code: workshop.workshop_code,
    workshop_name: workshop.workshop_name,
    workshop_type: workshop.workshop_type,
    location: workshop.location,
    manager_name: workshop.manager_name,
    manager_phone: workshop.manager_phone,
    description: workshop.description || ''
  }
  showEditDialog.value = true
}

const manageEquipment = (workshop: any) => {
  console.log('管理设备:', workshop)
  // 这里可以导航到设备管理页面
}

const deleteWorkshop = async (workshopId: number) => {
  if (!confirm('确定要删除这个车间吗？此操作不可撤销。')) {
    return
  }
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = workshops.value.findIndex(w => w.id === workshopId)
    if (index !== -1) {
      const workshop = workshops.value[index]
      workshops.value.splice(index, 1)
      
      // 更新统计数据
      stats.value.totalWorkshops--
      if (workshop.status === 'active') {
        stats.value.activeWorkshops--
      } else if (workshop.status === 'maintenance') {
        stats.value.maintenanceWorkshops--
      }
    }
  } catch (error) {
    console.error('删除车间失败:', error)
  }
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