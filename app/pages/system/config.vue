<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">系统配置</h1>
        <p class="text-muted-foreground">管理系统参数和配置项</p>
      </div>
      <Button :disabled="saving" @click="saveAllConfigs">
        <Save class="w-4 h-4 mr-2" />
        <span v-if="saving">保存中...</span>
        <span v-else>保存所有配置</span>
      </Button>
    </div>

    <!-- 配置选项卡 -->
    <Tabs default-value="basic" class="w-full">
      <TabsList class="grid w-full grid-cols-5">
        <TabsTrigger value="basic">基础配置</TabsTrigger>
        <TabsTrigger value="business">业务配置</TabsTrigger>
        <TabsTrigger value="security">安全配置</TabsTrigger>
        <TabsTrigger value="email">邮件配置</TabsTrigger>
        <TabsTrigger value="backup">备份配置</TabsTrigger>
      </TabsList>

      <!-- 基础配置 -->
      <TabsContent value="basic">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Settings class="w-5 h-5 mr-2" />
              基础信息配置
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>公司名称</Label>
                <Input v-model="basicConfig.companyName" placeholder="请输入公司名称" />
              </div>
              <div class="space-y-2">
                <Label>系统名称</Label>
                <Input v-model="basicConfig.systemName" placeholder="请输入系统名称" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>系统版本</Label>
                <Input v-model="basicConfig.version" placeholder="如: v1.0.0" />
              </div>
              <div class="space-y-2">
                <Label>管理员邮箱</Label>
                <Input v-model="basicConfig.adminEmail" type="email" placeholder="admin@company.com" />
              </div>
            </div>

            <div class="space-y-2">
              <Label>公司地址</Label>
              <Input v-model="basicConfig.address" placeholder="请输入公司地址" />
            </div>

            <div class="flex justify-end">
              <Button :disabled="saving" @click="saveBasicConfig">
                <Save class="w-4 h-4 mr-2" />
                <span v-if="saving">保存中...</span>
                <span v-else>保存基础配置</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- 业务配置 -->
      <TabsContent value="business">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Briefcase class="w-5 h-5 mr-2" />
              业务参数配置
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>默认货币</Label>
                <Select v-model="businessConfig.defaultCurrency">
                  <SelectTrigger>
                    <SelectValue placeholder="选择默认货币" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="option in currencyOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label>小数位数</Label>
                <Input
                  v-model.number="businessConfig.decimalPlaces"
                  type="number"
                  min="0"
                  max="6"
                  placeholder="小数位数"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>税率 (%)</Label>
                <Input
                  v-model.number="businessConfig.taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="税率"
                />
              </div>
              <div class="space-y-2">
                <Label>库存预警阈值</Label>
                <Input
                  v-model.number="businessConfig.stockWarningThreshold"
                  type="number"
                  min="0"
                  placeholder="库存预警阈值"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="autoApproval" v-model="businessConfig.autoApproval" />
                <Label for="autoApproval">启用自动审批</Label>
              </div>
            </div>

            <div class="flex justify-end">
              <Button :disabled="saving" @click="saveBusinessConfig">
                <Save class="w-4 h-4 mr-2" />
                <span v-if="saving">保存中...</span>
                <span v-else>保存业务配置</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- 安全配置 -->
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Shield class="w-5 h-5 mr-2" />
              安全参数配置
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>密码最小长度</Label>
                <Input
                  v-model.number="securityConfig.passwordMinLength"
                  type="number"
                  min="6"
                  max="32"
                  placeholder="密码最小长度"
                />
              </div>
              <div class="space-y-2">
                <Label>登录失败锁定次数</Label>
                <Input
                  v-model.number="securityConfig.maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  placeholder="登录失败锁定次数"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>会话超时时间 (分钟)</Label>
                <Input
                  v-model.number="securityConfig.sessionTimeout"
                  type="number"
                  min="10"
                  max="1440"
                  placeholder="会话超时时间"
                />
              </div>
              <div class="space-y-2">
                <Label>账户锁定时间 (分钟)</Label>
                <Input
                  v-model.number="securityConfig.lockoutDuration"
                  type="number"
                  min="5"
                  max="120"
                  placeholder="账户锁定时间"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="passwordComplexity" v-model="securityConfig.requirePasswordComplexity" />
                <Label for="passwordComplexity">密码复杂度要求</Label>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="twoFactor" v-model="securityConfig.enableTwoFactor" />
                <Label for="twoFactor">启用双因子认证</Label>
              </div>
            </div>

            <div class="flex justify-end">
              <Button :disabled="saving" @click="saveSecurityConfig">
                <Save class="w-4 h-4 mr-2" />
                <span v-if="saving">保存中...</span>
                <span v-else>保存安全配置</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- 邮件配置 -->
      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Mail class="w-5 h-5 mr-2" />
              邮件服务配置
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>SMTP服务器</Label>
                <Input v-model="emailConfig.smtpHost" placeholder="如: smtp.qq.com" />
              </div>
              <div class="space-y-2">
                <Label>SMTP端口</Label>
                <Input v-model.number="emailConfig.smtpPort" type="number" min="1" max="65535" placeholder="端口号" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>发件人邮箱</Label>
                <Input v-model="emailConfig.fromEmail" type="email" placeholder="system@company.com" />
              </div>
              <div class="space-y-2">
                <Label>发件人名称</Label>
                <Input v-model="emailConfig.fromName" placeholder="ERP系统" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>SMTP用户名</Label>
                <Input v-model="emailConfig.smtpUsername" placeholder="SMTP登录用户名" />
              </div>
              <div class="space-y-2">
                <Label>SMTP密码</Label>
                <Input v-model="emailConfig.smtpPassword" type="password" placeholder="SMTP登录密码" />
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center space-x-2">
                <Checkbox id="enableSSL" v-model="emailConfig.enableSSL" />
                <Label for="enableSSL">启用SSL加密</Label>
              </div>

              <div class="flex items-center space-x-2">
                <Checkbox id="enableTLS" v-model="emailConfig.enableTLS" />
                <Label for="enableTLS">启用TLS加密</Label>
              </div>
            </div>

            <div class="flex justify-between">
              <Button variant="outline" :disabled="testing" @click="testEmailConnection">
                <Send class="w-4 h-4 mr-2" />
                <span v-if="testing">测试中...</span>
                <span v-else>测试邮件连接</span>
              </Button>

              <Button :disabled="saving" @click="saveEmailConfig">
                <Save class="w-4 h-4 mr-2" />
                <span v-if="saving">保存中...</span>
                <span v-else>保存邮件配置</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- 备份配置 -->
      <TabsContent value="backup">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Database class="w-5 h-5 mr-2" />
              数据备份配置
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>备份频率</Label>
                <Select v-model="backupConfig.frequency">
                  <SelectTrigger>
                    <SelectValue placeholder="选择备份频率" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="option in backupFrequencyOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label>保留天数</Label>
                <Input
                  v-model.number="backupConfig.retentionDays"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="保留天数"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label>备份路径</Label>
              <Input v-model="backupConfig.backupPath" placeholder="/backup/erp" />
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="enableAutoBackup" v-model="backupConfig.enableAutoBackup" />
                <Label for="enableAutoBackup">启用自动备份</Label>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="compressBackup" v-model="backupConfig.compressBackup" />
                <Label for="compressBackup">压缩备份文件</Label>
              </div>
            </div>

            <div class="flex justify-end space-x-2">
              <Button variant="outline" :disabled="backing" @click="performBackup">
                <Download class="w-4 h-4 mr-2" />
                <span v-if="backing">备份中...</span>
                <span v-else>立即备份</span>
              </Button>
              <Button :disabled="saving" @click="saveBackupConfig">
                <Save class="w-4 h-4 mr-2" />
                <span v-if="saving">保存中...</span>
                <span v-else>保存备份配置</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup>
