<template>
  <div class="space-y-6">
    <!-- 页面标题和操作 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">部门管理</h1>
        <p class="text-muted-foreground">
          管理组织架构和部门层级关系
        </p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新数据
        </Button>
        <Button size="sm" @click="openDepartmentModal">
          <Building class="mr-2 h-4 w-4" />
          新增部门
        </Button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="w-full">
      <div class="flex items-center py-4">
        <Input
          class="max-w-sm"
          placeholder="搜索部门名称、编码..."
          :model-value="table.getColumn('name')?.getFilterValue() as string"
          @update:model-value="table.getColumn('name')?.setFilterValue($event)"
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
                  <Building class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 class="text-xl font-semibold mb-4">暂无部门数据</h3>
                  <p class="text-muted-foreground mb-6 max-w-md mx-auto">
                    没有找到符合条件的部门记录。请检查筛选条件或添加新部门。
                  </p>
                  <Button @click="openDepartmentModal">
                    <Building class="mr-2 h-4 w-4" />
                    添加部门
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

    <!-- 部门详情/编辑对话框 -->
    <Dialog v-model:open="showDepartmentModal">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Building class="h-5 w-5" />
            {{ modalTitle }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? "编辑部门信息和层级关系" : "创建新的部门" }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>部门名称 *</Label>
              <Input
                v-model="currentDepartment.name"
                placeholder="请输入部门名称"
              />
            </div>
            <div class="space-y-2">
              <Label>部门编码 *</Label>
              <Input
                v-model="currentDepartment.code"
                placeholder="请输入部门编码"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>部门描述</Label>
            <Textarea
              v-model="currentDepartment.description"
              placeholder="请输入部门描述..."
              :rows="3"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>上级部门</Label>
              <Select v-model="currentDepartment.parent_id">
                <SelectTrigger>
                  <SelectValue placeholder="选择上级部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无上级部门</SelectItem>
                  <SelectItem
                    v-for="dept in availableParentDepartments"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>排序</Label>
              <Input
                v-model.number="currentDepartment.sort"
                type="number"
                placeholder="排序数字"
                min="1"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>状态</Label>
            <Select v-model="currentDepartment.status">
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeDepartmentModal">取消</Button>
          <Button :disabled="saving" @click="saveDepartment">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditing ? "更新部门" : "创建部门" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认对话框 -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除部门 "{{ deletingDepartment?.name }}" 吗？
            <br />
            <span class="text-red-600 font-medium">此操作不可撤销！</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            :disabled="deleting"
            @click="handleDelete"
            class="bg-red-600 hover:bg-red-700"
          >
            <Loader2 v-if="deleting" class="mr-2 h-4 w-4 animate-spin" />
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
    Building,
    ChevronDown,
    Edit,
    Loader2,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Trash2,
} from 'lucide-vue-next'
import { h, ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Department, DepartmentForm } from '~/composables/useDepartments'

// 导入所需的UI组件
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  title: '部门管理 - 智能ERP管理系统',
})

// Composables
const {
  departments,
  loading,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment: deleteDept,
  canDeleteDepartment
} = useDepartments()

// 状态管理
const saving = ref(false)
const deleting = ref(false)
const showDepartmentModal = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)

// 表单数据
const currentDepartment = reactive<Partial<DepartmentForm> & { id?: string }>({
  name: '',
  code: '',
  description: '',
  parent_id: '',
  sort: 1,
  status: 'active'
})

const deletingDepartment = ref<Department | null>(null)

// 计算属性
const modalTitle = computed(() => {
  return isEditing.value ? '编辑部门' : '新增部门'
})

const availableParentDepartments = computed(() => {
  return departments.value.filter(dept => {
    // 排除自己和自己的子部门
    if (isEditing.value && currentDepartment.id) {
      return dept.id !== currentDepartment.id && dept.parent_id !== currentDepartment.id
    }
    return true
  })
})

// Table 相关状态
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

