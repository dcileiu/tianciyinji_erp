import { defineStore } from 'pinia';

// 用户扩展信息接口
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  department_id?: string;
  position_id?: string;
  status: 'active' | 'inactive';
  remarks?: string;
  is_online: boolean;
  login_count: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  // 关联数据
  department?: {
    id: string;
    name: string;
    code: string;
  };
  position?: {
    id: string;
    name: string;
    code: string;
  };
  roles: Array<{
    id: string;
    name: string;
    code: string;
    description?: string;
  }>;
}

// 用户状态接口
interface UserState {
  // 基础认证信息
  authUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 用户详细信息
  profile: UserProfile | null;

  // 权限相关
  permissions: string[];
  roles: string[];

  // 状态管理
  profileLoading: boolean;
  permissionsLoading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    // 基础认证
    authUser: null,
    isAuthenticated: false,
    isLoading: true,

    // 用户详细信息
    profile: null,

    // 权限数据
    permissions: [],
    roles: [],

    // 加载状态
    profileLoading: false,
    permissionsLoading: false,
    error: null,
  }),

  getters: {
    /**
     * 用户显示名称
     */
    displayName: (state): string => {
      return (
        state.profile?.name ||
        state.profile?.username ||
        state.authUser?.email?.split('@')[0] ||
        '未知用户'
      );
    },

    /**
     * 用户头像
     */
    userAvatar: (state): string => {
      return (
        state.profile?.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.authUser?.id}`
      );
    },

    /**
     * 是否为管理员
     */
    isAdmin: (state): boolean => {
      return (
        state.roles.includes('admin') || state.roles.includes('super_admin')
      );
    },

    /**
     * 用户部门信息
     */
    userDepartment: (state): string => {
      return state.profile?.department?.name || '未分配部门';
    },

    /**
     * 用户角色列表
     */
    userRoles: (state): string[] => {
      return state.profile?.roles?.map((role) => role.name) || [];
    },

    /**
     * 检查是否有特定权限
     */
    hasPermission:
      (state) =>
      (permission: string): boolean => {
        if (!permission) {
          return true;
        }
        if (state.roles.includes('super_admin')) {
          return true; // 超级管理员拥有所有权限
        }
        return state.permissions.includes(permission);
      },

    /**
     * 检查是否有任意一个权限
     */
    hasAnyPermission:
      (state) =>
      (checkPermissions: string[]): boolean => {
        if (!checkPermissions || checkPermissions.length === 0) {
          return true;
        }
        if (state.roles.includes('super_admin')) {
          return true;
        }
        return checkPermissions.some((permission) =>
          state.permissions.includes(permission)
        );
      },

    /**
     * 检查是否有所有权限
     */
    hasAllPermissions:
      (state) =>
      (checkPermissions: string[]): boolean => {
        if (!checkPermissions || checkPermissions.length === 0) {
          return true;
        }
        if (state.roles.includes('super_admin')) {
          return true;
        }
        return checkPermissions.every((permission) =>
          state.permissions.includes(permission)
        );
      },

    /**
     * 检查是否有特定角色
     */
    hasRole:
      (state) =>
      (role: string): boolean => {
        return state.roles.includes(role);
      },
  },

  actions: {
    /**
     * 设置认证用户
     */
    setAuthUser(user: User | null) {
      this.authUser = user;
      this.isAuthenticated = !!user;
      this.isLoading = false;

      if (!user) {
        this.clearUserData();
      }
    },

    /**
     * 获取用户详细信息
     */
    async fetchUserProfile(): Promise<void> {
      if (!this.authUser) {
        return;
      }

      // 如果已有用户信息且不是强制刷新，直接返回
      if (this.profile && !this.profileLoading) {
        return;
      }

      try {
        this.profileLoading = true;
        this.error = null;

        const response = await $fetch<{
          code: number;
          data: UserProfile;
          message: string;
        }>('/api/user', {
          query: { action: 'profile' },
        });

        if (response.code === 0) {
          this.profile = response.data;
          // 提取角色信息
          this.roles = response.data.roles?.map((role) => role.code) || [];
        } else {
          throw new Error(response.message || '获取用户信息失败');
        }
      } catch (err: any) {
        this.error = err.message || '获取用户信息失败';
      } finally {
        this.profileLoading = false;
      }
    },

    /**
     * 获取用户权限列表
     */
    async fetchUserPermissions(): Promise<void> {
      if (!this.authUser) {
        return;
      }

      // 如果已有权限数据且不是强制刷新，直接返回
      if (this.permissions.length > 0 && !this.permissionsLoading) {
        return;
      }

      try {
        this.permissionsLoading = true;
        this.error = null;

        const response = await $fetch<{
          code: number;
          data: string[];
          message: string;
        }>('/api/user', {
          query: { action: 'permissions' },
        });

        if (response.code === 0) {
          this.permissions = response.data || [];
        } else {
          throw new Error(response.message || '获取用户权限失败');
        }
      } catch (err: any) {
        this.error = err.message || '获取用户权限失败';
        this.permissions = [];
      } finally {
        this.permissionsLoading = false;
      }
    },

    /**
     * 初始化用户数据 - 获取用户信息和权限
     */
    async initializeUserData(): Promise<void> {
      if (!this.authUser) {
        return;
      }

      // 并行获取用户信息和权限数据
      await Promise.all([this.fetchUserProfile(), this.fetchUserPermissions()]);
    },

    /**
     * 刷新用户数据
     */
    async refreshUserData(): Promise<void> {
      // 清空现有数据，强制重新获取
      this.profile = null;
      this.permissions = [];
      this.roles = [];

      await this.initializeUserData();
    },

    /**
     * 更新用户信息
     */
    updateProfile(profileData: Partial<UserProfile>) {
      if (this.profile) {
        this.profile = { ...this.profile, ...profileData };
      }
    },

    /**
     * 清空用户数据
     */
    clearUserData() {
      this.profile = null;
      this.permissions = [];
      this.roles = [];
      this.error = null;
      this.profileLoading = false;
      this.permissionsLoading = false;
    },

    /**
     * 用户登出
     */
    logout() {
      this.authUser = null;
      this.isAuthenticated = false;
      this.clearUserData();
    },
  },
});
