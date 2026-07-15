// 通用列表响应
export interface ListResponse<T = unknown> {
  data: T[];
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total?: number;
  };
  success: boolean;
}

// 表单状态
export interface FormState {
  errors: Record<string, string>;
  loading: boolean;
  saving: boolean;
}

// 筛选条件基类
export interface BaseFilters {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  status?: string;
}

// 通用状态枚举
export enum Status {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Draft = "draft",
  Published = "published",
}

// 订单状态
export enum OrderStatus {
  Draft = "draft",
  Pending = "pending",
  Confirmed = "confirmed",
  InProgress = "in_progress",
  Completed = "completed",
  Cancelled = "cancelled",
}

// 支付状态
export enum PaymentStatus {
  Pending = "pending",
  Paid = "paid",
  Partial = "partial",
  Overdue = "overdue",
  Cancelled = "cancelled",
}

// 仓库类型
export enum WarehouseType {
  RawMaterials = "raw_materials",
  FinishedGoods = "finished_goods",
  SemiFinished = "semi_finished",
  Tools = "tools",
}

// 基础实体接口
export interface BaseEntity {
  created_at?: string;
  created_by?: string;
  id: number | string;
  updated_at?: string;
  updated_by?: string;
}

// 用户基础信息
export interface UserInfo {
  department?: string;
  email?: string;
  id: string;
  name: string;
  role?: string;
}

// 地址信息
export interface Address {
  city?: string;
  district?: string;
  fullAddress?: string;
  province?: string;
  street?: string;
  zipCode?: string;
}

// 联系信息
export interface ContactInfo {
  email?: string;
  fax?: string;
  mobile?: string;
  phone?: string;
  website?: string;
}

// 金额信息
export interface AmountInfo {
  amount: number;
  currency?: string;
  taxAmount?: number;
  taxRate?: number;
  totalAmount?: number;
}

// 表单验证相关类型
export type ValidationFunction = (value: any) => string | null;

export interface FormValidationRules {
  [field: string]: ValidationFunction[];
}

export interface ValidationResult {
  errors: Record<string, string>;
  isValid: boolean;
}
