// ERP 系统数据库表结构类型定义

// 用户相关
export interface DatabaseUser {
  avatar_url?: string;
  created_at: string;
  department: string;
  email: string;
  id: string;
  name: string;
  position: string;
  role: "admin" | "manager" | "employee" | "viewer";
  status: "active" | "inactive";
  updated_at: string;
}

// 客户管理
export interface Customer {
  address?: string; // 可选字段，因为创建时可能为null
  contact_person: string;
  contact_phone?: string; // 添加这个属性
  created_at: string;
  credit_limit: number;
  customer_no: string;
  customer_type?: string; // 添加这个属性以兼容旧代码
  email?: string; // 可选字段，因为创建时可能为null
  id: string;
  name: string;
  phone: string;
  region: string;
  status: "active" | "inactive" | "potential" | "suspended"; // 添加suspended状态
  type: "enterprise" | "individual" | "distributor";
  updated_at: string;
}

// 供应商管理
export interface Supplier {
  address?: string; // 可选字段，因为创建时可能为null
  contact_person: string;
  contact_phone?: string; // 添加这个属性
  created_at: string;
  email?: string; // 可选字段，因为创建时可能为null
  id: string;
  name: string;
  payment_terms: string;
  phone: string;
  rating: "A" | "B" | "C" | "D";
  region?: string; // 添加这个属性
  status: "active" | "inactive" | "suspended" | "terminated" | "potential";
  supplier_no: string;
  supplier_type?: string; // 添加这个属性以兼容旧代码
  type: "raw_material" | "equipment" | "service" | "logistics";
  updated_at: string;
}

// 商品管理
export interface Product {
  barcode?: string; // 添加条形码字段
  category: "raw_material" | "finished_product" | "semi_finished" | "accessory";
  cost_price: number;
  created_at: string;
  current_stock: number; // 添加当前库存字段
  description: string;
  id: string;
  max_stock: number;
  min_stock: number;
  name: string;
  product_no: string;
  specification: string;
  status: "active" | "inactive" | "discontinued";
  supplier_id?: string;
  supplier_name?: string; // 添加供应商名称字段
  unit: string;
  unit_price: number;
  updated_at: string;
}

// 仓库管理
export interface Warehouse {
  created_at: string;
  id: string;
  location: string;
  manager: string;
  name: string;
  status: "active" | "inactive";
  type: "main" | "raw_material" | "finished_goods" | "backup";
  updated_at: string;
  warehouse_no: string;
}

// 库存管理
export interface Inventory {
  available_stock: number;
  created_at: string;
  current_stock: number;
  id: string;
  last_updated: string;
  location?: string;
  max_stock?: number;
  min_stock?: number;
  // 关联产品信息
  product?: {
    name: string;
    product_no: string;
    unit: string;
  };
  product_id: string;
  reserved_stock: number;
  safety_stock: number;
  total_value: number;
  unit_cost: number;
  warehouse: string; // 仓库名称
  warehouse_id?: string;
}

// 销售订单
export interface SalesOrder {
  created_at: string;
  created_by: string;
  customer_id: string;
  delivery_date: string;
  discount: number;
  final_amount: number;
  id: string;
  order_date: string;
  order_no: string;
  remark: string;
  status: "draft" | "confirmed" | "shipped" | "delivered" | "cancelled";
  tax_amount: number;
  total_amount: number;
  updated_at: string;
}

// 销售订单明细
export interface SalesOrderItem {
  amount: number;
  created_at: string;
  delivered_quantity: number;
  discount: number;
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  remark: string;
  unit_price: number;
}

// 采购订单
export interface PurchaseOrder {
  created_at: string;
  created_by: string;
  discount: number;
  expected_date: string;
  final_amount: number;
  id: string;
  order_date: string;
  order_no: string;
  remark: string;
  status: "draft" | "confirmed" | "received" | "completed" | "cancelled";
  supplier_id: string;
  tax_amount: number;
  total_amount: number;
  updated_at: string;
}

// 采购订单明细
export interface PurchaseOrderItem {
  amount: number;
  created_at: string;
  discount: number;
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  received_quantity: number;
  remark: string;
  unit_price: number;
}

// 库存变动记录
export interface InventoryMovement {
  amount: number;
  balance_stock: number;
  business_type:
    | "sales"
    | "purchase"
    | "production"
    | "adjustment"
    | "transfer";
  created_at: string;
  created_by: string;
  id: string;
  movement_type: "in" | "out" | "transfer" | "adjustment";
  product_id: string;
  quantity: number;
  reference_no: string;
  remark: string;
  unit_price: number;
  warehouse_id: string;
}

// 库存调拨
export interface Transfer {
  created_at: Date;
  from_warehouse_id: string;
  from_warehouse_name: string;
  id: string;
  items: TransferItem[];
  operator_name: string;
  remark: string;
  status:
    | "draft"
    | "pending"
    | "approved"
    | "in_transit"
    | "completed"
    | "cancelled";
  to_warehouse_id: string;
  to_warehouse_name: string;
  total_quantity: number;
  transfer_no: string;
}

// 调拨明细
export interface TransferItem {
  current_stock: number;
  product_name: string;
  transfer_quantity: number;
  unit: string;
}

// 部门管理
export interface Department {
  code: string;
  created_at: string;
  description: string;
  id: string;
  manager: string;
  name: string;
  parent_id?: string;
  status: "active" | "inactive";
  updated_at: string;
}

// 角色管理
export interface Role {
  code: string;
  created_at: string;
  description: string;
  id: string;
  name: string;
  permissions: string[];
  status: "active" | "inactive";
  updated_at: string;
}

// 数据字典
export interface Dictionary {
  code: string;
  created_at: string;
  id: string;
  name: string;
  remark: string;
  sort_order: number;
  status: "active" | "inactive";
  type: string;
  updated_at: string;
  value: string;
}

// 系统日志
export interface SystemLog {
  action: string;
  created_at: string;
  details: string;
  id: string;
  ip_address: string;
  module: string;
  user_agent: string;
  user_id: string;
}

// 通用分页接口
export interface PaginationParams {
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending: boolean };
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 通用API响应接口
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}
