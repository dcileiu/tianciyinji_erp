<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-semibold text-color mb-2">仪表盘</h1>
      <p class="text-muted-color">欢迎回来！这里是您的业务概览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-primary mb-1">¥125,420</div>
              <div class="text-sm text-muted-color mb-2">今日销售额</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+12.5%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-border flex items-center justify-center text-primary-contrast">
              <i class="pi pi-chart-line text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-green-600 mb-1">342</div>
              <div class="text-sm text-muted-color mb-2">今日订单</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+8.2%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-shopping-cart text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-purple-600 mb-1">2,156</div>
              <div class="text-sm text-muted-color mb-2">总客户数</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+15.3%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-users text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-orange-600 mb-1">8,432</div>
              <div class="text-sm text-muted-color mb-2">库存商品</div>
              <div class="flex items-center gap-1 text-sm text-red-600">
                <i class="pi pi-arrow-down"></i>
                <span>-2.1%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-box text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 快速操作 -->
      <Card class="lg:col-span-2">
        <template #header>
          <div class="p-4 pb-0">
            <h3 class="text-lg font-semibold text-color mb-1">快速操作</h3>
            <p class="text-sm text-muted-color">常用功能快速入口</p>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            <Button
              label="新建订单"
              icon="pi pi-plus"
              class="p-4 justify-start gap-3 h-auto hover:shadow-md transition-shadow"
              outlined
              @click="navigateTo('/sales/orders')"
            />
            <Button
              label="添加客户"
              icon="pi pi-user-plus"
              class="p-4 justify-start gap-3 h-auto hover:shadow-md transition-shadow"
              outlined
              @click="navigateTo('/master-data/customers')"
            />
            <Button
              label="库存管理"
              icon="pi pi-box"
              class="p-4 justify-start gap-3 h-auto hover:shadow-md transition-shadow"
              outlined
              @click="navigateTo('/warehouse/inventory')"
            />
            <Button
              label="财务报表"
              icon="pi pi-chart-bar"
              class="p-4 justify-start gap-3 h-auto hover:shadow-md transition-shadow"
              outlined
              @click="navigateTo('/reports/sales')"
            />
            <Button
              label="生产计划"
              icon="pi pi-calendar"
              class="p-4 justify-start gap-3 h-auto hover:shadow-md transition-shadow"
              outlined
              @click="navigateTo('/production/plans')"
            />
            <Button
              label="系统设置"
              icon="pi pi-cog"
              class="p-4 justify-start gap-3 h-auto hover:shadow-md transition-shadow"
              outlined
              @click="navigateTo('/system/config')"
            />
          </div>
        </template>
      </Card>

      <!-- 最新活动 -->
      <Card>
        <template #header>
          <div class="p-4 pb-0">
            <h3 class="text-lg font-semibold text-color mb-1">最新活动</h3>
            <p class="text-sm text-muted-color">系统动态</p>
          </div>
        </template>
        <template #content>
          <div class="p-4">
            <Timeline 
              :value="recentActivities" 
              layout="vertical" 
              class="text-sm"
            >
              <template #content="slotProps">
                <div class="mb-3">
                  <div class="font-medium text-color">{{ slotProps.item.title }}</div>
                  <div class="text-muted-color">{{ slotProps.item.description }}</div>
                  <div class="text-xs text-muted-color mt-1">{{ formatTime(slotProps.item.time) }}</div>
                </div>
              </template>
            </Timeline>
          </div>
        </template>
      </Card>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 销售趋势 -->
      <Card>
        <template #header>
          <div class="p-4 pb-0">
            <h3 class="text-lg font-semibold text-color mb-1">销售趋势</h3>
            <p class="text-sm text-muted-color">过去30天的销售数据</p>
          </div>
        </template>
        <template #content>
          <div class="p-4">
            <Chart 
              type="line" 
              :data="salesChartData" 
              :options="chartOptions"
              class="h-80"
            />
          </div>
        </template>
      </Card>

      <!-- 产品分布 -->
      <Card>
        <template #header>
          <div class="p-4 pb-0">
            <h3 class="text-lg font-semibold text-color mb-1">产品分布</h3>
            <p class="text-sm text-muted-color">各类产品销售占比</p>
          </div>
        </template>
        <template #content>
          <div class="p-4">
            <Chart 
              type="doughnut" 
              :data="productChartData" 
              :options="doughnutOptions"
              class="h-80"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import Timeline from 'primevue/timeline'
import Chart from 'primevue/chart'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '仪表盘 - ERP 管理系统'
})

// 最新活动数据
const recentActivities = ref([
  {
    title: '新订单创建',
    description: '客户张三创建了新的采购订单 #SO-2025-001',
    time: new Date(Date.now() - 1000 * 60 * 15) // 15分钟前
  },
  {
    title: '库存警告',
    description: '产品"钢材A型"库存低于安全库存',
    time: new Date(Date.now() - 1000 * 60 * 30) // 30分钟前
  },
  {
    title: '付款确认',
    description: '客户李四的订单 #SO-2025-002 已付款',
    time: new Date(Date.now() - 1000 * 60 * 60) // 1小时前
  },
  {
    title: '生产完成',
    description: '生产订单 #MO-2025-001 已完成',
    time: new Date(Date.now() - 1000 * 60 * 90) // 1.5小时前
  }
])

// 销售趋势数据
const salesChartData = ref({
  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  datasets: [
    {
      label: '销售额',
      data: [65000, 78000, 55000, 89000, 92000, 105000],
      fill: false,
      backgroundColor: 'rgb(59, 130, 246)',
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.4
    }
  ]
})

// 产品分布数据
const productChartData = ref({
  labels: ['钢材', '电子元件', '机械零件', '化工原料', '包装材料'],
  datasets: [
    {
      data: [30, 25, 20, 15, 10],
      backgroundColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(139, 92, 246)'
      ]
    }
  ]
})

// 图表配置
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
})

const doughnutOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
})

// 格式化时间
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}
</script>
