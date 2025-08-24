// ERP 系统数据库表结构类型定义

// 用户相关
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'employee' | 'viewer'
  department: string
  position: string
  status: 'active' | 'inactive'
  avatar_url?: string
  created_at: string
  updated_at: string
}

// 客户管理
export interface Customer {
  id: string
  customer_no: string
  name: string
  contact_person: string
  contact_phone?: string // 添加这个属性
  phone: string
  email?: string // 可选字段，因为创建时可能为null
  address?: string // 可选字段，因为创建时可能为null
  type: 'enterprise' | 'individual' | 'distributor'
  customer_type?: string // 添加这个属性以兼容旧代码
  region: string
  status: 'active' | 'inactive' | 'potential' | 'suspended' // 添加suspended状态
  credit_limit: number
  created_at: string
  updated_at: string
}

// 供应商管理
export interface Supplier {
  id: string
  supplier_no: string
  name: string
  contact_person: string
  contact_phone?: string // 添加这个属性
  phone: string
  email?: string // 可选字段，因为创建时可能为null
  address?: string // 可选字段，因为创建时可能为null
  type: 'raw_material' | 'equipment' | 'service' | 'logistics'
  supplier_type?: string // 添加这个属性以兼容旧代码
  rating: 'A' | 'B' | 'C' | 'D'
  status: 'active' | 'inactive' | 'suspended' | 'terminated' | 'potential'
  payment_terms: string
  region?: string // 添加这个属性
  created_at: string
  updated_at: string
}

// 商品管理
export interface Product {
  id: string
  product_no: string
  name: string
  description: string
  category: 'raw_material' | 'finished_product' | 'semi_finished' | 'accessory'
  specification: string
  unit: string
  unit_price: number
  cost_price: number
  min_stock: number
  max_stock: number
  current_stock: number // 添加当前库存字段
  barcode?: string // 添加条形码字段
  supplier_name?: string // 添加供应商名称字段
  status: 'active' | 'inactive' | 'discontinued'
  supplier_id?: string
  created_at: string
  updated_at: string
}

// 仓库管理
export interface Warehouse {
  id: string
  warehouse_no: string
  name: string
  type: 'main' | 'raw_material' | 'finished_goods' | 'backup'
  location: string
  manager: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// 库存管理
export interface Inventory {
  id: string
  product_id: string
  warehouse: string // 仓库名称
  warehouse_id?: string
  location?: string
  current_stock: number
  available_stock: number
  reserved_stock: number
  safety_stock: number
  max_stock?: number
  min_stock?: number
  unit_cost: number
  total_value: number
  last_updated: string
  created_at: string
  // 关联产品信息
  product?: {
    name: string
    product_no: string
    unit: string
  }
}

// 销售订单
export interface SalesOrder {
  id: string
  order_no: string
  customer_id: string
  order_date: string
  delivery_date: string
  status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  discount: number
  tax_amount: number
  final_amount: number
  remark: string
  created_by: string
  created_at: string
  updated_at: string
}

// 销售订单明细
export interface SalesOrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  discount: number
  amount: number
  delivered_quantity: number
  remark: string
  created_at: string
}

// 采购订单
export interface PurchaseOrder {
  id: string
  order_no: string
  supplier_id: string
  order_date: string
  expected_date: string
  status: 'draft' | 'confirmed' | 'received' | 'completed' | 'cancelled'
  total_amount: number
  discount: number
  tax_amount: number
  final_amount: number
  remark: string
  created_by: string
  created_at: string
  updated_at: string
}

// 采购订单明细
export interface PurchaseOrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  discount: number
  amount: number
  received_quantity: number
  remark: string
  created_at: string
}

// 库存变动记录
export interface InventoryMovement {
  id: string
  product_id: string
  warehouse_id: string
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment'
  business_type: 'sales' | 'purchase' | 'production' | 'adjustment' | 'transfer'
  reference_no: string
  quantity: number
  unit_price: number
  amount: number
  balance_stock: number
  remark: string
  created_by: string
  created_at: string
}

// 库存调拨
export interface Transfer {
  id: string
  transfer_no: string
  from_warehouse_id: string
  from_warehouse_name: string
  to_warehouse_id: string
  to_warehouse_name: string
  status: 'draft' | 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled'
  operator_name: string
  total_quantity: number
  created_at: Date
  remark: string
  items: TransferItem[]
}

// 调拨明细
export interface TransferItem {
  product_name: string
  current_stock: number
  transfer_quantity: number
  unit: string
}

// 部门管理
export interface Department {
  id: string
  name: string
  code: string
  parent_id?: string
  manager: string
  description: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// 角色管理
export interface Role {
  id: string
  name: string
  code: string
  description: string
  permissions: string[]
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// 数据字典
export interface Dictionary {
  id: string
  type: string
  code: string
  name: string
  value: string
  sort_order: number
  status: 'active' | 'inactive'
  remark: string
  created_at: string
  updated_at: string
}

// 系统日志
export interface SystemLog {
  id: string
  user_id: string
  action: string
  module: string
  details: string
  ip_address: string
  user_agent: string
  created_at: string
}

// 通用分页接口
export interface PaginationParams {
  page: number
  pageSize: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  orderBy?: { column: string, ascending: boolean }
  filters?: Record<string, any>
}

export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 通用API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
