<template>
  <div class="p-6">
    <!-- 页面头部 -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-3">
        <BookOpen class="h-8 w-8 text-blue-600" />
        <h1 class="text-2xl font-bold text-gray-900">数据字典管理</h1>
      </div>
      <Button
        class="bg-blue-600 hover:bg-blue-700"
        @click="
          showCreateDialog = true
          editingDictionary = false
          currentDictionary = {
            id: '',
            code: '',
            name: '',
            type: 'system',
            status: 'active',
            description: '',
            items: [],
          }
        "
      >
        <Plus class="h-4 w-4 mr-2" />
        新建字典
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card class="mb-6">
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input v-model="searchQuery" placeholder="搜索字典名称、编码..." class="pl-10" />
          </div>
          <Select v-model="typeFilter">
            <SelectTrigger>
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部类型</SelectItem>
              <SelectItem v-for="option in typeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="statusFilter">
            <SelectTrigger>
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="option in statusFilterOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" class="w-full" @click="resetFilters">
            <RefreshCw class="h-4 w-4 mr-2" />
            重置
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 字典列表 -->
    <Card>
      <CardHeader>
        <CardTitle>字典列表</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>字典编码</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>项目数量</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="filteredDictionaries.length === 0">
              <TableCell colspan="6" class="text-center py-8">
                <div class="flex flex-col items-center">
                  <BookOpen class="h-12 w-12 text-gray-400 mb-4" />
                  <p class="text-gray-500">暂无字典数据</p>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-for="dictionary in filteredDictionaries" :key="dictionary.id">
              <TableCell>
                <div class="flex items-center space-x-3">
                  <div class="h-10 w-10 -full bg-blue-100 flex items-center justify-center">
                    <span class="text-blue-600 font-medium">{{ dictionary.code.charAt(0) }}</span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ dictionary.code }}</div>
                    <div class="text-sm text-gray-500">{{ dictionary.name }}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getTypeSeverity(dictionary.type)">
                  {{ getTypeText(dictionary.type) }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="dictionary.status === 'active' ? 'default' : 'destructive'">
                  {{ dictionary.status === 'active' ? '启用' : '禁用' }}
                </Badge>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-500">{{ dictionary.items?.length || 0 }} 项</span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-500">{{ formatDateTime(dictionary.updatedAt) }}</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" @click="viewDictionaryItems(dictionary)">
                    <List class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="editDictionary(dictionary)">
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="confirmDeleteDictionary(dictionary)">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- 创建/编辑字典对话框 -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editingDictionary ? '编辑字典' : '新建字典' }}</DialogTitle>
        </DialogHeader>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>字典编码 *</Label>
            <Input v-model="currentDictionary.code" placeholder="请输入字典编码" :disabled="editingDictionary" />
          </div>

          <div class="space-y-2">
            <Label>字典名称 *</Label>
            <Input v-model="currentDictionary.name" placeholder="请输入字典名称" />
          </div>

          <div class="space-y-2">
            <Label>字典类型</Label>
            <Select v-model="currentDictionary.type">
              <SelectTrigger>
                <SelectValue placeholder="选择字典类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in typeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>状态</Label>
            <Select v-model="currentDictionary.status">
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

          <div class="space-y-2 md:col-span-2">
            <Label>描述</Label>
            <Textarea v-model="currentDictionary.description" placeholder="请输入字典描述" rows="3" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showCreateDialog = false"> 取消 </Button>
          <Button :disabled="saving" @click="saveDictionary">
            {{ editingDictionary ? '更新' : '创建' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 字典项目管理对话框 -->
    <Dialog v-model:open="showItemsDialog">
      <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>管理字典项目 - {{ selectedDictionary?.name }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h4 class="text-lg font-medium text-gray-900">字典项目列表</h4>
            <Button size="sm" @click="addNewItem">
              <Plus class="h-4 w-4 mr-2" />
              添加项目
            </Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(item, index) in currentItems"
              :key="index"
              class="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border border-gray-200 -lg"
            >
              <div class="space-y-2">
                <Label>值</Label>
                <Input v-model="item.value" placeholder="项目值" />
              </div>

              <div class="space-y-2">
                <Label>标签</Label>
                <Input v-model="item.label" placeholder="显示标签" />
              </div>

              <div class="space-y-2">
                <Label>排序</Label>
                <Input v-model="item.sort" type="number" min="1" max="999" />
              </div>

              <div class="space-y-2">
                <Label>状态</Label>
                <Select v-model="item.status">
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="option in itemStatusOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>操作</Label>
                <Button variant="destructive" size="sm" class="w-full" @click="removeItem(index)">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div v-if="currentItems.length === 0" class="text-center py-8 text-gray-500">
            <List class="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>暂无字典项目，点击上方按钮添加</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showItemsDialog = false"> 取消 </Button>
          <Button :disabled="saving" @click="saveDictionaryItems"> 保存 </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import { BookOpen, Edit, List, Plus, RefreshCw, Search, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')

// 对话框状态
const showCreateDialog = ref(false)
const showItemsDialog = ref(false)
const editingDictionary = ref(false)

// 当前编辑的字典
const currentDictionary = ref({
  id: '',
  code: '',
  name: '',
  type: 'system',
  status: 'active',
  description: '',
  items: [] as any[],
})

// 选中的字典和项目
const selectedDictionary = ref(null as any)
const currentItems = ref([] as any[])

// 模拟字典数据
const dictionaries = ref([
  {
    id: '1',
    code: 'USER_STATUS',
    name: '用户状态',
    type: 'system',
    status: 'active',
    description: '系统用户状态定义',
    items: [
      { value: 'active', label: '启用', sort: 1, status: 'active' },
      { value: 'inactive', label: '禁用', sort: 2, status: 'active' },
      { value: 'locked', label: '锁定', sort: 3, status: 'active' },
    ],
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    code: 'ORDER_STATUS',
    name: '订单状态',
    type: 'business',
    status: 'active',
    description: '订单流程状态定义',
    items: [
      { value: 'pending', label: '待确认', sort: 1, status: 'active' },
      { value: 'confirmed', label: '已确认', sort: 2, status: 'active' },
      { value: 'shipped', label: '已发货', sort: 3, status: 'active' },
      { value: 'delivered', label: '已完成', sort: 4, status: 'active' },
      { value: 'cancelled', label: '已取消', sort: 5, status: 'active' },
    ],
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16'),
  },
  {
    id: '3',
    code: 'PRODUCT_CATEGORY',
    name: '产品分类',
    type: 'business',
    status: 'active',
    description: '产品分类管理',
    items: [
      { value: 'electronics', label: '电子产品', sort: 1, status: 'active' },
      { value: 'machinery', label: '机械设备', sort: 2, status: 'active' },
      { value: 'materials', label: '原材料', sort: 3, status: 'active' },
    ],
    createdAt: new Date('2025-01-17'),
    updatedAt: new Date('2025-01-17'),
  },
])

// 选项数据
const typeOptions = [
  { label: '系统', value: 'system' },
  { label: '业务', value: 'business' },
  { label: '配置', value: 'config' },
]

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
]

const statusFilterOptions = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
]

const itemStatusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
]

// 计算属性
const filteredDictionaries = computed(() => {
  let result = dictionaries.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      dict =>
        dict.name.toLowerCase().includes(query)
        || dict.code.toLowerCase().includes(query)
        || dict.description?.toLowerCase().includes(query),
    )
  }

  if (typeFilter.value) {
    result = result.filter(dict => dict.type === typeFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(dict => dict.status === statusFilter.value)
  }

  return result
})

