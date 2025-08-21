<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- 欢迎标题 -->
    <div class="text-center">
      <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-4 flex items-center">
        <CheckCircle class="w-5 h-5 text-green-600 mr-2" />
        系统当前状态
      </h2>
      <div class="grid md:grid-cols-3 gap-4">
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div class="flex items-center">
            <Check class="w-5 h-5 text-green-600 mr-2" />
            <span class="font-medium">认证系统</span>
          </div>
          <p class="text-sm text-muted-foreground mt-1">
            用户登录、注册、密码重置等功能已完成
          </p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div class="flex items-center">
            <Check class="w-5 h-5 text-green-600 mr-2" />
            <span class="font-medium">数据库结构</span>
          </div>
          <p class="text-sm text-muted-foreground mt-1">
            完整的业务数据表结构已设计
          </p>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div class="flex items-center">
            <Clock class="w-5 h-5 text-blue-600 mr-2" />
            <span class="font-medium">业务模块</span>
          </div>
          <p class="text-sm text-muted-foreground mt-1">
            产品管理等核心功能正在完善中
          </p>
        </div>
      </div>
    </Card>

    <!-- 快速开始步骤 -->
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-6">🚀 快速开始</h2>
      <div class="space-y-6">
        
        <!-- 步骤1：配置环境 -->
        <div class="flex items-start space-x-4">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            1
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-lg mb-2">配置 Supabase 环境</h3>
            <p class="text-muted-foreground mb-3">
              如果您还没有配置 Supabase，请按照以下步骤操作：
            </p>
            <div class="bg-muted p-4 rounded-lg space-y-2">
              <p class="font-medium">1. 创建 Supabase 项目</p>
              <p class="text-sm">访问 <a href="https://supabase.com" target="_blank" class="text-blue-600 hover:underline">supabase.com</a> 创建免费项目</p>
              
              <p class="font-medium mt-3">2. 配置环境变量</p>
              <p class="text-sm">在项目根目录创建 <code class="bg-background px-1 rounded">.env</code> 文件：</p>
              <pre class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key</pre>
              
              <p class="font-medium mt-3">3. 运行数据库迁移</p>
              <p class="text-sm">在 Supabase Dashboard 的 SQL 编辑器中运行 <code class="bg-background px-1 rounded">supabase/migrations/</code> 目录下的 SQL 文件</p>
            </div>
          </div>
        </div>

        <!-- 步骤2：初始化数据 -->
        <div class="flex items-start space-x-4">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            2
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-lg mb-2">初始化系统数据</h3>
            <p class="text-muted-foreground mb-3">
              使用数据库初始化页面创建基础数据和管理员账户：
            </p>
            <NuxtLink 
              to="/db-init"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Database class="w-4 h-4 mr-2" />
              前往数据库初始化
            </NuxtLink>
          </div>
        </div>

        <!-- 步骤3：开始使用 -->
        <div class="flex items-start space-x-4">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            3
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-lg mb-2">开始使用系统</h3>
            <p class="text-muted-foreground mb-3">
              系统配置完成后，您可以开始使用各个业务模块：
            </p>
            <div class="grid md:grid-cols-2 gap-3">
              <NuxtLink 
                to="/master-data/products"
                class="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors"
              >
                <Package class="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p class="font-medium">产品管理</p>
                  <p class="text-sm text-muted-foreground">管理产品信息和库存</p>
                </div>
              </NuxtLink>
              <NuxtLink 
                to="/sales/customers"
                class="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors"
              >
                <Users class="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p class="font-medium">客户管理</p>
                  <p class="text-sm text-muted-foreground">维护客户关系</p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 系统功能概览 -->
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-6">📋 系统功能概览</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- 主数据管理 -->
        <div class="space-y-3">
          <div class="flex items-center">
            <Database class="w-5 h-5 text-blue-600 mr-2" />
            <h3 class="font-semibold">主数据管理</h3>
          </div>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li>• 产品信息管理</li>
            <li>• 客户档案管理</li>
            <li>• 供应商管理</li>
            <li>• 仓库设置</li>
          </ul>
        </div>

        <!-- 销售管理 -->
        <div class="space-y-3">
          <div class="flex items-center">
            <ShoppingCart class="w-5 h-5 text-green-600 mr-2" />
            <h3 class="font-semibold">销售管理</h3>
          </div>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li>• 销售订单管理</li>
            <li>• 发货管理</li>
            <li>• 开票管理</li>
            <li>• 销售报表</li>
          </ul>
        </div>

        <!-- 采购管理 -->
        <div class="space-y-3">
          <div class="flex items-center">
            <ShoppingBag class="w-5 h-5 text-purple-600 mr-2" />
            <h3 class="font-semibold">采购管理</h3>
          </div>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li>• 采购订单管理</li>
            <li>• 到货管理</li>
            <li>• 采购退货</li>
            <li>• 供应商评估</li>
          </ul>
        </div>

        <!-- 库存管理 -->
        <div class="space-y-3">
          <div class="flex items-center">
            <Package class="w-5 h-5 text-orange-600 mr-2" />
            <h3 class="font-semibold">库存管理</h3>
          </div>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li>• 入库管理</li>
            <li>• 出库管理</li>
            <li>• 库存盘点</li>
            <li>• 库存调拨</li>
          </ul>
        </div>

        <!-- 生产管理 -->
        <div class="space-y-3">
          <div class="flex items-center">
            <Factory class="w-5 h-5 text-red-600 mr-2" />
            <h3 class="font-semibold">生产管理</h3>
          </div>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li>• 生产计划</li>
            <li>• 生产订单</li>
            <li>• BOM 管理</li>
            <li>• 车间管理</li>
          </ul>
        </div>

        <!-- 用户管理 -->
        <div class="space-y-3">
          <div class="flex items-center">
            <Users class="w-5 h-5 text-indigo-600 mr-2" />
            <h3 class="font-semibold">用户管理</h3>
          </div>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li>• 用户账户管理</li>
            <li>• 角色权限设置</li>
            <li>• 部门管理</li>
            <li>• 系统日志</li>
          </ul>
        </div>
      </div>
    </Card>

    <!-- 认证功能说明 -->
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-4">🔐 认证系统特性</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold mb-3 text-green-600">✅ 已实现功能</h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center">
              <Check class="w-4 h-4 text-green-600 mr-2" />
              邮箱密码登录
            </li>
            <li class="flex items-center">
              <Check class="w-4 h-4 text-green-600 mr-2" />
              用户注册与邮箱验证
            </li>
            <li class="flex items-center">
              <Check class="w-4 h-4 text-green-600 mr-2" />
              密码重置功能
            </li>
            <li class="flex items-center">
              <Check class="w-4 h-4 text-green-600 mr-2" />
              会话管理与自动续期
            </li>
            <li class="flex items-center">
              <Check class="w-4 h-4 text-green-600 mr-2" />
              路由保护中间件
            </li>
            <li class="flex items-center">
              <Check class="w-4 h-4 text-green-600 mr-2" />
              响应式登录界面
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-3 text-blue-600">🔮 可扩展功能</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-center">
              <Clock class="w-4 h-4 mr-2" />
              社交登录 (Google, GitHub)
            </li>
            <li class="flex items-center">
              <Clock class="w-4 h-4 mr-2" />
              多因素认证 (MFA)
            </li>
            <li class="flex items-center">
              <Clock class="w-4 h-4 mr-2" />
              单点登录 (SSO)
            </li>
            <li class="flex items-center">
              <Clock class="w-4 h-4 mr-2" />
              角色权限系统
            </li>
            <li class="flex items-center">
              <Clock class="w-4 h-4 mr-2" />
              用户头像上传
            </li>
            <li class="flex items-center">
              <Clock class="w-4 h-4 mr-2" />
              登录日志记录
            </li>
          </ul>
        </div>
      </div>
    </Card>

    <!-- 开发信息 -->
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-4">🛠️ 技术架构</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold mb-3">前端技术栈</h3>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li>• <strong>Nuxt 3</strong> - Vue.js 全栈框架</li>
            <li>• <strong>TypeScript</strong> - 类型安全</li>
            <li>• <strong>Tailwind CSS</strong> - 样式框架</li>
            <li>• <strong>Lucide Icons</strong> - 图标库</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-3">后端服务</h3>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li>• <strong>Supabase</strong> - 后端即服务</li>
            <li>• <strong>PostgreSQL</strong> - 关系型数据库</li>
            <li>• <strong>Row Level Security</strong> - 数据安全</li>
            <li>• <strong>Real-time</strong> - 实时数据同步</li>
          </ul>
        </div>
      </div>
    </Card>

    <!-- 帮助和支持 -->
    <Card class="p-6">
      <h2 class="text-xl font-semibold mb-4">💡 帮助和支持</h2>
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <FileText class="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 class="font-medium">查看文档</h3>
            <p class="text-sm text-muted-foreground">
              详细的认证系统使用指南请查看 
              <code class="bg-muted px-1 rounded">docs/AUTH_GUIDE.md</code>
            </p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <Settings class="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 class="font-medium">系统配置</h3>
            <p class="text-sm text-muted-foreground">
              如需修改系统配置，请编辑 <code class="bg-muted px-1 rounded">nuxt.config.ts</code> 文件
            </p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <Code class="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h3 class="font-medium">开发调试</h3>
            <p class="text-sm text-muted-foreground">
              开发环境下可以在浏览器控制台查看认证状态和调试信息
            </p>
          </div>
        </div>
      </div>
    </Card>

    <!-- 行动按钮 -->
    <div class="text-center space-y-4">
      <h2 class="text-xl font-semibold">准备好开始了吗？</h2>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink 
          to="/db-init"
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Database class="w-5 h-5 mr-2" />
          配置数据库
        </NuxtLink>
        <NuxtLink 
          to="/dashboard"
          class="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-muted transition-colors"
        >
          <BarChart3 class="w-5 h-5 mr-2" />
          查看仪表板
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  CheckCircle, Check, Clock, Database, Package, Users, ShoppingCart, 
  ShoppingBag, Factory, FileText, Settings, Code, BarChart3 
} from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'

// 页面配置
definePageMeta({
  middleware: 'auth'
})

useHead({
  title: '快速入门 - ERP 管理系统'
})
</script> 