<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">字典管理</h1>
        <p class="text-muted-foreground">管理系统数据字典和配置项</p>
      </div>
      <Button @click="showCreateDialog = true" class="bg-green-600 hover:bg-green-700">
        <Plus class="w-4 h-4 mr-2" />
        新增字典
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
              placeholder="字典名称、编码..."
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">字典类型</label>
            <Select v-model="typeFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部类型</SelectItem>
                <SelectItem value="system">系统字典</SelectItem>
                <SelectItem value="business">业务字典</SelectItem>
                <SelectItem value="config">配置字典</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">状态</label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
              </SelectContent>
            </Select>
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

    <!-- 字典列表 -->
    <Card>
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">字典列表</h2>
        <div class="text-sm text-muted-foreground">
          共 {{ filteredDictionaries.length }} 个字典
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>字典编码</TableHead>
              <TableHead>字典名称</TableHead>
              <TableHead>字典类型</TableHead>
              <TableHead>项目数量</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="dict in filteredDictionaries" :key="dict.id">
              <TableCell class="font-mono text-sm">{{ dict.code }}</TableCell>
              <TableCell class="font-medium">{{ dict.name }}</TableCell>
              <TableCell>
                <Badge :variant="getTypeVariant(dict.type)">
                  {{ getTypeName(dict.type) }}
                </Badge>
              </TableCell>
              <TableCell>{{ dict.item_count }}项</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(dict.status)">
                  {{ getStatusName(dict.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="viewDictionary(dict)">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" @click="editDictionary(dict)">
                    <Edit3 class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" @click="manageItems(dict)">
                    <List class="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    @click="deleteDictionary(dict.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredDictionaries.length === 0">
              <TableCell colspan="6" class="text-center text-muted-foreground">
                暂无字典数据
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>

    <!-- 创建/编辑字典对话框 -->
    <Dialog :open="showCreateDialog || showEditDialog" @update:open="(open) => !open && cancelForm()">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{ showEditDialog ? '编辑字典' : '新增字典' }}
          </DialogTitle>
        </DialogHeader>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">字典编码</label>
              <Input v-model="formData.code" placeholder="如: DICT_USER_STATUS" required />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">字典名称</label>
              <Input v-model="formData.name" placeholder="如: 用户状态" required />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">字典类型</label>
              <Select v-model="formData.type" required>
                <SelectTrigger>
                  <SelectValue placeholder="请选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">系统字典</SelectItem>
                  <SelectItem value="business">业务字典</SelectItem>
                  <SelectItem value="config">配置字典</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">状态</label>
              <Select v-model="formData.status" required>
                <SelectTrigger>
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">字典描述</label>
            <Textarea 
              v-model="formData.description"
              rows="3"
              placeholder="请输入字典描述"
            />
          </div>
          
          <DialogFooter>
            <Button type="submit">
              {{ showEditDialog ? '更新' : '创建' }}
            </Button>
            <Button type="button" variant="outline" @click="cancelForm">
              取消
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- 字典项管理对话框 -->
    <Dialog :open="showItemsDialog" @update:open="(open) => !open && closeItemsDialog()">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <div class="flex justify-between items-center">
            <DialogTitle>
              管理字典项 - {{ currentDictionary?.name }}
            </DialogTitle>
            <Button @click="showAddItemDialog = true" size="sm">
              <Plus class="w-4 h-4 mr-2" />
              新增项目
            </Button>
          </div>
        </DialogHeader>
        
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>项目编码</TableHead>
                <TableHead>项目名称</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in dictionaryItems" :key="item.id">
                <TableCell class="font-mono text-sm">{{ item.code }}</TableCell>
                <TableCell>{{ item.name }}</TableCell>
                <TableCell>{{ item.sort_order }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(item.status)">
                    {{ getStatusName(item.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline" @click="editItem(item)">
                      <Edit3 class="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      @click="deleteItem(item.id)"
                      class="text-red-600 hover:text-red-700"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="closeItemsDialog">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Eye, Edit3, Trash2, List } from 'lucide-vue-next'
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
  title: '字典管理 - ERP 管理系统'
})

// 数据管理
const { dictionaries, createDictionary, updateDictionary, deleteDictionary: removeDictionary, refreshDictionaries } = useDictionaries()

// 响应式数据
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showItemsDialog = ref(false)
const showAddItemDialog = ref(false)
const currentEditId = ref<string | null>(null)
const currentDictionary = ref<any>(null)
const dictionaryItems = ref<any[]>([])

// 表单数据
const formData = ref({
  code: '',
  name: '',
  type: '',
  status: 'active',
  description: ''
})

// 计算属性
const filteredDictionaries = computed(() => {
  let filtered = dictionaries.value
  
  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(dict => 
      dict.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      dict.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 类型过滤
  if (typeFilter.value) {
    filtered = filtered.filter(dict => dict.type === typeFilter.value)
  }
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(dict => dict.status === statusFilter.value)
  }
  
  return filtered
})

// 方法
const resetFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  statusFilter.value = ''
}

const getTypeName = (type: string) => {
  const types = {
    system: '系统字典',
    business: '业务字典',
    config: '配置字典'
  }
  return types[type as keyof typeof types] || type
}

const getStatusName = (status: string) => {
  const statuses = {
    active: '启用',
    inactive: '停用'
  }
  return statuses[status as keyof typeof statuses] || status
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

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'system':
      return 'default'
    case 'business':
      return 'secondary'
    case 'config':
      return 'outline'
    default:
      return 'secondary'
  }
}

const viewDictionary = (dict: any) => {
  // TODO: 实现查看字典详情
  console.log('查看字典:', dict)
}

const editDictionary = (dict: any) => {
  formData.value = {
    code: dict.code,
    name: dict.name,
    type: dict.type,
    status: dict.status,
    description: dict.description || ''
  }
  currentEditId.value = dict.id
  showEditDialog.value = true
}

const manageItems = (dict: any) => {
  currentDictionary.value = dict
  // TODO: 加载字典项数据
  dictionaryItems.value = [
    { id: '1', code: 'ACTIVE', name: '启用', sort_order: 1, status: 'active' },
    { id: '2', code: 'INACTIVE', name: '停用', sort_order: 2, status: 'active' }
  ]
  showItemsDialog.value = true
}

const deleteDictionary = async (id: string) => {
  if (confirm('确定要删除这个字典吗？')) {
    await removeDictionary(id)
    await refreshDictionaries()
  }
}

const submitForm = async () => {
  try {
    if (showEditDialog.value && currentEditId.value) {
      await updateDictionary(currentEditId.value, formData.value)
    } else {
      await createDictionary(formData.value)
    }
    
    await refreshDictionaries()
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
    type: '',
    status: 'active',
    description: ''
  }
}

const closeItemsDialog = () => {
  showItemsDialog.value = false
  currentDictionary.value = null
  dictionaryItems.value = []
}

const editItem = (item: any) => {
  // TODO: 实现编辑字典项
  console.log('编辑字典项:', item)
}

const deleteItem = (id: string) => {
  // TODO: 实现删除字典项
  console.log('删除字典项:', id)
}

// 初始化数据
onMounted(async () => {
  await refreshDictionaries()
})
</script>