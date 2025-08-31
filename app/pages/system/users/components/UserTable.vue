<template>
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
              :colspan="getColumns().length"
              class="h-24 text-center"
            >
                <!-- 骨架屏行 -->
                <div v-for="i in 2" :key="i" class="grid grid-cols-[auto_1fr_200px_120px_150px_100px_60px] gap-4 p-4 items-center">
                  <!-- 复选框列 -->
                  <div class="h-4 w-4 bg-muted animate-pulse rounded"></div>
                  <!-- 用户信息列 (最宽) -->
                  <div class="flex items-center space-x-4">
                    <div class="h-10 w-10 bg-muted animate-pulse rounded-full"></div>
                    <div class="space-y-2 flex-1">
                      <div class="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                      <div class="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                      <div class="h-3 bg-muted animate-pulse rounded w-5/6"></div>
                    </div>
                  </div>
                  <!-- 邮箱列 -->
                  <div class="h-4 bg-muted animate-pulse rounded w-full"></div>
                  <!-- 部门列 -->
                  <div class="h-4 bg-muted animate-pulse rounded w-full"></div>
                  <!-- 角色列 -->
                  <div class="flex gap-1">
                    <div class="h-6 bg-muted animate-pulse rounded w-16"></div>
                    <div class="h-6 bg-muted animate-pulse rounded w-12"></div>
                  </div>
                  <!-- 创建时间列 -->
                  <div class="h-4 bg-muted animate-pulse rounded w-full"></div>
                  <!-- 操作列 -->
                  <div class="h-8 w-8 bg-muted animate-pulse rounded"></div>
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
  Edit,
  Eye,
  MoreHorizontal,
  Power
} from 'lucide-vue-next'
import { h } from 'vue'
import type { UserData } from '~/composables/useUsers'

// 导入所需的UI组件
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props {
  users: UserData[]
  departments: any[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'view-user': [user: UserData]
  'edit-user': [user: UserData]
  'toggle-status': [user: UserData]
  'create-user': []
}>()

// Table 相关状态
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

// 表格列定义
const getColumns = (): ColumnDef<UserData>[] => [
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
        h(Avatar, { class: "h-10 w-10" }, {
          default: () => [
            user.avatar ? h(AvatarImage, { src: user.avatar, alt: user.name }) : null,
            h(AvatarFallback, { class: "bg-primary/10 text-primary" }, {
              default: () => (user.name || user.email || 'U').charAt(0).toUpperCase()
            })
          ]
        }),
        h("div", { class: "space-y-1" }, [
          h("div", { class: "flex items-center space-x-2" }, [
            h("h3", { class: "font-semibold" }, user.name || user.email),
            h(Badge, {
              variant: user.status === 'active' ? 'default' : 'destructive',
              class: "text-xs"
            }, {
              default: () => user.status === 'active' ? '活跃' : '停用'
            })
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
      const user = row.original
      const departmentId = user.department_id

      if (!departmentId || departmentId.trim() === '') {
        return h("div", { class: "text-muted-foreground" }, "未分配")
      }
      const department = props.departments.find(d => d.id === departmentId)
      if (department) {
        return h("div", { class: "font-medium" }, department.name)
      } else {
        return h("div", { class: "text-orange-600" }, `部门不存在 (${departmentId.slice(0, 8)}...)`)
      }
    },
  },
  {
    accessorKey: "roles",
    header: "角色",
    cell: ({ row }) => {
      const user = row.original
      const userRoles = user.roles

      if (!userRoles || userRoles.length === 0) {
        return h("div", { class: "text-muted-foreground" }, "无角色")
      }
      return h("div", { class: "flex flex-wrap gap-1" },
        userRoles.map(role =>
          h("span", {
            class: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          }, role.name)
        )
      )
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
                onClick: () => emit('view-user', user)
              }, {
                default: () => [
                  h(Eye, { class: "mr-2 h-4 w-4" }),
                  "查看详情"
                ]
              }),
              h(DropdownMenuItem, {
                onClick: () => emit('edit-user', user)
              }, {
                default: () => [
                  h(Edit, { class: "mr-2 h-4 w-4" }),
                  "编辑用户"
                ]
              }),
              h(DropdownMenuSeparator),
              h(DropdownMenuItem, {
                onClick: () => emit('toggle-status', user),
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
  get data() { return props.users },
  get columns() { return getColumns() },
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
</script>
