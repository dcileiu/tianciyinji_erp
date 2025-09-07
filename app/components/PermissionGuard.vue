<template>
  <div v-if="hasAccess" :class="wrapperClass">
    <slot />
  </div>
  <div v-else-if="showFallback" :class="fallbackClass">
    <slot name="fallback">
      <div class="flex items-center justify-center p-4 text-gray-500">
        <Icon name="Lock" class="w-5 h-5 mr-2" />
        <span>{{ fallbackMessage }}</span>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // 权限要求
  permission?: string | string[];
  // 角色要求
  role?: string | string[];
  // 权限模式：'any' 任意一个满足 | 'all' 全部满足
  mode?: 'any' | 'all';
  // 是否显示无权限提示
  showFallback?: boolean;
  // 无权限时的提示消息
  fallbackMessage?: string;
  // 包装器样式类
  wrapperClass?: string;
  // 无权限提示样式类
  fallbackClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'any',
  showFallback: false,
  fallbackMessage: '您没有权限访问此内容',
  wrapperClass: '',
  fallbackClass: 'text-center',
});

const { hasPermission, hasAnyPermission, hasAllPermissions, roles } =
  usePermissions();
const permissionsStore = usePermissionsStore();

/**
 * 检查权限访问
 */
const hasAccess = computed(() => {
  // 如果声明了权限或角色，但权限还未加载完成，则暂不展示内容
  const needsCheck = !!props.permission || !!props.role;
  if (needsCheck && !permissionsStore.loaded) {
    return false;
  }
  // 检查权限
  if (props.permission) {
    if (typeof props.permission === 'string') {
      if (!hasPermission(props.permission)) {
        return false;
      }
    } else if (Array.isArray(props.permission)) {
      const hasPermissionAccess =
        props.mode === 'all'
          ? hasAllPermissions(props.permission)
          : hasAnyPermission(props.permission);

      if (!hasPermissionAccess) {
        return false;
      }
    }
  }

  // 检查角色
  if (props.role) {
    const userRoleCodes = roles.value.map((role: any) => role.code);

    if (typeof props.role === 'string') {
      if (!userRoleCodes.includes(props.role)) {
        return false;
      }
    } else if (Array.isArray(props.role)) {
      const hasRoleAccess =
        props.mode === 'all'
          ? props.role.every((role) => userRoleCodes.includes(role))
          : props.role.some((role) => userRoleCodes.includes(role));

      if (!hasRoleAccess) {
        return false;
      }
    }
  }

  return true;
});
</script>
