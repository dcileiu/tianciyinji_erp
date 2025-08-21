<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">角色管理</h1>
        <p class="text-muted-foreground">管理系统角色权限配置</p>
      </div>
      <Button @click="showCreateDialog = true" class="bg-blue-600 hover:bg-blue-700">
        <Plus class="w-4 h-4 mr-2" />
        新增角色
      </Button>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <div class="p-4">
        <div class="flex gap-4 items-center">
          <Input
            v-model="searchQuery"
            placeholder="搜索角色名称..."
            class="max-w-sm"
          />
          <Button variant="outline" @click="resetSearch">
            <RefreshCw class="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </div>
    </Card>

    <!-- 角色列表 -->
    <Card>
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold">角色列表</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">角色名称</th>
              <th class="p-4 font-medium">角色编码</th>
              <th class="p-4 font-medium">描述</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">创建时间</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in filteredRoles" :key="role.id" class="border-b hover:bg-muted/50">
              <td class="p-4">{{ role.name }}</td>
              <td class="p-4 font-mono text-sm">{{ role.code }}</td>
              <td class="p-4 text-muted-foreground">{{ role.description || '-' }}</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': role.status === 'active',
                    'bg-red-100 text-red-800': role.status === 'inactive'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ role.status === 'active' ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="p-4 text-sm text-muted-foreground">
                {{ formatDate(role.created_at) }}
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="editRole(role)">
                    <Edit3 class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" @click="viewPermissions(role)">
                    <Settings class="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    @click="deleteRole(role.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredRoles.length === 0">
              <td colspan="6" class="p-8 text-center text-muted-foreground">
                暂无角色数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 创建/编辑角色对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditDialog ? '编辑角色' : '新增角色' }}
        </h3>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">角色名称</label>
            <Input v-model="formData.name" placeholder="请输入角色名称" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">角色编码</label>
            <Input v-model="formData.code" placeholder="请输入角色编码" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">描述</label>
            <textarea 
              v-model="formData.description"
              class="w-full px-3 py-2 border rounded-md resize-none"
              rows="3"
              placeholder="请输入角色描述"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">状态</label>
            <select v-model="formData.status" class="w-full px-3 py-2 border rounded-md">
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
          
          <div class="flex gap-3 pt-4">
            <Button type="submit" class="flex-1">
              {{ showEditDialog ? '更新' : '创建' }}
            </Button>
            <Button type="button" variant="outline" @click="cancelForm" class="flex-1">
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Edit3, Settings, Trash2 } from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '角色管理 - ERP 管理系统'
})

// 数据管理
const { roles, createRole, updateRole, deleteRole: removeRole, refreshRoles } = useRoles()

// 响应式数据
const searchQuery = ref('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentEditId = ref<string | null>(null)

// 表单数据
const formData = ref({
  name: '',
  code: '',
  description: '',
  permissions: [] as string[],
  status: 'active' as const
})

// 计算属性
const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value
  
  return roles.value.filter(role => 
    role.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    role.code.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const resetSearch = () => {
  searchQuery.value = ''
}

const editRole = (role: any) => {
  formData.value = {
    name: role.name,
    code: role.code,
    description: role.description || '',
    permissions: role.permissions || [],
    status: role.status
  }
  currentEditId.value = role.id
  showEditDialog.value = true
}

const viewPermissions = (role: any) => {
  // TODO: 实现权限配置页面
  console.log('查看权限配置:', role)
}

const deleteRole = async (id: string) => {
  if (confirm('确定要删除这个角色吗？')) {
    await removeRole(id)
    await refreshRoles()
  }
}

const submitForm = async () => {
  try {
    if (showEditDialog.value && currentEditId.value) {
      await updateRole(currentEditId.value, formData.value)
    } else {
      await createRole(formData.value)
    }
    
    await refreshRoles()
    cancelForm()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const cancelForm = () => {
  showCreateDialog.value = false
  showEditDialog.value = false
  currentEditId.value = null
  formData.value = {
    name: '',
    code: '',
    description: '',
    permissions: [],
    status: 'active'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化数据
onMounted(async () => {
  await refreshRoles()
})
</script> 