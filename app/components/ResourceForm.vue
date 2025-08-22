<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- 基本信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 资源名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          资源名称 <span class="text-red-500">*</span>
        </label>
        <Input
          v-model="form.name"
          placeholder="请输入资源名称"
          :class="{ 'border-red-500': errors.name }"
          required
        />
        <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
      </div>
      
      <!-- 资源键值 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          资源键值 <span class="text-red-500">*</span>
        </label>
        <Input
          v-model="form.resource_key"
          placeholder="例如: user:create, order:view"
          :class="{ 'border-red-500': errors.resource_key }"
          required
        />
        <p v-if="errors.resource_key" class="text-red-500 text-sm mt-1">{{ errors.resource_key }}</p>
        <p class="text-gray-500 text-xs mt-1">
          建议格式：模块:操作，如 user:create、order:view
        </p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 资源类型 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          资源类型 <span class="text-red-500">*</span>
        </label>
        <Select v-model="form.type" :class="{ 'border-red-500': errors.type }" required>
          <option value="">请选择资源类型</option>
          <option value="page">页面</option>
          <option value="function">功能</option>
          <option value="data">数据</option>
          <option value="api">API</option>
          <option value="button">按钮</option>
          <option value="menu">菜单</option>
        </Select>
        <p v-if="errors.type" class="text-red-500 text-sm mt-1">{{ errors.type }}</p>
      </div>
      
      <!-- 父级资源 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          父级资源
        </label>
        <Select v-model="form.parent_id">
          <option value="">无父级资源</option>
          <option
            v-for="resource in availableParents"
            :key="resource.id"
            :value="resource.id"
          >
            {{ resource.name }} ({{ resource.resource_key }})
          </option>
        </Select>
        <p class="text-gray-500 text-xs mt-1">
          选择父级资源可以建立层级关系
        </p>
      </div>
    </div>
    
    <!-- 描述 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        描述
      </label>
      <Textarea
        v-model="form.description"
        placeholder="请输入资源描述"
        rows="3"
        class="resize-none"
      />
    </div>
    
    <!-- 高级设置 -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">高级设置</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 排序 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            排序
          </label>
          <Input
            v-model.number="form.sort_order"
            type="number"
            placeholder="数字越小排序越靠前"
            min="0"
          />
        </div>
        
        <!-- 状态 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            状态
          </label>
          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input
                v-model="form.is_active"
                type="radio"
                :value="true"
                class="text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">启用</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="form.is_active"
                type="radio"
                :value="false"
                class="text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">禁用</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 权限验证设置 -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">权限验证设置</h4>
      
      <div class="space-y-4">
        <!-- 是否需要权限验证 -->
        <div class="flex items-center">
          <input
            v-model="form.requires_auth"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            需要权限验证
          </label>
        </div>
        
        <!-- 验证规则 -->
        <div v-if="form.requires_auth">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            验证规则
          </label>
          <Select v-model="form.auth_rule">
            <option value="any">满足任一权限即可</option>
            <option value="all">需要满足所有权限</option>
            <option value="owner">仅限资源所有者</option>
            <option value="custom">自定义规则</option>
          </Select>
        </div>
        
        <!-- 自定义验证表达式 -->
        <div v-if="form.requires_auth && form.auth_rule === 'custom'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            自定义验证表达式
          </label>
          <Textarea
            v-model="form.auth_expression"
            placeholder="例如: user.role === 'admin' || user.department === 'finance'"
            rows="2"
            class="resize-none font-mono text-sm"
          />
          <p class="text-gray-500 text-xs mt-1">
            支持JavaScript表达式，可使用user、role、department等变量
          </p>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
      <Button
        type="button"
        variant="outline"
        @click="$emit('cancel')"
      >
        取消
      </Button>
      
      <Button
        type="submit"
        :disabled="loading"
        class="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        {{ resource ? '更新' : '创建' }}
      </Button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  resource: {
    type: Object,
    default: null
  },
  parentId: {
    type: String,
    default: null
  },
  resources: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['save', 'cancel'])

// 状态
const loading = ref(false)
const errors = ref({})

