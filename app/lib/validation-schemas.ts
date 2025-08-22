import { z } from 'zod'

// 基础验证规则
export const commonSchemas = {
  // 必填字符串
  requiredString: (message = '此字段为必填项') => 
    z.string().min(1, message),
  
  // 邮箱
  email: (message = '请输入有效的邮箱地址') => 
    z.string().email(message),
  
  // 密码（至少8位，包含字母和数字）
  password: (message = '密码至少8位，需包含字母和数字') =>
    z.string()
      .min(8, '密码至少8位')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, message),
  
  // 手机号
  phone: (message = '请输入有效的手机号') =>
    z.string().regex(/^1[3-9]\d{9}$/, message),
  
  // URL
  url: (message = '请输入有效的URL') =>
    z.string().url(message),
  
  // 正整数
  positiveNumber: (message = '请输入大于0的数字') =>
    z.number().positive(message),
  
  // 非负数
  nonNegativeNumber: (message = '请输入大于等于0的数字') =>
    z.number().min(0, message),
  
  // 日期
  date: (message = '请选择有效日期') =>
    z.date({ message }),
  
  // 选择项（必选）
  requiredSelect: (message = '请选择一个选项') =>
    z.string().min(1, message),
}

// 用户相关 Schema
export const userSchemas = {
  // 用户注册
  register: z.object({
    name: commonSchemas.requiredString('请输入姓名'),
    email: commonSchemas.email(),
    password: commonSchemas.password(),
    confirmPassword: commonSchemas.requiredString('请确认密码'),
    department_id: commonSchemas.requiredSelect('请选择部门'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  }),
  
  // 用户登录
  login: z.object({
    email: commonSchemas.email(),
    password: commonSchemas.requiredString('请输入密码'),
  }),
  
  // 修改密码
  changePassword: z.object({
    currentPassword: commonSchemas.requiredString('请输入当前密码'),
    newPassword: commonSchemas.password(),
    confirmPassword: commonSchemas.requiredString('请确认新密码'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  }),
  
  // 用户信息编辑
  editProfile: z.object({
    name: commonSchemas.requiredString('请输入姓名'),
    email: commonSchemas.email(),
    phone: commonSchemas.phone().optional(),
    department_id: commonSchemas.requiredSelect('请选择部门'),
  }),
}

// 角色权限相关 Schema
export const roleSchemas = {
  // 创建角色
  createRole: z.object({
    name: commonSchemas.requiredString('请输入角色名称'),
    code: z.string()
      .min(1, '请输入角色代码')
      .regex(/^[A-Z_]+$/, '角色代码只能包含大写字母和下划线'),
    description: z.string().optional(),
  }),
  
  // 编辑角色
  editRole: z.object({
    name: commonSchemas.requiredString('请输入角色名称'),
    description: z.string().optional(),
  }),
}

// 菜单相关 Schema
export const menuSchemas = {
  // 创建菜单
  createMenu: z.object({
    name: commonSchemas.requiredString('请输入菜单名称'),
    title: commonSchemas.requiredString('请输入菜单标题'),
    icon: z.string().optional(),
    route: z.string().optional(),
    component: z.string().optional(),
    parent_id: z.string().uuid().optional(),
    sort_order: z.number().min(0, '排序必须大于等于0').optional(),
    is_hidden: z.boolean().optional(),
    is_external: z.boolean().optional(),
  }),
  
  // 编辑菜单
  editMenu: z.object({
    name: commonSchemas.requiredString('请输入菜单名称'),
    title: commonSchemas.requiredString('请输入菜单标题'),
    icon: z.string().optional(),
    route: z.string().optional(),
    component: z.string().optional(),
    sort_order: z.number().min(0, '排序必须大于等于0').optional(),
    is_hidden: z.boolean().optional(),
    is_external: z.boolean().optional(),
  }),
}

// 客户相关 Schema
export const customerSchemas = {
  // 创建客户
  createCustomer: z.object({
    name: commonSchemas.requiredString('请输入客户名称'),
    code: commonSchemas.requiredString('请输入客户编码'),
    contact_person: commonSchemas.requiredString('请输入联系人'),
    phone: commonSchemas.phone(),
    email: commonSchemas.email().optional(),
    address: z.string().optional(),
    credit_limit: commonSchemas.nonNegativeNumber().optional(),
    payment_terms: z.string().optional(),
  }),
}

// 产品相关 Schema
export const productSchemas = {
  // 创建产品
  createProduct: z.object({
    name: commonSchemas.requiredString('请输入产品名称'),
    code: commonSchemas.requiredString('请输入产品编码'),
    category_id: commonSchemas.requiredSelect('请选择产品分类'),
    unit: commonSchemas.requiredString('请输入计量单位'),
    price: commonSchemas.positiveNumber('请输入产品价格'),
    cost: commonSchemas.nonNegativeNumber().optional(),
    description: z.string().optional(),
    specifications: z.string().optional(),
  }),
}

// 订单相关 Schema
export const orderSchemas = {
  // 创建销售订单
  createSalesOrder: z.object({
    customer_id: commonSchemas.requiredSelect('请选择客户'),
    order_date: commonSchemas.date(),
    delivery_date: commonSchemas.date(),
    payment_terms: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      product_id: commonSchemas.requiredSelect('请选择产品'),
      quantity: commonSchemas.positiveNumber('请输入数量'),
      unit_price: commonSchemas.positiveNumber('请输入单价'),
    })).min(1, '至少需要一个订单项'),
  }),
  
  // 创建采购订单
  createPurchaseOrder: z.object({
    supplier_id: commonSchemas.requiredSelect('请选择供应商'),
    order_date: commonSchemas.date(),
    expected_date: commonSchemas.date(),
    payment_terms: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      product_id: commonSchemas.requiredSelect('请选择产品'),
      quantity: commonSchemas.positiveNumber('请输入数量'),
      unit_price: commonSchemas.positiveNumber('请输入单价'),
    })).min(1, '至少需要一个订单项'),
  }),
}

// 库存相关 Schema
export const inventorySchemas = {
  // 库存调整
  adjustInventory: z.object({
    product_id: commonSchemas.requiredSelect('请选择产品'),
    warehouse_id: commonSchemas.requiredSelect('请选择仓库'),
    adjustment_type: z.enum(['increase', 'decrease'], {
      message: '请选择调整类型'
    }),
    quantity: commonSchemas.positiveNumber('请输入调整数量'),
    reason: commonSchemas.requiredString('请输入调整原因'),
    notes: z.string().optional(),
  }),
} 