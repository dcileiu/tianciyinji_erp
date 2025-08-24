# UI 组件自动导入使用指南

本项目已配置UI组件自动导入，无需手动导入即可直接使用所有 shadcn-vue 组件。

## 🚀 自动导入配置

### Nuxt 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  components: [
    // 启用嵌套组件扫描
    {
      path: '~/components',
      pathPrefix: false,
    },
    // UI组件自动导入
    {
      path: '~/components/ui',
      extensions: ['.vue'],
      prefix: 'Ui',
      pathPrefix: false,
      global: true,
    },
  ],

  // 自动导入composables, utils, types
  imports: {
    dirs: ['composables/**', 'utils/**', 'types/**'],
  },
})
```

## 📝 使用方式

### 1. 基础组件使用

```vue
<template>
  <div class="space-y-4">
    <!-- 按钮组件 -->
    <Button variant="default" size="md"> 点击我 </Button>

    <!-- 输入框组件 -->
    <Input v-model="inputValue" placeholder="请输入内容..." type="text" />

    <!-- 文本域组件 -->
    <Textarea v-model="textareaValue" placeholder="请输入描述..." rows="4" />

    <!-- 复选框组件 -->
    <div class="flex items-center space-x-2">
      <Checkbox id="terms" v-model:checked="accepted" />
      <Label for="terms">同意服务条款</Label>
    </div>
  </div>
</template>

<script setup lang="ts">
// 无需导入任何组件，直接使用
const inputValue = ref('')
const textareaValue = ref('')
const accepted = ref(false)
</script>
```

### 2. 表单组件使用

```vue
<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle>用户注册</CardTitle>
      <CardDescription>填写信息创建新账户</CardDescription>
    </CardHeader>

    <CardContent>
      <form @submit="onSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">邮箱地址</Label>
          <Input id="email" v-model="email" type="email" placeholder="your@email.com" required />
        </div>

        <div class="space-y-2">
          <Label for="password">密码</Label>
          <Input id="password" v-model="password" type="password" placeholder="••••••••" required />
        </div>

        <div class="flex items-center space-x-2">
          <Switch id="marketing" v-model:checked="marketingEmails" />
          <Label for="marketing">接收营销邮件</Label>
        </div>

        <Button type="submit" class="w-full"> 创建账户 </Button>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const marketingEmails = ref(false)

const onSubmit = (event: Event) => {
  event.preventDefault()
  // 处理表单提交
  console.log('Form submitted:', { email: email.value, password: password.value })
}
</script>
```

### 3. 对话框和反馈组件

```vue
<template>
  <div class="space-y-4">
    <!-- 警告框 -->
    <Alert>
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>提示</AlertTitle>
      <AlertDescription> 这是一个重要的系统通知。 </AlertDescription>
    </Alert>

    <!-- 对话框触发器 -->
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">打开对话框</Button>
      </DialogTrigger>

      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑用户信息</DialogTitle>
          <DialogDescription> 在这里修改用户的基本信息。 </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">姓名</Label>
            <Input id="name" value="张三" class="col-span-3" />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit">保存更改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 进度条 -->
    <div class="space-y-2">
      <Label>上传进度</Label>
      <Progress :value="progress" class="w-full" />
    </div>

    <!-- 骨架屏 -->
    <div class="space-y-2">
      <Skeleton class="h-4 w-[250px]" />
      <Skeleton class="h-4 w-[200px]" />
      <Skeleton class="h-4 w-[150px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

const progress = ref(65)
</script>
```

### 4. 数据表格组件

```vue
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">用户列表</h2>
      <Button>
        <Plus class="mr-2 h-4 w-4" />
        添加用户
      </Button>
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>状态</TableHead>
            <TableHead class="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell class="font-medium">
              <div class="flex items-center space-x-2">
                <Avatar class="h-8 w-8">
                  <AvatarImage :src="user.avatar" :alt="user.name" />
                  <AvatarFallback>{{ user.name.charAt(0) }}</AvatarFallback>
                </Avatar>
                <span>{{ user.name }}</span>
              </div>
            </TableCell>

            <TableCell>{{ user.email }}</TableCell>

            <TableCell>
              <Badge :variant="user.status === 'active' ? 'default' : 'secondary'">
                {{ user.status === 'active' ? '活跃' : '非活跃' }}
              </Badge>
            </TableCell>

            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" class="h-8 w-8 p-0">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>操作</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>编辑</DropdownMenuItem>
                  <DropdownMenuItem>查看详情</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-red-600">删除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Plus, MoreHorizontal } from 'lucide-vue-next'

const users = ref([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    status: 'active',
    avatar: 'https://github.com/shadcn.png',
  },
  // ... 更多用户数据
])
</script>
```

## 🎨 格式化规范

项目已配置统一的代码格式化规范：

### Prettier 配置

- **缩进**: 2个空格
- **行长度**: 120字符
- **引号**: 单引号
- **分号**: 不使用分号
- **尾随逗号**: ES5 标准

### 使用命令

```bash
# 格式化所有文件
pnpm format

# 检查格式化
pnpm format:check

# 格式化并修复 ESLint 错误
pnpm format:lint

# 运行所有检查
pnpm check-all
```

### VS Code 配置

项目已配置 `.vscode/settings.json`：

- 保存时自动格式化
- ESLint 自动修复
- 统一编辑器设置

## 📋 可用组件列表

### 基础组件

- `Button` - 按钮
- `Input` - 输入框
- `Label` - 标签
- `Textarea` - 文本域
- `Checkbox` - 复选框
- `Switch` - 开关
- `RadioGroup`, `RadioGroupItem` - 单选框组
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` - 选择器

### 布局组件

- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter` - 卡片
- `Separator` - 分割线
- `AspectRatio` - 纵横比容器
- `ScrollArea` - 滚动区域

### 反馈组件

- `Alert`, `AlertDescription`, `AlertTitle` - 警告框
- `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent` - 确认对话框
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` - 对话框
- `Drawer` - 抽屉
- `Sheet` - 侧边表单
- `Skeleton` - 骨架屏
- `Progress` - 进度条
- `Badge` - 徽章

### 导航组件

- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` - 标签页
- `Breadcrumb` - 面包屑
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem` - 下拉菜单
- `Pagination` - 分页

### 数据显示

- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` - 表格
- `Avatar`, `AvatarFallback`, `AvatarImage` - 头像
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` - 工具提示

### 表单组件

- `Form`, `FormControl`, `FormDescription`, `FormField`, `FormItem` - 表单
- `AutoForm` - 自动表单
- `Calendar` - 日历
- `Slider` - 滑块

### 图表组件

- `ChartCrosshair`, `ChartLegend`, `ChartTooltip` - 图表基础组件
- `AreaChart`, `BarChart`, `DonutChart`, `LineChart` - 各类图表

## 💡 最佳实践

1. **组件命名**: 直接使用组件名，无需前缀
2. **样式类**: 使用 Tailwind CSS 类名
3. **响应式**: 利用 Tailwind 的响应式前缀
4. **类型安全**: 充分利用 TypeScript 类型提示
5. **组合使用**: 多个组件组合使用创建复杂UI

## 🔧 自定义组件

如需创建自定义组件，请遵循以下结构：

```vue
<template>
  <!-- 组件模板 -->
</template>

<script setup lang="ts">
// 使用 Composition API
// 无需导入UI组件，直接使用
</script>
```

---

_最后更新: 2025-01-20_
