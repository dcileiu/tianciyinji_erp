<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">资源管理</h1>
        <p class="text-gray-600 mt-1">
          管理系统中的各种资源权限，包括页面、功能、数据等
        </p>
      </div>

      <div class="flex items-center gap-3">
        <Button v-if="canCreate" @click="openCreateDialog">
          <Plus class="h-4 w-4 mr-2" />
          添加资源
        </Button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div class="md:col-span-2 relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            />
            <Input
              class="pl-10"
              placeholder="搜索资源名称、键值或描述..."
              v-model="searchQuery"
            />
          </div>

          <!-- 资源类型筛选 -->
          <div>
            <Select v-model="typeFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 状态筛选 -->
          <div>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- 筛选操作 -->
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              v-if="hasSelected"
              @click="handleBatchDelete"
            >
              <Trash2 class="h-4 w-4 mr-2" />
              批量删除 ({{ selectedResources.length }})
            </Button>

            <Button
              size="sm"
              variant="ghost"
              v-if="
                searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              "
              @click="clearFilters"
            >
              <RefreshCw class="h-4 w-4 mr-2" />
              清空筛选
            </Button>
          </div>

          <div class="flex items-center gap-2">
            <Button size="sm" variant="outline" @click="exportResources">
              <Download class="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button size="sm" variant="outline" @click="loadResources">
              <RefreshCw class="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 资源列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <Database class="h-5 w-5" />
            资源列表
          </CardTitle>
          <div class="text-sm text-gray-600">
            共 {{ filteredResources.length }} 个资源
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div class="flex items-center justify-center py-8" v-if="loading">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
        </div>

        <div
          class="text-center py-8 text-gray-500"
          v-else-if="filteredResources.length === 0"
        >
          暂无资源数据
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">
                <input class="rounded" type="checkbox">
              </TableHead>
              <TableHead>资源键值</TableHead>
              <TableHead>资源名称</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead class="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="resource in filteredResources" :key="resource.id">
              <TableCell>
                <input class="rounded" type="checkbox">
              </TableCell>

              <TableCell>
                <code class="bg-gray-100 px-2 py-1 text-sm font-mono rounded">
                  {{ resource.key }}
                </code>
              </TableCell>

              <TableCell>
                <div class="flex items-center space-x-2">
                  <component
                    class="h-4 w-4 text-blue-600"
                    :is="getResourceIcon(resource.type)"
                  />
                  <span class="font-medium">{{ resource.name }}</span>
                </div>
              </TableCell>

              <TableCell>
                <Badge :variant="getTypeSeverity(resource.type)">
                  {{ getTypeDisplayName(resource.type) }}
                </Badge>
              </TableCell>

              <TableCell>
                <span class="text-gray-600 text-sm">
                  {{ resource.description || "-" }}
                </span>
              </TableCell>

              <TableCell>
                <Badge
                  :variant="
                    resource.status === 'active' ? 'default' : 'secondary'
                  "
                >
                  {{ resource.status === "active" ? "启用" : "禁用" }}
                </Badge>
              </TableCell>

              <TableCell>
                <span class="text-sm text-gray-600">
                  {{ formatDate(resource.created_at) }}
                </span>
              </TableCell>

              <TableCell>
                <div class="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="viewResource(resource)"
                  >
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    v-if="canEdit"
                    @click="editResource(resource)"
                  >
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    v-if="canDelete"
                    @click="confirmDeleteResource(resource)"
                  >
                    <Trash2 class="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- 资源对话框 -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{ editingResource ? "编辑资源" : "添加资源" }}
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>资源键值 *</Label>
              <Input
                placeholder="例如: user:create"
                v-model="resourceForm.key"
              />
            </div>

            <div class="space-y-2">
              <Label>资源名称 *</Label>
              <Input placeholder="例如: 创建用户" v-model="resourceForm.name" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>资源类型 *</Label>
              <Select v-model="resourceForm.type">
                <SelectTrigger>
                  <SelectValue placeholder="选择资源类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="type in typeOptions"
                    :key="type.value"
                    :value="type.value"
                  >
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>状态</Label>
              <Select v-model="resourceForm.status">
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="status in statusOptions"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label>描述</Label>
            <Textarea
              placeholder="请输入资源描述"
              v-model="resourceForm.description"
              :rows="3"
            />
          </div>

          <div class="space-y-2">
            <Label>路径</Label>
            <Input placeholder="例如: /api/users" v-model="resourceForm.path" />
          </div>

          <div class="space-y-2">
            <Label>HTTP方法</Label>
            <Select multiple v-model="resourceForm.methods">
              <SelectTrigger>
                <SelectValue placeholder="选择HTTP方法" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="method in methodOptions"
                  :key="method.value"
                  :value="method.value"
                >
                  {{ method.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeDialog">取消</Button>
          <Button :disabled="saving" @click="saveResource">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 确认对话框 -->
    <!-- ConfirmDialog 已移除，需要手动实现确认对话框 -->
  </div>
</template>

<script lang="ts" setup>
  // 手动导入 Lucide 图标
  import {
    Circle,
    Database,
    Download,
    Edit,
    Eye,
    FileText,
    Menu,
    Plus,
    RefreshCw,
    Search,
    Server,
    Settings,
    Trash2,
  } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  // 页面配置
  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "system:resources",
  });

  useHead({
    title: "资源管理 - ERP 管理系统",
  });

  // 权限检查
  const canCreate = ref(true);
  const canEdit = ref(true);
  const canDelete = ref(true);

  // 状态管理
  const loading = ref(false);
  const saving = ref(false);
  const showDialog = ref(false);
  const editingResource = ref(null as any);
  const selectedResources = ref([]);

  // 模拟数据搜索和筛选
  const searchQuery = ref("");
  const typeFilter = ref("all");
  const statusFilter = ref("all");

  // 表单数据
  const resourceForm = ref({
    key: "",
    name: "",
    type: "page",
    description: "",
    path: "",
    methods: [],
    status: "active",
  });

  // 选项数据
  const typeOptions = ref([
    { label: "页面", value: "page" },
    { label: "功能", value: "function" },
    { label: "数据", value: "data" },
    { label: "API", value: "api" },
    { label: "按钮", value: "button" },
    { label: "菜单", value: "menu" },
  ]);

  const statusOptions = ref([
    { label: "启用", value: "active" },
    { label: "禁用", value: "inactive" },
  ]);

  const methodOptions = ref([
    { label: "GET", value: "GET" },
    { label: "POST", value: "POST" },
    { label: "PUT", value: "PUT" },
    { label: "DELETE", value: "DELETE" },
    { label: "PATCH", value: "PATCH" },
  ]);

  // 模拟数据
  const mockResources = ref([
    {
      id: "1",
      key: "user:view",
      name: "查看用户",
      type: "function",
      description: "查看用户列表和详情",
      path: "/api/users",
      methods: ["GET"],
      status: "active",
      created_at: new Date("2024-01-01"),
    },
    {
      id: "2",
      key: "user:create",
      name: "创建用户",
      type: "function",
      description: "创建新用户",
      path: "/api/users",
      methods: ["POST"],
      status: "active",
      created_at: new Date("2024-01-02"),
    },
    {
      id: "3",
      key: "user:edit",
      name: "编辑用户",
      type: "function",
      description: "编辑用户信息",
      path: "/api/users/:id",
      methods: ["PUT", "PATCH"],
      status: "active",
      created_at: new Date("2024-01-03"),
    },
    {
      id: "4",
      key: "user:delete",
      name: "删除用户",
      type: "function",
      description: "删除用户",
      path: "/api/users/:id",
      methods: ["DELETE"],
      status: "active",
      created_at: new Date("2024-01-04"),
    },
    {
      id: "5",
      key: "dashboard",
      name: "仪表盘页面",
      type: "page",
      description: "系统仪表盘页面",
      path: "/dashboard",
      methods: [],
      status: "active",
      created_at: new Date("2024-01-05"),
    },
  ]);

  // 计算属性
  const filteredResources = computed(() => {
    let result = mockResources.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (resource) =>
          resource.key.toLowerCase().includes(query) ||
          resource.name.toLowerCase().includes(query) ||
          resource.description?.toLowerCase().includes(query)
      );
    }

    if (typeFilter.value && typeFilter.value !== "all") {
      result = result.filter((resource) => resource.type === typeFilter.value);
    }

    if (statusFilter.value && statusFilter.value !== "all") {
      result = result.filter(
        (resource) => resource.status === statusFilter.value
      );
    }

    return result;
  });

  const hasSelected = computed(() => selectedResources.value.length > 0);

  // 类型映射
  const typeMap: Record<string, string> = {
    page: "页面",
    function: "功能",
    data: "数据",
    api: "API",
    button: "按钮",
    menu: "菜单",
  };

  const severityMap: Record<
    string,
    "default" | "destructive" | "outline" | "secondary"
  > = {
    page: "secondary",
    function: "default",
    data: "outline",
    api: "destructive",
    button: "secondary",
    menu: "secondary",
  };

  // 方法
  const getResourceIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      page: FileText,
      function: Settings,
      data: Database,
      api: Server,
      button: Circle,
      menu: Menu,
    };
    return iconMap[type] || Circle;
  };

  const getTypeDisplayName = (type: string) => typeMap[type] || type;

  const getTypeSeverity = (
    type: string
  ): "default" | "destructive" | "outline" | "secondary" =>
    (severityMap[type] as
      | "default"
      | "destructive"
      | "outline"
      | "secondary") || "secondary";

  const formatDate = (date: Date) => new Date(date).toLocaleString("zh-CN");

  const loadResources = async () => {
    loading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (_error) {
    } finally {
      loading.value = false;
    }
  };

  const openCreateDialog = () => {
    editingResource.value = null;
    Object.assign(resourceForm.value, {
      key: "",
      name: "",
      type: "page",
      description: "",
      path: "",
      methods: [],
      status: "active",
    });
    showDialog.value = true;
  };

  const editResource = (resource: any) => {
    editingResource.value = resource;
    Object.assign(resourceForm.value, {
      key: resource.key,
      name: resource.name,
      type: resource.type,
      description: resource.description,
      path: resource.path,
      methods: resource.methods,
      status: resource.status,
    });
    showDialog.value = true;
  };

  const viewResource = (_resource: any) => {};

  const closeDialog = () => {
    showDialog.value = false;
    editingResource.value = null;
  };

  const saveResource = async () => {
    saving.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingResource.value) {
        // 更新资源
        const index = mockResources.value.findIndex(
          (r) => r.id === editingResource.value.id
        );
        if (index !== -1 && mockResources.value[index]) {
          mockResources.value[index]!.key = resourceForm.value.key;
          mockResources.value[index]!.name = resourceForm.value.name;
          mockResources.value[index]!.type = resourceForm.value.type;
          mockResources.value[index]!.description =
            resourceForm.value.description;
          mockResources.value[index]!.path = resourceForm.value.path;
          mockResources.value[index]!.methods = resourceForm.value.methods;
          mockResources.value[index]!.status = resourceForm.value.status;
        }
        toast.success("资源更新成功");
      } else {
        // 新增资源
        const newResource = {
          id: Date.now().toString(),
          ...resourceForm.value,
          created_at: new Date(),
        };
        mockResources.value.push(newResource);
        toast.success("资源添加成功");
      }

      closeDialog();
    } catch (_error) {
      toast.error("操作失败，请重试");
    } finally {
      saving.value = false;
    }
  };

  const confirmDeleteResource = (resource: any) => {
    if (confirm(`确定要删除资源 "${resource.name}" 吗？`)) {
      deleteResource(resource.id);
    }
  };

  const deleteResource = (id: string) => {
    const index = mockResources.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      mockResources.value.splice(index, 1);
      toast.success("资源删除成功");
    }
  };

  const handleBatchDelete = () => {
    if (selectedResources.value.length === 0) {
      toast.warning("请选择要删除的资源");
      return;
    }

    if (
      confirm(`确定要删除选中的 ${selectedResources.value.length} 个资源吗？`)
    ) {
      const selectedIds = selectedResources.value.map((r: any) => r.id);
      mockResources.value = mockResources.value.filter(
        (resource) => !selectedIds.includes(resource.id)
      );
      selectedResources.value = [];
      toast.success(`成功删除 ${selectedIds.length} 个资源`);
    }
  };

  const clearFilters = () => {
    searchQuery.value = "";
    typeFilter.value = "all";
    statusFilter.value = "all";
  };

  const exportResources = () => {
    // 模拟导出功能
    const data = filteredResources.value;
    toast.success(`成功导出 ${data.length} 条资源数据`);
  };

  // 初始化
  onMounted(() => {
    loadResources();
  });
</script>
