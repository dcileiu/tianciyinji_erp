<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">组件演示</h1>
      
      <!-- Alert 组件演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Alert 组件</h2>
        <div class="space-y-4">
          <Alert>
            <AlertTitle>提示</AlertTitle>
            <p>这是一个基础提示消息。</p>
          </Alert>
        </div>
      </div>

      <!-- Tabs 组件演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Tabs 组件</h2>
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger>订单管理</TabsTrigger>
            <TabsTrigger>库存管理</TabsTrigger>
            <TabsTrigger>报表分析</TabsTrigger>
          </TabsList>
          <TabsContent class="mt-4">
            <Card class="p-4">
              <h3 class="font-semibold mb-2">订单管理</h3>
              <p>管理所有订单信息、状态跟踪等功能。</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <!-- Switch 组件演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Switch 组件</h2>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <Switch v-model="notificationsEnabled" />
            <Label>启用通知</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Switch v-model="darkModeEnabled" size="sm" />
            <Label>深色模式</Label>
          </div>
        </div>
      </div>

      <!-- Progress 组件演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Progress 组件</h2>
        <div class="space-y-4 max-w-md">
          <div>
            <Label class="text-sm font-medium">上传进度</Label>
            <Progress :model-value="uploadProgress" class="mt-2" />
            <p class="text-sm text-gray-500 mt-1">{{ uploadProgress }}%</p>
          </div>
          <Button @click="simulateUpload" :disabled="isUploading">
            {{ isUploading ? '上传中...' : '开始上传' }}
          </Button>
        </div>
      </div>

      <!-- DropdownMenu 组件演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">DropdownMenu 组件</h2>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline">
              操作菜单
              <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="handleEdit">编辑</DropdownMenuItem>
            <DropdownMenuItem @click="handleDuplicate">复制</DropdownMenuItem>
            <DropdownMenuItem @click="handleDelete">删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Sheet 组件演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Sheet 组件</h2>
        <Button @click="showSheet = true">打开侧边栏</Button>
        <Sheet v-model="showSheet" side="right" size="lg">
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4">用户详情</h3>
            <div class="space-y-4">
              <div>
                <Label>姓名</Label>
                <Input placeholder="请输入姓名" />
              </div>
              <div>
                <Label>邮箱</Label>
                <Input type="email" placeholder="请输入邮箱" />
              </div>
                             <div>
                 <Label>角色</Label>
                 <select class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                   <option value="admin">管理员</option>
                   <option value="user">普通用户</option>
                   <option value="guest">访客</option>
                 </select>
               </div>
              <div class="flex justify-end space-x-2 pt-4">
                <Button variant="outline" @click="showSheet = false">取消</Button>
                <Button @click="showSheet = false">保存</Button>
              </div>
            </div>
          </div>
        </Sheet>
      </div>

      <!-- Toast 演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Toast 组件</h2>
        <div class="space-x-2">
          <Button @click="showToast('default')">默认提示</Button>
          <Button @click="showToast('success')" variant="outline">成功提示</Button>
          <Button @click="showToast('warning')" variant="outline">警告提示</Button>
          <Button @click="showToast('destructive')" variant="destructive">错误提示</Button>
        </div>
      </div>

      <!-- Avatar 头像组件演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Avatar 头像组件</h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <Avatar fallback="张三" />
            <Avatar fallback="John Doe" />
            <Avatar size="lg" fallback="管理员" />
            <Avatar variant="square" fallback="A" />
          </div>
        </div>
      </div>

      <!-- Skeleton 骨架屏组件演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Skeleton 骨架屏组件</h2>
        <div class="space-y-4">
          <div class="space-y-2">
            <Skeleton class="w-[250px] h-[20px]" />
            <Skeleton class="w-[200px] h-[16px]" />
            <Skeleton class="w-[180px] h-[16px]" />
          </div>
          <div class="flex items-center space-x-4">
            <Skeleton variant="circle" class="w-[40px] h-[40px]" />
            <div class="space-y-2">
              <Skeleton class="w-[120px] h-[16px]" />
              <Skeleton class="w-[80px] h-[14px]" />
            </div>
          </div>
        </div>
      </div>

      <!-- Tooltip 工具提示组件演示 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Tooltip 工具提示组件</h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <Tooltip content="这是一个顶部提示">
              <Button variant="outline">悬停显示提示</Button>
            </Tooltip>
            <Tooltip content="右侧提示" placement="right">
              <Button variant="outline">右侧提示</Button>
            </Tooltip>
            <Tooltip content="深色主题提示" variant="dark">
              <Button variant="outline">深色提示</Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Toast 容器 -->
      <div class="fixed top-4 right-4 space-y-2 z-50">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :variant="toast.variant"
          :show="toast.show"
          @close="removeToast(toast.id)"
        >
          <div class="p-4">
            <h4 class="font-semibold">{{ toast.title }}</h4>
            <p class="text-sm">{{ toast.message }}</p>
          </div>
        </Toast>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

// 导入组件
import { Alert, AlertTitle } from '~/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import Switch from '~/components/ui/Switch.vue'
import Progress from '~/components/ui/Progress.vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import Sheet from '~/components/ui/sheet/Sheet.vue'
import Toast from '~/components/ui/toast/Toast.vue'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Label from '~/components/ui/Label.vue'
import Input from '~/components/ui/Input.vue'
import Avatar from '~/components/ui/Avatar.vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import Tooltip from '~/components/ui/Tooltip.vue'

// 响应式数据
const activeTab = ref(0)
const notificationsEnabled = ref(false)
const darkModeEnabled = ref(false)
const uploadProgress = ref(0)
const isUploading = ref(false)
const showSheet = ref(false)
const toasts = ref<Array<{
  id: string
  title: string
  message: string
  variant: 'default' | 'success' | 'warning' | 'destructive'
  show: boolean
}>>([])

// 方法
const simulateUpload = () => {
  if (isUploading.value) return
  
  isUploading.value = true
  uploadProgress.value = 0
  
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      isUploading.value = false
      showToast('success')
    }
  }, 200)
}

const showToast = (variant: 'default' | 'success' | 'warning' | 'destructive') => {
  const toastConfig = {
    default: { title: '提示', message: '这是一个默认提示消息' },
    success: { title: '成功', message: '操作已成功完成' },
    warning: { title: '警告', message: '请注意检查输入内容' },
    destructive: { title: '错误', message: '操作失败，请重试' }
  }
  
  const toast = {
    id: Date.now().toString(),
    ...toastConfig[variant],
    variant,
    show: true
  }
  
  toasts.value.push(toast)
  
  // 3秒后自动移除
  setTimeout(() => {
    removeToast(toast.id)
  }, 3000)
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const handleEdit = () => {
  showToast('default')
}

const handleDuplicate = () => {
  showToast('success')
}

const handleDelete = () => {
  showToast('destructive')
}

// 页面元数据
definePageMeta({
  layout: 'default'
})
</script> 