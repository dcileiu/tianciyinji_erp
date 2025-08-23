<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-color">系统配置</h1>
        <p class="text-muted-color">管理系统参数和配置项</p>
      </div>
      <Button
        label="保存所有配置"
        icon="pi pi-save"
        severity="success"
        :loading="saving"
        @click="saveAllConfigs"
      />
    </div>

    <!-- 配置选项卡 -->
    <TabView>
      <!-- 基础配置 -->
      <TabPanel value="basic" header="基础配置">
        <Card>
          <template #header>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-color">基础信息配置</h3>
            </div>
          </template>
          
          <template #content>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">公司名称</label>
                  <InputText
                    v-model="basicConfig.companyName"
                    placeholder="请输入公司名称"
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">系统名称</label>
                  <InputText
                    v-model="basicConfig.systemName"
                    placeholder="请输入系统名称"
                    class="w-full"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">系统版本</label>
                  <InputText
                    v-model="basicConfig.version"
                    placeholder="如: v1.0.0"
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">管理员邮箱</label>
                  <InputText
                    v-model="basicConfig.adminEmail"
                    type="email"
                    placeholder="admin@company.com"
                    class="w-full"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-color">公司地址</label>
                <InputText
                  v-model="basicConfig.address"
                  placeholder="请输入公司地址"
                  class="w-full"
                />
              </div>

              <div class="flex justify-end">
                <Button
                  label="保存基础配置"
                  icon="pi pi-save"
                  :loading="saving"
                  @click="saveBasicConfig"
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>

      <!-- 业务配置 -->
      <TabPanel value="business" header="业务配置">
        <Card>
          <template #header>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-color">业务参数配置</h3>
            </div>
          </template>
          
          <template #content>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">默认货币</label>
                  <Dropdown
                    v-model="businessConfig.defaultCurrency"
                    :options="currencyOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="选择默认货币"
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">小数位数</label>
                  <InputNumber
                    v-model="businessConfig.decimalPlaces"
                    :min="0"
                    :max="6"
                    show-buttons
                    class="w-full"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">税率 (%)</label>
                  <InputNumber
                    v-model="businessConfig.taxRate"
                    mode="decimal"
                    :min="0"
                    :max="100"
                    :max-fraction-digits="2"
                    suffix="%"
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">库存预警阈值</label>
                  <InputNumber
                    v-model="businessConfig.stockWarningThreshold"
                    :min="0"
                    show-buttons
                    class="w-full"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    v-model="businessConfig.autoApproval"
                    input-id="autoApproval"
                    :binary="true"
                  />
                  <label for="autoApproval" class="text-sm font-medium text-color">启用自动审批</label>
                </div>
              </div>

              <div class="flex justify-end">
                <Button
                  label="保存业务配置"
                  icon="pi pi-save"
                  :loading="saving"
                  @click="saveBusinessConfig"
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>

      <!-- 安全配置 -->
      <TabPanel value="security" header="安全配置">
        <Card>
          <template #header>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-color">安全参数配置</h3>
            </div>
          </template>
          
          <template #content>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">密码最小长度</label>
                  <InputNumber
                    v-model="securityConfig.passwordMinLength"
                    :min="6"
                    :max="32"
                    show-buttons
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">登录失败锁定次数</label>
                  <InputNumber
                    v-model="securityConfig.maxLoginAttempts"
                    :min="3"
                    :max="10"
                    show-buttons
                    class="w-full"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">会话超时时间 (分钟)</label>
                  <InputNumber
                    v-model="securityConfig.sessionTimeout"
                    :min="10"
                    :max="1440"
                    show-buttons
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">账户锁定时间 (分钟)</label>
                  <InputNumber
                    v-model="securityConfig.lockoutDuration"
                    :min="5"
                    :max="120"
                    show-buttons
                    class="w-full"
                  />
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    v-model="securityConfig.requirePasswordComplexity"
                    input-id="passwordComplexity"
                    :binary="true"
                  />
                  <label for="passwordComplexity" class="text-sm font-medium text-color">密码复杂度要求</label>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox
                    v-model="securityConfig.enableTwoFactor"
                    input-id="twoFactor"
                    :binary="true"
                  />
                  <label for="twoFactor" class="text-sm font-medium text-color">启用双因子认证</label>
                </div>
              </div>

              <div class="flex justify-end">
                <Button
                  label="保存安全配置"
                  icon="pi pi-save"
                  :loading="saving"
                  @click="saveSecurityConfig"
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>

      <!-- 邮件配置 -->
      <TabPanel value="email" header="邮件配置">
        <Card>
          <template #header>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-color">邮件服务配置</h3>
            </div>
          </template>
          
          <template #content>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">SMTP服务器</label>
                  <InputText
                    v-model="emailConfig.smtpHost"
                    placeholder="如: smtp.qq.com"
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">SMTP端口</label>
                  <InputNumber
                    v-model="emailConfig.smtpPort"
                    :min="1"
                    :max="65535"
                    show-buttons
                    class="w-full"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">发件人邮箱</label>
                  <InputText
                    v-model="emailConfig.fromEmail"
                    type="email"
                    placeholder="system@company.com"
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">发件人名称</label>
                  <InputText
                    v-model="emailConfig.fromName"
                    placeholder="ERP系统"
                    class="w-full"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">SMTP用户名</label>
                  <InputText
                    v-model="emailConfig.smtpUsername"
                    placeholder="SMTP登录用户名"
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">SMTP密码</label>
                  <Password
                    v-model="emailConfig.smtpPassword"
                    placeholder="SMTP登录密码"
                    :feedback="false"
                    toggle-mask
                    class="w-full"
                  />
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    v-model="emailConfig.enableSSL"
                    input-id="enableSSL"
                    :binary="true"
                  />
                  <label for="enableSSL" class="text-sm font-medium text-color">启用SSL加密</label>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox
                    v-model="emailConfig.enableTLS"
                    input-id="enableTLS"
                    :binary="true"
                  />
                  <label for="enableTLS" class="text-sm font-medium text-color">启用TLS加密</label>
                </div>
              </div>

              <div class="flex justify-between">
                <Button
                  label="测试邮件连接"
                  icon="pi pi-send"
                  outlined
                  :loading="testing"
                  @click="testEmailConnection"
                />
                
                <Button
                  label="保存邮件配置"
                  icon="pi pi-save"
                  :loading="saving"
                  @click="saveEmailConfig"
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>

      <!-- 备份配置 -->
      <TabPanel value="backup" header="备份配置">
        <Card>
          <template #header>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-color">数据备份配置</h3>
            </div>
          </template>
          
          <template #content>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">备份频率</label>
                  <Dropdown
                    v-model="backupConfig.frequency"
                    :options="backupFrequencyOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="选择备份频率"
                    class="w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">保留天数</label>
                  <InputNumber
                    v-model="backupConfig.retentionDays"
                    :min="1"
                    :max="365"
                    show-buttons
                    class="w-full"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-color">备份路径</label>
                <InputText
                  v-model="backupConfig.backupPath"
                  placeholder="/var/backups/erp"
                  class="w-full"
                />
              </div>

              <div class="space-y-4">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    v-model="backupConfig.enableAutoBackup"
                    input-id="autoBackup"
                    :binary="true"
                  />
                  <label for="autoBackup" class="text-sm font-medium text-color">启用自动备份</label>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Checkbox
                    v-model="backupConfig.compressBackup"
                    input-id="compressBackup"
                    :binary="true"
                  />
                  <label for="compressBackup" class="text-sm font-medium text-color">压缩备份文件</label>
                </div>
              </div>

              <div class="flex justify-between">
                <Button
                  label="立即备份"
                  icon="pi pi-download"
                  outlined
                  :loading="backing"
                  @click="createBackup"
                />
                
                <Button
                  label="保存备份配置"
                  icon="pi pi-save"
                  :loading="saving"
                  @click="saveBackupConfig"
                />
              </div>
            </div>
          </template>
        </Card>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Password from 'primevue/password'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '系统配置 - ERP 管理系统'
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
  address: '北京市朝阳区某某街道123号'
})

