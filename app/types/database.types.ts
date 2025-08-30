// 数据库表类型定义
// 从 supabase gen types typescript --project-id YOUR_PROJECT_ID 自动生成
// 手动添加的自定义类型

// 订单状态类型
export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// 支付状态类型
export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'cancelled';

// 用户角色类型
export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

// 仓库类型
export type WarehouseType =
  | 'raw_materials'
  | 'finished_goods'
  | 'semi_finished'
  | 'tools';

// 生产状态类型
export type ProductionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'paused';

// 导出所有需要的类型
export type { } from // 不再导出ProcessRoute和ProcessStep，因为它们未被使用
  './production'

// 数据库表结构类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          department_id?: string;
          position_id?: string;
          phone?: string;
          avatar?: string;
          status: 'active' | 'inactive';
          last_login?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: UserRole;
          department_id?: string;
          position_id?: string;
          phone?: string;
          avatar?: string;
          status?: 'active' | 'inactive';
          last_login?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          department_id?: string;
          position_id?: string;
          phone?: string;
          avatar?: string;
          status?: 'active' | 'inactive';
          last_login?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      menus: {
        Row: {
          id: string;
          name: string;
          icon?: string | null;
          path?: string | null;
          parent_id: string; // '0' 表示根菜单
          sort: number;
          status: 'active' | 'inactive';
          permission?: string | null;
          type: 'directory' | 'menu' | 'permission';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          path?: string | null;
          parent_id?: string; // 默认为 '0'
          sort?: number;
          status?: 'active' | 'inactive';
          permission?: string | null;
          type?: 'directory' | 'menu' | 'permission';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string | null;
          path?: string | null;
          parent_id?: string;
          sort?: number;
          status?: 'active' | 'inactive';
          permission?: string | null;
          type?: 'directory' | 'menu' | 'permission';
          created_at?: string;
          updated_at?: string;
        };
      };

      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          manager_id?: string;
          parent_id?: string;
          level: number;
          description?: string;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          manager_id?: string;
          parent_id?: string;
          level?: number;
          description?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          manager_id?: string;
          parent_id?: string;
          level?: number;
          description?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };

      positions: {
        Row: {
          id: string;
          name: string;
          code: string;
          department_id: string;
          level: number;
          description?: string;
          requirements?: string;
          salary_range?: string;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          department_id: string;
          level?: number;
          description?: string;
          requirements?: string;
          salary_range?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          department_id?: string;
          level?: number;
          description?: string;
          requirements?: string;
          salary_range?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };

      roles: {
        Row: {
          id: string;
          name: string;
          code: string;
          description?: string;
          permissions: string[];
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string;
          permissions?: string[];
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string;
          permissions?: string[];
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };

      permissions: {
        Row: {
          id: string;
          name: string;
          code: string;
          resource: string;
          action: string;
          description?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          resource: string;
          action: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          resource?: string;
          action?: string;
          description?: string;
          created_at?: string;
        };
      };

      customers: {
        Row: {
          id: string;
          customer_no: string;
          name: string;
          contact_person: string;
          contact_phone: string;
          email?: string;
          address?: string;
          customer_type: 'enterprise' | 'individual' | 'government' | 'other';
          region: string;
          credit_limit?: number;
          payment_terms?: string;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_no: string;
          name: string;
          contact_person: string;
          contact_phone: string;
          email?: string;
          address?: string;
          customer_type: 'enterprise' | 'individual' | 'government' | 'other';
          region: string;
          credit_limit?: number;
          payment_terms?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_no?: string;
          name?: string;
          contact_person?: string;
          contact_phone?: string;
          email?: string;
          address?: string;
          customer_type?: 'enterprise' | 'individual' | 'government' | 'other';
          region?: string;
          credit_limit?: number;
          payment_terms?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };

      suppliers: {
        Row: {
          id: string;
          supplier_no: string;
          name: string;
          contact_person: string;
          contact_phone: string;
          email?: string;
          address?: string;
          supplier_type: 'manufacturer' | 'distributor' | 'service' | 'other';
          rating?: 'A' | 'B' | 'C' | 'D';
          payment_terms?: string;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_no: string;
          name: string;
          contact_person: string;
          contact_phone: string;
          email?: string;
          address?: string;
          supplier_type: 'manufacturer' | 'distributor' | 'service' | 'other';
          rating?: 'A' | 'B' | 'C' | 'D';
          payment_terms?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_no?: string;
          name?: string;
          contact_person?: string;
          contact_phone?: string;
          email?: string;
          address?: string;
          supplier_type?: 'manufacturer' | 'distributor' | 'service' | 'other';
          rating?: 'A' | 'B' | 'C' | 'D';
          payment_terms?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };

      products: {
        Row: {
          id: string;
          product_code: string;
          name: string;
          category: string;
          specification?: string;
          unit: string;
          cost_price?: number;
          selling_price?: number;
          min_stock?: number;
          max_stock?: number;
          current_stock?: number;
          status: 'active' | 'inactive' | 'discontinued';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_code: string;
          name: string;
          category: string;
          specification?: string;
          unit: string;
          cost_price?: number;
          selling_price?: number;
          min_stock?: number;
          max_stock?: number;
          current_stock?: number;
          status?: 'active' | 'inactive' | 'discontinued';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_code?: string;
          name?: string;
          category?: string;
          specification?: string;
          unit?: string;
          cost_price?: number;
          selling_price?: number;
          min_stock?: number;
          max_stock?: number;
          current_stock?: number;
          status?: 'active' | 'inactive' | 'discontinued';
          created_at?: string;
          updated_at?: string;
        };
      };

      warehouses: {
        Row: {
          id: string;
          name: string;
          code: string;
          type: WarehouseType;
          location: string;
          manager: string;
          capacity?: number;
          status: 'active' | 'inactive';
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          type: WarehouseType;
          location: string;
          manager: string;
          capacity?: number;
          status?: 'active' | 'inactive';
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          type?: WarehouseType;
          location?: string;
          manager?: string;
          capacity?: number;
          status?: 'active' | 'inactive';
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      inventory: {
        Row: {
          id: string;
          product_id: string;
          warehouse_id: string;
          quantity: number;
          reserved_quantity?: number;
          available_quantity: number;
          last_updated: string;
          batch_no?: string;
          expiry_date?: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          warehouse_id: string;
          quantity: number;
          reserved_quantity?: number;
          available_quantity?: number;
          last_updated?: string;
          batch_no?: string;
          expiry_date?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          warehouse_id?: string;
          quantity?: number;
          reserved_quantity?: number;
          available_quantity?: number;
          last_updated?: string;
          batch_no?: string;
          expiry_date?: string;
        };
      };

      system_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource: string;
          resource_id?: string;
          details?: string;
          ip_address?: string;
          user_agent?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource: string;
          resource_id?: string;
          details?: string;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource?: string;
          resource_id?: string;
          details?: string;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
      };

      workshops: {
        Row: {
          id: string;
          code: string;
          name: string;
          type: string;
          status: string;
          manager: string;
          equipment_count: number;
          capacity: number;
          utilization: number;
          location: string;
          description: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          type: string;
          status?: string;
          manager: string;
          equipment_count?: number;
          capacity: number;
          utilization?: number;
          location: string;
          description?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          type?: string;
          status?: string;
          manager?: string;
          equipment_count?: number;
          capacity?: number;
          utilization?: number;
          location?: string;
          description?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
