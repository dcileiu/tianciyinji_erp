<template>
  <div class="space-y-6">
    <!-- 页面标题和操作 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">用户管理</h1>
        <p class="text-muted-foreground">
          管理系统用户账户，分配角色权限和访问控制
        </p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="importUsers">
          <Upload class="mr-2 h-4 w-4" />
          批量导入
        </Button>
        <Button variant="outline" size="sm" @click="exportUsers">
          <Download class="mr-2 h-4 w-4" />
          导出用户
        </Button>
        <Button size="sm" @click="openUserModal">
          <Plus class="mr-2 h-4 w-4" />
          新增用户
        </Button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="w-full">
      <div class="flex items-center py-4">
        <Input
          class="max-w-sm"
          placeholder="搜索用户名、姓名、邮箱..."
          :model-value="table.getColumn('email')?.getFilterValue() as string"
          @update:model-value="table.getColumn('email')?.setFilterValue($event)"
        />
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="ml-auto">
              显示列 <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
              :key="column.id"
              class="capitalize"
              :model-value="column.getIsVisible()"
              @update:model-value="(value) => {
                column.toggleVisibility(!!value)
              }"
            >
              {{ getColumnDisplayName(column.id) }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <TableHead v-for="header in headerGroup.headers" :key="header.id">
                <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="table.getRowModel().rows?.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :data-state="row.getIsSelected() && 'selected'"
              >
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
            </template>

            <TableRow v-else>
              <TableCell
                :colspan="columns.length"
                class="h-24 text-center"
              >
                <div v-if="loading" class="flex items-center justify-center">
                  <Loader2 class="h-6 w-6 animate-spin mr-2" />
                  加载中...
                </div>
                <div v-else>
                  <Users class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 class="text-xl font-semibold mb-4">暂无用户数据</h3>
                  <p class="text-muted-foreground mb-6 max-w-md mx-auto">
                    没有找到符合条件的用户记录。请检查筛选条件或添加新用户。
                  </p>
                  <Button @click="openUserModal">
                    <Plus class="mr-2 h-4 w-4" />
                    添加用户
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div class="flex items-center justify-end space-x-2 py-4">
        <div class="flex-1 text-sm text-muted-foreground">
          {{ table.getFilteredSelectedRowModel().rows.length }} of
          {{ table.getFilteredRowModel().rows.length }} row(s) selected.
        </div>
        <div class="space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
          >
            Next
          </Button>
        </div>
      </div>
    </div>

    <!-- 用户详情/编辑对话框 -->
    <Dialog v-model:open="showUserModal">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Users class="h-5 w-5" />
            {{ modalTitle }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? "编辑用户信息和权限设置" : "创建新的系统用户账户" }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>用户名 *</Label>
              <Input
                v-model="currentUser.username"
                placeholder="请输入用户名"
                :disabled="isEditing"
              />
            </div>
            <div class="space-y-2">
              <Label>姓名 *</Label>
              <Input v-model="currentUser.name" placeholder="请输入姓名" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>邮箱 *</Label>
              <Input
                v-model="currentUser.email"
                type="email"
                placeholder="请输入邮箱地址"
              />
            </div>
            <div class="space-y-2">
              <Label>手机号</Label>
              <Input v-model="currentUser.phone" placeholder="请输入手机号" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>所属部门</Label>
              <Select v-model="currentUser.department_id">
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>用户角色 *</Label>
              <Select v-model="currentUserRoleId">
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>密码 *</Label>
              <Input
                v-model="currentUser.password"
                type="password"
                placeholder="请输入密码"
              />
            </div>
            <div class="space-y-2">
              <Label>确认密码 *</Label>
              <Input
                v-model="currentUser.confirmPassword"
                type="password"
                placeholder="请确认密码"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>备注</Label>
            <Textarea
              v-model="currentUser.remarks"
              placeholder="请输入备注信息..."
              :rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeUserModal">取消</Button>
          <Button :disabled="saving" @click="saveUser">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditing ? "更新用户" : "创建用户" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { valueUpdater } from '@/utils'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Power,
  Upload,
  Users
} from 'lucide-vue-next'
import { h, ref } from 'vue'
import { toast } from 'vue-sonner'
import type { RoleData } from '~/composables/useRoles'
import type { UserData, UserForm } from '~/composables/useUsers'

// 导入所需的UI组件
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '用户管理 - 智能ERP管理系统',
})

