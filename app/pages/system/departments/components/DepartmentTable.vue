<template>
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
              <div v-if="loading" class="space-y-3">
                <!-- 骨架屏行 -->
                <div v-for="i in 3" :key="i" class="grid grid-cols-[auto_1fr_120px_80px_80px_100px_60px] gap-4 p-4 items-center">
                  <!-- 复选框列 -->
                  <div class="h-4 w-4 bg-muted animate-pulse rounded"></div>
                  <!-- 部门信息列 (最宽) -->
                  <div class="flex items-center space-x-4">
                    <div class="h-12 w-12 bg-muted animate-pulse rounded-lg"></div>
                    <div class="space-y-2 flex-1">
                      <div class="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                      <div class="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                    </div>
                  </div>
                  <!-- 上级部门列 -->
                  <div class="h-4 bg-muted animate-pulse rounded w-full"></div>
                  <!-- 排序列 -->
                  <div class="h-6 bg-muted animate-pulse rounded w-full"></div>
                  <!-- 状态列 -->
                  <div class="h-6 bg-muted animate-pulse rounded w-full"></div>
                  <!-- 创建时间列 -->
                  <div class="h-4 bg-muted animate-pulse rounded w-full"></div>
                  <!-- 操作列 -->
                  <div class="h-8 w-8 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
              <div v-else>
                <Building class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 class="text-xl font-semibold mb-4">暂无部门数据</h3>
                <p class="text-muted-foreground mb-6 max-w-md mx-auto">
                  没有找到符合条件的部门记录。请检查筛选条件或添加新部门。
                </p>
                <Button @click="$emit('create-department')">
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
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-vue-next'
import { h } from 'vue'
import type { DepartmentData } from '~/composables/useDepartments'

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
  departments: DepartmentData[]
  loading: boolean
  canDeleteDepartment: (id: string) => boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'edit-department': [department: DepartmentData]
  'add-sub-department': [department: DepartmentData]
  'delete-department': [department: DepartmentData]
  'create-department': []
}>()

// Table 相关状态
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

// 表格列定义
const columns: ColumnDef<DepartmentData>[] = [
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
        const parent = props.departments.find(d => d.id === parentId)
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
                onClick: () => emit('edit-department', department)
              }, {
                default: () => [
                  h(Edit, { class: "mr-2 h-4 w-4" }),
                  "编辑部门"
                ]
              }),
              h(DropdownMenuItem, {
                onClick: () => emit('add-sub-department', department)
              }, {
                default: () => [
                  h(Plus, { class: "mr-2 h-4 w-4" }),
                  "添加子部门"
                ]
              }),
              h(DropdownMenuSeparator),
              h(DropdownMenuItem, {
                onClick: () => emit('delete-department', department),
                disabled: !props.canDeleteDepartment(department.id),
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
  get data() { return props.departments },
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
</script>