// 业务配置
const businessConfig = ref({
  defaultCurrency: 'CNY',
  decimalPlaces: 2,
  taxRate: 13.0,
  stockWarningThreshold: 10,
  autoApproval: false
})

// 安全配置
const securityConfig = ref({
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  sessionTimeout: 120,
  lockoutDuration: 30,
  requirePasswordComplexity: true,
  enableTwoFactor: false
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
  enableTLS: true
})

// 备份配置
const backupConfig = ref({
  frequency: 'daily',
  retentionDays: 30,
  backupPath: '/var/backups/erp',
  enableAutoBackup: true,
  compressBackup: true
})

// 选项数据
const currencyOptions = ref([
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '美元 (USD)', value: 'USD' },
  { label: '欧元 (EUR)', value: 'EUR' },
  { label: '日元 (JPY)', value: 'JPY' }
])

const backupFrequencyOptions = ref([
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '手动', value: 'manual' }
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
      backup: backupConfig.value
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
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('保存基础配置:', basicConfig.value)
  }
  catch (error) {
    console.error('保存基础配置失败:', error)
  }
  finally {
    saving.value = false
  }
}

const saveBusinessConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('保存业务配置:', businessConfig.value)
  }
  catch (error) {
    console.error('保存业务配置失败:', error)
  }
  finally {
    saving.value = false
  }
}

const saveSecurityConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('保存安全配置:', securityConfig.value)
  }
  catch (error) {
    console.error('保存安全配置失败:', error)
  }
  finally {
    saving.value = false
  }
}

const saveEmailConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('保存邮件配置:', emailConfig.value)
  }
  catch (error) {
    console.error('保存邮件配置失败:', error)
  }
  finally {
    saving.value = false
  }
}

const saveBackupConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('保存备份配置:', backupConfig.value)
  }
  catch (error) {
    console.error('保存备份配置失败:', error)
  }
  finally {
    saving.value = false
  }
}

const testEmailConnection = async () => {
  testing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('测试邮件连接')
  }
  catch (error) {
    console.error('测试邮件连接失败:', error)
  }
  finally {
    testing.value = false
  }
}

const createBackup = async () => {
  backing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('创建备份')
  }
  catch (error) {
    console.error('创建备份失败:', error)
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
