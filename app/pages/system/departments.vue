<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-gray-900 mb-2">部门管理</h1>
        <p class="text-gray-600">管理组织架构和部门层级关系</p>
      </div>
      <div>
        <Button
          class="bg-blue-600 hover:bg-blue-700"
          @click="showCreateDialog = true"
        >
          <Building class="w-4 h-4 mr-2" />
          新增部门
        </Button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <CardContent class="p-6">
        <div class="flex gap-4 items-center flex-wrap">
          <div class="flex-1 min-w-80 relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            />
            <Input
              v-model="searchQuery"
              placeholder="搜索部门名称、负责人..."
              class="pl-10 w-full"
            />
          </div>

          <div class="flex gap-4 items-center">
            <Select v-model="statusFilter">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in statusFilterOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" @click="resetFilters">
              <RefreshCw class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 部门列表 -->
    <Card>
      <CardHeader>
        <CardTitle>部门列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
        </div>

        <div
          v-else-if="filteredDepartments.length === 0"
          class="text-center py-12 text-gray-500"
        >
          <Building class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 class="text-lg mb-2">暂无部门数据</h3>
          <p class="mb-4">开始创建您的第一个部门</p>
          <Button @click="showCreateDialog = true">
            <Building class="w-4 h-4 mr-2" />
            新增部门
          </Button>
        </div>

        <div v-else class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>部门名称</TableHead>
                <TableHead>部门负责人</TableHead>
                <TableHead>上级部门</TableHead>
                <TableHead>员工数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead class="w-40">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="department in filteredDepartments"
                :key="department.id"
              >
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
                    >
                      <Building class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 mb-1">
                        {{ department.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ department.description }}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-sm font-medium"
                    >
                      {{ department.manager?.charAt(0) || "N" }}
                    </div>
                    <span class="font-medium">{{
                      department.manager || "未指定"
                    }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    v-if="department.parentDepartment"
                    class="text-gray-600"
                  >
                    {{ department.parentDepartment }}
                  </span>
                  <Badge v-else variant="secondary">顶级部门</Badge>
                </TableCell>
                <TableCell>
                  <span class="font-medium">{{
                    department.employeeCount || 0
                  }}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    :variant="
                      department.status === 'active' ? 'default' : 'destructive'
                    "
                  >
                    {{ department.status === "active" ? "启用" : "停用" }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      @click="editDepartment(department)"
                    >
                      <Edit class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="addSubDepartment(department)"
                    >
                      <Plus class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="confirmDelete(department)"
                    >
                      <Trash2 class="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 新增/编辑部门对话框 -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{
            editingDepartment ? "编辑部门" : "新增部门"
          }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-6">
          <div class="space-y-2">
            <Label for="name">部门名称 *</Label>
            <Input
              id="name"
              v-model="departmentForm.name"
              placeholder="请输入部门名称"
            />
          </div>

          <div class="space-y-2">
            <Label for="description">部门描述</Label>
            <Textarea
              id="description"
              v-model="departmentForm.description"
              placeholder="请输入部门描述"
              :rows="3"
            />
          </div>

          <div class="space-y-2">
            <Label for="parent">上级部门</Label>
            <Select v-model="departmentForm.parentId">
              <SelectTrigger>
                <SelectValue placeholder="请选择上级部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in parentDepartmentOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="manager">部门负责人</Label>
            <Input
              id="manager"
              v-model="departmentForm.manager"
              placeholder="请输入负责人姓名"
            />
          </div>

          <div class="space-y-2">
            <Label for="count">员工数量</Label>
            <Input
              id="count"
              v-model.number="departmentForm.employeeCount"
              type="number"
              placeholder="请输入员工数量"
              :min="0"
            />
          </div>

          <div class="space-y-2">
            <Label for="status">状态</Label>
            <Select v-model="departmentForm.status">
              <SelectTrigger>
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeCreateDialog">取消</Button>
          <Button @click="saveDepartment">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import {
  Building,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-vue-next';

import { toast } from 'vue-sonner';

// 页面状态
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');

// 对话框状态
const showCreateDialog = ref(false);
const editingDepartment = ref<any>(null);

// 部门表单
const departmentForm = ref({
  code: '',
  name: '',
  description: '',
  status: 'active',
  parentId: '',
  manager: '',
  employeeCount: 0,
  sort: 0,
});

// 状态筛选选项
const statusFilterOptions = [
  { label: '全部状态', value: 'all' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
];

// 模拟部门数据
const departments = ref([
  {
    id: '1',
    code: 'TECH',
    name: '技术部',
    description: '负责产品研发和技术支持',
    status: 'active',
    parentId: '',
    parentDepartment: '',
    manager: '张三',
    employeeCount: 15,
    sort: 1,
  },
  {
    id: '2',
    code: 'SALES',
    name: '销售部',
    description: '负责产品销售和客户关系维护',
    status: 'active',
    parentId: '',
    parentDepartment: '',
    manager: '李四',
    employeeCount: 12,
    sort: 2,
  },
  {
    id: '3',
    code: 'TECH_FE',
    name: '前端开发组',
    description: '负责前端界面开发',
    status: 'active',
    parentId: '1',
    parentDepartment: '技术部',
    manager: '王五',
    employeeCount: 8,
    sort: 1,
  },
  {
    id: '4',
    code: 'TECH_BE',
    name: '后端开发组',
    description: '负责后端服务开发',
    status: 'active',
    parentId: '1',
    parentDepartment: '技术部',
    manager: '赵六',
    employeeCount: 7,
    sort: 2,
  },
]);

// 计算属性
const filteredDepartments = computed(() => {
  let result = departments.value;

  if (searchQuery.value) {
    result = result.filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        dept.manager.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (statusFilter.value && statusFilter.value !== 'all') {
    result = result.filter((dept) => dept.status === statusFilter.value);
  }

  return result;
});

const parentDepartmentOptions = computed(() => {
  const options = [{ label: '无上级部门', value: 'all' }];

  // 只显示顶级部门作为上级部门选项
  const topLevelDepts = departments.value.filter((dept) => !dept.parentId);
  topLevelDepts.forEach((dept) => {
    if (!editingDepartment.value || dept.id !== editingDepartment.value.id) {
      options.push({ label: dept.name, value: dept.id });
    }
  });

  return options;
});

// 方法
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
};

const editDepartment = (department: any) => {
  editingDepartment.value = department;
  Object.assign(departmentForm.value, {
    code: department.code,
    name: department.name,
    description: department.description,
    status: department.status,
    parentId: department.parentId,
    manager: department.manager,
    employeeCount: department.employeeCount,
    sort: department.sort,
  });
  showCreateDialog.value = true;
};

const addSubDepartment = (parentDepartment: any) => {
  editingDepartment.value = null;
  departmentForm.value = {
    code: '',
    name: '',
    description: '',
    status: 'active',
    parentId: parentDepartment.id,
    manager: '',
    employeeCount: 0,
    sort: 0,
  };
  showCreateDialog.value = true;
};

const confirmDelete = (department: any) => {
  if (confirm(`确定要删除部门 "${department.name}" 吗？`)) {
    deleteDepartment(department.id);
  }
};

const deleteDepartment = (id: any) => {
  departments.value = departments.value.filter((d) => d.id !== id);
  toast.success('部门删除成功');
};

const closeCreateDialog = () => {
  showCreateDialog.value = false;
  editingDepartment.value = null;
  departmentForm.value = {
    code: '',
    name: '',
    description: '',
    status: 'active',
    parentId: '',
    manager: '',
    employeeCount: 0,
    sort: 0,
  };
};

const saveDepartment = () => {
  if (!departmentForm.value.name) {
    toast.error('请输入部门名称');
    return;
  }

  if (editingDepartment.value) {
    // 更新部门
    const index = departments.value.findIndex(
      (d) => d.id === editingDepartment.value.id
    );
    if (index !== -1) {
      departments.value[index] = {
        ...departmentForm.value,
        id: editingDepartment.value.id,
        parentDepartment: '',
        employeeCount: departmentForm.value.employeeCount || 0,
      };
    }
    toast.success('部门更新成功');
  } else {
    // 新增部门
    const newDepartment = {
      ...departmentForm.value,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      parentDepartment: '',
      employeeCount: departmentForm.value.employeeCount || 0,
    };
    departments.value.push(newDepartment);
    toast.success('部门创建成功');
  }

  closeCreateDialog();
};
</script>
