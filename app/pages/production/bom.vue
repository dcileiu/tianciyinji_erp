<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">BOM物料清单管理</h1>
        <p class="text-muted-foreground mt-1">
          管理产品物料清单，维护产品结构和用料关系
        </p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="w-4 h-4 mr-2" />
        新建BOM
      </Button>
    </div>

    <!-- BOM概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-blue-500/10 rounded-full">
            <FileText class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              总BOM数
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ stats.totalBOMs }}
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
              已审核
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ stats.approvedBOMs }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-500/10 rounded-full">
            <Clock class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              待审核
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ stats.pendingBOMs }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-500/10 rounded-full">
            <Package class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              涉及物料
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ stats.totalMaterials }}
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
            产品名称
          </label>
          <Input
            v-model="searchQuery"
            placeholder="输入产品名称搜索"
            class="w-full"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            BOM状态
          </label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="approved">已审核</option>
            <option value="active">启用</option>
            <option value="inactive">停用</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            产品类别
          </label>
          <select
            v-model="selectedCategory"
            class="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">全部类别</option>
            <option value="electronics">电子产品</option>
            <option value="mechanical">机械产品</option>
            <option value="chemical">化工产品</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            BOM版本
          </label>
          <Input
            v-model="selectedVersion"
            placeholder="输入版本号"
            class="w-full"
          />
        </div>
      </div>
    </Card>

    <!-- BOM列表 -->
    <Card class="p-6">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-4 font-medium text-foreground">
                产品信息
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                BOM版本
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                物料数量
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                总成本
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                状态
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                创建时间
              </th>
              <th class="text-left py-3 px-4 font-medium text-foreground">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="bom in paginatedBOMs"
              :key="bom.id"
              class="border-b border-border hover:bg-accent/20 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="font-medium text-foreground">
                  {{ bom.product_name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ bom.product_code }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ getCategoryText(bom.product_category) }}
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="font-medium text-foreground">
                  {{ bom.version }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ bom.is_current ? '当前版本' : '历史版本' }}
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="font-medium text-foreground">
                  {{ bom.material_count }} 种
                </div>
                <div class="text-sm text-muted-foreground">
                  总用量: {{ bom.total_quantity }}
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="font-medium text-foreground">
                  ¥{{ bom.total_cost?.toFixed(2) || '0.00' }}
                </div>
                <div class="text-sm text-muted-foreground">
                  单位成本
                </div>
              </td>
              <td class="py-3 px-4">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getStatusColor(bom.status)
                ]">
                  {{ getStatusText(bom.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="text-sm text-foreground">
                  {{ formatDate(bom.created_at) }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ bom.created_by }}
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" @click="viewBOM(bom)">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" @click="editBOM(bom)">
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" @click="copyBOM(bom)">
                    <Copy class="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    @click="deleteBOM(bom.id)"
                    class="text-destructive hover:text-destructive"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-muted-foreground">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到 
          {{ Math.min(currentPage * pageSize, filteredBOMs.length) }} 条，
          共 {{ filteredBOMs.length }} 条记录
        </div>
        <div class="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </Button>
          <span class="text-sm text-muted-foreground">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <Button
            size="sm"
            variant="outline"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  Package,
  Eye,
  Edit,
  Copy,
  Trash2
} from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

// 响应式数据
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const selectedVersion = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showCreateDialog = ref(false)

// 统计数据
const stats = ref({
  totalBOMs: 25,
  approvedBOMs: 18,
  pendingBOMs: 5,
  totalMaterials: 156
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
    total_cost: 1250.50,
    status: 'active',
    created_by: '张工程师',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-20')
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
    updated_at: new Date('2024-01-18')
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
    updated_at: new Date('2024-01-05')
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
    total_cost: 420.80,
    status: 'draft',
    created_by: '赵工程师',
    created_at: new Date('2024-01-25'),
    updated_at: new Date('2024-01-25')
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
    total_cost: 980.60,
    status: 'active',
    created_by: '孙工程师',
    created_at: new Date('2024-01-12'),
    updated_at: new Date('2024-01-22')
  }
])

// 筛选后的BOM
const filteredBOMs = computed(() => {
  return boms.value.filter(bom => {
    const matchesSearch = !searchQuery.value || 
      bom.product_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !selectedStatus.value || bom.status === selectedStatus.value
    const matchesCategory = !selectedCategory.value || bom.product_category === selectedCategory.value
    const matchesVersion = !selectedVersion.value || 
      bom.version.toLowerCase().includes(selectedVersion.value.toLowerCase())
    
    return matchesSearch && matchesStatus && matchesCategory && matchesVersion
  })
})

// 分页后的BOM
const paginatedBOMs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBOMs.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredBOMs.value.length / pageSize.value)
})

// 辅助函数
const getCategoryText = (category: string): string => {
  const categories: Record<string, string> = {
    electronics: '电子产品',
    mechanical: '机械产品',
    chemical: '化工产品'
  }
  return categories[category] || '未知类别'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    approved: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    draft: '草稿',
    approved: '已审核',
    active: '启用',
    inactive: '停用'
  }
  return texts[status] || '未知状态'
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
}

// 页面标题
useHead({
  title: 'BOM物料清单管理 - ERP 管理系统'
})

// 页面元数据
definePageMeta({
  middleware: 'auth'
})
</script>