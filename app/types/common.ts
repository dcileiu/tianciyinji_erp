// 通用分页参数
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 通用响应结构
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 通用列表响应
export interface ListResponse<T = unknown> {
  success: boolean
  data: T[]
  pagination?: PaginationParams
  message?: string
  error?: string
}

// 表单状态
export interface FormState {
  loading: boolean
  saving: boolean
  errors: Record<string, string>
}

// 筛选条件基类
export interface BaseFilters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

// 通用状态枚举
export enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Draft = 'draft',
  Published = 'published'
}

// 订单状态
export enum OrderStatus {
  Draft = 'draft',
  Pending = 'pending',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

// 支付状态
export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Partial = 'partial',
  Overdue = 'overdue',
  Cancelled = 'cancelled'
}

// 仓库类型
export enum WarehouseType {
  RawMaterials = 'raw_materials',
  FinishedGoods = 'finished_goods',
  SemiFinished = 'semi_finished',
  Tools = 'tools'
}

// 基础实体接口
export interface BaseEntity {
  id: number | string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

// 用户基础信息
export interface UserInfo {
  id: string
  name: string
  email?: string
  role?: string
  department?: string
}

// 地址信息
export interface Address {
  province?: string
  city?: string
  district?: string
  street?: string
  zipCode?: string
  fullAddress?: string
}

// 联系信息
export interface ContactInfo {
  phone?: string
  mobile?: string
  fax?: string
  email?: string
  website?: string
}

// 金额信息
export interface AmountInfo {
  amount: number
  currency?: string
  taxRate?: number
  taxAmount?: number
  totalAmount?: number
}

// 表单验证相关类型
export interface ValidationFunction {
  (value: any): string | null
}

export interface FormValidationRules {
  [field: string]: ValidationFunction[]
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
} 
