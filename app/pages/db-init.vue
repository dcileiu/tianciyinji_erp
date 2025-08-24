<template>
  <div class="container mx-auto px-4 py-8">
    <Card>
      <template #header>
        <div class="p-6 pb-0">
          <h1 class="text-2xl font-bold text-color mb-2">数据库初始化</h1>
          <p class="text-muted-color">初始化系统数据库和基础配置</p>
        </div>
      </template>

      <template #content>
        <div class="p-6">
          <!-- 连接状态检查 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-color mb-4">连接状态检查</h2>
            <div class="grid md:grid-cols-3 gap-4">
              <Card>
                <template #content>
                  <div class="flex align-items-center gap-3 p-4">
                    <div class="flex-shrink-0">
                      <div
                        :class="[
                          'w-3 h-3 rounded-full',
                          connectionStatus === 'connected'
                            ? 'bg-green-500'
                            : connectionStatus === 'checking'
                              ? 'bg-yellow-500'
                              : 'bg-red-500',
                        ]"
                      ></div>
                    </div>
                    <div>
                      <p class="font-medium text-color">数据库连接</p>
                      <p class="text-sm text-muted-color">
                        {{
                          connectionStatus === 'connected'
                            ? '已连接'
                            : connectionStatus === 'checking'
                              ? '检查中...'
                              : '连接失败'
                        }}
                      </p>
                    </div>
                  </div>
                </template>
              </Card>

              <Card>
                <template #content>
                  <div class="flex items-center gap-3 p-4">
                    <div class="flex-shrink-0">
                      <div
                        :class="[
                          'w-3 h-3 rounded-full',
                          connectionStatus === 'connected'
                            ? 'bg-green-500'
                            : connectionStatus === 'checking'
                              ? 'bg-yellow-500'
                              : 'bg-red-500',
                        ]"
                      ></div>
                    </div>
                    <div>
                      <p class="font-medium text-color">认证服务</p>
                      <p class="text-sm text-muted-color">
                        {{
                          connectionStatus === 'connected'
                            ? '已连接'
                            : connectionStatus === 'checking'
                              ? '检查中...'
                              : '连接失败'
                        }}
                      </p>
                    </div>
                  </div>
                </template>
              </Card>

              <Card>
                <template #content>
                  <div class="flex align-items-center gap-3 p-4">
                    <div class="flex-shrink-0">
                      <div
                        :class="[
                          'w-3 h-3 rounded-full',
                          connectionStatus === 'connected'
                            ? 'bg-green-500'
                            : connectionStatus === 'checking'
                              ? 'bg-yellow-500'
                              : 'bg-red-500',
                        ]"
                      ></div>
                    </div>
                    <div>
                      <p class="font-medium text-color">管理员角色</p>
                      <p class="text-sm text-muted-color">
                        {{
                          connectionStatus === 'connected'
                            ? '已配置'
                            : connectionStatus === 'checking'
                              ? '检查中...'
                              : '未配置'
                        }}
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
            <div class="flex flex-column gap-4">
              <!-- 检查数据库连接 -->
              <div class="flex align-items-center justify-content-between p-4 border-1 border-surface border-round-lg">
                <div class="flex align-items-center gap-3">
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                      getStepById('check-connection')?.status === 'completed'
                        ? 'bg-green-500'
                        : getStepById('check-connection')?.status === 'running'
                          ? 'bg-blue-500'
                          : 'bg-gray-400',
                    ]"
                  >
                    <i v-if="getStepById('check-connection')?.status === 'completed'" class="pi pi-check text-xs"></i>
                    <span v-else>1</span>
                  </div>
                  <div>
                    <p class="font-medium text-color">检查数据库连接</p>
                    <p class="text-sm text-muted-color">验证数据库连接状态</p>
                    <div v-if="getStepById('check-connection')?.progress && getStepById('check-connection')!.progress > 0" class="mt-1" />
                  </div>
                </div>
                <Button :disabled="getStepById('check-connection')?.status === 'running'" @click="checkConnection">
                  检查连接
                </Button>
              </div>

              <!-- 检查表结构 -->
              <div class="flex align-items-center justify-content-between p-4 border-1 border-surface border-round-lg">
                <div class="flex align-items-center gap-3">
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex align-items-center justify-content-center text-white text-sm',
                      getStepById('check-tables')?.status === 'completed'
                        ? 'bg-green-500'
                        : getStepById('check-tables')?.status === 'running'
                          ? 'bg-blue-500'
                          : 'bg-gray-400',
                    ]"
                  >
                    <i v-if="getStepById('check-tables')?.status === 'completed'" class="pi pi-check text-xs"></i>
                    <span v-else>2</span>
                  </div>
                  <div>
                    <p class="font-medium text-color">检查数据库表结构</p>
                    <p class="text-sm text-muted-color">验证所有必要的数据库表是否存在</p>
                    <div v-if="getStepById('check-tables')?.progress && getStepById('check-tables')!.progress > 0" class="mt-1">
                    </div>
                  </div>
                </div>
                <Button :disabled="getStepById('check-tables')?.status === 'running'" @click="checkTables">
                  检查表结构
                </Button>
              </div>

              <!-- 检查管理员角色 -->
              <div class="flex items-center justify-between p-4 border border-surface rounded-lg">
                <div class="flex items-center space-x-3">
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                      getStepById('check-admin-role')?.status === 'completed'
                        ? 'bg-green-500'
                        : getStepById('check-admin-role')?.status === 'running'
                          ? 'bg-blue-500'
                          : 'bg-gray-400',
                    ]"
                  >
                    <i v-if="getStepById('check-admin-role')?.status === 'completed'" class="pi pi-check text-xs"></i>
                    <span v-else>3</span>
                  </div>
                  <div>
                    <p class="font-medium text-color">检查管理员角色</p>
                    <p class="text-sm text-muted-color">验证管理员角色和权限配置</p>
                    <div v-if="getStepById('check-admin-role')?.progress && getStepById('check-admin-role')!.progress > 0" class="mt-1">
                    </div>
                  </div>
                </div>
                <Button :disabled="getStepById('check-admin-role')?.status === 'running'" @click="checkAdminRole">
                  检查角色
                </Button>
              </div>

              <!-- 创建管理员用户 -->
              <div class="flex items-center justify-between p-4 border border-surface rounded-lg">
                <div class="flex items-center space-x-3">
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                      getStepById('create-admin')?.status === 'completed'
                        ? 'bg-green-500'
                        : getStepById('create-admin')?.status === 'running'
                          ? 'bg-blue-500'
                          : 'bg-gray-400',
                    ]"
                  >
                    <i v-if="getStepById('create-admin')?.status === 'completed'" class="pi pi-check text-xs"></i>
                    <span v-else>4</span>
                  </div>
                  <div>
                    <p class="font-medium text-color">创建管理员账户</p>
                    <p class="text-sm text-muted-color">设置系统管理员用户</p>
                    <div v-if="getStepById('create-admin')?.progress && getStepById('create-admin')!.progress > 0" class="mt-1">
                    </div>
                  </div>
                </div>
                <Button :disabled="getStepById('create-admin')?.status === 'running'" @click="createAdmin">
                  创建管理员
                </Button>
              </div>

              <!-- 分配管理员角色 -->
              <div class="flex items-center justify-between p-4 border border-surface rounded-lg">
                <div class="flex items-center space-x-3">
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                      getStepById('assign-role')?.status === 'completed'
                        ? 'bg-green-500'
                        : getStepById('assign-role')?.status === 'running'
                          ? 'bg-blue-500'
                          : 'bg-gray-400',
                    ]"
                  >
                    <i v-if="getStepById('assign-role')?.status === 'completed'" class="pi pi-check text-xs"></i>
                    <span v-else>5</span>
                  </div>
                  <div>
                    <p class="font-medium text-color">分配管理员角色</p>
                    <p class="text-sm text-muted-color">为管理员用户分配相应角色和权限</p>
                    <div v-if="getStepById('assign-role')?.progress && getStepById('assign-role')!.progress > 0" class="mt-1">
                    </div>
                  </div>
                </div>
                <Button :disabled="getStepById('assign-role')?.status === 'running'" @click="assignAdminRole">
                  分配角色
                </Button>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-color mb-4">快速操作</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Button :disabled="isInitializing" severity="info" class="w-full" @click="checkConnection">
                <i class="pi pi-wifi mr-2"></i>
                检查数据库连接
              </Button>

              <Button :disabled="isInitializing" severity="info" class="w-full" @click="checkTables">
                <i class="pi pi-table mr-2"></i>
                检查表结构
              </Button>

              <Button :disabled="isInitializing" severity="info" class="w-full" @click="checkAdminRole">
                <i class="pi pi-shield mr-2"></i>
                检查管理员角色
              </Button>

              <Button :disabled="isInitializing" severity="warning" class="w-full" @click="validateAdminPermissions">
                <i class="pi pi-verified mr-2"></i>
                验证管理员权限
              </Button>
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
                  severity="success"
                  @click="initializeAll"
                >
                  开始初始化
                </Button>
              </div>

              <!-- 初始化进度 -->
              <div v-if="isInitializing" class="mt-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-color">初始化进度</span>
                  <span class="text-sm text-muted-color">{{ initProgress }}%</span>
                </div>
                <p class="text-sm text-muted-color mt-2">{{ currentStep }}</p>
              </div>
            </div>
          </div>

          <!-- 日志输出 -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-color mb-4">初始化日志</h2>
            <div class="bg-surface-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              <div v-for="(log, index) in logs" :key="index" class="mb-2">
                <div class="flex items-start space-x-2">
                  <span class="text-gray-500 flex-shrink-0">[{{ formatTime(log.timestamp) }}]</span>
                  <div class="flex-1">
                    <span :class="getLogClass(log.level)">{{ log.message }}</span>
                  </div>
                </div>
              </div>
              <div v-if="logs.length === 0" class="text-gray-500">等待初始化操作...</div>
              <div v-if="currentUser" class="text-blue-400 text-xs mt-2 pt-2 border-t border-gray-700">
                当前用户: {{ currentUser.email || '未登录' }}
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
                <p class="text-green-700 mt-1">数据库已成功初始化，您现在可以使用管理员账户登录系统。</p>
                <div class="mt-4">
                  <Button class="mr-2" @click="goToLogin">
                    前往登录
                  </Button>
                  <Button @click="goToDashboard">
                    进入系统
                  </Button>
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
import { navigateTo } from '#app'
import { useDbInit } from '~/composables/useDbInit'

