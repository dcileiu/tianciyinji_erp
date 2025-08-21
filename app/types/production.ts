// 生产相关类型定义

// 生产订单
export interface ProductionOrder {
  id: string
  order_no: string
  product_id: string
  quantity: number
  planned_start_date: string
  planned_end_date: string
  actual_start_date?: string
  actual_end_date?: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  workshop_id: string
  bom_id?: string
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

// 生产计划
export interface ProductionPlan {
  id: string
  plan_no: string
  name: string
  plan_name?: string  // 添加这个属性以兼容旧代码
  description?: string
  start_date: string
  end_date: string
  period_type?: string  // 添加这个属性
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'cancelled'
  workshop_id: string
  planned_capacity: number
  planned_quantity?: number  // 添加这个属性
  target_quantity?: number   // 添加这个属性
  actual_capacity?: number
  progress: number
  notes?: string  // 添加这个属性
  created_by: string
  created_at: string
  updated_at: string
}

// 工艺路线
export interface ProcessRoute {
  id: string
  name: string
  product_id: string
  version: string
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}

// 工艺步骤
export interface ProcessStep {
  id: string
  route_id: string
  step_no: number
  name: string
  description?: string
  workshop_id: string
  equipment_id?: string
  standard_time: number
  setup_time: number
  created_at: string
}

// 车间
export interface Workshop {
  id: string
  name: string
  code: string
  type: 'production' | 'assembly' | 'packaging' | 'quality'
  manager: string
  capacity: number
  status: 'active' | 'inactive' | 'maintenance'
  location: string
  description?: string
  created_at: string
  updated_at: string
} 