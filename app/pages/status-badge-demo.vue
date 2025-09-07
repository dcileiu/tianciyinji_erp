<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold">菜单管理状态徽章演示</h1>
      <p class="text-muted-foreground">
        演示StatusBadge组件在菜单管理页面中的应用效果
      </p>
    </div>

    <!-- 菜单状态示例 -->
    <Card>
      <CardHeader>
        <CardTitle>菜单状态显示</CardTitle>
        <CardDescription>
          模拟菜单管理页面中的状态列显示效果
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border rounded-lg p-4">
              <h4 class="font-medium mb-3">启用状态菜单</h4>
              <div class="space-y-2">
                <div class="flex items-center justify-between p-2 border rounded">
                  <span>系统管理</span>
                  <StatusBadge status="done" customLabel="启用" size="sm" />
                </div>
                <div class="flex items-center justify-between p-2 border rounded">
                  <span>用户管理</span>
                  <StatusBadge status="done" customLabel="启用" size="sm" />
                </div>
                <div class="flex items-center justify-between p-2 border rounded">
                  <span>角色管理</span>
                  <StatusBadge status="done" customLabel="启用" size="sm" />
                </div>
              </div>
            </div>

            <div class="border rounded-lg p-4">
              <h4 class="font-medium mb-3">禁用状态菜单</h4>
              <div class="space-y-2">
                <div class="flex items-center justify-between p-2 border rounded">
                  <span>测试菜单1</span>
                  <StatusBadge status="paused" customLabel="禁用" size="sm" />
                </div>
                <div class="flex items-center justify-between p-2 border rounded">
                  <span>测试菜单2</span>
                  <StatusBadge status="paused" customLabel="禁用" size="sm" />
                </div>
                <div class="flex items-center justify-between p-2 border rounded">
                  <span>临时菜单</span>
                  <StatusBadge status="paused" customLabel="禁用" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 状态对比 -->
    <Card>
      <CardHeader>
        <CardTitle>新旧状态对比</CardTitle>
        <CardDescription>
          对比原有Badge组件和新的StatusBadge组件的效果
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-6">
          <div>
            <h4 class="font-medium mb-3">原有Badge样式</h4>
            <div class="flex gap-4">
              <Badge class="bg-green-600 hover:bg-green-700 text-white text-xs">启用</Badge>
              <Badge variant="destructive" class="bg-red-500 hover:bg-red-600 text-white text-xs">禁用</Badge>
            </div>
          </div>
          
          <div>
            <h4 class="font-medium mb-3">新StatusBadge样式</h4>
            <div class="flex gap-4">
              <StatusBadge status="done" customLabel="启用" size="sm" />
              <StatusBadge status="paused" customLabel="禁用" size="sm" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 模拟菜单表格 -->
    <Card>
      <CardHeader>
        <CardTitle>菜单表格模拟</CardTitle>
        <CardDescription>
          模拟完整的菜单管理表格，展示StatusBadge的实际应用效果
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="border rounded-lg overflow-hidden">
          <!-- 表头 -->
          <div class="grid grid-cols-6 gap-4 bg-muted p-3 border-b font-medium text-sm">
            <div>菜单名称</div>
            <div class="text-center">类型</div>
            <div>路径</div>
            <div class="text-center">图标</div>
            <div class="text-center">状态</div>
            <div class="text-center">操作</div>
          </div>
          
          <!-- 表体 -->
          <div class="divide-y">
            <div class="grid grid-cols-6 gap-4 p-3 items-center hover:bg-muted/50">
              <div class="font-medium">系统管理</div>
              <div class="text-center">
                <Badge variant="secondary" class="text-xs">目录</Badge>
              </div>
              <div><code class="text-xs bg-muted px-2 py-1 rounded">/system</code></div>
              <div class="text-center">Settings</div>
              <div class="text-center">
                <StatusBadge status="done" customLabel="启用" size="sm" />
              </div>
              <div class="text-center">
                <Button variant="ghost" size="sm">编辑</Button>
              </div>
            </div>
            
            <div class="grid grid-cols-6 gap-4 p-3 items-center hover:bg-muted/50">
              <div class="pl-4 font-medium">用户管理</div>
              <div class="text-center">
                <Badge class="text-xs">菜单</Badge>
              </div>
              <div><code class="text-xs bg-muted px-2 py-1 rounded">/system/users</code></div>
              <div class="text-center">Users</div>
              <div class="text-center">
                <StatusBadge status="done" customLabel="启用" size="sm" />
              </div>
              <div class="text-center">
                <Button variant="ghost" size="sm">编辑</Button>
              </div>
            </div>
            
            <div class="grid grid-cols-6 gap-4 p-3 items-center hover:bg-muted/50">
              <div class="pl-4 font-medium">角色管理</div>
              <div class="text-center">
                <Badge class="text-xs">菜单</Badge>
              </div>
              <div><code class="text-xs bg-muted px-2 py-1 rounded">/system/roles</code></div>
              <div class="text-center">Shield</div>
              <div class="text-center">
                <StatusBadge status="paused" customLabel="禁用" size="sm" />
              </div>
              <div class="text-center">
                <Button variant="ghost" size="sm">编辑</Button>
              </div>
            </div>
            
            <div class="grid grid-cols-6 gap-4 p-3 items-center hover:bg-muted/50">
              <div class="font-medium">测试菜单</div>
              <div class="text-center">
                <Badge variant="outline" class="text-xs">权限</Badge>
              </div>
              <div><span class="text-muted-foreground">-</span></div>
              <div class="text-center">-</div>
              <div class="text-center">
                <StatusBadge status="paused" customLabel="禁用" size="sm" />
              </div>
              <div class="text-center">
                <Button variant="ghost" size="sm">编辑</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 使用说明 -->
    <Card>
      <CardHeader>
        <CardTitle>菜单状态映射说明</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-medium mb-2">状态映射关系</h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between p-2 border rounded">
                  <span><code>active</code> (启用)</span>
                  <StatusBadge status="done" customLabel="启用" size="sm" />
                </div>
                <div class="flex items-center justify-between p-2 border rounded">
                  <span><code>inactive</code> (禁用)</span>
                  <StatusBadge status="paused" customLabel="禁用" size="sm" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium mb-2">组件特性</h4>
              <ul class="text-sm space-y-1 text-muted-foreground">
                <li>• 透明背景，浅色边框</li>
                <li>• 图标与状态对应</li>
                <li>• 支持点击切换状态</li>
                <li>• 统一的视觉风格</li>
                <li>• 响应式设计</li>
              </ul>
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
  title: '菜单管理状态徽章演示',
});
</script> 