// Composables
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword: resetUserPassword,
  toggleUserStatus,
  getDepartments
} = useUsers()

const { roles: rolesData, fetchRoles } = useRoles()

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showUserModal = ref(false)
const isEditing = ref(false)

// 数据
const users = ref<UserData[]>([])
const roles = ref<RoleData[]>([])
const departments = ref<any[]>([])

// 表单数据
const currentUser = reactive({
  id: '',
  username: '',
  name: '',
  email: '',
  phone: '',
  department_id: '',
  password: '',
  confirmPassword: '',
  remarks: '',
  status: 'active' as const
})

const currentUserRoleId = ref('')

// 计算属性
const modalTitle = computed(() => {
  return isEditing.value ? '编辑用户' : '新增用户'
})

// Table 相关状态
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

// 表格列定义
const columns: ColumnDef<UserData>[] = [
  {
    id: "select",
    header: ({ table }) => h(Checkbox, {
      "modelValue": table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
      "onUpdate:modelValue": value => table.toggleAllPageRowsSelected(!!value),
      "ariaLabel": "Select all",
    }),
    cell: ({ row }) => h(Checkbox, {
      "modelValue": row.getIsSelected(),
      "onUpdate:modelValue": value => row.toggleSelected(!!value),
      "ariaLabel": "Select row",
    }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return h(Button, {
        variant: "ghost",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }, () => ["用户信息", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })])
    },
    cell: ({ row }) => {
      const user = row.original
      return h("div", { class: "flex items-center space-x-4" }, [
        h(Avatar, { class: "h-10 w-10" }, [
          user.avatar ? h(AvatarImage, { src: user.avatar, alt: user.name }) : null,
          h(AvatarFallback, { class: "bg-primary/10 text-primary" },
            (user.name || user.email || 'U').charAt(0).toUpperCase()
          )
        ]),
        h("div", { class: "space-y-1" }, [
          h("div", { class: "flex items-center space-x-2" }, [
            h("h3", { class: "font-semibold" }, user.name || user.email),
            h(Badge, {
              variant: user.status === 'active' ? 'default' : 'destructive',
              class: "text-xs"
            }, user.status === 'active' ? '活跃' : '停用')
          ]),
          h("p", { class: "text-sm text-muted-foreground" },
            `@${user.username || user.email?.split('@')[0]}`
          ),
          h("p", { class: "text-sm text-muted-foreground" }, user.email)
        ])
      ])
    },
  },
  {
    accessorKey: "email",
    header: "邮箱",
    cell: ({ row }) => h("div", { class: "lowercase" }, row.getValue("email")),
  },
  {
    accessorKey: "department_id",
    header: "部门",
    cell: ({ row }) => {
      const departmentId = row.getValue("department_id") as string
      const department = departments.value.find(d => d.id === departmentId)
      return h("div", department?.name || '未分配')
    },
  },
  {
    accessorKey: "roles",
    header: "角色",
    cell: ({ row }) => {
      const userRoles = row.getValue("roles") as Array<{ name: string }>
      if (!userRoles || userRoles.length === 0) {
        return h("div", { class: "text-muted-foreground" }, "无角色")
      }
      return h("div", userRoles.map(r => r.name).join(', '))
    },
  },
  {
    accessorKey: "created_at",
    header: "创建时间",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return h("div", date.toLocaleDateString('zh-CN'))
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original
      return h(DropdownMenu, {}, {
        default: () => [
          h(DropdownMenuTrigger, {
            asChild: true
          }, {
            default: () => h(Button, {
              variant: "ghost",
              class: "h-8 w-8 p-0"
            }, {
              default: () => [
                h("span", { class: "sr-only" }, "Open menu"),
                h(MoreHorizontal, { class: "h-4 w-4" })
              ]
            })
          }),
          h(DropdownMenuContent, {
            align: "end"
          }, {
            default: () => [
              h(DropdownMenuLabel, {}, "操作"),
              h(DropdownMenuItem, {
                onClick: () => viewUser(user)
              }, {
                default: () => [
                  h(Eye, { class: "mr-2 h-4 w-4" }),
                  "查看详情"
                ]
              }),
              h(DropdownMenuItem, {
                onClick: () => editUser(user)
              }, {
                default: () => [
                  h(Edit, { class: "mr-2 h-4 w-4" }),
                  "编辑用户"
                ]
              }),
              h(DropdownMenuSeparator),
              h(DropdownMenuItem, {
                onClick: () => toggleStatus(user),
                class: user.status === 'active' ? 'text-red-600' : 'text-green-600'
              }, {
                default: () => [
                  h(Power, { class: "mr-2 h-4 w-4" }),
                  user.status === 'active' ? "停用用户" : "启用用户"
                ]
              })
            ]
          })
        ]
      })
    },
  },
]

