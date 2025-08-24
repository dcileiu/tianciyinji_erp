<template>
  <div class="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="text-center">
      <div class="flex flex-col items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-muted animate-pulse"></div>
        <div class="w-48 h-4 bg-muted rounded animate-pulse"></div>
      </div>
      <p class="mt-3 text-sm text-muted-foreground">
        正在检查登录状态...
      </p>
    </div>

    <!-- 未登录用户显示欢迎页面 -->
    <div v-else-if="!isAuthenticated" class="text-center max-w-4xl mx-auto">
      <div class="mb-8">
        <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 class="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 class="text-4xl font-bold text-foreground mb-4">
          ERP 管理系统
        </h1>
        <p class="text-xl text-muted-foreground mb-8">
          企业资源规划系统，助力您的业务发展
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <Card class="shadow-lg">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart class="w-6 h-6 text-blue-600" />
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">
              销售管理
            </h3>
            <p class="text-muted-foreground">
              客户管理、订单处理、发货跟踪等全流程销售管理
            </p>
          </CardContent>
        </Card>

        <Card class="shadow-lg">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Warehouse class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">
              库存管理
            </h3>
            <p class="text-muted-foreground">
              实时库存监控、入出库管理、盘点调拨等仓储功能
            </p>
          </CardContent>
        </Card>

        <Card class="shadow-lg">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Factory class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">
              生产管理
            </h3>
            <p class="text-muted-foreground">
              生产计划、工单管理、质量控制等生产流程管理
            </p>
          </CardContent>
        </Card>

        <Card class="shadow-lg">
          <CardContent class="p-6">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">
              财务管理
            </h3>
            <p class="text-muted-foreground">
              应收应付、成本核算、财务报表等财务管理功能
            </p>
          </CardContent>
        </Card>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          class="w-full sm:w-auto"
          size="lg"
          @click="navigateTo('/login')"
        >
          <LogIn class="w-4 h-4 mr-2" />
          立即登录
        </Button>
        <Button 
          variant="outline"
          class="w-full sm:w-auto"
          size="lg"
          @click="navigateTo('/getting-started')"
        >
          <Info class="w-4 h-4 mr-2" />
          了解更多
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Building2, ShoppingCart, Warehouse, Factory, Calculator, LogIn, Info } from 'lucide-vue-next'
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

// 如果已登录，重定向到仪表板
watchEffect(() => {
  if (!isLoading.value && isAuthenticated.value) {
    navigateTo('/dashboard')
  }
})
</script>
