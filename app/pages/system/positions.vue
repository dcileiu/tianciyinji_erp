<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">岗位管理</h1>
        <p class="text-gray-600">管理系统岗位和职位设置</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="w-4 h-4 mr-2" />
        新增岗位
      </Button>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label for="search-input">搜索</Label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="search-input" v-model="searchQuery" placeholder="岗位名称、编码..." class="pl-10" />
            </div>
          </div>
          <div>
            <Label for="department-filter">部门</Label>
            <Select v-model="departmentFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部部门</SelectItem>
                <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label for="status-filter">状态</Label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" class="flex-1" @click="resetFilters">
              <RefreshCw class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 岗位列表 -->
    <Card>
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle class="flex items-center space-x-2">
            <Briefcase class="w-5 h-5" />
            <span>岗位列表</span>
          </CardTitle>
          <div class="text-sm text-gray-600">共 {{ filteredPositions.length }} 个岗位</div>
        </div>
      </CardHeader>

      <CardContent>
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin -full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="filteredPositions.length === 0" class="text-center py-8 text-gray-500">暂无岗位数据</div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>岗位编码</TableHead>
                <TableHead>岗位名称</TableHead>
                <TableHead>岗位级别</TableHead>
                <TableHead>薪资范围</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="position in filteredPositions" :key="position.id">
                <TableCell>
                  <span class="font-mono text-sm">{{ position.code }}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">{{ position.name }}</div>
                    <div class="text-sm text-gray-500">{{ position.department_name }}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getLevelSeverity(position.level)">
                    {{ getLevelDisplayName(position.level) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    {{ position.min_salary?.toLocaleString() }} -
                    {{ position.max_salary?.toLocaleString() }}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="position.status === 'active' ? 'default' : 'destructive'">
                    {{ position.status === 'active' ? '启用' : '禁用' }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="text-sm text-gray-500">
                    {{ position.created_at }}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button variant="ghost" size="sm" @click="viewPosition(position)">
                      <Eye class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="editPosition(position)">
                      <Edit class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="confirmDeletePosition(position)">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 岗位对话框 -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editingPosition ? '编辑岗位' : '新增岗位' }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-6">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="position-code">岗位编码 *</Label>
              <Input
                id="position-code"
                v-model="positionForm.code"
                placeholder="请输入岗位编码"
                :class="{ 'border-red-500': !positionForm.code }"
              />
            </div>

            <div>
              <Label for="position-name">岗位名称 *</Label>
              <Input
                id="position-name"
                v-model="positionForm.name"
                placeholder="请输入岗位名称"
                :class="{ 'border-red-500': !positionForm.name }"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="department-select">所属部门 *</Label>
              <Select v-model="positionForm.department_id">
                <SelectTrigger>
                  <SelectValue placeholder="请选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label for="level-select">职级 *</Label>
              <Select v-model="positionForm.level">
                <SelectTrigger>
                  <SelectValue placeholder="请选择职级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in levelOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="min-salary">最低薪资</Label>
              <Input
                id="min-salary"
                v-model="positionForm.min_salary"
                type="number"
                placeholder="请输入最低薪资"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <Label for="max-salary">最高薪资</Label>
              <Input
                id="max-salary"
                v-model="positionForm.max_salary"
                type="number"
                placeholder="请输入最高薪资"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div>
            <Label for="description">岗位描述</Label>
            <Textarea id="description" v-model="positionForm.description" placeholder="请输入岗位描述" :rows="3" />
          </div>

          <div>
            <Label for="requirements">任职要求</Label>
            <Textarea id="requirements" v-model="positionForm.requirements" placeholder="请输入任职要求" :rows="3" />
          </div>

          <div>
            <Label for="status-select">状态</Label>
            <Select v-model="positionForm.status">
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeDialog"> 取消 </Button>
          <Button :disabled="saving" @click="savePosition"> 保存 </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import { Briefcase, Edit, Eye, Plus, RefreshCw, Search, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '岗位管理 - ERP 管理系统',
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingPosition = ref(null as any)

// 搜索和筛选
const searchQuery = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')

// 表单数据
const positionForm = ref({
  code: '',
  name: '',
  department_id: '',
  level: 'junior',
  min_salary: 0,
  max_salary: 0,
  description: '',
  requirements: '',
  status: 'active',
})

// 选项数据
const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
])

const levelOptions = ref([
  { label: '初级', value: 'junior' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'senior' },
  { label: '专家', value: 'expert' },
  { label: '主管', value: 'supervisor' },
  { label: '经理', value: 'manager' },
  { label: '总监', value: 'director' },
])

// 模拟数据
const departments = ref([
  { id: '1', name: '技术部' },
  { id: '2', name: '销售部' },
  { id: '3', name: '人事部' },
  { id: '4', name: '财务部' },
  { id: '5', name: '运营部' },
])

const mockPositions = ref([
  {
    id: '1',
    code: 'DEV001',
    name: '前端开发工程师',
    department_id: '1',
    department_name: '技术部',
    level: 'intermediate',
    min_salary: 8000,
    max_salary: 15000,
    description: '负责前端页面开发和维护',
    requirements: '熟悉Vue.js、React等前端框架',
    employee_count: 5,
    status: 'active',
    created_at: new Date('2024-01-01'),
  },
  {
    id: '2',
    code: 'DEV002',
    name: '后端开发工程师',
    department_id: '1',
    department_name: '技术部',
    level: 'senior',
    min_salary: 12000,
    max_salary: 25000,
    description: '负责后端API开发和数据库设计',
    requirements: '熟悉Java、Python、Node.js等后端技术',
    employee_count: 3,
    status: 'active',
    created_at: new Date('2024-01-02'),
  },
  {
    id: '3',
    code: 'SAL001',
    name: '销售专员',
    department_id: '2',
    department_name: '销售部',
    level: 'junior',
    min_salary: 5000,
    max_salary: 8000,
    description: '负责客户开发和销售业务',
    requirements: '具备良好的沟通能力和销售技巧',
    employee_count: 8,
    status: 'active',
    created_at: new Date('2024-01-03'),
  },
  {
    id: '4',
    code: 'HR001',
    name: '人事专员',
    department_id: '3',
    department_name: '人事部',
    level: 'intermediate',
    min_salary: 6000,
    max_salary: 10000,
    description: '负责招聘、培训和员工关系维护',
    requirements: '熟悉人力资源管理相关法规',
    employee_count: 2,
    status: 'active',
    created_at: new Date('2024-01-04'),
  },
])

// 计算属性
const filteredPositions = computed(() => {
  let result = mockPositions.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      position => position.name.toLowerCase().includes(query) || position.code.toLowerCase().includes(query),
    )
  }

  if (departmentFilter.value) {
    result = result.filter(position => position.department_id === departmentFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(position => position.status === statusFilter.value)
  }

  return result
})

