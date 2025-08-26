<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-color">BOM物料清单管理</h1>
        <p class="text-muted-color mt-1">管理产品物料清单，维护产品结构和用料关系</p>
      </div>
      <Button @click="showCreateDialog = true" />
    </div>

    <!-- BOM概览 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-600 dark:text-blue-400 text-sm font-medium">总BOM数</p>
              <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {{ stats.totalBOMs }}
              </p>
            </div>
            <div class="bg-blue-100 dark:bg-blue-800 p-3 -full">
              <i class="pi pi-file-text text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-green-50 dark:bg-green-900/20 border-green-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-600 dark:text-green-400 text-sm font-medium">已审核</p>
              <p class="text-2xl font-bold text-green-900 dark:text-green-100">
                {{ stats.approvedBOMs }}
              </p>
            </div>
            <div class="bg-green-100 dark:bg-green-800 p-3 -full">
              <i class="pi pi-check-circle text-green-600 dark:text-green-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-yellow-600 dark:text-yellow-400 text-sm font-medium">待审核</p>
              <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {{ stats.pendingBOMs }}
              </p>
            </div>
            <div class="bg-yellow-100 dark:bg-yellow-800 p-3 -full">
              <i class="pi pi-clock text-yellow-600 dark:text-yellow-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-600 dark:text-purple-400 text-sm font-medium">涉及物料</p>
              <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {{ stats.totalMaterials }}
              </p>
            </div>
            <div class="bg-purple-100 dark:bg-purple-800 p-3 -full">
              <i class="pi pi-box text-purple-600 dark:text-purple-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 筛选和搜索 -->
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-color">搜索筛选</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">产品名称</label>
            <Input v-model="searchQuery" placeholder="输入产品名称搜索" class="w-full" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">BOM状态</label>
            <Select
              v-model="selectedStatus"
              :options="statusOptions"
              option-option-value="value"
              placeholder="全部状态"
              class="w-full"
              show-clear
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">产品类别</label>
            <Select
              v-model="selectedCategory"
              :options="categoryOptions"
              option-option-value="value"
              placeholder="全部类别"
              class="w-full"
              show-clear
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">BOM版本</label>
            <Input v-model="selectedVersion" placeholder="输入版本号" class="w-full" />
          </div>
        </div>
      </template>
    </Card>

    <!-- BOM列表 -->
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-color">BOM列表</h3>
      </template>
      <template #content>
        <Table
          :value="paginatedBOMs"
          :loading="loading"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
          class="p-4"
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-file-text text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无BOM数据</h3>
              <p class="mb-4">开始创建您的第一个BOM</p>
              <Button @click="showCreateDialog = true" />
            </div>
          </template>

          <TableHead field="product_name" header="产品信息" :sortable="true">
            <template #body="slotProps">
              <div>
                <span class="font-medium text-color">{{ slotProps.data.product_name }}</span>
                <div class="text-sm text-muted-color">编号: {{ slotProps.data.product_code }}</div>
                <div class="text-sm text-muted-color">
                  类别: {{ getCategoryText(slotProps.data.product_category) }}
                </div>
              </div>
            </template>
          </TableHead>

          <TableHead field="version" header="BOM版本" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono bg-surface-100 px-2 py-1 text-primary text-sm">
                {{ slotProps.data.version }}
              </span>
            </template>
          </TableHead>

          <TableHead field="status" header="状态" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="getStatusText(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </TableHead>

          <TableHead field="material_count" header="物料数量" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold">{{ slotProps.data.material_count }}</span>
            </template>
          </TableHead>

          <TableHead field="total_cost" header="总成本" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-green-600">
                ¥{{ slotProps.data.total_cost.toFixed(2) }}
              </span>
            </template>
          </TableHead>

          <TableHead field="effective_date" header="生效日期" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.effective_date) }}
              </span>
            </template>
          </TableHead>

          <TableHead header="操作" class="w-40">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button size="sm" @click="viewBOM(slotProps.data)" />
                <Button size="sm" @click="editBOM(slotProps.data)" />
                <Button size="sm" @click="copyBOM(slotProps.data)" />
                <Button size="sm" severity="danger" @click="confirmDelete(slotProps.data)" />
              </div>
            </template>
          </TableHead>
        </Table>
      </template>
    </Card>

    <!-- 分页 -->
    <div class="flex justify-between items-center">
      <span class="text-sm text-muted-color">
        共 {{ filteredBOMs.length }} 条记录，每页显示 {{ pageSize }} 条
      </span>
      <!-- Paginator 组件已移除 -->
    </div>
  </div>
</template>