// 表单数据
const form = ref({
  name: '',
  resource_key: '',
  type: '',
  parent_id: props.parentId || '',
  description: '',
  sort_order: 0,
  is_active: true,
  requires_auth: true,
  auth_rule: 'any',
  auth_expression: ''
})

// 计算属性
const availableParents = computed(() => {
  // 过滤掉当前编辑的资源（避免循环引用）
  return props.resources.filter(resource => {
    if (props.resource && resource.id === props.resource.id) {
      return false
    }
    return true
  })
})

// 监听props变化
watch(() => props.resource, (newResource) => {
  if (newResource) {
    // 编辑模式，填充表单数据
    form.value = {
      name: newResource.name || '',
      resource_key: newResource.resource_key || '',
      type: newResource.type || '',
      parent_id: newResource.parent_id || '',
      description: newResource.description || '',
      sort_order: newResource.sort_order || 0,
      is_active: newResource.is_active !== false,
      requires_auth: newResource.requires_auth !== false,
      auth_rule: newResource.auth_rule || 'any',
      auth_expression: newResource.auth_expression || ''
    }
  } else {
    // 创建模式，重置表单
    resetForm()
  }
}, { immediate: true })

watch(() => props.parentId, (newParentId) => {
  if (newParentId && !props.resource) {
    form.value.parent_id = newParentId
  }
})

// 方法
const resetForm = () => {
  form.value = {
    name: '',
    resource_key: '',
    type: '',
    parent_id: props.parentId || '',
    description: '',
    sort_order: 0,
    is_active: true,
    requires_auth: true,
    auth_rule: 'any',
    auth_expression: ''
  }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}
  
  // 必填字段验证
  if (!form.value.name.trim()) {
    errors.value.name = '请输入资源名称'
  }
  
  if (!form.value.resource_key.trim()) {
    errors.value.resource_key = '请输入资源键值'
  } else {
    // 验证资源键值格式
    const keyPattern = /^[a-zA-Z][a-zA-Z0-9_]*:[a-zA-Z][a-zA-Z0-9_]*$/
    if (!keyPattern.test(form.value.resource_key)) {
      errors.value.resource_key = '资源键值格式不正确，建议格式：模块:操作'
    }
  }
  
  if (!form.value.type) {
    errors.value.type = '请选择资源类型'
  }
  
  // 检查资源键值是否重复
  const existingResource = props.resources.find(resource => {
    if (props.resource && resource.id === props.resource.id) {
      return false // 排除当前编辑的资源
    }
    return resource.resource_key === form.value.resource_key
  })
  
  if (existingResource) {
    errors.value.resource_key = '该资源键值已存在'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    // 准备提交数据
    const submitData = {
      ...form.value,
      parent_id: form.value.parent_id || null,
      sort_order: Number(form.value.sort_order) || 0
    }
    
    // 如果不需要权限验证，清空相关字段
    if (!submitData.requires_auth) {
      submitData.auth_rule = null
      submitData.auth_expression = null
    }
    
    // 如果验证规则不是自定义，清空表达式
    if (submitData.auth_rule !== 'custom') {
      submitData.auth_expression = null
    }
    
    emit('save', submitData)
  } catch (error) {
    console.error('提交表单失败:', error)
  } finally {
    loading.value = false
  }
}

// 自动生成资源键值
watch(() => form.value.name, (newName) => {
  if (newName && !props.resource && !form.value.resource_key) {
    // 只在创建模式且用户还没有手动输入键值时自动生成
    const key = newName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
    
    if (key) {
      form.value.resource_key = `${key}:view`
    }
  }
})

// 根据类型自动调整默认设置
watch(() => form.value.type, (newType) => {
  if (newType === 'page' || newType === 'menu') {
    form.value.requires_auth = true
    form.value.auth_rule = 'any'
  } else if (newType === 'api') {
    form.value.requires_auth = true
    form.value.auth_rule = 'all'
  } else if (newType === 'button') {
    form.value.requires_auth = true
    form.value.auth_rule = 'any'
  }
})

// 初始化
onMounted(() => {
  if (!props.resource) {
    resetForm()
  }
})
</script>