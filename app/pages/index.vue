<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="text-center">
      <ProgressSpinner style="width: 50px; height: 50px" stroke-width="3" />
      <p class="mt-2 text-sm text-muted-color">
        正在检查登录状态...
      </p>
    </div>

    <!-- 未登录用户显示欢迎页面 -->
    <div v-else-if="!isAuthenticated" class="text-center max-w-2xl mx-auto">
      <div class="mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-2xl">E</span>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          ERP 管理系统
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
          企业资源规划系统，助力您的业务发展
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
            <i class="pi pi-shopping-cart text-blue-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            销售管理
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            客户管理、订单处理、发货跟踪等全流程销售管理
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
            <i class="pi pi-box text-green-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            库存管理
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            实时库存监控、入出库管理、盘点调拨等仓储功能
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
            <i class="pi pi-cog text-purple-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            生产管理
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            生产计划、工单管理、质量控制等生产流程管理
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
            <i class="pi pi-chart-line text-red-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            财务管理
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            应收应付、成本核算、财务报表等财务管理功能
          </p>
        </div>
      </div>

      <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <Button 
          label="立即登录" 
          icon="pi pi-sign-in"
          class="w-full sm:w-auto"
          @click="navigateTo('/login')"
        />
        <Button 
          label="了解更多" 
          icon="pi pi-info-circle"
          outlined
          class="w-full sm:w-auto"
          @click="navigateTo('/getting-started')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'
import { useAuth } from '~/composables/useAuth'

// 页面元数据
definePageMeta({
  layout: 'auth',
  middleware: []
})

useHead({
  title: 'ERP 管理系统'
})

// 获取认证状态
const { isAuthenticated, user } = useAuth()

// 页面加载状态
const isLoading = ref(true)

onMounted(async () => {
  // 模拟初始化加载
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  isLoading.value = false
  
  // 如果已登录，跳转到仪表盘
  if (isAuthenticated.value) {
    await navigateTo('/dashboard')
  }
})
</script>