const {
  isInitializing,
  initializationProgress,
  logs,
  steps,
  connectionStatus,
  currentUser,
  checkConnection,
  checkTables,
  checkAdminRole,
  createAdmin,
  assignAdminRole,
  initializeAll,
  validateAdminPermissions,
} = useDbInit()

// 计算属性
const allStepsCompleted = computed(() => {
  return steps.value.every(step => step.status === 'completed')
})

const totalSteps = computed(() => steps.value.length)
const completedSteps = computed(() => steps.value.filter(step => step.status === 'completed').length)
const initProgress = computed(() =>
  isInitializing.value ? initializationProgress.value : Math.round((completedSteps.value / totalSteps.value) * 100),
)

// 获取特定步骤的辅助函数
const getStepById = (id: string) => {
  return steps.value.find(step => step.id === id)
}

const currentStep = computed(() => {
  const runningStep = steps.value.find(step => step.status === 'running')
  if (runningStep) {
    const stepNames: Record<string, string> = {
      'check-connection': '检查数据库连接',
      'check-tables': '检查数据库表结构',
      'check-admin-role': '检查管理员角色',
      'create-admin': '创建管理员用户',
      'assign-role': '分配管理员角色',
    }
    return stepNames[runningStep.id] || '正在处理...'
  }
  return isInitializing.value ? '正在初始化...' : '等待开始...'
})

// 方法
const formatTime = (date: any) => {
  return date.toLocaleTimeString()
}

const getLogClass = (level: any) => {
  switch (level) {
    case 'error':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'success':
      return 'text-green-400'
    default:
      return 'text-green-400'
  }
}

const goToLogin = () => {
  navigateTo('/login')
}

const goToDashboard = () => {
  navigateTo('/dashboard')
}

// 页面加载时检查连接
onMounted(async () => {
  await checkConnection()
})
</script>
