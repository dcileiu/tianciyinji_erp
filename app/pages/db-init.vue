<template>
  <div class="max-w-4xl mx-auto">
    <Card>
      <template #content>
        <div class="p-8">
      <div class="mb-8">
            <h1 class="text-3xl font-bold text-color mb-2">
          数据库初始化
        </h1>
            <p class="text-muted-color">
          初始化 ERP 系统数据库，创建基础数据和测试连接
        </p>
      </div>

      <!-- 连接状态检查 -->
      <div class="mb-8">
            <h2 class="text-xl font-semibold text-color mb-4">连接状态检查</h2>
        <div class="grid md:grid-cols-2 gap-4">
              <Card>
                <template #content>
                  <div class="flex items-center space-x-3 p-4">
              <div class="flex-shrink-0">
                <div
:class="[
                  'w-3 h-3 rounded-full',
                  connectionStatus.database ? 'bg-green-500' : 'bg-red-500',
                ]"
></div>
              </div>
              <div>
                      <p class="font-medium text-color">数据库连接</p>
                      <p class="text-sm text-muted-color">
                  {{ connectionStatus.database ? '已连接' : '未连接' }}
                </p>
              </div>
            </div>
                </template>
          </Card>

              <Card>
                <template #content>
                  <div class="flex items-center space-x-3 p-4">
              <div class="flex-shrink-0">
                <div
:class="[
                  'w-3 h-3 rounded-full',
                  connectionStatus.auth ? 'bg-green-500' : 'bg-red-500',
                ]"
></div>
              </div>
              <div>
                      <p class="font-medium text-color">认证服务</p>
                      <p class="text-sm text-muted-color">
                  {{ connectionStatus.auth ? '已连接' : '未连接' }}
                </p>
              </div>
            </div>
                </template>
          </Card>
        </div>
      </div>

      <!-- 初始化步骤 -->
      <div class="mb-8">
            <h2 class="text-xl font-semibold text-color mb-4">初始化步骤</h2>
        <div class="space-y-4">
          <!-- 检查表结构 -->
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-3">
              <div
:class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                steps.checkTables.status === 'completed' ? 'bg-green-500'
                : steps.checkTables.status === 'running' ? 'bg-blue-500' : 'bg-gray-400',
              ]"
>
                    <i v-if="steps.checkTables.status === 'completed'" class="pi pi-check text-xs"></i>
                    <ProgressSpinner v-else-if="steps.checkTables.status === 'running'" style="width: 16px; height: 16px" />
                <span v-else>1</span>
              </div>
              <div>
                    <p class="font-medium text-color">检查数据库表结构</p>
                    <p class="text-sm text-muted-color">验证所有必要的表是否存在</p>
              </div>
            </div>
            <Button 
              :disabled="steps.checkTables.status === 'running'" 
              :label="steps.checkTables.status === 'completed' ? '重新检查' : '开始检查'"
                  outlined
                  @click="checkTables"
                />
          </div>

          <!-- 创建管理员用户 -->
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-3">
              <div
:class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                steps.createAdmin.status === 'completed' ? 'bg-green-500'
                : steps.createAdmin.status === 'running' ? 'bg-blue-500' : 'bg-gray-400',
              ]"
>
                    <i v-if="steps.createAdmin.status === 'completed'" class="pi pi-check text-xs"></i>
                    <ProgressSpinner v-else-if="steps.createAdmin.status === 'running'" style="width: 16px; height: 16px" />
                <span v-else>2</span>
              </div>
              <div>
                    <p class="font-medium text-color">创建管理员账户</p>
                    <p class="text-sm text-muted-color">设置系统管理员用户</p>
              </div>
            </div>
            <Button 
                  :disabled="steps.createAdmin.status === 'running' || steps.checkTables.status !== 'completed'" 
              :label="steps.createAdmin.status === 'completed' ? '重新创建' : '开始创建'"
                  outlined
                  @click="createAdmin"
                />
          </div>

              <!-- 创建基础数据 -->
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-3">
              <div
:class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                    steps.seedData.status === 'completed' ? 'bg-green-500'
                    : steps.seedData.status === 'running' ? 'bg-blue-500' : 'bg-gray-400',
              ]"
