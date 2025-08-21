<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">岗位管理</h1>
        <p class="text-muted-foreground">管理系统岗位和职位设置</p>
      </div>
      <Button @click="showCreateDialog = true" class="bg-blue-600 hover:bg-blue-700">
        <Plus class="w-4 h-4 mr-2" />
        新增岗位
      </Button>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">搜索</label>
            <Input
              v-model="searchQuery"
              placeholder="岗位名称、编码..."
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">部门</label>
            <select v-model="departmentFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部部门</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">状态</label>
            <select v-model="statusFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部状态</option>
              <option value="active">启用</option>
              <option value="inactive">停用</option>
            </select>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" @click="resetFilters" class="flex-1">
              <RefreshCw class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 岗位列表 -->
    <Card>
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">岗位列表</h2>
        <div class="text-sm text-muted-foreground">
          共 {{ filteredPositions.length }} 个岗位
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">岗位编码</th>
              <th class="p-4 font-medium">岗位名称</th>
              <th class="p-4 font-medium">所属部门</th>
              <th class="p-4 font-medium">职级</th>
              <th class="p-4 font-medium">人数</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="position in filteredPositions" :key="position.id" class="border-b hover:bg-muted/50">
              <td class="p-4 font-mono text-sm">{{ position.code }}</td>
              <td class="p-4 font-medium">{{ position.name }}</td>
              <td class="p-4">{{ position.department_name }}</td>
              <td class="p-4">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {{ position.level }}
                </span>
              </td>
              <td class="p-4">{{ position.employee_count }}人</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': position.status === 'active',
                    'bg-red-100 text-red-800': position.status === 'inactive'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusName(position.status) }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="viewPosition(position)">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" @click="editPosition(position)">
                    <Edit3 class="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    @click="deletePosition(position.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPositions.length === 0">
              <td colspan="7" class="p-8 text-center text-muted-foreground">
                暂无岗位数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 创建/编辑岗位对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditDialog ? '编辑岗位' : '新增岗位' }}
        </h3>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">岗位编码</label>
              <Input v-model="formData.code" placeholder="如: POS001" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">岗位名称</label>
              <Input v-model="formData.name" placeholder="如: 软件工程师" required />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">所属部门</label>
              <select v-model="formData.department_id" class="w-full px-3 py-2 border rounded-md" required>
                <option value="">请选择部门</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">职级</label>
              <select v-model="formData.level" class="w-full px-3 py-2 border rounded-md" required>
                <option value="">请选择职级</option>
                <option value="P1">P1 - 初级</option>
                <option value="P2">P2 - 中级</option>
                <option value="P3">P3 - 高级</option>
                <option value="P4">P4 - 专家</option>
                <option value="P5">P5 - 资深专家</option>
                <option value="M1">M1 - 主管</option>
                <option value="M2">M2 - 经理</option>
                <option value="M3">M3 - 总监</option>
                <option value="M4">M4 - 副总裁</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">编制人数</label>
              <Input 
                v-model.number="formData.quota" 
                type="number" 
                min="1"
                placeholder="如: 5" 
                required 
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">状态</label>
              <select v-model="formData.status" class="w-full px-3 py-2 border rounded-md" required>
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">岗位描述</label>
            <textarea 
              v-model="formData.description"
              class="w-full px-3 py-2 border rounded-md resize-none"
              rows="3"
              placeholder="请输入岗位职责描述"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">任职要求</label>
            <textarea 
              v-model="formData.requirements"
              class="w-full px-3 py-2 border rounded-md resize-none"
              rows="3"
              placeholder="请输入任职要求"
            ></textarea>
          </div>
          
          <div class="flex gap-3 pt-4">
            <Button type="submit" class="flex-1">
              {{ showEditDialog ? '更新' : '创建' }}
            </Button>
            <Button type="button" variant="outline" @click="cancelForm" class="flex-1">
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Eye, Edit3, Trash2 } from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '岗位管理 - ERP 管理系统'
})

// 数据管理
const { positions, createPosition, updatePosition, deletePosition: removePosition, refreshPositions } = usePositions()
const { departments } = useDepartments()

// 响应式数据
const searchQuery = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentEditId = ref<string | null>(null)

// 表单数据
const formData = ref({
  code: '',
  name: '',
  department_id: '',
  level: '',
  quota: 1,
  status: 'active',
  description: '',
  requirements: ''
})

// 计算属性
const filteredPositions = computed(() => {
  let filtered = positions.value
  
  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(position => 
      position.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      position.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 部门过滤
  if (departmentFilter.value) {
    filtered = filtered.filter(position => position.department_id === departmentFilter.value)
  }
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(position => position.status === statusFilter.value)
  }
  
  return filtered
})

// 方法
const resetFilters = () => {
  searchQuery.value = ''
  departmentFilter.value = ''
  statusFilter.value = ''
}

const getStatusName = (status: string) => {
  const statuses = {
    active: '启用',
    inactive: '停用'
  }
  return statuses[status as keyof typeof statuses] || status
}

const viewPosition = (position: any) => {
  // TODO: 实现查看岗位详情
  console.log('查看岗位:', position)
}

const editPosition = (position: any) => {
  formData.value = {
    code: position.code,
    name: position.name,
    department_id: position.department_id,
    level: position.level,
    quota: position.quota,
    status: position.status,
    description: position.description || '',
    requirements: position.requirements || ''
  }
  currentEditId.value = position.id
  showEditDialog.value = true
}

const deletePosition = async (id: string) => {
  if (confirm('确定要删除这个岗位吗？')) {
    await removePosition(id)
    await refreshPositions()
  }
}

const submitForm = async () => {
  try {
    if (showEditDialog.value && currentEditId.value) {
      await updatePosition(currentEditId.value, formData.value)
    } else {
      await createPosition(formData.value)
    }
    
    await refreshPositions()
    cancelForm()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const cancelForm = () => {
  showCreateDialog.value = false
  showEditDialog.value = false
  currentEditId.value = null
  formData.value = {
    code: '',
    name: '',
    department_id: '',
    level: '',
    quota: 1,
    status: 'active',
    description: '',
    requirements: ''
  }
}

// 初始化数据
onMounted(async () => {
  await refreshPositions()
})
</script> 