<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">系统配置</h1>
        <p class="text-muted-foreground">管理系统参数和配置项</p>
      </div>
      <Button @click="saveAllConfigs" class="bg-green-600 hover:bg-green-700">
        <Save class="w-4 h-4 mr-2" />
        保存所有配置
      </Button>
    </div>

    <!-- 配置分类导航 -->
    <div class="flex space-x-1 bg-muted p-1 rounded-lg">
      <button
        v-for="tab in configTabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 rounded-md text-sm font-medium transition-colors',
          activeTab === tab.id
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 基础配置 -->
    <div v-if="activeTab === 'basic'" class="space-y-6">
      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">基础信息配置</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">公司名称</label>
              <Input v-model="basicConfig.companyName" placeholder="请输入公司名称" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">系统名称</label>
              <Input v-model="basicConfig.systemName" placeholder="请输入系统名称" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">系统版本</label>
              <Input v-model="basicConfig.version" placeholder="如: v1.0.0" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">管理员邮箱</label>
              <Input v-model="basicConfig.adminEmail" type="email" placeholder="admin@company.com" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">公司地址</label>
            <Input v-model="basicConfig.address" placeholder="请输入公司地址" />
          </div>
        </div>
      </Card>
    </div>

    <!-- 业务配置 -->
    <div v-if="activeTab === 'business'" class="space-y-6">
      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">业务参数配置</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">默认货币</label>
              <select v-model="businessConfig.defaultCurrency" class="w-full px-3 py-2 border rounded-md">
                <option value="CNY">人民币 (CNY)</option>
                <option value="USD">美元 (USD)</option>
                <option value="EUR">欧元 (EUR)</option>
                <option value="JPY">日元 (JPY)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">税率 (%)</label>
              <Input v-model.number="businessConfig.taxRate" type="number" min="0" max="100" step="0.1" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">订单号前缀</label>
              <Input v-model="businessConfig.orderPrefix" placeholder="如: SO" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">采购单号前缀</label>
              <Input v-model="businessConfig.purchasePrefix" placeholder="如: PO" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">库存预警阈值</label>
              <Input v-model.number="businessConfig.stockWarningThreshold" type="number" min="0" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">最大登录失败次数</label>
              <Input v-model.number="businessConfig.maxLoginAttempts" type="number" min="1" max="10" />
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 安全配置 -->
    <div v-if="activeTab === 'security'" class="space-y-6">
      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">安全设置</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">密码最小长度</label>
              <Input v-model.number="securityConfig.minPasswordLength" type="number" min="6" max="20" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">密码过期天数</label>
              <Input v-model.number="securityConfig.passwordExpireDays" type="number" min="0" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">会话超时时间(分钟)</label>
              <Input v-model.number="securityConfig.sessionTimeout" type="number" min="5" max="480" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">登录锁定时间(分钟)</label>
              <Input v-model.number="securityConfig.lockoutDuration" type="number" min="5" max="1440" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <input
                id="enableTwoFactor"
                v-model="securityConfig.enableTwoFactor"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="enableTwoFactor" class="text-sm font-medium">启用双因素认证</label>
            </div>
            <div class="flex items-center space-x-2">
              <input
                id="enableAuditLog"
                v-model="securityConfig.enableAuditLog"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="enableAuditLog" class="text-sm font-medium">启用审计日志</label>
            </div>
            <div class="flex items-center space-x-2">
              <input
                id="enableIpWhitelist"
                v-model="securityConfig.enableIpWhitelist"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="enableIpWhitelist" class="text-sm font-medium">启用IP白名单</label>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 邮件配置 -->
    <div v-if="activeTab === 'email'" class="space-y-6">
      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">邮件服务配置</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">SMTP服务器</label>
              <Input v-model="emailConfig.smtpServer" placeholder="如: smtp.gmail.com" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">SMTP端口</label>
              <Input v-model.number="emailConfig.smtpPort" type="number" placeholder="如: 587" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">发件人邮箱</label>
              <Input v-model="emailConfig.fromEmail" type="email" placeholder="noreply@company.com" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">发件人名称</label>
              <Input v-model="emailConfig.fromName" placeholder="系统通知" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">邮箱用户名</label>
              <Input v-model="emailConfig.username" placeholder="邮箱用户名" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">邮箱密码</label>
              <Input v-model="emailConfig.password" type="password" placeholder="邮箱密码" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <input
                id="enableSsl"
                v-model="emailConfig.enableSsl"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="enableSsl" class="text-sm font-medium">启用SSL加密</label>
            </div>
            <div class="flex items-center space-x-2">
              <input
                id="enableEmailNotification"
                v-model="emailConfig.enableNotification"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="enableEmailNotification" class="text-sm font-medium">启用邮件通知</label>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 备份配置 -->
    <div v-if="activeTab === 'backup'" class="space-y-6">
      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">数据备份配置</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">自动备份频率</label>
              <select v-model="backupConfig.frequency" class="w-full px-3 py-2 border rounded-md">
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">备份保留天数</label>
              <Input v-model.number="backupConfig.retentionDays" type="number" min="1" max="365" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">备份存储路径</label>
            <Input v-model="backupConfig.storagePath" placeholder="/backup" />
          </div>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <input
                id="enableAutoBackup"
                v-model="backupConfig.enableAutoBackup"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="enableAutoBackup" class="text-sm font-medium">启用自动备份</label>
            </div>
            <div class="flex items-center space-x-2">
              <input
                id="enableCompression"
                v-model="backupConfig.enableCompression"
                type="checkbox"
                class="rounded border-gray-300"
              />
              <label for="enableCompression" class="text-sm font-medium">启用压缩备份</label>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 保存状态提示 -->
    <div v-if="saveStatus" class="fixed bottom-4 right-4 z-50">
      <div :class="[
        'px-4 py-2 rounded-lg shadow-lg',
        saveStatus.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      ]">
        {{ saveStatus.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Save } from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '系统配置 - ERP 管理系统'
})