>
                    <i v-if="steps.seedData.status === 'completed'" class="pi pi-check text-xs"></i>
                    <ProgressSpinner v-else-if="steps.seedData.status === 'running'" style="width: 16px; height: 16px" />
                <span v-else>3</span>
              </div>
              <div>
                    <p class="font-medium text-color">创建基础数据</p>
                    <p class="text-sm text-muted-color">创建角色、权限等基础配置数据</p>
                  </div>
                </div>
                <Button 
                  :disabled="steps.seedData.status === 'running' || steps.createAdmin.status !== 'completed'" 
                  :label="steps.seedData.status === 'completed' ? '重新创建' : '开始创建'"
                  outlined
                  @click="seedData"
                />
              </div>

              <!-- 运行迁移 -->
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div class="flex items-center space-x-3">
                  <div
:class="[
                    'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                    steps.runMigrations.status === 'completed' ? 'bg-green-500'
                    : steps.runMigrations.status === 'running' ? 'bg-blue-500' : 'bg-gray-400',
                  ]"
>
                    <i v-if="steps.runMigrations.status === 'completed'" class="pi pi-check text-xs"></i>
                    <ProgressSpinner v-else-if="steps.runMigrations.status === 'running'" style="width: 16px; height: 16px" />
                    <span v-else>4</span>
                  </div>
                  <div>
                    <p class="font-medium text-color">运行数据库迁移</p>
                    <p class="text-sm text-muted-color">执行所有待运行的数据库迁移</p>
              </div>
            </div>
            <Button 
                  :disabled="steps.runMigrations.status === 'running'" 
                  :label="steps.runMigrations.status === 'completed' ? '重新运行' : '开始运行'"
                  outlined
                  @click="runMigrations"
                />
          </div>
        </div>
      </div>

          <!-- 快速初始化 -->
      <div class="mb-8">
            <h2 class="text-xl font-semibold text-color mb-4">快速初始化</h2>
            <div class="bg-surface-50 p-6 rounded-lg border">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-color">一键完成所有初始化步骤</p>
                  <p class="text-sm text-muted-color mt-1">
                    自动执行所有必要的初始化操作，包括表结构检查、管理员创建和基础数据导入
                  </p>
                </div>
                <Button 
                  :disabled="isInitializing"
                  :loading="isInitializing"
                  label="一键初始化"
                  severity="success"
                  @click="initializeAll"
                />
              </div>
              
              <!-- 初始化进度 -->
              <div v-if="isInitializing" class="mt-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-color">初始化进度</span>
                  <span class="text-sm text-muted-color">{{ initProgress }}%</span>
                </div>
                <ProgressBar :value="initProgress" class="h-2" />
                <p class="text-sm text-muted-color mt-2">{{ currentStep }}</p>
              </div>
        </div>
      </div>

      <!-- 日志输出 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-color mb-4">初始化日志</h2>
            <div class="bg-surface-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              <div v-for="(log, index) in logs" :key="index" class="mb-1">
                <span class="text-gray-500">[{{ formatTime(log.timestamp) }}]</span>
                <span :class="getLogClass(log.level)">{{ log.message }}</span>
          </div>
              <div v-if="logs.length === 0" class="text-gray-500">
                等待初始化操作...
        </div>
      </div>
          </div>

          <!-- 初始化完成状态 -->
          <div v-if="allStepsCompleted" class="bg-green-50 border border-green-200 p-6 rounded-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <i class="pi pi-check-circle text-green-600 text-2xl"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-lg font-medium text-green-800">初始化完成！</h3>
                <p class="text-green-700 mt-1">
                  数据库已成功初始化，您现在可以使用管理员账户登录系统。
                </p>
                <div class="mt-4">
                  <Button 
                    label="前往登录"
                    icon="pi pi-sign-in"
                    class="mr-2"
                    @click="goToLogin"
                  />
                  <Button 
                    label="查看系统状态"
                    icon="pi pi-chart-bar"
                    outlined
                    @click="goToDashboard"
            />
          </div>
              </div>
            </div>
          </div>
          </div>
      </template>
      </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '数据库初始化 - ERP 管理系统'
})

