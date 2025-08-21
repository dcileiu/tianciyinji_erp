<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">部门管理</h1>
        <p class="text-muted-foreground">管理企业组织架构和部门设置</p>
      </div>
      <Button @click="showCreateDialog = true" class="bg-blue-600 hover:bg-blue-700">
        <Plus class="w-4 h-4 mr-2" />
        新增部门
      </Button>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <div class="p-4">
        <div class="flex gap-4 items-center">
          <Input
            v-model="searchQuery"
            placeholder="搜索部门名称..."
            class="max-w-sm"
          />
          <Button variant="outline" @click="resetSearch">
            <RefreshCw class="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </div>
    </Card>

    <!-- 部门列表 -->
    <Card>
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold">部门列表</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">部门名称</th>
              <th class="p-4 font-medium">部门编码</th>
              <th class="p-4 font-medium">上级部门</th>
              <th class="p-4 font-medium">负责人</th>
              <th class="p-4 font-medium">描述</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">创建时间</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="department in filteredDepartments" :key="department.id" class="border-b hover:bg-muted/50">
              <td class="p-4 font-medium">{{ department.name }}</td>
              <td class="p-4 font-mono text-sm">{{ department.code }}</td>
              <td class="p-4 text-muted-foreground">{{ getParentName(department.parent_id) || '无' }}</td>
              <td class="p-4">{{ department.manager }}</td>
              <td class="p-4 text-muted-foreground">{{ department.description || '-' }}</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': department.status === 'active',
                    'bg-red-100 text-red-800': department.status === 'inactive'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ department.status === 'active' ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="p-4 text-sm text-muted-foreground">
                {{ formatDate(department.created_at) }}
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="editDepartment(department)">
                    <Edit3 class="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    @click="deleteDepartment(department.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDepartments.length === 0">
              <td colspan="8" class="p-8 text-center text-muted-foreground">
                暂无部门数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 创建/编辑部门对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditDialog ? '编辑部门' : '新增部门' }}
        </h3>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">部门名称</label>
            <Input v-model="formData.name" placeholder="请输入部门名称" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">部门编码</label>
            <Input v-model="formData.code" placeholder="请输入部门编码" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">上级部门</label>
            <select v-model="formData.parent_id" class="w-full px-3 py-2 border rounded-md">
              <option value="">无上级部门</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">负责人</label>
            <Input v-model="formData.manager" placeholder="请输入负责人姓名" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">描述</label>
            <textarea 
              v-model="formData.description"
              class="w-full px-3 py-2 border rounded-md resize-none"
              rows="3"
              placeholder="请输入部门描述"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">状态</label>
            <select v-model="formData.status" class="w-full px-3 py-2 border rounded-md">
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
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
import { Plus, RefreshCw, Edit3, Trash2 } from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '部门管理 - ERP 管理系统'
})

// 数据管理
const { departments, createDepartment, updateDepartment, deleteDepartment: removeDepartment, refreshDepartments } = useDepartments()

// 响应式数据
const searchQuery = ref('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentEditId = ref<string | null>(null)

// 表单数据
const formData = ref({
  name: '',
  code: '',
  parent_id: '',
  manager: '',
  description: '',
  status: 'active'
})

// 计算属性
const filteredDepartments = computed(() => {
  if (!searchQuery.value) return departments.value
  
  return departments.value.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const resetSearch = () => {
  searchQuery.value = ''
}

const getParentName = (parentId?: string) => {
  if (!parentId) return ''
  const parent = departments.value.find(dept => dept.id === parentId)
  return parent?.name || ''
}

const editDepartment = (department: any) => {
  formData.value = {
    name: department.name,
    code: department.code,
    parent_id: department.parent_id || '',
    manager: department.manager,
    description: department.description || '',
    status: department.status
  }
  currentEditId.value = department.id
  showEditDialog.value = true
}

const deleteDepartment = async (id: string) => {
  if (confirm('确定要删除这个部门吗？')) {
    await removeDepartment(id)
    await refreshDepartments()
  }
}

const submitForm = async () => {
  try {
    const data = {
      ...formData.value,
      parent_id: formData.value.parent_id || undefined
    }
    
    if (showEditDialog.value && currentEditId.value) {
      await updateDepartment(currentEditId.value, data)
    } else {
      await createDepartment(data)
    }
    
    await refreshDepartments()
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
    name: '',
    code: '',
    parent_id: '',
    manager: '',
    description: '',
    status: 'active'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化数据
onMounted(async () => {
  await refreshDepartments()
})
</script> 