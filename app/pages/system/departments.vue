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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>部门名称</TableHead>
              <TableHead>部门编码</TableHead>
              <TableHead>上级部门</TableHead>
              <TableHead>负责人</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="department in filteredDepartments" :key="department.id">
              <TableCell class="font-medium">{{ department.name }}</TableCell>
              <TableCell class="font-mono text-sm">{{ department.code }}</TableCell>
              <TableCell class="text-muted-foreground">{{ getParentName(department.parent_id) || '无' }}</TableCell>
              <TableCell>{{ department.manager }}</TableCell>
              <TableCell class="text-muted-foreground">{{ department.description || '-' }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(department.status)">
                  {{ department.status === 'active' ? '启用' : '禁用' }}
                </Badge>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">
                {{ formatDate(department.created_at) }}
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredDepartments.length === 0">
              <TableCell colspan="8" class="text-center text-muted-foreground">
                暂无部门数据
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>

    <!-- 创建/编辑部门对话框 -->
    <Dialog :open="showCreateDialog || showEditDialog" @update:open="(open) => !open && cancelForm()">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ showEditDialog ? '编辑部门' : '新增部门' }}
          </DialogTitle>
        </DialogHeader>
        
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
            <Select v-model="formData.parent_id">
              <SelectTrigger>
                <SelectValue placeholder="选择上级部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">无上级部门</SelectItem>
                <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">负责人</label>
            <Input v-model="formData.manager" placeholder="请输入负责人姓名" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">描述</label>
            <Textarea 
              v-model="formData.description"
              placeholder="请输入部门描述"
              rows="3"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">状态</label>
            <Select v-model="formData.status">
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" @click="cancelForm">
              取消
            </Button>
            <Button type="submit">
              {{ showEditDialog ? '更新' : '创建' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Edit3, Trash2 } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'destructive'
    default:
      return 'secondary'
  }
}

// 初始化数据
onMounted(async () => {
  await refreshDepartments()
})
</script>