// UI组件现在自动导入，无需手动导入

import { Briefcase, Database, Download, Mail, Save, Send, Settings, Shield } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '系统配置 - ERP 管理系统',
})

// 状态管理
const saving = ref(false)
const testing = ref(false)
const backing = ref(false)

// 基础配置
const basicConfig = ref({
  companyName: '某某科技有限公司',
  systemName: 'ERP管理系统',
  version: 'v1.0.0',
  adminEmail: 'admin@company.com',
  address: '北京市朝阳区某某街道123号',
})

// 业务配置
const businessConfig = ref({
  defaultCurrency: 'CNY',
  decimalPlaces: 2,
  taxRate: 13.0,
  stockWarningThreshold: 10,
  autoApproval: false,
})

// 安全配置
const securityConfig = ref({
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  sessionTimeout: 120,
  lockoutDuration: 30,
  requirePasswordComplexity: true,
  enableTwoFactor: false,
})

// 邮件配置
const emailConfig = ref({
  smtpHost: '',
  smtpPort: 587,
  fromEmail: '',
  fromName: 'ERP系统',
  smtpUsername: '',
  smtpPassword: '',
  enableSSL: false,
  enableTLS: true,
})

// 备份配置
const backupConfig = ref({
  frequency: 'daily',
  retentionDays: 30,
  backupPath: '/var/backups/erp',
  enableAutoBackup: true,
  compressBackup: true,
})

// 选项数据
const currencyOptions = ref([
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '美元 (USD)', value: 'USD' },
  { label: '欧元 (EUR)', value: 'EUR' },
  { label: '日元 (JPY)', value: 'JPY' },
])

const backupFrequencyOptions = ref([
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '手动', value: 'manual' },
])

// 方法
const saveAllConfigs = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('保存所有配置:', {
      basic: basicConfig.value,
      business: businessConfig.value,
      security: securityConfig.value,
      email: emailConfig.value,
      backup: backupConfig.value,
    })
  }
  catch (error) {
    console.error('保存配置失败:', error)
  }
  finally {
    saving.value = false
  }
}

const saveBasicConfig = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('基础配置保存成功')
  }
  catch (error) {
    toast.error('保存失败，请重试', {
      description: error.message,
    })
  }
  finally {
    saving.value = false
  }
}

const saveBusinessConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('业务配置保存成功')
  }
  catch (error) {
    toast.error('保存失败，请重试', {
      description: error.message,
    })
  }
  finally {
    saving.value = false
  }
}

const saveSecurityConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('安全配置保存成功')
  }
  catch (error) {
    toast.error('保存失败，请重试', {
      description: error.message,
    })
  }
  finally {
    saving.value = false
  }
}

const saveEmailConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('邮件配置保存成功')
  }
  catch (error) {
    toast.error('保存失败，请重试', {
      description: error.message,
    })
  }
  finally {
    saving.value = false
  }
}

const saveBackupConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('备份配置保存成功')
  }
  catch (error) {
    toast.error('保存失败，请重试', {
      description: error.message,
    })
  }
  finally {
    saving.value = false
  }
}

const testEmailConnection = async () => {
  testing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('邮件连接测试成功')
  }
  catch (error) {
    toast.error('邮件连接测试失败', {
      description: error.message,
    })
  }
  finally {
    testing.value = false
  }
}

const performBackup = async () => {
  backing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 3000))
    toast.success('数据备份完成')
  }
  catch (error) {
    toast.error('数据备份失败', {
      description: error.message,
    })
  }
  finally {
    backing.value = false
  }
}

// 初始化
onMounted(() => {
  // 加载配置数据
})
</script>
