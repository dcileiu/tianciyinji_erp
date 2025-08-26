<template>
  <div>
    <div class="customers-container p-6 space-y-6 bg-gray-50 min-h-full">
      <!-- 页面头部 -->
      <div
        class="page-header bg-gradient-to-r from-green-500 via-green-600 to-green-700 -2xl p-8 text-white relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <div class="absolute -top-4 -right-4 w-32 h-32 bg-white opacity-5 -full"></div>
        <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-white opacity-5 -full"></div>
        <div class="relative z-10">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2 flex items-center">
                <Users class="mr-3 h-8 w-8" />
                客户管理
              </h1>
              <p class="text-green-100 text-lg">管理客户信息、联系方式和业务关系，维护客户档案</p>
            </div>
            <div class="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                class="text-white border-white hover:bg-white hover:text-green-600"
                @click="importCustomers"
              >
                <Upload class="mr-2 h-4 w-4" />
                导入客户
              </Button>
              <Button
                class="bg-white text-green-600 hover:bg-green-50 border-0 shadow-lg"
                @click="openCustomerModal"
              >
                <Plus class="mr-2 h-4 w-4" />
                新建客户
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索和筛选区域 -->
      <Card class="shadow-lg border-0">
        <CardHeader>
          <CardTitle class="flex items-center">
            <Search class="mr-2 h-5 w-5 text-primary" />
            搜索与筛选
          </CardTitle>
          <p class="text-muted-foreground">快速找到您需要的客户信息</p>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div class="space-y-2">
              <Label class="text-sm font-semibold">搜索客户</Label>
              <div class="relative">
                <Search
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input v-model="searchKeyword" placeholder="搜索客户名称、编号..." class="pl-10" />
              </div>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-semibold">状态筛选</Label>
              <Select v-model="selectedStatus">
                <SelectTrigger>
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in statusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-semibold">地区筛选</Label>
              <Select v-model="selectedRegion">
                <SelectTrigger>
                  <SelectValue placeholder="全部地区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in regionOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-semibold opacity-0">操作</Label>
              <div class="flex gap-2">
                <Button variant="outline" class="flex-1" @click="resetFilters">
                  <RefreshCw class="mr-2 h-4 w-4" />
                  重置
                </Button>
                <Button variant="outline" size="icon" @click="exportData">
                  <Download class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 统计信息卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          class="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg overflow-hidden"
        >
          <CardContent class="p-6">
            <div class="relative">
              <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 -full"></div>
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                  <div
                    class="w-14 h-14 bg-white bg-opacity-20 -xl flex items-center justify-center"
                  >
                    <Users class="h-6 w-6 text-white" />
                  </div>
                  <div class="text-right">
                    <div class="flex items-center text-sm font-medium text-blue-100">
                      <TrendingUp class="mr-1 h-4 w-4" />
                      +12.5%
                    </div>
                  </div>
                </div>
                <div>
                  <div class="text-3xl font-bold mb-1">{{ filteredCustomers.length }}</div>
                  <div class="text-blue-100">总客户数</div>
                  <div class="text-xs text-blue-200 mt-2">
                    本月新增 {{ Math.floor(filteredCustomers.length * 0.2) }} 个
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          class="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg overflow-hidden"
        >
          <CardContent class="p-6">
            <div class="relative">
              <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 -full"></div>
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                  <div
                    class="w-14 h-14 bg-white bg-opacity-20 -xl flex items-center justify-center"
                  >
                    <CheckCircle class="h-6 w-6 text-white" />
                  </div>
                  <div class="text-right">
                    <div class="flex items-center text-sm font-medium text-green-100">
                      <TrendingUp class="mr-1 h-4 w-4" />
                      +8.5%
                    </div>
                  </div>
                </div>
                <div>
                  <div class="text-3xl font-bold mb-1">{{ activeCustomersCount }}</div>
                  <div class="text-green-100">活跃客户</div>
                  <div class="text-xs text-green-200 mt-2">近30天有业务往来</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          class="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg overflow-hidden"
        >
          <CardContent class="p-6">
            <div class="relative">
              <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 -full"></div>
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                  <div
                    class="w-14 h-14 bg-white bg-opacity-20 -xl flex items-center justify-center"
                  >
                    <UserPlus class="h-6 w-6 text-white" />
                  </div>
                  <div class="text-right">
                    <div class="flex items-center text-sm font-medium text-purple-100">
                      <TrendingUp class="mr-1 h-4 w-4" />
                      +15.2%
                    </div>
                  </div>
                </div>
                <div>
                  <div class="text-3xl font-bold mb-1">{{ newCustomersCount }}</div>
                  <div class="text-purple-100">新增客户</div>
                  <div class="text-xs text-purple-200 mt-2">本月新注册客户</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 客户列表 -->
      <Card class="shadow-lg border-0">
        <CardHeader class="border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 -lg flex items-center justify-center">
                <List class="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle class="text-lg font-semibold text-gray-900">客户列表</CardTitle>
                <p class="text-sm text-gray-500">当前共有 {{ filteredCustomers.length }} 个客户</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <Select v-model="pageSize">
                <SelectTrigger class="w-32">
                  <SelectValue placeholder="每页显示" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in pageSizeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" @click="refreshData">
                <RefreshCw class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-0">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="flex flex-col items-center space-y-4">
              <div class="animate-spin -full h-8 w-8 border-b-2 border-blue-600"></div>
              <p class="text-sm text-gray-500">加载中...</p>
            </div>
          </div>
          <div
            v-else-if="filteredCustomers.length === 0"
            class="flex flex-col items-center justify-center py-12"
          >
            <Search class="h-12 w-12 text-gray-400 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">未找到客户</h3>
            <p class="text-gray-500">尝试调整搜索条件或添加新客户</p>
          </div>
          <div v-else>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="min-w-32">客户编号</TableHead>
                  <TableHead class="min-w-48">联系信息</TableHead>
                  <TableHead class="min-w-48">邮箱</TableHead>
                  <TableHead class="min-w-64">地址</TableHead>
                  <TableHead class="min-w-24">状态</TableHead>
                  <TableHead class="min-w-32">创建时间</TableHead>
                  <TableHead class="min-w-48">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="customer in filteredCustomers" :key="customer.id">
                  <TableCell>
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-blue-100 -full flex items-center justify-center">
                        <span class="text-sm font-medium text-blue-600">
                          {{ customer.name.charAt(0) }}
                        </span>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{{ customer.code }}</div>
                        <div class="text-sm text-gray-500">{{ customer.name }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="space-y-1">
                      <div class="flex items-center text-sm">
                        <User class="h-4 w-4 text-gray-400 mr-2" />
                        <span class="text-gray-900">{{ customer.contactName }}</span>
                      </div>
                      <div class="flex items-center text-sm">
                        <Phone class="h-4 w-4 text-gray-400 mr-2" />
                        <span class="text-gray-600">{{ customer.contactPhone }}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center">
                      <Mail class="h-4 w-4 text-gray-400 mr-2" />
                      <span class="text-blue-600 hover:text-blue-800 cursor-pointer">
                        {{ customer.email }}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center">
                      <MapPin class="h-4 w-4 text-gray-400 mr-2" />
                      <span class="text-gray-600 truncate">{{ customer.address }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      :variant="getStatusVariant(customer.status)"
                      class="px-3 py-1 text-xs font-medium"
                    >
                      {{ getStatusText(customer.status) }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div class="text-sm text-gray-600">
                      {{ formatDate(customer.created_at) }}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center space-x-2">
                      <Button variant="outline" size="sm" @click="viewCustomer(customer)">
                        <Eye class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="editCustomer(customer)">
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="sendEmail(customer)">
                        <Mail class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="viewOrders(customer)">
                        <ShoppingCart class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="confirmDelete(customer)">
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Table
        :value="filteredCustomers"
        :loading="loading"
        :emptyMessage="emptyMessage"
        :paginator="true"
        :rows="10"
        :first="first"
        :totalRecords="totalRecords"
        :pageLinks="5"
        :page="page"
        :pageSize="pageSize"
        @page="handlePageChange"
      >
        <template #loading>
          <div class="p-6">
            <div v-for="i in 5" :key="i" class="flex align-items-center gap-4 mb-4">
              <Skeleton shape="circle" size="3rem" />
              <div class="flex-1">
                <Skeleton width="100%" height="1.5rem" class="mb-2" />
                <Skeleton width="70%" height="1rem" />
              </div>
              <Skeleton width="8rem" height="1.5rem" />
              <Skeleton width="6rem" height="1.5rem" />
              <Skeleton width="5rem" height="2rem" />
            </div>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-16 text-surface-500">
            <div class="mb-6">
              <i class="pi pi-users text-8xl text-surface-300"></i>
            </div>
            <h3 class="text-xl font-semibold mb-4">暂无客户记录</h3>
            <p class="text-surface-600 mb-6 max-w-md mx-auto">
              您还没有添加任何客户。点击下方按钮开始添加您的第一个客户。
            </p>
            <Button class="px-6 py-3" @click="openCustomerModal" />
          </div>
        </template>

        <TableHead field="customer" header="客户信息" :sortable="true" style="min-width: 250px">
          <template #body="slotProps">
            <div class="flex items-center gap-4">
              <div class="relative">
                <Avatar
                  :shape="'circle'"
                  size="lg"
                  class="bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg"
                />
                <div
                  class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white -full"
                ></div>
              </div>
              <div>
                <div class="font-bold text-lg text-surface-900">{{ slotProps.data.name }}</div>
                <div class="text-sm text-primary-600 font-mono bg-primary-50 px-2 py-1">
                  {{ slotProps.data.code }}
                </div>
                <div class="text-xs text-surface-500 mt-1">
                  创建于 {{ formatDate(slotProps.data.created_at) }}
                </div>
              </div>
            </div>
          </template>
        </TableHead>

        <TableHead field="contact" header="联系方式" :sortable="true" style="min-width: 200px">
          <template #body="slotProps">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <i class="pi pi-user text-primary-600"></i>
                <span class="font-semibold text-surface-900">{{ slotProps.data.contactName }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-phone text-green-600"></i>
                <a
                  :href="`tel:${slotProps.data.contactPhone}`"
                  class="text-green-600 hover:underline"
                >
                  {{ slotProps.data.contactPhone }}
                </a>
              </div>
            </div>
          </template>
        </TableHead>

        <TableHead field="email" header="邮箱地址" :sortable="true" style="min-width: 200px">
          <template #body="slotProps">
            <div v-if="slotProps.data.email" class="flex items-center gap-2">
              <i class="pi pi-envelope text-blue-600"></i>
              <a :href="`mailto:${slotProps.data.email}`" class="text-blue-600 hover:underline">
                {{ slotProps.data.email }}
              </a>
            </div>
            <span v-else class="text-surface-400 italic">未设置邮箱</span>
          </template>
        </TableHead>

        <TableHead field="address" header="地址信息" :sortable="true" style="min-width: 250px">
          <template #body="slotProps">
            <div class="flex items-start gap-2">
              <i class="pi pi-map-marker text-red-600 mt-1"></i>
              <div>
                <div class="text-surface-900 leading-relaxed">{{ slotProps.data.address }}</div>
                <div class="text-xs text-surface-500 mt-1">详细地址</div>
              </div>
            </div>
          </template>
        </TableHead>

        <TableHead field="status" header="客户状态" :sortable="true" style="min-width: 120px">
          <template #body="slotProps">
            <div class="flex flex-col items-center gap-2">
              <Tag
                :value="getStatusText(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
                class="font-semibold px-3 py-1"
              />
              <div class="text-xs text-surface-500">
                {{ getStatusDescription(slotProps.data.status) }}
              </div>
            </div>
          </template>
        </TableHead>

        <TableHead header="操作" style="min-width: 180px" :exportable="false">
          <template #body="slotProps">
            <div class="flex gap-1 justify-center">
              <Button size="sm" class="p-button-info" @click="viewCustomer(slotProps.data)" />
              <Button size="sm" class="p-button-warning" @click="editCustomer(slotProps.data)" />
              <Button
                size="sm"
                class="p-button-secondary"
                :disabled="!slotProps.data.email"
                @click="sendEmail(slotProps.data)"
              />
              <Button size="sm" class="p-button-primary" @click="viewOrders(slotProps.data)" />
              <Button size="sm" severity="danger" @click="confirmDelete(slotProps.data)" />
            </div>
          </template>
        </TableHead>
      </Table>
    </div>

    <!-- 客户详情/编辑对话框 -->
    <Dialog v-model:open="showCustomerModal">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 -lg flex items-center justify-center">
              <Users class="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle class="text-xl font-bold text-gray-900">{{ modalTitle }}</DialogTitle>
              <p class="text-gray-600 text-sm">
                {{ isEditing ? '编辑客户信息' : '创建新的客户档案' }}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div class="space-y-6 py-4">
          <!-- 基本信息 -->
          <Card class="shadow-sm">
            <CardHeader>
              <CardTitle class="font-semibold text-gray-900 flex items-center">
                <Info class="mr-2 h-4 w-4 text-blue-600" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-gray-900">客户编号</Label>
                  <Input
                    v-model="currentCustomer.code"
                    placeholder="系统自动生成"
                    :disabled="isEditing"
                    class="font-mono"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-gray-900">客户名称 *</Label>
                  <Input
                    v-model="currentCustomer.name"
                    placeholder="输入客户名称"
                    :class="{ 'border-red-500': !currentCustomer.name && showValidation }"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 联系信息 -->
          <Card class="shadow-sm">
            <CardHeader>
              <CardTitle class="font-semibold text-gray-900 flex items-center">
                <Phone class="mr-2 h-4 w-4 text-blue-600" />
                联系信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-gray-900">联系人</Label>
                  <Input v-model="currentCustomer.contactName" placeholder="输入联系人姓名" />
                </div>
                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-gray-900">联系电话</Label>
                  <Input v-model="currentCustomer.contactPhone" placeholder="输入联系电话" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-gray-900">邮箱地址</Label>
                  <Input v-model="currentCustomer.email" placeholder="输入邮箱地址" type="email" />
                </div>
                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-gray-900">客户状态</Label>
                  <Select v-model="currentCustomer.status">
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in statusOptions.filter(s => s.value !== '')"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 地址信息 -->
          <Card class="shadow-sm">
            <CardHeader>
              <CardTitle class="font-semibold text-gray-900 flex items-center">
                <MapPin class="mr-2 h-4 w-4 text-blue-600" />
                地址信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <Label class="text-sm font-semibold text-gray-900">详细地址</Label>
                <Textarea
                  v-model="currentCustomer.address"
                  placeholder="输入详细地址信息..."
                  :rows="3"
                  class="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" @click="closeCustomerModal">
              <X class="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button :disabled="saving" @click="saveCustomer">
              <template v-if="saving">
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              </template>
              <template v-else>
                <component :is="isEditing ? Check : Plus" class="mr-2 h-4 w-4" />
              </template>
              {{ isEditing ? '更新客户' : '创建客户' }}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认对话框 -->
    <!-- ConfirmDialog 已移除，需要手动实现确认对话框 -->
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import {
  Check,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Info,
  List,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Upload,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '客户管理 - 智能ERP管理系统',
})

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')
const selectedRegion = ref('')
const pageSize = ref(10)
const showValidation = ref(false)

// 分页选项
const pageSizeOptions = [
  { label: '10条/页', value: 10 },
  { label: '20条/页', value: 20 },
  { label: '50条/页', value: 50 },
]

// 对话框状态
const showCustomerModal = ref(false)
const isEditing = ref(false)

// 当前编辑的客户
const currentCustomer = ref({
  id: '',
  code: '',
  name: '',
  contactName: '',
  contactPhone: '',
  email: '',
  address: '',
  status: 'active',
  created_at: new Date(),
  updated_at: new Date(),
})

// 模拟客户数据
const customers = ref([
  {
    id: '1',
    code: 'CUST-001',
    name: '苏州华智科技有限公司',
    contactName: '张经理',
    contactPhone: '138-0000-0001',
    email: 'zhang@huazhi.com',
    address: '江苏省苏州市工业园区科技大道100号华智科技园A座',
    status: 'active',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  },
  {
    id: '2',
    code: 'CUST-002',
    name: '上海浦东制造有限公司',
    contactName: '李总监',
    contactPhone: '139-0000-0002',
    email: 'li@pudong.com',
    address: '上海市浦东新区张江高科技园区创新大厦15楼',
    status: 'active',
    created_at: new Date('2025-01-02'),
    updated_at: new Date('2025-01-02'),
  },
  {
    id: '3',
    code: 'CUST-003',
    name: '北京智能设备有限公司',
    contactName: '王主管',
    contactPhone: '135-0000-0003',
    email: 'wang@bjzn.com',
    address: '北京市海淀区中关村软件园二期8号楼',
    status: 'inactive',
    created_at: new Date('2025-01-03'),
    updated_at: new Date('2025-01-03'),
  },
  {
    id: '4',
    code: 'CUST-004',
    name: '深圳创新科技有限公司',
    contactName: '陈总经理',
    contactPhone: '137-0000-0004',
    email: 'chen@szcx.com',
    address: '深圳市南山区科技园南区深圳湾科技生态园10栋A座',
    status: 'active',
    created_at: new Date('2025-01-04'),
    updated_at: new Date('2025-01-04'),
  },
  {
    id: '5',
    code: 'CUST-005',
    name: '广州精密制造有限公司',
    contactName: '刘工程师',
    contactPhone: '136-0000-0005',
    email: 'liu@gzjm.com',
    address: '广州市天河区珠江新城国际金融中心南塔36楼',
    status: 'active',
    created_at: new Date('2025-01-05'),
    updated_at: new Date('2025-01-05'),
  },
])

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '活跃', value: 'active' },
  { label: '非活跃', value: 'inactive' },
  { label: '暂停', value: 'suspended' },
]

// 地区选项
const regionOptions = [
  { label: '全部地区', value: '' },
  { label: '华东', value: 'east' },
  { label: '华南', value: 'south' },
  { label: '华北', value: 'north' },
  { label: '西部', value: 'west' },
]

// 计算属性
const filteredCustomers = computed(() => {
  let result = customers.value

  if (searchKeyword.value) {
    result = result.filter(
      customer =>
        customer.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
        || customer.code.toLowerCase().includes(searchKeyword.value.toLowerCase()),
    )
  }

  if (selectedStatus.value) {
    result = result.filter(customer => customer.status === selectedStatus.value)
  }

  return result
})

const activeCustomersCount = computed(() => {
  return customers.value.filter(c => c.status === 'active').length
})

const newCustomersCount = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return customers.value.filter(c => new Date(c.created_at) > oneMonthAgo).length
})