// 创建表格实例
const table = useVueTable({
  get data() { return users.value },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
  },
  initialState: {
    pagination: {
      pageSize: 10,
    },
  },
})

// 方法
const loadUsers = async () => {
  loading.value = true
  try {
    const result = await getUsers({
      page: 1,
      pageSize: 1000, // 获取所有数据，在前端进行分页和筛选
    })

    if (result.code === 0) {
      users.value = result.data
    } else {
      toast.error('获取用户列表失败', {
        description: result.message
      })
    }
  } catch (error: any) {
    toast.error('获取用户列表失败', {
      description: error.message || '网络错误'
    })
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    await fetchRoles()
    // fetchRoles 会直接更新 rolesData，我们需要将其同步到本地 roles
    if (rolesData.value) {
      roles.value = [...rolesData.value]
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

const loadDepartments = async () => {
  try {
    departments.value = await getDepartments()
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

const getColumnDisplayName = (columnId: string) => {
  const nameMap: Record<string, string> = {
    name: '用户信息',
    email: '邮箱',
    department_id: '部门',
    roles: '角色',
    created_at: '创建时间'
  }
  return nameMap[columnId] || columnId
}

// 用户操作方法
const openUserModal = () => {
  isEditing.value = false
  Object.assign(currentUser, {
    id: '',
    username: '',
    name: '',
    email: '',
    phone: '',
    department_id: '',
    password: '',
    confirmPassword: '',
    remarks: '',
    status: 'active' as const
  })
  currentUserRoleId.value = ''
  showUserModal.value = true
}

const viewUser = (user: UserData) => {
  editUser(user)
}

const editUser = (user: UserData) => {
  isEditing.value = true
  Object.assign(currentUser, {
    id: user.id,
    username: user.username || '',
    name: user.name || '',
    email: user.email,
    phone: user.phone || '',
    department_id: user.department_id || '',
    password: '',
    confirmPassword: '',
    remarks: user.remarks || '',
    status: user.status
  })
  currentUserRoleId.value = user.roles?.[0]?.id || ''
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  isEditing.value = false
}

const saveUser = async () => {
  try {
    saving.value = true

    if (!currentUser.username || !currentUser.name || !currentUser.email) {
      toast.error('请填写必填字段')
      return
    }

    if (!isEditing.value && currentUser.password !== currentUser.confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    if (!currentUserRoleId.value) {
      toast.error('请选择用户角色')
      return
    }

    const userData: UserForm = {
      username: currentUser.username,
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      department_id: currentUser.department_id,
      role_ids: [currentUserRoleId.value],
      remarks: currentUser.remarks,
      status: currentUser.status,
      password: currentUser.password,
      confirmPassword: currentUser.confirmPassword
    }

    let result
    if (isEditing.value) {
      result = await updateUser(currentUser.id, userData)
    } else {
      result = await createUser(userData)
    }

    if (result.code === 0) {
      toast.success(isEditing.value ? '更新用户成功' : '创建用户成功')
      closeUserModal()
      loadUsers()
    } else {
      toast.error(isEditing.value ? '更新用户失败' : '创建用户失败', {
        description: (result as any).message || '操作失败'
      })
    }
  } catch (error: any) {
    toast.error('操作失败', {
      description: error.message || '网络错误'
    })
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (user: UserData) => {
  try {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    const result = await toggleUserStatus(user.id, newStatus)

    if (result.code === 0) {
      toast.success('更新状态成功')
      loadUsers()
    } else {
      toast.error('更新状态失败', {
        description: (result as any).message || '操作失败'
      })
    }
  } catch (error: any) {
    toast.error('更新状态失败', {
      description: error.message || '网络错误'
    })
  }
}

const importUsers = () => {
  toast.info('功能开发中', {
    description: '批量导入功能即将上线'
  })
}

const exportUsers = () => {
  toast.info('功能开发中', {
    description: '导出功能即将上线'
  })
}

// 初始化
onMounted(async () => {
  await Promise.all([
    loadUsers(),
    loadRoles(),
    loadDepartments()
  ])
})
</script>
