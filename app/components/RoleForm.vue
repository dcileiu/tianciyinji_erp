<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- 基本信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 角色名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          角色名称 <span class="text-red-500">*</span>
        </label>
        <Input
          v-model="form.name"
          placeholder="请输入角色名称"
          :class="{ 'border-red-500': errors.name }"
          required
        />
        <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
      </div>
      
      <!-- 角色代码 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          角色代码 <span class="text-red-500">*</span>
        </label>
        <Input
          v-model="form.code"
          placeholder="例如: admin, manager, user"
          :class="{ 'border-red-500': errors.code }"
          :disabled="role && role.code === 'admin'"
          required
        />
        <p v-if="errors.code" class="text-red-500 text-sm mt-1">{{ errors.code }}</p>
        <p class="text-gray-500 text-xs mt-1">
          角色代码用于系统内部识别，建议使用英文小写字母
        </p>
      </div>
    </div>
    
    <!-- 描述 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        角色描述
      </label>
      <Textarea
        v-model="form.description"
        placeholder="请输入角色描述"
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
    
    <!-- 权限设置 -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">权限设置</h4>
      
      <div class="space-y-4">
        <!-- 是否为超级管理员 -->
        <div class="flex items-center">
          <input
            v-model="form.is_super_admin"
            type="checkbox"
            :disabled="role && role.code === 'admin'"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            超级管理员
            <span class="text-gray-500">(拥有所有权限，无需单独配置)</span>
          </label>
        </div>
        
        <!-- 数据权限范围 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            数据权限范围
          </label>
          <Select v-model="form.data_scope">
            <option value="all">全部数据</option>
            <option value="department">本部门数据</option>
            <option value="department_and_sub">本部门及下级部门数据</option>
            <option value="self">仅本人数据</option>
            <option value="custom">自定义数据权限</option>
          </Select>
          <p class="text-gray-500 text-xs mt-1">
            控制该角色用户可以访问的数据范围
          </p>
        </div>
        
        <!-- 自定义数据权限 -->
        <div v-if="form.data_scope === 'custom'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            数据权限表达式
          </label>
          <Textarea
            v-model="form.data_permission_expression"
            placeholder="例如: user.department_id IN (1,2,3) OR user.id = current_user.id"
            rows="2"
            class="resize-none font-mono text-sm"
          />
          <p class="text-gray-500 text-xs mt-1">
            支持SQL WHERE条件表达式，可使用user、current_user等变量
          </p>
        </div>
      </div>
    </div>
    
    <!-- 角色层级 -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">角色层级</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 角色级别 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            角色级别
          </label>
          <Input
            v-model.number="form.level"
            type="number"
            placeholder="数字越小级别越高"
            min="1"
            max="10"
          />
          <p class="text-gray-500 text-xs mt-1">
            用于控制角色之间的层级关系，1为最高级别
          </p>
        </div>
        
        <!-- 最大用户数 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            最大用户数
          </label>
          <Input
            v-model.number="form.max_users"
            type="number"
            placeholder="0表示无限制"
            min="0"
          />
          <p class="text-gray-500 text-xs mt-1">
            限制该角色最多可分配给多少个用户
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
        {{ role ? '更新' : '创建' }}
      </Button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  role: {
    type: Object,
    default: null
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
  code: '',
  description: '',
  sort_order: 0,
  is_active: true,
  is_super_admin: false,
  data_scope: 'department',
  data_permission_expression: '',
  level: 5,
  max_users: 0
})

// 监听props变化
watch(() => props.role, (newRole) => {
  if (newRole) {
    // 编辑模式，填充表单数据
    form.value = {
      name: newRole.name || '',
      code: newRole.code || '',
      description: newRole.description || '',
      sort_order: newRole.sort_order || 0,
      is_active: newRole.is_active !== false,
      is_super_admin: newRole.is_super_admin || false,
      data_scope: newRole.data_scope || 'department',
      data_permission_expression: newRole.data_permission_expression || '',
      level: newRole.level || 5,
      max_users: newRole.max_users || 0
    }
  } else {
    // 创建模式，重置表单
    resetForm()
  }
}, { immediate: true })

// 方法
const resetForm = () => {
  form.value = {
    name: '',
    code: '',
    description: '',
    sort_order: 0,
    is_active: true,
    is_super_admin: false,
    data_scope: 'department',
    data_permission_expression: '',
    level: 5,
    max_users: 0
  }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}
  
  // 必填字段验证
  if (!form.value.name.trim()) {
    errors.value.name = '请输入角色名称'
  }
  
  if (!form.value.code.trim()) {
    errors.value.code = '请输入角色代码'
  } else {
    // 验证角色代码格式
    const codePattern = /^[a-z][a-z0-9_]*$/
    if (!codePattern.test(form.value.code)) {
      errors.value.code = '角色代码只能包含小写字母、数字和下划线，且必须以字母开头'
    }
  }
  
  // 级别验证
  if (form.value.level < 1 || form.value.level > 10) {
    errors.value.level = '角色级别必须在1-10之间'
  }
  
  // 最大用户数验证
  if (form.value.max_users < 0) {
    errors.value.max_users = '最大用户数不能为负数'
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
      sort_order: Number(form.value.sort_order) || 0,
      level: Number(form.value.level) || 5,
      max_users: Number(form.value.max_users) || 0
    }
    
    // 如果数据权限范围不是自定义，清空表达式
    if (submitData.data_scope !== 'custom') {
      submitData.data_permission_expression = null
    }
    
    emit('save', submitData)
  } catch (error) {
    console.error('提交表单失败:', error)
  } finally {
    loading.value = false
  }
}

// 自动生成角色代码
watch(() => form.value.name, (newName) => {
  if (newName && !props.role && !form.value.code) {
    // 只在创建模式且用户还没有手动输入代码时自动生成
    const code = newName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
    
    if (code) {
      form.value.code = code
    }
  }
})

// 根据是否为超级管理员自动调整设置
watch(() => form.value.is_super_admin, (isSuperAdmin) => {
  if (isSuperAdmin) {
    form.value.data_scope = 'all'
    form.value.level = 1
  }
})

// 初始化
onMounted(() => {
  if (!props.role) {
    resetForm()
  }
})
</script>