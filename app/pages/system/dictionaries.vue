<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">字典管理</h1>
        <p class="text-muted-color">管理系统字典数据和配置项</p>
      </div>
      <Button
        label="新增字典"
        icon="pi pi-plus"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-sm font-medium text-color">搜索</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchQuery"
                placeholder="搜索字典名称、编码..."
                class="w-full"
              />
            </span>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">字典类型</label>
            <Dropdown
              v-model="typeFilter"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="全部类型"
              class="w-full"
              show-clear
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">状态</label>
            <Dropdown
              v-model="statusFilter"
              :options="statusFilterOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              class="w-full"
              show-clear
            />
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <Button
            label="重置筛选"
            icon="pi pi-refresh"
            outlined
            @click="resetFilters"
          />
        </div>
      </template>
    </Card>

    <!-- 字典列表 -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-color">字典列表</h3>
          <span class="text-sm text-muted-color">共 {{ filteredDictionaries.length }} 条记录</span>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="filteredDictionaries"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :total-records="filteredDictionaries.length"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-database text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无字典数据</h3>
              <p class="mb-4">开始创建您的第一个字典</p>
              <Button
                label="新增字典"
                icon="pi pi-plus"
                @click="showCreateDialog = true"
              />
            </div>
          </template>

          <Column field="code" header="字典编码" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono bg-surface-100 px-2 py-1 rounded text-primary text-sm">
                {{ slotProps.data.code }}
              </span>
            </template>
          </Column>

          <Column field="name" header="字典名称" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :label="slotProps.data.name.charAt(0)"
                  shape="circle"
                  size="normal"
                  class="bg-primary-100 text-primary"
                />
                <div>
                  <div class="font-medium text-color">{{ slotProps.data.name }}</div>
                  <div class="text-sm text-muted-color">{{ slotProps.data.description || '暂无描述' }}</div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="type" header="类型" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="getTypeText(slotProps.data.type)"
                :severity="getTypeSeverity(slotProps.data.type)"
              />
            </template>
          </Column>

          <Column field="itemCount" header="项目数量" :sortable="true">
            <template #body="slotProps">
              <span class="inline-flex items-center gap-1 text-sm">
                <i class="pi pi-list text-muted-color"></i>
                {{ slotProps.data.items?.length || 0 }} 个
              </span>
            </template>
          </Column>

          <Column field="status" header="状态" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.status === 'active' ? '启用' : '禁用'"
                :severity="slotProps.data.status === 'active' ? 'success' : 'danger'"
              />
            </template>
          </Column>

          <Column field="updatedAt" header="更新时间" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDateTime(slotProps.data.updatedAt) }}
              </span>
            </template>
          </Column>

          <Column header="操作" class="w-40">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button
                  v-tooltip="'查看项目'"
                  icon="pi pi-list"
                  outlined
                  rounded
                  size="small"
                  @click="viewDictionaryItems(slotProps.data)"
                />
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  outlined
                  rounded
                  size="small"
                  @click="editDictionary(slotProps.data)"
                />
                <Button
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  outlined
                  rounded
                  size="small"
                  severity="danger"
                  @click="confirmDeleteDictionary(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 创建/编辑字典对话框 -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="editingDictionary ? '编辑字典' : '新增字典'"
      modal
      :style="{ width: '600px' }"
      class="p-fluid"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">字典编码 *</label>
            <InputText
              v-model="currentDictionary.code"
              placeholder="输入字典编码"
              :disabled="editingDictionary"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">字典名称 *</label>
            <InputText
              v-model="currentDictionary.name"
              placeholder="输入字典名称"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">字典类型 *</label>
            <Dropdown
              v-model="currentDictionary.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="选择字典类型"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">状态</label>
            <Dropdown
              v-model="currentDictionary.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-color">描述</label>
          <Textarea
            v-model="currentDictionary.description"
            placeholder="输入字典描述"
            :rows="3"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            outlined
            @click="showCreateDialog = false"
          />
          <Button
            :label="editingDictionary ? '更新' : '创建'"
            :loading="saving"
            @click="saveDictionary"
          />
        </div>
      </template>
    </Dialog>

    <!-- 字典项目管理对话框 -->
    <Dialog
      v-model:visible="showItemsDialog"
      :header="`管理字典项目: ${selectedDictionary?.name}`"
      modal
      :style="{ width: '900px' }"
      maximizable
    >
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h4 class="text-lg font-semibold text-color">字典项目列表</h4>
          <Button
            label="新增项目"
            icon="pi pi-plus"
            size="small"
            @click="addNewItem"
          />
        </div>

        <DataTable
          :value="currentItems"
          striped-rows
          responsive-layout="scroll"
        >
          <template #empty>
            <div class="text-center py-8 text-muted-color">
              <i class="pi pi-inbox text-4xl mb-2 opacity-50"></i>
              <p>暂无字典项目</p>
            </div>
          </template>

          <Column header="项目值" class="w-32">
            <template #body="slotProps">
              <InputText
                v-model="slotProps.data.value"
                size="small"
                placeholder="项目值"
              />
            </template>
          </Column>

          <Column header="项目标签" class="flex-1">
            <template #body="slotProps">
              <InputText
                v-model="slotProps.data.label"
                size="small"
                placeholder="项目标签"
              />
            </template>
          </Column>

          <Column header="排序" class="w-24">
            <template #body="slotProps">
              <InputNumber
                v-model="slotProps.data.sort"
                size="small"
                :min="0"
                :max="999"
              />
            </template>
          </Column>

          <Column header="状态" class="w-32">
            <template #body="slotProps">
              <Dropdown
                v-model="slotProps.data.status"
                :options="itemStatusOptions"
                option-label="label"
                option-value="value"
                size="small"
              />
            </template>
          </Column>

          <Column header="操作" class="w-20">
            <template #body="slotProps">
              <Button
                v-tooltip="'删除'"
                icon="pi pi-trash"
                text
                rounded
                size="small"
                severity="danger"
                @click="removeItem(slotProps.index)"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            outlined
            @click="showItemsDialog = false"
          />
          <Button
            label="保存项目"
            :loading="saving"
            @click="saveDictionaryItems"
          />
        </div>
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

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
const confirm = useConfirm()

