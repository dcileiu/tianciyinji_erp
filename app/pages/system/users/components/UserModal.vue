<template>
  <Dialog :open="open" @update:open="$emit('close')">
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
              :model-value="formData.username"
              @update:model-value="formData.username = $event as string"
              placeholder="请输入用户名"
              :disabled="isEditing"
            />
          </div>
          <div class="space-y-2">
            <Label>姓名 *</Label>
            <Input
              :model-value="formData.name"
              @update:model-value="formData.name = $event as string"
              placeholder="请输入姓名"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>邮箱 *</Label>
            <Input
              :model-value="formData.email"
              @update:model-value="formData.email = $event as string"
              type="email"
              placeholder="请输入邮箱地址"
            />
          </div>
          <div class="space-y-2">
            <Label>手机号</Label>
            <Input
              :model-value="formData.phone"
              @update:model-value="formData.phone = $event as string"
              placeholder="请输入手机号"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>所属部门</Label>
            <Select
              :model-value="formData.department_id"
              @update:model-value="formData.department_id = $event as string"
            >
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
            <Select
              :model-value="formData.role_id"
              @update:model-value="formData.role_id = $event as string"
            >
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
              :model-value="formData.password"
              @update:model-value="formData.password = $event as string"
              type="password"
              placeholder="请输入密码"
            />
          </div>
          <div class="space-y-2">
            <Label>确认密码 *</Label>
            <Input
              :model-value="formData.confirmPassword"
              @update:model-value="formData.confirmPassword = $event as string"
              type="password"
              placeholder="请确认密码"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label>备注</Label>
          <Textarea
            :model-value="formData.remarks"
            @update:model-value="formData.remarks = $event as string"
            placeholder="请输入备注信息..."
            :rows="3"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('close')">取消</Button>
        <Button :disabled="saving" @click="handleSave">
          <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
          {{ isEditing ? "更新用户" : "创建用户" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Loader2, Users } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { UserData } from '~/composables/useUsers'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  user?: UserData | null
  departments: any[]
  roles: any[]
  saving: boolean
}

interface FormData {
  id: string
  username: string
  name: string
  email: string
  phone: string
  department_id: string
  role_id: string
  password: string
  confirmPassword: string
  remarks: string
  status: 'active' | 'inactive'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: FormData]
}>()

const isEditing = computed(() => !!props.user)
const modalTitle = computed(() => isEditing.value ? '编辑用户' : '新增用户')

const formData = reactive<FormData>({
  id: '',
  username: '',
  name: '',
  email: '',
  phone: '',
  department_id: '',
  role_id: '',
  password: '',
  confirmPassword: '',
  remarks: '',
  status: 'active'
})

// 监听用户变化，初始化表单数据
watch(() => props.user, (user) => {
  if (user) {
    Object.assign(formData, {
      id: user.id,
      username: user.username || '',
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      department_id: user.department_id || '',
      role_id: user.roles?.[0]?.id || '',
      password: '',
      confirmPassword: '',
      remarks: user.remarks || '',
      status: user.status
    })
  } else {
    // 重置表单
    Object.assign(formData, {
      id: '',
      username: '',
      name: '',
      email: '',
      phone: '',
      department_id: '',
      role_id: '',
      password: '',
      confirmPassword: '',
      remarks: '',
      status: 'active'
    })
  }
}, { immediate: true })

const handleSave = () => {
  // 验证必填字段
  if (!formData.username || !formData.name || !formData.email) {
    toast.error('请填写必填字段')
    return
  }

  if (!isEditing.value && formData.password !== formData.confirmPassword) {
    toast.error('两次输入的密码不一致')
    return
  }

  if (!formData.role_id) {
    toast.error('请选择用户角色')
    return
  }

  emit('save', { ...formData })
}
</script>
