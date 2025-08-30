<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- 欢迎标题 -->
    <div class="text-center">
      <div
        class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
      >
        <span class="text-white font-bold text-2xl">E</span>
      </div>
      <h1 class="text-3xl font-bold text-foreground mb-2">
        欢迎使用 ERP 管理系统！
      </h1>
      <p class="text-xl text-muted-foreground">
        让我们带您快速了解系统功能和使用方法
      </p>
    </div>

    <!-- 当前状态 -->
    <Card>
      <CardHeader>
        <CardTitle class="text-xl font-semibold flex items-center">
          <CheckCircle class="text-green-600 mr-2 h-5 w-5" />
          系统当前状态
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div class="flex items-center">
              <Check class="text-green-600 mr-2 h-4 w-4" />
              <span class="font-medium">认证系统</span>
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              用户登录、注册、密码重置等功能已完成
            </p>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div class="flex items-center">
              <Check class="text-green-600 mr-2 h-4 w-4" />
              <span class="font-medium">数据库结构</span>
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              完整的业务数据表结构已设计
            </p>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div class="flex items-center">
              <Clock class="text-blue-600 mr-2 h-4 w-4" />
              <span class="font-medium">业务模块</span>
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              产品管理等核心功能正在完善中
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 功能模块介绍 -->
    <Card>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">主要功能模块</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 基础数据 -->
          <div class="border border-border rounded-lg p-4">
            <div class="flex items-center mb-3">
              <div
                class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3"
              >
                <Database class="text-blue-600 h-5 w-5" />
              </div>
              <h3 class="font-semibold">基础数据</h3>
            </div>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• 产品信息管理</li>
              <li>• 客户供应商管理</li>
              <li>• 仓库信息管理</li>
              <li>• 员工部门管理</li>
            </ul>
          </div>

          <!-- 销售管理 -->
          <div class="border border-border rounded-lg p-4">
            <div class="flex items-center mb-3">
              <div
                class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3"
              >
                <ShoppingCart class="text-green-600 h-5 w-5" />
              </div>
              <h3 class="font-semibold">销售管理</h3>
            </div>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• 销售订单管理</li>
              <li>• 客户关系管理</li>
              <li>• 发货单管理</li>
              <li>• 销售报表分析</li>
            </ul>
          </div>

          <!-- 采购管理 -->
          <div class="border border-border rounded-lg p-4">
            <div class="flex items-center mb-3">
              <div
                class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3"
              >
                <ShoppingBag class="text-purple-600 h-5 w-5" />
              </div>
              <h3 class="font-semibold">采购管理</h3>
            </div>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• 采购订单管理</li>
              <li>• 供应商管理</li>
              <li>• 到货验收</li>
              <li>• 采购成本分析</li>
            </ul>
          </div>

          <!-- 库存管理 -->
          <div class="border border-border rounded-lg p-4">
            <div class="flex items-center mb-3">
              <div
                class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3"
              >
                <Package class="text-yellow-600 h-5 w-5" />
              </div>
              <h3 class="font-semibold">库存管理</h3>
            </div>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• 入库出库管理</li>
              <li>• 库存盘点</li>
              <li>• 库存预警</li>
              <li>• 库存报表</li>
            </ul>
          </div>

          <!-- 生产管理 -->
          <div class="border border-border rounded-lg p-4">
            <div class="flex items-center mb-3">
              <div
                class="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3"
              >
                <Settings class="text-red-600 h-5 w-5" />
              </div>
              <h3 class="font-semibold">生产管理</h3>
            </div>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• 生产计划</li>
              <li>• 工单管理</li>
              <li>• BOM 物料清单</li>
              <li>• 生产报表</li>
            </ul>
          </div>

          <!-- 财务管理 -->
          <div class="border border-border rounded-lg p-4">
            <div class="flex items-center mb-3">
              <div
                class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3"
              >
                <TrendingUp class="text-indigo-600 h-5 w-5" />
              </div>
              <h3 class="font-semibold">财务管理</h3>
            </div>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>• 应收应付管理</li>
              <li>• 成本核算</li>
              <li>• 财务报表</li>
              <li>• 资金流向分析</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 快速开始 -->
    <Card>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">快速开始</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold mb-3 flex items-center">
                <Info class="text-blue-600 mr-2 h-4 w-4" />
                第一步：了解系统架构
              </h3>
              <p class="text-sm text-muted-foreground mb-3">
                本系统基于现代 Web 技术栈构建：
              </p>
              <ul class="text-sm text-muted-foreground space-y-1">
                <li>• 前端：Nuxt.js 4 + Vue 3</li>
                <li>• UI组件：shadcn/ui + Tailwind CSS</li>
                <li>• 后端：Supabase (PostgreSQL)</li>
                <li>• 认证：Supabase Auth</li>
                <li>• 部署：支持多种部署方式</li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold mb-3 flex items-center">
                <Settings class="text-green-600 mr-2 h-4 w-4" />
                第二步：配置基础数据
              </h3>
              <p class="text-sm text-muted-foreground mb-3">
                建议按以下顺序配置系统：
              </p>
              <ul class="text-sm text-muted-foreground space-y-1">
                <li>• 数据库初始化</li>
                <li>• 组织架构设置</li>
                <li>• 基础数据录入</li>
                <li>• 权限角色配置</li>
                <li>• 业务流程测试</li>
              </ul>
            </div>
          </div>

          <div
            class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
          >
            <h4
              class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center"
            >
              <AlertTriangle class="mr-2 h-4 w-4" />
              重要提示
            </h4>
            <p class="text-sm text-yellow-700 dark:text-yellow-300">
              这是一个演示系统，数据仅用于功能展示。在生产环境中使用前，请确保：
            </p>
            <ul
              class="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1"
            >
              <li>• 正确配置生产环境的数据库</li>
              <li>• 设置合适的备份策略</li>
              <li>• 配置生产环境的认证设置</li>
              <li>• 进行充分的功能测试</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 技术信息 -->
    <Card>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">技术信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold mb-3 flex items-center">
              <Code class="text-purple-600 mr-2 h-4 w-4" />
              开发框架
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Nuxt.js</span>
                <span class="font-mono">v4.x</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Vue.js</span>
                <span class="font-mono">v3.x</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">shadcn/ui</span>
                <span class="font-mono">latest</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Tailwind CSS</span>
                <span class="font-mono">v3.x</span>
              </div>
            </div>
          </div>
          <div>
            <h3 class="font-semibold mb-3 flex items-center">
              <Info class="text-blue-600 mr-2 h-4 w-4" />
              运行环境
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Node.js</span>
                <span class="font-mono">≥ 18.x</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">包管理器</span>
                <span class="font-mono">pnpm</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">数据库</span>
                <span class="font-mono">PostgreSQL</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">环境</span>
                <span class="font-mono">开发模式</span>
              </div>
            </div>
            <p class="text-xs text-muted-foreground mt-3">
              开发环境下可以在浏览器控制台查看认证状态和调试信息
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 行动按钮 -->
    <div class="text-center space-y-4">
      <h2 class="text-xl font-semibold">准备好开始了吗？</h2>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button @click="navigateTo('/db-init')">
          <Database class="mr-2 h-4 w-4" />
          初始化数据库
        </Button>
        <Button @click="navigateTo('/dashboard')" variant="outline">
          <LayoutDashboard class="mr-2 h-4 w-4" />
          进入仪表盘
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Code,
  Database,
  Info,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
} from 'lucide-vue-next';

// 页面配置
definePageMeta({
  layout: 'default',
});

useHead({
  title: '快速入门 - ERP 管理系统',
});
</script>
