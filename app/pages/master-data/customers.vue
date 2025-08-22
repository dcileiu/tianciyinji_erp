<template>
  <div class="container mx-auto py-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">客户管理</h1>
        <p class="text-muted-foreground">管理客户信息和联系方式</p>
      </div>
      <PermissionWrapper :has-permission="canCreateCustomer">
        <Button @click="openCreateDialog">
          <Plus class="mr-2 h-4 w-4" />
          新增客户
        </Button>
      </PermissionWrapper>
    </div>

    <!-- 搜索和筛选 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>搜索筛选</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label for="search">搜索客户</Label>
            <Input
              id="search"
              v-model="searchQuery"
              placeholder="输入客户名称或编码"
              class="mt-1"
            />
          </div>
          <div>
            <Label for="status">状态</Label>
            <select
              id="status"
              v-model="selectedStatus"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">停用</option>
            </select>
          </div>
          <div>
            <Label for="credit">信用等级</Label>
            <select
              id="credit"
              v-model="selectedCredit"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部等级</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div class="flex items-end">
            <Button @click="handleSearch" class="w-full">
              <Search class="mr-2 h-4 w-4" />
              搜索
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 客户列表 -->
    <Card>
      <CardHeader>
        <CardTitle>客户列表</CardTitle>
        <CardDescription>
          共 {{ filteredCustomers.length }} 个客户
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          加载中...
        </div>
        <div v-else-if="filteredCustomers.length === 0" class="text-center py-8">
          <Users class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p class="text-muted-foreground">暂无客户数据</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="customer in filteredCustomers"
            :key="customer.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Building class="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 class="font-semibold">{{ customer.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ customer.code }}</p>
                <p class="text-sm text-muted-foreground">{{ customer.contact_person }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <div class="flex items-center space-x-2">
                  <Badge :variant="customer.status === 'active' ? 'default' : 'secondary'">
                    {{ customer.status === 'active' ? '活跃' : '停用' }}
                  </Badge>
                  <Badge :variant="getCreditVariant(customer.credit_rating)">
                    {{ getCreditText(customer.credit_rating) }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ customer.phone }}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewCustomer(customer)">
                    <Eye class="mr-2 h-4 w-4" />
                    查看详情
                  </DropdownMenuItem>
                  <PermissionWrapper :has-permission="canEditCustomer">
                    <DropdownMenuItem @click="editCustomer(customer)">
                      <Edit class="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                  </PermissionWrapper>
                  <PermissionWrapper :has-permission="canDeleteCustomer">
                    <DropdownMenuItem 
                      @click="deleteCustomer(customer)"
                      class="text-destructive"
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </PermissionWrapper>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 创建/编辑客户对话框 -->
    <Dialog v-model:open="showCustomerDialog">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ editingCustomer ? '编辑客户' : '新增客户' }}</DialogTitle>
          <DialogDescription>
            {{ editingCustomer ? '修改客户信息' : '添加新的客户信息' }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="customer-name">客户名称 <span class="text-destructive">*</span></Label>
              <Input
                id="customer-name"
                v-model="customerForm.name"
                placeholder="请输入客户名称"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="customer-code">客户编码 <span class="text-destructive">*</span></Label>
              <Input
                id="customer-code"
                v-model="customerForm.code"
                placeholder="请输入客户编码"
                class="mt-1"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="contact-person">联系人 <span class="text-destructive">*</span></Label>
              <Input
                id="contact-person"
                v-model="customerForm.contact_person"
                placeholder="请输入联系人姓名"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="phone">联系电话 <span class="text-destructive">*</span></Label>
              <Input
                id="phone"
                v-model="customerForm.phone"
                placeholder="请输入联系电话"
                class="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label for="email">邮箱地址</Label>
            <Input
              id="email"
              v-model="customerForm.email"
              type="email"
              placeholder="请输入邮箱地址"
              class="mt-1"
            />
          </div>
          
          <div>
            <Label for="address">地址</Label>
            <Textarea
              id="address"
              v-model="customerForm.address"
              placeholder="请输入详细地址"
              class="mt-1"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="credit-limit">信用额度</Label>
              <Input
                id="credit-limit"
                v-model.number="customerForm.credit_limit"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="credit-rating">信用等级</Label>
              <select
                id="credit-rating"
                v-model="customerForm.credit_rating"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
              >
                <option value="">请选择信用等级</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label for="payment-terms">付款条件</Label>
            <Input
              id="payment-terms"
              v-model="customerForm.payment_terms"
              placeholder="例如：货到付款、30天付款等"
              class="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" @click="showCustomerDialog = false">
            取消
          </Button>
          <Button @click="handleSubmit" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingCustomer ? '更新' : '创建' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 客户详情对话框 -->
    <Dialog v-model:open="showDetailDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>客户详情</DialogTitle>
        </DialogHeader>
        <div v-if="selectedCustomer" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">客户名称</Label>
              <p class="font-medium">{{ selectedCustomer.name }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">客户编码</Label>
              <p class="font-medium">{{ selectedCustomer.code }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">联系人</Label>
              <p class="font-medium">{{ selectedCustomer.contact_person }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">联系电话</Label>
              <p class="font-medium">{{ selectedCustomer.phone }}</p>
            </div>
          </div>
          <div v-if="selectedCustomer.email">
            <Label class="text-sm font-medium text-muted-foreground">邮箱地址</Label>
            <p class="font-medium">{{ selectedCustomer.email }}</p>
          </div>
          <div v-if="selectedCustomer.address">
            <Label class="text-sm font-medium text-muted-foreground">地址</Label>
            <p class="font-medium">{{ selectedCustomer.address }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">信用额度</Label>
              <p class="font-medium">¥{{ formatCurrency(selectedCustomer.credit_limit) }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">信用等级</Label>
              <Badge :variant="getCreditVariant(selectedCustomer.credit_rating)">
                {{ getCreditText(selectedCustomer.credit_rating) }}
              </Badge>
            </div>
          </div>
          <div v-if="selectedCustomer.payment_terms">
            <Label class="text-sm font-medium text-muted-foreground">付款条件</Label>
            <p class="font-medium">{{ selectedCustomer.payment_terms }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDetailDialog = false">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, Search, MoreHorizontal, Users, Building, 
  Eye, Edit, Trash2, Loader2 
} from 'lucide-vue-next'

// 导入组件
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Textarea from '~/components/ui/Textarea.vue'
import Badge from '~/components/ui/Badge.vue'
import Dialog from '~/components/ui/Dialog.vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import PermissionWrapper from '~/components/PermissionWrapper.vue'

// 使用 composables
const { customers, loading, fetchCustomers, createCustomer, updateCustomer, deleteCustomer: removeCustomer } = useCustomers()

// 响应式数据
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCredit = ref('')
const showCustomerDialog = ref(false)
const showDetailDialog = ref(false)
const editingCustomer = ref(null)
const selectedCustomer = ref(null)
const submitting = ref(false)

// 权限检查（模拟）
const canCreateCustomer = ref(true)
const canEditCustomer = ref(true)
const canDeleteCustomer = ref(true)

// 表单数据
const customerForm = reactive({
  name: '',
  code: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  credit_limit: 0,
  credit_rating: '',
  payment_terms: ''
})

// 计算属性
const filteredCustomers = computed(() => {
  let result = customers.value || []
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      customer.code.toLowerCase().includes(query)
    )
  }
  
  if (selectedStatus.value) {
    result = result.filter(customer => customer.status === selectedStatus.value)
  }
  
  if (selectedCredit.value) {
    result = result.filter(customer => customer.credit_rating === selectedCredit.value)
  }
  
  return result
})

// 方法
const openCreateDialog = () => {
  editingCustomer.value = null
  resetForm()
  showCustomerDialog.value = true
}

const editCustomer = (customer: any) => {
  editingCustomer.value = customer
  Object.assign(customerForm, customer)
  showCustomerDialog.value = true
}

const viewCustomer = (customer: any) => {
  selectedCustomer.value = customer
  showDetailDialog.value = true
}

const deleteCustomer = async (customer: any) => {
  if (confirm(`确定要删除客户 "${customer.name}" 吗？`)) {
    try {
      await removeCustomer(customer.id)
      await fetchCustomers()
    } catch (error) {
      alert('删除失败，请重试')
    }
  }
}

const handleSubmit = async () => {
  if (!customerForm.name || !customerForm.code || !customerForm.contact_person || !customerForm.phone) {
    alert('请填写必填字段')
    return
  }
  
  submitting.value = true
  try {
    if (editingCustomer.value) {
      await updateCustomer(editingCustomer.value.id, customerForm)
    } else {
      await createCustomer(customerForm)
    }
    showCustomerDialog.value = false
    await fetchCustomers()
  } catch (error) {
    alert('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(customerForm, {
    name: '',
    code: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: 0,
    credit_rating: '',
    payment_terms: ''
  })
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

const getCreditVariant = (rating: string) => {
  const variants = {
    high: 'default',
    medium: 'secondary',
    low: 'destructive'
  }
  return variants[rating] || 'secondary'
}

const getCreditText = (rating: string) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return texts[rating] || '未设置'
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN').format(amount || 0)
}

// 页面加载时获取数据
onMounted(() => {
  fetchCustomers()
})

// 页面元数据
definePageMeta({
  layout: 'default'
})
</script> 