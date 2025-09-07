import type { LoginForm } from "~/types/auth";

/**
 * 认证管理 Composable - 使用 Pinia Store
 */
export const useAuth = () => {
  const userStore = useUserStore();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const user = useSupabaseUser();

  // 监听 Supabase 用户状态变化
  watch(
    user,
    (newUser) => {
      userStore.setAuthUser(newUser);
    },
    { immediate: true }
  );

  // 登录
  const login = async (credentials: LoginForm) => {
    try {
      userStore.isLoading = true;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(getAuthErrorMessage(error));
      }

      if (data.user && data.session) {
        userStore.setAuthUser(data.user);

        // 更新用户在线状态
        try {
          await $fetch("/api/auth/login", { method: "POST" });
        } catch (_) {
          // 忽略在线状态更新失败，继续执行登录流程
        }

        // 登录成功后初始化用户数据
        await userStore.initializeUserData();
        return { success: true, user: data.user };
      }

      throw new Error("登录失败");
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        error: {
          message: err.message || "登录失败，请重试",
        },
      };
    } finally {
      userStore.isLoading = false;
    }
  };

  // 注册
  const register = async (email: string, password: string, userData?: any) => {
    try {
      userStore.isLoading = true;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {},
        },
      });

      if (error) {
        throw new Error(getAuthErrorMessage(error));
      }

      return { success: true, user: data.user };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        error: {
          message: err.message || "注册失败，请重试",
        },
      };
    } finally {
      userStore.isLoading = false;
    }
  };

  // 登出
  const logout = async () => {
    try {
      userStore.isLoading = true;

      // 尝试更新服务端用户元数据，标记为离线
      try {
        await $fetch("/api/auth/logout", { method: "POST" });
      } catch (_) {
        // 忽略元数据更新失败，继续执行登出
      }

      // 全局登出，撤销当前用户的所有刷新令牌，确保彻底退出
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) {
        throw new Error(getAuthErrorMessage(error));
      }

      // 清理本地用户与权限数据
      const permissionsStore = usePermissionsStore();
      permissionsStore.clearPermissions();
      userStore.logout();

      await router.push("/login");

      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        error: {
          message: err.message || "登出失败",
        },
      };
    } finally {
      userStore.isLoading = false;
    }
  };

  // 获取会话
  const getSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    } catch (error) {
      return null;
    }
  };

  // 刷新会话
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }
      return data.session;
    } catch (error) {
      return null;
    }
  };

  // 重置密码
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login/reset-password`,
      });

      if (error) {
        throw new Error(getAuthErrorMessage(error));
      }

      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        error: {
          message: err.message || "重置密码失败",
        },
      };
    }
  };

  // 更新密码
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw new Error(getAuthErrorMessage(error));
      }

      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        error: {
          message: err.message || "更新密码失败",
        },
      };
    }
  };

  return {
    // 状态
    user: computed(() => userStore.authUser),
    isAuthenticated: computed(() => userStore.isAuthenticated),
    isLoading: computed(() => userStore.isLoading),
    profile: computed(() => userStore.profile),
    permissions: computed(() => userStore.permissions),
    roles: computed(() => userStore.roles),
    displayName: computed(() => userStore.displayName),
    userAvatar: computed(() => userStore.userAvatar),
    isAdmin: computed(() => userStore.isAdmin),

    // 权限检查方法
    hasPermission: userStore.hasPermission,
    hasAnyPermission: userStore.hasAnyPermission,
    hasAllPermissions: userStore.hasAllPermissions,
    hasRole: userStore.hasRole,

    // 认证方法
    login,
    register,
    logout,
    getSession,
    refreshSession,
    resetPassword,
    updatePassword,

    // 数据管理方法
    refreshUserData: userStore.refreshUserData,
    updateProfile: userStore.updateProfile,
  };
};

// 错误信息转换
function getAuthErrorMessage(error: any): string {
  const errorMessages: Record<string, string> = {
    "Invalid login credentials": "邮箱或密码错误",
    "Email not confirmed": "邮箱未验证，请检查邮箱",
    "Too many requests": "请求过于频繁，请稍后重试",
    "User already registered": "用户已存在",
    "Weak password": "密码强度不足",
    "Invalid email": "邮箱格式无效",
  };

  const message = error?.message || error?.error_description || error;
  return errorMessages[message] || message || "操作失败";
}
