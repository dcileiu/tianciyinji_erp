<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="text-center">
      <Loader2 class="h-8 w-8 animate-spin mx-auto text-primary" />
      <p class="mt-2 text-sm text-muted-foreground">
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
            <ShoppingCart class="h-6 w-6 text-blue-600" />
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
            <Package class="h-6 w-6 text-green-600" />
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
            <Factory class="h-6 w-6 text-purple-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            生产管理
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            生产计划、工单管理、工艺路线等生产过程控制
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
            <ShoppingBag class="h-6 w-6 text-orange-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            采购管理
          </h3>
          <p class="text-gray-600 dark:text-gray-300">
            供应商管理、采购订单、到货验收等采购全流程
          </p>
        </div>
      </div>

      <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/login"
            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            立即登录
          </NuxtLink>
          <NuxtLink 
            to="/register"
            class="px-8 py-3 border border-gray-300 dark:border-gray-600 text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
          >
            注册账户
          </NuxtLink>
          <NuxtLink 
            to="/getting-started"
            class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            📋 快速入门
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2, ShoppingCart, Package, Factory, ShoppingBag } from 'lucide-vue-next'

// 使用认证布局
definePageMeta({
  layout: 'auth',
})

// 页面标题
useHead({
  title: '欢迎使用 ERP 管理系统',
})

const { isAuthenticated, isLoading } = useAuth()
</script>