<script setup lang="ts">
// import Card from 'primevue/card' // 已移除PrimeVue导入
// import Button from 'primevue/button' // 已移除PrimeVue导入
// import InputText from 'primevue/inputtext' // 已移除PrimeVue导入
// import Dropdown from 'primevue/dropdown' // 已移除PrimeVue导入
// import DataTable from 'primevue/datatable' // 已移除PrimeVue导入
// import Column from 'primevue/column' // 已移除PrimeVue导入
// import Tag from 'primevue/tag' // 已移除PrimeVue导入
// import Paginator from 'primevue/paginator' // 已移除PrimeVue导入
// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const selectedVersion = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showCreateDialog = ref(false)

// 选项数据
const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已审核', value: 'approved' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
])

const categoryOptions = ref([
  { label: '全部类别', value: '' },
  { label: '电子产品', value: 'electronics' },
  { label: '机械产品', value: 'mechanical' },
  { label: '化工产品', value: 'chemical' },
])

// 统计数据
const stats = ref({
  totalBOMs: 25,
  approvedBOMs: 18,
  pendingBOMs: 5,
  totalMaterials: 156,
})

// 模拟BOM数据
const boms = ref([
  {
    id: 1,
    product_code: 'PRD-001',
    product_name: '智能手机X1',
    product_category: 'electronics',
    version: 'V1.0',
    is_current: true,
    material_count: 25,
    total_quantity: 150,
    total_cost: 1250.5,
    status: 'active',
    created_by: '张工程师',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-20'),
    effective_date: new Date('2024-01-20'),
  },
  {
    id: 2,
    product_code: 'PRD-002',
    product_name: '平板电脑T1',
    product_category: 'electronics',
    version: 'V2.1',
    is_current: true,
    material_count: 32,
    total_quantity: 180,
    total_cost: 1850.75,
    status: 'approved',
    created_by: '李工程师',
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-18'),
  },
  {
    id: 3,
    product_code: 'PRD-003',
    product_name: '机械键盘K1',
    product_category: 'mechanical',
    version: 'V1.5',
    is_current: false,
    material_count: 18,
    total_quantity: 95,
    total_cost: 680.25,
    status: 'inactive',
    created_by: '王工程师',
    created_at: new Date('2023-12-20'),
    updated_at: new Date('2024-01-05'),
  },
  {
    id: 4,
    product_code: 'PRD-004',
    product_name: '无线耳机E1',
    product_category: 'electronics',
    version: 'V1.0',
    is_current: true,
    material_count: 15,
    total_quantity: 75,
    total_cost: 420.8,
    status: 'draft',
    created_by: '赵工程师',
    created_at: new Date('2024-01-25'),
    updated_at: new Date('2024-01-25'),
  },
  {
    id: 5,
    product_code: 'PRD-005',
    product_name: '智能手表W1',
    product_category: 'electronics',
    version: 'V3.0',
    is_current: true,
    material_count: 28,
    total_quantity: 120,
    total_cost: 980.6,
    status: 'active',
    created_by: '孙工程师',
    created_at: new Date('2024-01-12'),
    updated_at: new Date('2024-01-22'),
  },
])

// 筛选后的BOM
const filteredBOMs = computed(() => {
  return boms.value.filter((bom) => {
    const matchesSearch
      = !searchQuery.value || bom.product_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !selectedStatus.value || bom.status === selectedStatus.value
    const matchesCategory
      = !selectedCategory.value || bom.product_category === selectedCategory.value
    const matchesVersion
      = !selectedVersion.value
        || bom.version.toLowerCase().includes(selectedVersion.value.toLowerCase())

    return matchesSearch && matchesStatus && matchesCategory && matchesVersion
  })
})

// 分页后的BOM
const paginatedBOMs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBOMs.value.slice(start, end)
})

// 辅助函数
const getCategoryText = (category: string): string => {
  const categories: Record<string, string> = {
    electronics: '电子产品',
    mechanical: '机械产品',
    chemical: '化工产品',
  }
  return categories[category] || '未知类别'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    draft: '草稿',
    approved: '已审核',
    active: '启用',
    inactive: '停用',
  }
  return texts[status] || '未知状态'
}

const getStatusSeverity = (status: string): string => {
  const severityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    draft: 'outline',
    approved: 'secondary',
    active: 'default',
    inactive: 'destructive',
  }
  return severityMap[status] || 'secondary'
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN')
}

// 操作函数
const viewBOM = (bom: any) => {
  console.log('查看BOM:', bom)
}

const editBOM = (bom: any) => {
  console.log('编辑BOM:', bom)
}

const copyBOM = (bom: any) => {
  console.log('复制BOM:', bom)
}

const deleteBOM = (bomId: number) => {
  console.log('删除BOM:', bomId)
  boms.value = boms.value.filter(bom => bom.id !== bomId)
}

const confirmDelete = (bom: any) => {
  if (confirm(`确定要删除 ${bom.product_name} 的BOM吗？`)) {
    deleteBOM(bom.id)
  }
}

// 页面标题
useHead({
  title: 'BOM物料清单管理 - ERP 管理系统',
})

// 页面元数据
definePageMeta({
  layout: 'default',
})
</script>