// 表格列定义
const columns: ColumnDef<Department>[] = [
  {
    id: "select",
    header: ({ table }) => h(Checkbox, {
      "modelValue": table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
      "onUpdate:modelValue": (value: any) => table.toggleAllPageRowsSelected(!!value),
      "ariaLabel": "Select all",
    }),
    cell: ({ row }) => h(Checkbox, {
      "modelValue": row.getIsSelected(),
      "onUpdate:modelValue": (value: any) => row.toggleSelected(!!value),
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
      }, () => ["部门信息", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })])
    },
    cell: ({ row }) => {
      const department = row.original
      return h("div", { class: "flex items-center space-x-4" }, [
        h("div", { class: "w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center" }, [
          h(Building, { class: "w-6 h-6 text-primary" })
        ]),
        h("div", { class: "space-y-1" }, [
          h("div", { class: "flex items-center space-x-2" }, [
            h("h3", { class: "font-semibold" }, department.name),
            h(Badge, { variant: "outline", class: "text-xs" }, department.code)
          ]),
          h("p", { class: "text-sm text-muted-foreground" },
            department.description || '暂无描述'
          )
        ])
      ])
    },
  },
  {
    accessorKey: "parent_id",
    header: "上级部门",
    cell: ({ row }) => {
      const parentId = row.getValue("parent_id") as string
      if (parentId) {
        const parent = departments.value.find(d => d.id === parentId)
        return h("span", { class: "text-muted-foreground" }, parent?.name || '未知部门')
      }
      return h(Badge, { variant: "secondary" }, "顶级部门")
    },
  },
  {
    accessorKey: "sort",
    header: "排序",
    cell: ({ row }) => h(Badge, { variant: "outline" }, row.getValue("sort")),
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return h(Badge, {
        variant: status === 'active' ? 'default' : 'destructive'
      }, status === 'active' ? '启用' : '停用')
    },
  },
  {
    accessorKey: "created_at",
    header: "创建时间",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return h("div", { class: "text-sm" }, date.toLocaleDateString('zh-CN'))
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const department = row.original
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
                onClick: () => editDepartment(department)
              }, {
                default: () => [
                  h(Edit, { class: "mr-2 h-4 w-4" }),
                  "编辑部门"
                ]
              }),
              h(DropdownMenuItem, {
                onClick: () => addSubDepartment(department)
              }, {
                default: () => [
                  h(Plus, { class: "mr-2 h-4 w-4" }),
                  "添加子部门"
                ]
              }),
              h(DropdownMenuSeparator),
              h(DropdownMenuItem, {
                onClick: () => confirmDelete(department),
                disabled: !canDeleteDepartment(department.id),
                class: "text-red-600"
              }, {
                default: () => [
                  h(Trash2, { class: "mr-2 h-4 w-4" }),
                  "删除部门"
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
  get data() { return departments.value },
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
const loadDepartments = async () => {
  try {
    const result = await getDepartments()
    if (result.code !== 0) {
      toast.error('获取部门列表失败', {
        description: result.message
      })
    }
  } catch (error: any) {
    toast.error('获取部门列表失败', {
      description: error.message || '网络错误'
    })
  }
}

const refreshData = () => {
  loadDepartments()
}

const getColumnDisplayName = (columnId: string) => {
  const nameMap: Record<string, string> = {
    name: '部门信息',
    parent_id: '上级部门',
    sort: '排序',
    status: '状态',
    created_at: '创建时间'
  }
  return nameMap[columnId] || columnId
}

// 部门操作方法
const openDepartmentModal = () => {
  isEditing.value = false
  Object.assign(currentDepartment, {
    id: '',
    name: '',
    code: '',
    description: '',
    parent_id: '',
    sort: 1,
    status: 'active' as const
  })
  showDepartmentModal.value = true
}

const editDepartment = (department: Department) => {
  isEditing.value = true
  Object.assign(currentDepartment, {
    id: department.id,
    name: department.name,
    code: department.code,
    description: department.description || '',
    parent_id: department.parent_id || '',
    sort: department.sort,
    status: department.status
  })
  showDepartmentModal.value = true
}

const addSubDepartment = (parentDepartment: Department) => {
  isEditing.value = false
  Object.assign(currentDepartment, {
    id: '',
    name: '',
    code: '',
    description: '',
    parent_id: parentDepartment.id,
    sort: 1,
    status: 'active' as const
  })
  showDepartmentModal.value = true
}

const closeDepartmentModal = () => {
  showDepartmentModal.value = false
  isEditing.value = false
}

const saveDepartment = async () => {
  try {
    saving.value = true

    // 验证必填字段
    if (!currentDepartment.name || !currentDepartment.code) {
      toast.error('请填写必填字段')
      return
    }

    const departmentData: DepartmentForm = {
      name: currentDepartment.name,
      code: currentDepartment.code,
      description: currentDepartment.description || '',
      parent_id: currentDepartment.parent_id || undefined,
      sort: currentDepartment.sort || 1,
      status: currentDepartment.status || 'active'
    }

    let result
    if (isEditing.value && currentDepartment.id) {
      result = await updateDepartment(currentDepartment.id, departmentData)
    } else {
      result = await createDepartment(departmentData)
    }

    if (result.code === 0) {
      toast.success(isEditing.value ? '更新部门成功' : '创建部门成功')
      closeDepartmentModal()
      loadDepartments()
    } else {
      toast.error(isEditing.value ? '更新部门失败' : '创建部门失败', {
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

const confirmDelete = (department: Department) => {
  if (!canDeleteDepartment(department.id)) {
    toast.error('无法删除', {
      description: '该部门下还有子部门，请先删除子部门'
    })
    return
  }

  deletingDepartment.value = department
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  if (!deletingDepartment.value) return

  try {
    deleting.value = true

    const result = await deleteDept(deletingDepartment.value.id)

    if (result.code === 0) {
      toast.success('删除部门成功')
      showDeleteDialog.value = false
      deletingDepartment.value = null
      loadDepartments()
    } else {
      toast.error('删除部门失败', {
        description: (result as any).message || '删除失败'
      })
    }
  } catch (error: any) {
    toast.error('删除部门失败', {
      description: error.message || '网络错误'
    })
  } finally {
    deleting.value = false
  }
}

// 初始化
onMounted(() => {
  loadDepartments()
})
</script>
