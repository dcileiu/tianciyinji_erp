export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  
  // 公开路由，无需权限检查
  const publicRoutes = [
    '/login',
    '/register', 
    '/forgot-password',
    '/auth/callback',
    '/auth/reset-password',
    '/',
    '/components-demo'
  ]
  
  // 如果是公开路由，直接通过
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // 检查用户是否已登录
  if (!user.value) {
    return navigateTo('/login')
  }
  
  // TODO: 在这里可以添加更详细的权限检查
  // 当前先确保用户已登录即可访问
  // 具体的页面权限检查可以在页面组件中实现
})

// 路由权限映射 - 供页面组件使用
export const ROUTE_PERMISSIONS = {
  '/users': ['user:list'],
  '/system/users': ['user:list'],
  '/system/roles': ['role:list'],
  '/system/menus': ['menu:list'],
  '/system/resources': ['resource:list'],
  '/system/permissions': ['permission:list'],
  '/master-data/customers': ['customer:list'],
  '/master-data/suppliers': ['supplier:list'],
  '/master-data/products': ['product:list'],
  '/warehouse/inventory': ['inventory:list'],
  '/sales/orders': ['sales-order:list'],
  '/purchase/orders': ['purchase-order:list'],
  '/production/plans': ['production-plan:list'],
  '/reports/sales': ['report:sales'],
  '/reports/purchase': ['report:purchase'],
  '/reports/production': ['report:production'],
  '/reports/inventory': ['report:inventory']
} as const 