// 当前编辑的字典
const currentDictionary = ref({
  id: '',
  code: '',
  name: '',
  type: 'system',
  status: 'active',
  description: '',
  items: [] as any[]
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
      { value: 'locked', label: '锁定', sort: 3, status: 'active' }
    ],
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
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
      { value: 'cancelled', label: '已取消', sort: 5, status: 'active' }
    ],
    createdAt: new Date('2025-01-16'),
    updatedAt: new Date('2025-01-16')
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
      { value: 'materials', label: '原材料', sort: 3, status: 'active' }
    ],
    createdAt: new Date('2025-01-17'),
    updatedAt: new Date('2025-01-17')
  }
])

// 选项数据
const typeOptions = [
  { label: '系统', value: 'system' },
  { label: '业务', value: 'business' },
  { label: '配置', value: 'config' }
]

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
]

const statusFilterOptions = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
]

const itemStatusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
]

// 计算属性
const filteredDictionaries = computed(() => {
  let result = dictionaries.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(dict =>
      dict.name.toLowerCase().includes(query)
      || dict.code.toLowerCase().includes(query)
      || dict.description?.toLowerCase().includes(query)
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
    config: '配置'
  }
  return typeMap[type] || type
}

const getTypeSeverity = (type: string) => {
  const severityMap: Record<string, string> = {
    system: 'info',
    business: 'success',
    config: 'warn'
  }
  return severityMap[type] || 'secondary'
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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
  confirm.require({
    message: `确定要删除字典 "${dictionary.name}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteDictionary(dictionary.id)
    }
  })
}

const deleteDictionary = async (dictionaryId: string) => {
  try {
    loading.value = true
    const index = dictionaries.value.findIndex(d => d.id === dictionaryId)
    if (index !== -1) {
      dictionaries.value.splice(index, 1)
    }
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
        if (index !== -1) {
          dictionaries.value[index] = {
            ...dictionaries.value[index],
            ...currentDictionary.value,
            updatedAt: new Date()
          }
        }
      }
    else {
      // 创建新字典
      const newDictionary = {
        ...currentDictionary.value,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      dictionaries.value.push(newDictionary)
    }

    showCreateDialog.value = false
    editingDictionary.value = false
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
    status: 'active'
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
        if (index !== -1) {
          dictionaries.value[index].items = [...currentItems.value]
          dictionaries.value[index].updatedAt = new Date()
        }
      }
      showItemsDialog.value = false
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
