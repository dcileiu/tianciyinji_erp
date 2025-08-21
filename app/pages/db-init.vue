<template>
  <div class="max-w-4xl mx-auto">
    <Card class="p-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground mb-2">
          数据库初始化
        </h1>
        <p class="text-muted-foreground">
          初始化 ERP 系统数据库，创建基础数据和测试连接
        </p>
      </div>

      <!-- 连接状态检查 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">连接状态检查</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <Card class="p-4">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  connectionStatus.database ? 'bg-green-500' : 'bg-red-500'
                ]"></div>
              </div>
              <div>
                <p class="font-medium">数据库连接</p>
                <p class="text-sm text-muted-foreground">
                  {{ connectionStatus.database ? '已连接' : '未连接' }}
                </p>
              </div>
            </div>
          </Card>

          <Card class="p-4">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  connectionStatus.auth ? 'bg-green-500' : 'bg-red-500'
                ]"></div>
              </div>
              <div>
                <p class="font-medium">认证服务</p>
                <p class="text-sm text-muted-foreground">
                  {{ connectionStatus.auth ? '已连接' : '未连接' }}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- 初始化步骤 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">初始化步骤</h2>
        <div class="space-y-4">
          <!-- 检查表结构 -->
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                steps.checkTables.status === 'completed' ? 'bg-green-500' :
                steps.checkTables.status === 'running' ? 'bg-blue-500' : 'bg-gray-400'
              ]">
                <Check v-if="steps.checkTables.status === 'completed'" class="w-4 h-4" />
                <Loader2 v-else-if="steps.checkTables.status === 'running'" class="w-4 h-4 animate-spin" />
                <span v-else>1</span>
              </div>
              <div>
                <p class="font-medium">检查数据库表结构</p>
                <p class="text-sm text-muted-foreground">验证所有必要的表是否存在</p>
              </div>
            </div>
            <Button 
              @click="checkTables" 
              :disabled="steps.checkTables.status === 'running'"
              variant="outline"
            >
              {{ steps.checkTables.status === 'completed' ? '重新检查' : '开始检查' }}
            </Button>
          </div>

          <!-- 创建管理员用户 -->
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                steps.createAdmin.status === 'completed' ? 'bg-green-500' :
                steps.createAdmin.status === 'running' ? 'bg-blue-500' : 'bg-gray-400'
              ]">
                <Check v-if="steps.createAdmin.status === 'completed'" class="w-4 h-4" />
                <Loader2 v-else-if="steps.createAdmin.status === 'running'" class="w-4 h-4 animate-spin" />
                <span v-else>2</span>
              </div>
              <div>
                <p class="font-medium">创建管理员账户</p>
                <p class="text-sm text-muted-foreground">设置系统管理员用户</p>
              </div>
            </div>
            <Button 
              @click="showAdminForm = true" 
              :disabled="steps.createAdmin.status === 'running' || !steps.checkTables.status === 'completed'"
              variant="outline"
            >
              创建管理员
            </Button>
          </div>

          <!-- 初始化基础数据 -->
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                steps.initData.status === 'completed' ? 'bg-green-500' :
                steps.initData.status === 'running' ? 'bg-blue-500' : 'bg-gray-400'
              ]">
                <Check v-if="steps.initData.status === 'completed'" class="w-4 h-4" />
                <Loader2 v-else-if="steps.initData.status === 'running'" class="w-4 h-4 animate-spin" />
                <span v-else>3</span>
              </div>
              <div>
                <p class="font-medium">初始化基础数据</p>
                <p class="text-sm text-muted-foreground">创建部门、角色、示例产品等</p>
              </div>
            </div>
            <Button 
              @click="initializeData" 
              :disabled="steps.initData.status === 'running'"
              variant="outline"
            >
              初始化数据
            </Button>
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">系统信息</h2>
        <div class="grid md:grid-cols-3 gap-4">
          <Card class="p-4">
            <p class="text-sm text-muted-foreground">Supabase URL</p>
            <p class="font-medium truncate">{{ config.public.supabaseUrl || '未配置' }}</p>
          </Card>
          <Card class="p-4">
            <p class="text-sm text-muted-foreground">环境</p>
            <p class="font-medium">{{ isDev ? '开发环境' : '生产环境' }}</p>
          </Card>
          <Card class="p-4">
            <p class="text-sm text-muted-foreground">版本</p>
            <p class="font-medium">v1.0.0</p>
          </Card>
        </div>
      </div>

      <!-- 日志输出 -->
      <div v-if="logs.length > 0" class="mb-8">
        <h2 class="text-xl font-semibold mb-4">操作日志</h2>
        <div class="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
          <div v-for="(log, index) in logs" :key="index" class="text-sm font-mono">
            <span :class="[
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'warning' ? 'text-yellow-400' : 'text-gray-300'
            ]">
              [{{ log.time }}] {{ log.message }}
            </span>
          </div>
        </div>
      </div>
    </Card>

    <!-- 管理员创建弹窗 -->
    <div v-if="showAdminForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card class="w-full max-w-md p-6 m-4">
        <h3 class="text-lg font-semibold mb-4">创建管理员账户</h3>
        <form @submit.prevent="createAdmin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">邮箱</label>
            <Input 
              v-model="adminForm.email" 
              type="email" 
              required 
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">密码</label>
            <Input 
              v-model="adminForm.password" 
              type="password" 
              required 
              placeholder="至少6个字符"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">姓名</label>
            <Input 
              v-model="adminForm.name" 
              type="text" 
              required 
              placeholder="系统管理员"
            />
          </div>
          <div class="flex space-x-3">
            <Button type="submit" :disabled="steps.createAdmin.status === 'running'" class="flex-1">
              <Loader2 v-if="steps.createAdmin.status === 'running'" class="w-4 h-4 animate-spin mr-2" />
              创建
            </Button>
            <Button type="button" variant="outline" @click="showAdminForm = false" class="flex-1">
              取消
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Check, Loader2 } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