const modalTitle = computed(() => {
  return isEditing.value ? '编辑客户' : '新建客户'
})

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    suspended: '暂停',
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const variantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    active: 'default',
    inactive: 'secondary',
    suspended: 'outline',
  }
  return variantMap[status] || 'secondary'
}

const getStatusDescription = (status: string) => {
  const descMap: Record<string, string> = {
    active: '正常交易',
    inactive: '暂无业务',
    suspended: '业务暂停',
  }
  return descMap[status] || ''
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedStatus.value = ''
  selectedRegion.value = ''
}

const refreshData = async () => {
  loading.value = true
  try {
    // 模拟刷新数据
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  finally {
    loading.value = false
  }
}

const exportData = () => {
  console.log('导出客户数据')
  // 这里可以实现数据导出功能
}

const importCustomers = () => {
  console.log('导入客户')
  // 这里可以实现客户导入功能
}

const openCustomerModal = () => {
  isEditing.value = false
  showValidation.value = false
  currentCustomer.value = {
    id: '',
    code: `CUST-${String(customers.value.length + 1).padStart(3, '0')}`,
    name: '',
    contactName: '',
    contactPhone: '',
    email: '',
    address: '',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  }
  showCustomerModal.value = true
}

const editCustomer = (customer: any) => {
  isEditing.value = true
  showValidation.value = false
  currentCustomer.value = { ...customer }
  showCustomerModal.value = true
}

const viewCustomer = (customer: any) => {
  editCustomer(customer)
  // 可以设置为只读模式
}

const sendEmail = (customer: any) => {
  if (customer.email) {
    window.open(`mailto:${customer.email}`, '_blank')
  }
}

const viewOrders = (customer: any) => {
  // 跳转到该客户的订单页面
  navigateTo(`/sales/orders?customer=${customer.id}`)
}

const confirmDelete = (customer: any) => {
  if (window.confirm(`确定要删除客户 "${customer.name}" 吗？此操作不可撤销。`)) {
    deleteCustomer(customer.id)
  }
}

const deleteCustomer = async (customerId: string) => {
  try {
    loading.value = true
    // 模拟删除操作
    const index = customers.value.findIndex(c => c.id === customerId)
    if (index !== -1) {
      customers.value.splice(index, 1)
    }
  }
  catch (error) {
    console.error('删除客户失败:', error)
  }
  finally {
    loading.value = false
  }
}

const saveCustomer = async () => {
  showValidation.value = true

  // 简单验证
  if (!currentCustomer.value.name) {
    return
  }

  try {
    saving.value = true

    if (isEditing.value) {
      // 更新客户
      const index = customers.value.findIndex(c => c.id === currentCustomer.value.id)
      if (index !== -1) {
        customers.value[index] = {
          ...currentCustomer.value,
          updated_at: new Date(),
        }
      }
    }
    else {
      // 创建新客户
      const newCustomer = {
        ...currentCustomer.value,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date(),
      }
      customers.value.push(newCustomer)
    }

    closeCustomerModal()
  }
  catch (error) {
    console.error('保存客户失败:', error)
  }
  finally {
    saving.value = false
  }
}

const closeCustomerModal = () => {
  showCustomerModal.value = false
  isEditing.value = false
  showValidation.value = false
}
</script>