// 配置分类
const configTabs = [
  { id: 'basic', name: '基础配置' },
  { id: 'business', name: '业务配置' },
  { id: 'security', name: '安全配置' },
  { id: 'email', name: '邮件配置' },
  { id: 'backup', name: '备份配置' }
]

// 响应式数据
const activeTab = ref('basic')
const saveStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)

// 配置数据
const basicConfig = ref({
  companyName: '示例科技有限公司',
  systemName: 'ERP管理系统',
  version: 'v1.0.0',
  adminEmail: 'admin@company.com',
  address: '深圳市南山区科技园'
})

const businessConfig = ref({
  defaultCurrency: 'CNY',
  taxRate: 13,
  orderPrefix: 'SO',
  purchasePrefix: 'PO',
  stockWarningThreshold: 10,
  maxLoginAttempts: 5
})

const securityConfig = ref({
  minPasswordLength: 8,
  passwordExpireDays: 90,
  sessionTimeout: 30,
  lockoutDuration: 30,
  enableTwoFactor: false,
  enableAuditLog: true,
  enableIpWhitelist: false
})

const emailConfig = ref({
  smtpServer: 'smtp.gmail.com',
  smtpPort: 587,
  fromEmail: 'noreply@company.com',
  fromName: '系统通知',
  username: '',
  password: '',
  enableSsl: true,
  enableNotification: false
})

const backupConfig = ref({
  frequency: 'daily',
  retentionDays: 30,
  storagePath: '/backup',
  enableAutoBackup: true,
  enableCompression: true
})

// 方法
const saveAllConfigs = async () => {
  try {
    // TODO: 保存配置到数据库
    console.log('保存配置:', {
      basic: basicConfig.value,
      business: businessConfig.value,
      security: securityConfig.value,
      email: emailConfig.value,
      backup: backupConfig.value
    })
    
    saveStatus.value = {
      type: 'success',
      message: '配置保存成功！'
    }
    
    // 3秒后清除提示
    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
  } catch (error) {
    saveStatus.value = {
      type: 'error',
      message: '配置保存失败，请重试！'
    }
    
    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
  }
}

// 初始化数据
onMounted(async () => {
  // TODO: 从数据库加载配置
  console.log('加载系统配置')
})
</script> 