// 页面配置
definePageMeta({
  middleware: 'auth'
})

useHead({
  title: '数据库初始化 - ERP 管理系统'
})

// 配置和状态
const config = useRuntimeConfig()
const supabase = useSupabaseClient()
const { register } = useAuth()
const isDev = process.dev

// 响应式数据
const connectionStatus = reactive({
  database: false,
  auth: false
})

const steps = reactive({
  checkTables: { status: 'pending' }, // pending, running, completed, failed
  createAdmin: { status: 'pending' },
  initData: { status: 'pending' }
})

const showAdminForm = ref(false)
const adminForm = reactive({
  email: '',
  password: '',
  name: '系统管理员'
})

const logs = ref<Array<{type: 'info' | 'success' | 'warning' | 'error', message: string, time: string}>>([])

// 添加日志
const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
  logs.value.push({
    type,
    message,
    time: new Date().toLocaleTimeString()
  })
}

// 检查连接状态
const checkConnection = async () => {
  addLog('info', '开始检查连接状态...')
  
  try {
    // 检查数据库连接
    const { data, error } = await supabase.from('products').select('count').limit(1)
    connectionStatus.database = !error
    
    if (connectionStatus.database) {
      addLog('success', '数据库连接正常')
    } else {
      addLog('error', `数据库连接失败: ${error?.message}`)
    }
  } catch (err) {
    connectionStatus.database = false
    addLog('error', '数据库连接测试失败')
  }

  try {
    // 检查认证服务
    const { data } = await supabase.auth.getSession()
    connectionStatus.auth = true
    addLog('success', '认证服务连接正常')
  } catch (err) {
    connectionStatus.auth = false
    addLog('error', '认证服务连接失败')
  }
}

// 检查表结构
const checkTables = async () => {
  steps.checkTables.status = 'running'
  addLog('info', '开始检查数据库表结构...')

  const requiredTables = [
    'products', 'customers', 'suppliers', 'sales_orders', 
    'purchase_orders', 'production_orders', 'workshops', 
    'bom_headers', 'inventory'
  ]

  try {
    let allTablesExist = true
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          addLog('warning', `表 ${table} 不存在或无法访问`)
          allTablesExist = false
        } else {
          addLog('success', `表 ${table} 存在`)
        }
      } catch (err) {
        addLog('error', `检查表 ${table} 时出错`)
        allTablesExist = false
      }
    }

    if (allTablesExist) {
      steps.checkTables.status = 'completed'
      addLog('success', '所有必要的表都存在')
    } else {
      steps.checkTables.status = 'failed'
      addLog('warning', '部分表缺失，请运行数据库迁移')
    }
  } catch (err) {
    steps.checkTables.status = 'failed'
    addLog('error', '检查表结构时发生错误')
  }
}

// 创建管理员
const createAdmin = async () => {
  steps.createAdmin.status = 'running'
  addLog('info', `开始创建管理员账户: ${adminForm.email}`)

  try {
    const result = await register(adminForm.email, adminForm.password, {
      full_name: adminForm.name,
      role: 'admin'
    })

    if (result.success) {
      steps.createAdmin.status = 'completed'
      addLog('success', '管理员账户创建成功')
      showAdminForm.value = false
      
      // 重置表单
      adminForm.email = ''
      adminForm.password = ''
      adminForm.name = '系统管理员'
    } else {
      steps.createAdmin.status = 'failed'
      addLog('error', `创建管理员失败: ${result.error?.message}`)
    }
  } catch (err: any) {
    steps.createAdmin.status = 'failed'
    addLog('error', `创建管理员时发生错误: ${err.message}`)
  }
}

// 初始化基础数据
const initializeData = async () => {
  steps.initData.status = 'running'
  addLog('info', '开始初始化基础数据...')

  try {
    // 创建示例产品
    const sampleProducts = [
      {
        product_no: 'P001',
        name: '示例产品A',
        description: '这是一个示例产品',
        category: 'finished_product',
        unit: 'pcs',
        unit_price: 100.00,
        cost_price: 80.00,
        min_stock: 10,
        max_stock: 100,
        status: 'active'
      },
      {
        product_no: 'P002',
        name: '示例原料B',
        description: '这是一个示例原料',
        category: 'raw_material',
        unit: 'kg',
        unit_price: 50.00,
        cost_price: 40.00,
        min_stock: 20,
        max_stock: 200,
        status: 'active'
      }
    ]

    const { error: productError } = await supabase
      .from('products')
      .upsert(sampleProducts, { onConflict: 'product_no' })

    if (productError) {
      addLog('warning', `创建示例产品失败: ${productError.message}`)
    } else {
      addLog('success', '示例产品创建成功')
    }

    // 创建示例客户
    const sampleCustomers = [
      {
        customer_code: 'C001',
        name: '示例客户A',
        contact_person: '张三',
        phone: '138-0000-0001',
        email: 'customer-a@example.com',
        address: '北京市朝阳区示例地址1号',
        status: 'active'
      }
    ]

    const { error: customerError } = await supabase
      .from('customers')
      .upsert(sampleCustomers, { onConflict: 'customer_code' })

    if (customerError) {
      addLog('warning', `创建示例客户失败: ${customerError.message}`)
    } else {
      addLog('success', '示例客户创建成功')
    }

    steps.initData.status = 'completed'
    addLog('success', '基础数据初始化完成')
  } catch (err: any) {
    steps.initData.status = 'failed'
    addLog('error', `初始化数据时发生错误: ${err.message}`)
  }
}

// 页面加载时检查连接
onMounted(() => {
  checkConnection()
})
</script>