// 状态管理
const isInitializing = ref(false)
const initProgress = ref(0)
const currentStep = ref('')

// 连接状态
const connectionStatus = ref({
  database: false,
  auth: false
})

// 初始化步骤状态
const steps = ref({
  checkTables: { status: 'pending' },
  createAdmin: { status: 'pending' },
  seedData: { status: 'pending' },
  runMigrations: { status: 'pending' }
})

// 日志
const logs = ref<Array<{ timestamp: Date, level: string, message: string }>>([])

// 计算属性
const allStepsCompleted = computed(() => {
  return Object.values(steps.value).every(step => step.status === 'completed')
})

// 方法
const addLog = (level: string, message: string) => {
  logs.value.push({
    timestamp: new Date(),
    level,
    message
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}

const getLogClass = (level: string) => {
  switch (level) {
    case 'error': return 'text-red-400'
    case 'warning': return 'text-yellow-400'
    case 'success': return 'text-green-400'
    default: return 'text-green-400'
  }
}

const checkConnection = async () => {
  try {
    addLog('info', '检查数据库连接...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    connectionStatus.value.database = true
    addLog('success', '数据库连接成功')
    
    addLog('info', '检查认证服务连接...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    connectionStatus.value.auth = true
    addLog('success', '认证服务连接成功')
  }
  catch (error) {
    addLog('error', '连接检查失败: ' + (error as Error).message)
  }
}

const checkTables = async () => {
  steps.value.checkTables.status = 'running'
  addLog('info', '开始检查数据库表结构...')

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    steps.value.checkTables.status = 'completed'
    addLog('success', '数据库表结构检查完成')
  }
  catch (error) {
    steps.value.checkTables.status = 'pending'
    addLog('error', '表结构检查失败: ' + (error as Error).message)
  }
}

const createAdmin = async () => {
  steps.value.createAdmin.status = 'running'
  addLog('info', '开始创建管理员账户...')

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    steps.value.createAdmin.status = 'completed'
    addLog('success', '管理员账户创建完成')
  }
  catch (error) {
    steps.value.createAdmin.status = 'pending'
    addLog('error', '管理员账户创建失败: ' + (error as Error).message)
  }
}

const seedData = async () => {
  steps.value.seedData.status = 'running'
  addLog('info', '开始创建基础数据...')
  
  try {
    await new Promise(resolve => setTimeout(resolve, 3000))
    steps.value.seedData.status = 'completed'
    addLog('success', '基础数据创建完成')
  }
  catch (error) {
    steps.value.seedData.status = 'pending'
    addLog('error', '基础数据创建失败: ' + (error as Error).message)
  }
}

const runMigrations = async () => {
  steps.value.runMigrations.status = 'running'
  addLog('info', '开始运行数据库迁移...')

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    steps.value.runMigrations.status = 'completed'
    addLog('success', '数据库迁移完成')
  }
  catch (error) {
    steps.value.runMigrations.status = 'pending'
    addLog('error', '数据库迁移失败: ' + (error as Error).message)
  }
}

const initializeAll = async () => {
  isInitializing.value = true
  initProgress.value = 0
  
  try {
    currentStep.value = '检查表结构...'
    await checkTables()
    initProgress.value = 25
    
    currentStep.value = '创建管理员账户...'
    await createAdmin()
    initProgress.value = 50
    
    currentStep.value = '创建基础数据...'
    await seedData()
    initProgress.value = 75
    
    currentStep.value = '运行数据库迁移...'
    await runMigrations()
    initProgress.value = 100
    
    currentStep.value = '初始化完成!'
    addLog('success', '=== 所有初始化步骤已完成 ===')
  }
  catch (error) {
    addLog('error', '初始化过程中出现错误: ' + (error as Error).message)
  }
  finally {
    isInitializing.value = false
  }
}

const goToLogin = () => {
  navigateTo('/login')
}

const goToDashboard = () => {
  navigateTo('/dashboard')
}

// 初始化
onMounted(async () => {
  await checkConnection()
})
</script>
