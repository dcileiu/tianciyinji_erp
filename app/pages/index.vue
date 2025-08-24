<template>
  <div class="min-h-screen flex align-items-center justify-content-center py-6 px-4 sm:px-6 lg:px-8">
    <!-- 加载状态 -->
    <Panel
v-if="isLoading" class="text-center border-none" :pt="{
      root: { class: 'bg-transparent' },
      header: { class: 'hidden' },
      content: { class: 'p-6' },
    }">
      <div class="flex flex-column align-items-center gap-3">
        <Skeleton shape="circle" size="3rem" />
        <Skeleton width="12rem" height="1rem" />
      </div>
      <p class="mt-3 text-sm text-surface-500">
        正在检查登录状态...
      </p>
    </Panel>

    <!-- 未登录用户显示欢迎页面 -->
    <div v-else-if="!isAuthenticated" class="text-center max-w-4xl mx-auto">
      <div class="mb-8">
        <div class="w-4rem h-4rem bg-primary border-round-2xl flex align-items-center justify-content-center mx-auto mb-4">
          <span class="text-white font-bold text-2xl">E</span>
        </div>
        <h1 class="text-4xl font-bold text-surface-900 mb-4">
          ERP 管理系统
        </h1>
        <p class="text-xl text-surface-600 mb-8">
          企业资源规划系统，助力您的业务发展
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <Panel
class="shadow-lg border-0" :pt="{
          root: { class: 'bg-surface-0' },
          header: { class: 'hidden' },
          content: { class: 'p-6' },
        }">
          <div class="w-3rem h-3rem bg-blue-100 border-round flex align-items-center justify-content-center mb-4">
            <i class="pi pi-shopping-cart text-blue-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-surface-900 mb-2">
            销售管理
          </h3>
          <p class="text-surface-600">
            客户管理、订单处理、发货跟踪等全流程销售管理
          </p>
        </Panel>

        <Panel
class="shadow-lg border-0" :pt="{
          root: { class: 'bg-surface-0' },
          header: { class: 'hidden' },
          content: { class: 'p-6' },
        }">
          <div class="w-3rem h-3rem bg-green-100 border-round flex align-items-center justify-content-center mb-4">
            <i class="pi pi-box text-green-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-surface-900 mb-2">
            库存管理
          </h3>
          <p class="text-surface-600">
            实时库存监控、入出库管理、盘点调拨等仓储功能
          </p>
        </Panel>

        <Panel
class="shadow-lg border-0" :pt="{
          root: { class: 'bg-surface-0' },
          header: { class: 'hidden' },
          content: { class: 'p-6' },
        }">
          <div class="w-3rem h-3rem bg-purple-100 border-round flex align-items-center justify-content-center mb-4">
            <i class="pi pi-cog text-purple-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-surface-900 mb-2">
            生产管理
          </h3>
          <p class="text-surface-600">
            生产计划、工单管理、质量控制等生产流程管理
          </p>
        </Panel>

        <Panel
class="shadow-lg border-0" :pt="{
          root: { class: 'bg-surface-0' },
          header: { class: 'hidden' },
          content: { class: 'p-6' },
        }">
          <div class="w-3rem h-3rem bg-red-100 border-round flex align-items-center justify-content-center mb-4">
            <i class="pi pi-chart-line text-red-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-surface-900 mb-2">
            财务管理
          </h3>
          <p class="text-surface-600">
            应收应付、成本核算、财务报表等财务管理功能
          </p>
        </Panel>
      </div>

      <div class="flex flex-column sm:flex-row gap-4 justify-content-center">
        <Button 
          label="立即登录" 
          icon="pi pi-sign-in"
          class="w-full sm:w-auto"
          size="large"
          @click="navigateTo('/login')"
        />
        <Button 
          label="了解更多" 
          icon="pi pi-info-circle"
          outlined
          class="w-full sm:w-auto"
          size="large"
          @click="navigateTo('/getting-started')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Skeleton from 'primevue/skeleton'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
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
