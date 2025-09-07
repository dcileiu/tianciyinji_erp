<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold">更新后的状态徽章测试</h1>
      <p class="text-muted-foreground">
        测试统一样式的StatusBadge组件，浅灰色边框，只有图标有颜色
      </p>
    </div>

    <!-- 项目常用状态 -->
    <Card>
      <CardHeader>
        <CardTitle>项目常用状态</CardTitle>
        <CardDescription>
          适配项目实际使用的状态类型
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <h4 class="text-sm font-medium">启用/禁用</h4>
            <div class="space-y-2">
              <StatusBadge status="active" />
              <StatusBadge status="inactive" />
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="text-sm font-medium">结果状态</h4>
            <div class="space-y-2">
              <StatusBadge status="success" />
              <StatusBadge status="error" />
              <StatusBadge status="warning" />
              <StatusBadge status="pending" />
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="text-sm font-medium">处理状态</h4>
            <div class="space-y-2">
              <StatusBadge status="in-process" />
              <StatusBadge status="loading" />
              <StatusBadge status="running" />
              <StatusBadge status="paused" />
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="text-sm font-medium">完成状态</h4>
            <div class="space-y-2">
              <StatusBadge status="done" />
              <StatusBadge status="failed" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 图标对比 -->
    <Card>
      <CardHeader>
        <CardTitle>图标更新对比</CardTitle>
        <CardDescription>
          显示使用的新图标，特别是禁用状态使用Ban图标，错误状态使用CircleX图标
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="p-4 border rounded-lg">
              <h4 class="font-medium mb-2">禁用状态</h4>
              <div class="space-y-2">
                <StatusBadge status="inactive" customLabel="禁用 (Ban)" />
              </div>
            </div>
            
            <div class="p-4 border rounded-lg">
              <h4 class="font-medium mb-2">错误状态</h4>
              <div class="space-y-2">
                <StatusBadge status="error" customLabel="错误 (CircleX)" />
                <StatusBadge status="failed" customLabel="失败 (CircleX)" />
              </div>
            </div>
            
            <div class="p-4 border rounded-lg">
              <h4 class="font-medium mb-2">成功状态</h4>
              <div class="space-y-2">
                <StatusBadge status="success" customLabel="成功 (CheckCircle)" />
                <StatusBadge status="active" customLabel="启用 (CheckCircle)" />
                <StatusBadge status="done" customLabel="完成 (CheckCircle)" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 固定小尺寸 -->
    <Card>
      <CardHeader>
        <CardTitle>统一小尺寸设计</CardTitle>
        <CardDescription>
          固定小尺寸，统一的浅灰色边框，rounded-md圆角，py-2上下内边距
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <StatusBadge status="active" />
          <StatusBadge status="inactive" />
          <StatusBadge status="error" />
          <StatusBadge status="warning" />
          <StatusBadge status="loading" />
          <StatusBadge status="success" />
          <StatusBadge status="pending" />
        </div>
      </CardContent>
    </Card>

    <!-- 菜单管理实际应用 -->
    <Card>
      <CardHeader>
        <CardTitle>菜单管理中的应用</CardTitle>
        <CardDescription>
          模拟菜单管理页面中状态列的实际效果
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="border rounded-lg overflow-hidden">
          <div class="grid grid-cols-4 gap-4 bg-muted p-3 border-b font-medium text-sm">
            <div>菜单名称</div>
            <div class="text-center">类型</div>
            <div class="text-center">状态</div>
            <div class="text-center">操作</div>
          </div>
          
          <div class="divide-y">
            <div class="grid grid-cols-4 gap-4 p-3 items-center hover:bg-muted/50">
              <div class="font-medium">系统管理</div>
              <div class="text-center"><Badge variant="secondary" class="text-xs">目录</Badge></div>
              <div class="text-center">
                <div class="cursor-pointer inline-block">
                  <StatusBadge status="active" customLabel="启用" size="sm" />
                </div>
              </div>
              <div class="text-center"><Button variant="ghost" size="sm">编辑</Button></div>
            </div>
            
            <div class="grid grid-cols-4 gap-4 p-3 items-center hover:bg-muted/50">
              <div class="font-medium">用户管理</div>
              <div class="text-center"><Badge class="text-xs">菜单</Badge></div>
              <div class="text-center">
                <div class="cursor-pointer inline-block">
                  <StatusBadge status="active" customLabel="启用" size="sm" />
                </div>
              </div>
              <div class="text-center"><Button variant="ghost" size="sm">编辑</Button></div>
            </div>
            
            <div class="grid grid-cols-4 gap-4 p-3 items-center hover:bg-muted/50">
              <div class="font-medium">测试菜单</div>
              <div class="text-center"><Badge variant="outline" class="text-xs">权限</Badge></div>
                             <div class="text-center">
                 <div class="cursor-pointer inline-block">
                   <StatusBadge status="inactive" customLabel="禁用" />
                 </div>
               </div>
              <div class="text-center"><Button variant="ghost" size="sm">编辑</Button></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 样式特性说明 -->
    <Card>
      <CardHeader>
        <CardTitle>样式更新说明</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium mb-3">样式特性</h4>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-gray-200 rounded-full"></div>
                统一的浅灰色边框 (border-gray-200)
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-transparent border border-gray-200 rounded-sm"></div>
                透明背景 (bg-transparent)
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-foreground rounded-sm"></div>
                统一文本颜色 (text-foreground)
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                图标保持状态颜色
              </li>
              <li class="flex items-center gap-2">
                <div class="w-2 h-2 border border-gray-300 rounded-sm"></div>
                中等圆角 (rounded-md)
              </li>
            </ul>
          </div>
          
          <div>
            <h4 class="font-medium mb-3">图标映射</h4>
            <div class="space-y-2 text-sm">
                             <div class="flex items-center gap-3">
                 <StatusBadge status="active" :showLabel="false" />
                 <span><code>active</code> → CheckCircle (绿色)</span>
               </div>
               <div class="flex items-center gap-3">
                 <StatusBadge status="inactive" :showLabel="false" />
                 <span><code>inactive</code> → Ban (红色)</span>
               </div>
               <div class="flex items-center gap-3">
                 <StatusBadge status="error" :showLabel="false" />
                 <span><code>error</code> → CircleX (红色)</span>
               </div>
               <div class="flex items-center gap-3">
                 <StatusBadge status="warning" :showLabel="false" />
                 <span><code>warning</code> → AlertCircle (黄色)</span>
               </div>
               <div class="flex items-center gap-3">
                 <StatusBadge status="loading" :showLabel="false" />
                 <span><code>loading</code> → Loader2 (紫色，旋转)</span>
               </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

useHead({
  title: '状态徽章测试 - 更新版本',
});
</script> 