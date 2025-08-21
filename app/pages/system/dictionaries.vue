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
            <select v-model="typeFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部类型</option>
              <option value="system">系统字典</option>
              <option value="business">业务字典</option>
              <option value="config">配置字典</option>
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

    <!-- 字典列表 -->
    <Card>
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">字典列表</h2>
        <div class="text-sm text-muted-foreground">
          共 {{ filteredDictionaries.length }} 个字典
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">字典编码</th>
              <th class="p-4 font-medium">字典名称</th>
              <th class="p-4 font-medium">字典类型</th>
              <th class="p-4 font-medium">项目数量</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dict in filteredDictionaries" :key="dict.id" class="border-b hover:bg-muted/50">
              <td class="p-4 font-mono text-sm">{{ dict.code }}</td>
              <td class="p-4 font-medium">{{ dict.name }}</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-blue-100 text-blue-800': dict.type === 'system',
                    'bg-green-100 text-green-800': dict.type === 'business',
                    'bg-purple-100 text-purple-800': dict.type === 'config'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getTypeName(dict.type) }}
                </span>
              </td>
              <td class="p-4">{{ dict.item_count }}项</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': dict.status === 'active',
                    'bg-red-100 text-red-800': dict.status === 'inactive'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusName(dict.status) }}
                </span>
              </td>
              <td class="p-4">
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
              </td>
            </tr>
            <tr v-if="filteredDictionaries.length === 0">
              <td colspan="6" class="p-8 text-center text-muted-foreground">
                暂无字典数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 创建/编辑字典对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditDialog ? '编辑字典' : '新增字典' }}
        </h3>
        
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
              <select v-model="formData.type" class="w-full px-3 py-2 border rounded-md" required>
                <option value="">请选择类型</option>
                <option value="system">系统字典</option>
                <option value="business">业务字典</option>
                <option value="config">配置字典</option>
              </select>
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
            <label class="block text-sm font-medium mb-1">字典描述</label>
            <textarea 
              v-model="formData.description"
              class="w-full px-3 py-2 border rounded-md resize-none"
              rows="3"
              placeholder="请输入字典描述"
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

    <!-- 字典项管理对话框 -->
    <div v-if="showItemsDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            管理字典项 - {{ currentDictionary?.name }}
          </h3>
          <Button @click="showAddItemDialog = true" size="sm">
            <Plus class="w-4 h-4 mr-2" />
            新增项目
          </Button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b">
              <tr class="text-left">
                <th class="p-4 font-medium">项目编码</th>
                <th class="p-4 font-medium">项目名称</th>
                <th class="p-4 font-medium">排序</th>
                <th class="p-4 font-medium">状态</th>
                <th class="p-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in dictionaryItems" :key="item.id" class="border-b hover:bg-muted/50">
                <td class="p-4 font-mono text-sm">{{ item.code }}</td>
                <td class="p-4">{{ item.name }}</td>
                <td class="p-4">{{ item.sort_order }}</td>
                <td class="p-4">
                  <span 
                    :class="{
                      'bg-green-100 text-green-800': item.status === 'active',
                      'bg-red-100 text-red-800': item.status === 'inactive'
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusName(item.status) }}
                  </span>
                </td>
                <td class="p-4">
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="flex gap-3 pt-4">
          <Button variant="outline" @click="closeItemsDialog" class="flex-1">
            关闭
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Eye, Edit3, Trash2, List } from 'lucide-vue-next'

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