// 类型映射
const levelMap: Record<string, string> = {
  junior: '初级',
  intermediate: '中级',
  senior: '高级',
  expert: '专家',
  supervisor: '主管',
  manager: '经理',
  director: '总监',
}

// 方法
const getLevelDisplayName = (level: string) => levelMap[level] || level

const getLevelSeverity = (level: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const severityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    junior: 'secondary',
    intermediate: 'default',
    senior: 'outline',
    expert: 'destructive',
    manager: 'default',
  }
  return severityMap[level] || 'secondary'
}

const resetFilters = () => {
  searchQuery.value = ''
  departmentFilter.value = ''
  statusFilter.value = ''
}

const viewPosition = (position: any) => {
  console.log('查看岗位详情:', position)
}

const editPosition = (position: any) => {
  editingPosition.value = position
  positionForm.value.code = position.code
  positionForm.value.name = position.name
  positionForm.value.department_id = position.department_id
  positionForm.value.level = position.level
  positionForm.value.min_salary = position.min_salary
  positionForm.value.max_salary = position.max_salary
  positionForm.value.description = position.description
  positionForm.value.requirements = position.requirements
  positionForm.value.status = position.status
  showCreateDialog.value = true
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingPosition.value = null
  Object.assign(positionForm.value, {
    code: '',
    name: '',
    department_id: '',
    level: 'junior',
    min_salary: 0,
    max_salary: 0,
    description: '',
    requirements: '',
    status: 'active',
  })
}

const savePosition = () => {
  if (editingPosition.value) {
    // 更新现有岗位
    const index = mockPositions.value.findIndex(p => p.id === editingPosition.value.id)
    if (index !== -1) {
      const department = departments.value.find(d => d.id === positionForm.value.department_id)
      mockPositions.value[index] = {
        ...mockPositions.value[index],
        ...positionForm.value,
        id: mockPositions.value[index]?.id || '',
        employee_count: mockPositions.value[index]?.employee_count || 0,
        created_at: mockPositions.value[index]?.created_at || new Date(),
        department_name: department?.name || '',
      }
    }
    toast.success('岗位更新成功')
  }
  else {
    // 添加新岗位
    const department = departments.value.find(d => d.id === positionForm.value.department_id)
    const newPosition = {
      id: Date.now().toString(),
      ...positionForm.value,
      department_name: department?.name || '',
      employee_count: 0,
      created_at: new Date(),
    }
    mockPositions.value.push(newPosition)
    toast.success('岗位创建成功')
  }

  closeDialog()
}

const confirmDeletePosition = (position: any) => {
  if (confirm(`确定要删除岗位 "${position.name}" 吗？`)) {
    deletePosition(position.id)
  }
}

const deletePosition = (positionId: string) => {
  mockPositions.value = mockPositions.value.filter(position => position.id !== positionId)
  toast.success('岗位删除成功')
}

// 初始化
onMounted(() => {
  // 加载数据
})
</script>