// 方法
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    system: '系统',
    business: '业务',
    config: '配置',
  }
  return typeMap[type] || type
}

const getTypeSeverity = (type: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const severityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    system: 'default',
    business: 'secondary',
    config: 'outline',
  }
  return severityMap[type] || 'secondary'
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const resetFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  statusFilter.value = ''
}

const editDictionary = (dictionary: any) => {
  editingDictionary.value = true
  currentDictionary.value = { ...dictionary }
  showCreateDialog.value = true
}

const viewDictionaryItems = (dictionary: any) => {
  selectedDictionary.value = dictionary
  currentItems.value = [...(dictionary.items || [])]
  showItemsDialog.value = true
}

const confirmDeleteDictionary = (dictionary: any) => {
  if (confirm(`确定要删除字典 "${dictionary.name}" 吗？此操作不可撤销。`)) {
    deleteDictionary(dictionary.id)
  }
}

const deleteDictionary = async (dictionaryId: string) => {
  try {
    loading.value = true
    const index = dictionaries.value.findIndex(d => d.id === dictionaryId)
    if (index !== -1) {
      dictionaries.value.splice(index, 1)
    }
    toast.success('字典删除成功')
  }
  catch (error) {
    console.error('删除字典失败:', error)
  }
  finally {
    loading.value = false
  }
}

const saveDictionary = async () => {
  try {
    saving.value = true

    if (editingDictionary.value) {
      // 更新字典
      const index = dictionaries.value.findIndex(d => d.id === currentDictionary.value.id)
      if (index !== -1 && dictionaries.value[index]) {
        dictionaries.value[index] = {
          ...dictionaries.value[index],
          ...currentDictionary.value,
          createdAt: dictionaries.value[index].createdAt || new Date(),
          updatedAt: new Date(),
        }
      }
    }
    else {
      // 创建新字典
      const newDictionary = {
        ...currentDictionary.value,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dictionaries.value.push(newDictionary)
    }

    showCreateDialog.value = false
    editingDictionary.value = false
    toast.success('字典保存成功')
  }
  catch (error: any) {
    console.error('保存字典失败:', error)
  }
  finally {
    saving.value = false
  }
}

const addNewItem = () => {
  currentItems.value.push({
    value: '',
    label: '',
    sort: currentItems.value.length + 1,
    status: 'active',
  })
}

const removeItem = (index: number) => {
  currentItems.value.splice(index, 1)
}

const saveDictionaryItems = async () => {
  try {
    saving.value = true
    if (selectedDictionary.value) {
      const index = dictionaries.value.findIndex(d => d.id === selectedDictionary.value!.id)
      if (index !== -1 && dictionaries.value[index]) {
        dictionaries.value[index]!.items = [...currentItems.value]
        dictionaries.value[index]!.updatedAt = new Date()
      }
    }
    showItemsDialog.value = false
    toast.success('字典项目保存成功')
  }
  catch (error: any) {
    console.error('保存字典项目失败:', error)
  }
  finally {
    saving.value = false
  }
}

// 初始化
onMounted(() => {
  // 可以在这里加载数据
})
</script>
