import type { DirectiveBinding } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  // 权限指令
  const permissionDirective = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      checkPermission(el, binding)
    },
    updated(el: HTMLElement, binding: DirectiveBinding) {
      checkPermission(el, binding)
    }
  }

  // 角色指令
  const roleDirective = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      checkRole(el, binding)
    },
    updated(el: HTMLElement, binding: DirectiveBinding) {
      checkRole(el, binding)
    }
  }

  /**
   * 检查权限并控制元素显示/隐藏
   */
  function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()
    const { value, modifiers } = binding

    let hasAccess = true

    if (!value) {
      return // 没有权限要求，直接显示
    }

    if (typeof value === 'string') {
      // 单个权限
      hasAccess = hasPermission(value)
    } else if (Array.isArray(value)) {
      // 多个权限
      if (modifiers.all) {
        // 需要全部权限
        hasAccess = hasAllPermissions(value)
      } else {
        // 任意一个权限即可（默认）
        hasAccess = hasAnyPermission(value)
      }
    }

    // 控制元素显示/隐藏
    if (hasAccess) {
      el.style.display = ''
      el.removeAttribute('disabled')
    } else {
      if (modifiers.hide) {
        // 完全隐藏元素
        el.style.display = 'none'
      } else if (modifiers.disable) {
        // 禁用但保持可见
        el.setAttribute('disabled', 'true')
        el.style.opacity = '0.5'
        el.style.cursor = 'not-allowed'
      } else {
        // 默认行为：隐藏
        el.style.display = 'none'
      }
    }
  }

  /**
   * 检查角色并控制元素显示/隐藏
   */
  function checkRole(el: HTMLElement, binding: DirectiveBinding) {
    const { roles } = usePermissions()
    const { value, modifiers } = binding

    let hasAccess = true

    if (!value) {
      return
    }

    const userRoleCodes = roles.value.map((role: any) => role.code)

    if (typeof value === 'string') {
      hasAccess = userRoleCodes.includes(value)
    } else if (Array.isArray(value)) {
      if (modifiers.all) {
        hasAccess = value.every(role => userRoleCodes.includes(role))
      } else {
        hasAccess = value.some(role => userRoleCodes.includes(role))
      }
    }

    // 控制元素显示/隐藏
    if (hasAccess) {
      el.style.display = ''
      el.removeAttribute('disabled')
    } else {
      if (modifiers.hide) {
        el.style.display = 'none'
      } else if (modifiers.disable) {
        el.setAttribute('disabled', 'true')
        el.style.opacity = '0.5'
        el.style.cursor = 'not-allowed'
      } else {
        el.style.display = 'none'
      }
    }
  }

  // 注册指令
  nuxtApp.vueApp.directive('permission', permissionDirective)
  nuxtApp.vueApp.directive('role', roleDirective)
})
