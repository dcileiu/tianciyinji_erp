// 数据库表类型定义
// 从 supabase gen types typescript --project-id YOUR_PROJECT_ID 自动生成
// 手动添加的自定义类型

// 订单状态类型
export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

// 支付状态类型
export type PaymentStatus =
  | "pending"
  | "paid"
  | "partial"
  | "overdue"
  | "cancelled";

// 用户角色类型
export type UserRole = "admin" | "manager" | "employee" | "viewer";

// 仓库类型
export type WarehouseType =
  | "raw_materials"
  | "finished_goods"
  | "semi_finished"
  | "tools";

// 生产状态类型
export type ProductionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "paused";

// 导出所有需要的类型
export type {} from // 不再导出ProcessRoute和ProcessStep，因为它们未被使用
"./production";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      menus: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          path: string | null;
          parent_id: string | null;
          sort: number;
          status: string;
          permission: string | null;
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          path?: string | null;
          parent_id?: string | null;
          sort?: number;
          status?: string;
          permission?: string | null;
          type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string | null;
          path?: string | null;
          parent_id?: string | null;
          sort?: number;
          status?: string;
          permission?: string | null;
          type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menus_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          },
        ];
      };
      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          parent_id: string | null;
          manager_id: string | null;
          sort: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          parent_id?: string | null;
          manager_id?: string | null;
          sort?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          parent_id?: string | null;
          manager_id?: string | null;
          sort?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "departments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          code: string;
          name: string;
          category: string | null;
          specification: string | null;
          unit: string | null;
          price: number;
          cost: number;
          status: string;
          remark: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          category?: string | null;
          specification?: string | null;
          unit?: string | null;
          price?: number;
          cost?: number;
          status?: string;
          remark?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          category?: string | null;
          specification?: string | null;
          unit?: string | null;
          price?: number;
          cost?: number;
          status?: string;
          remark?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          code: string;
          name: string;
          contact_name: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          status: string;
          remark: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          contact_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          status?: string;
          remark?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          contact_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          status?: string;
          remark?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          code: string;
          name: string;
          contact_name: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          status: string;
          remark: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          contact_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          status?: string;
          remark?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          contact_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          status?: string;
          remark?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      warehouses: {
        Row: {
          id: string;
          code: string;
          name: string;
          type: string;
          address: string | null;
          status: string;
          remark: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          type?: string;
          address?: string | null;
          status?: string;
          remark?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          type?: string;
          address?: string | null;
          status?: string;
          remark?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          status: string;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          status?: string;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          status?: string;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users_role: {
        Row: {
          user_id: string;
          role_id: string;
          assigned_at: string;
          assigned_by: string | null;
        };
        Insert: {
          user_id: string;
          role_id: string;
          assigned_at?: string;
          assigned_by?: string | null;
        };
        Update: {
          user_id?: string;
          role_id?: string;
          assigned_at?: string;
          assigned_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_role_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_role_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      roles_menu: {
        Row: {
          role_id: string;
          menu_id: string;
          granted_at: string;
          granted_by: string | null;
        };
        Insert: {
          role_id: string;
          menu_id: string;
          granted_at?: string;
          granted_by?: string | null;
        };
        Update: {
          role_id?: string;
          menu_id?: string;
          granted_at?: string;
          granted_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "roles_menu_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roles_menu_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      user_menu_permissions: {
        Row: {
          user_id: string | null;
          menu_id: string | null;
          menu_name: string | null;
          menu_path: string | null;
          menu_permission: string | null;
          role_code: string | null;
          role_name: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_user_menu_tree: {
        Args: {
          p_user_id: string;
        };
        Returns: Json;
      };
      check_user_menu_permission: {
        Args: {
          p_user_id: string;
          p_menu_path: string;
        };
        Returns: boolean;
      };
      get_user_roles: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          role_id: string;
          role_code: string;
          role_name: string;
          role_description: string;
          assigned_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
