import type { LoginForm } from "~/types/auth";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
};

/**
 * 认证管理 Composable - Session Cookie + Pinia
 */
export const useAuth = () => {
  const userStore = useUserStore();
  const router = useRouter();

  const login = async (credentials: LoginForm) => {
    try {
      userStore.isLoading = true;

      const res = await $fetch<{
        code: number;
        message: string;
        data: AuthUser | null;
      }>("/api/auth/login", {
        method: "POST",
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      });

      if (res.code !== 0 || !res.data) {
        throw new Error(res.message || "登录失败");
      }

      userStore.setAuthUser(res.data);
      await userStore.refreshUserData();

      try {
        const permRes = await $fetch<{ code: number; data: string[] }>(
          "/api/user",
          { query: { action: "permissions" } }
        );
        if (
          permRes?.code === 0 &&
          Array.isArray(permRes.data) &&
          permRes.data.length === 0
        ) {
          return {
            success: false,
            error: { message: "请联系管理员" },
          };
        }
      } catch {
        // 忽略权限接口异常
      }

      return { success: true, user: res.data };
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      return {
        success: false,
        error: {
          message: err?.data?.message || err?.message || "登录失败，请重试",
        },
      };
    } finally {
      userStore.isLoading = false;
    }
  };

  const register = async (
    _email: string,
    _password: string,
    _userData?: unknown
  ) => ({
    success: false,
    error: {
      message: "系统已关闭公开注册，请联系管理员创建账号",
    },
  });

  const logout = async () => {
    try {
      userStore.isLoading = true;
      try {
        await $fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // 继续本地清理
      }

      const permissionsStore = usePermissionsStore();
      permissionsStore.clearPermissions();
      userStore.logout();
      await router.push("/login");
      return { success: true };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        error: { message: err.message || "登出失败" },
      };
    } finally {
      userStore.isLoading = false;
    }
  };

  const bootstrapSession = async () => {
    try {
      userStore.isLoading = true;
      const res = await $fetch<{
        code: number;
        data: {
          id: string;
          email: string;
          name: string;
          username: string;
        };
      }>("/api/user", { query: { action: "profile" } });

      if (res.code === 0 && res.data) {
        userStore.setAuthUser({
          id: res.data.id,
          email: res.data.email,
          name: res.data.name,
          username: res.data.username,
        });
        await userStore.initializeUserData();
        return true;
      }

      userStore.setAuthUser(null);
      return false;
    } catch {
      userStore.setAuthUser(null);
      return false;
    } finally {
      userStore.isLoading = false;
    }
  };

  const getSession = async () => {
    const ok = userStore.isAuthenticated || (await bootstrapSession());
    return ok ? { user: userStore.authUser } : null;
  };

  const refreshSession = async () => getSession();

  const resetPassword = async (_email: string) => ({
    success: false,
    error: { message: "请联系管理员重置密码" },
  });

  const updatePassword = async (_password: string) => ({
    success: false,
    error: { message: "请联系管理员重置密码" },
  });

  return {
    user: computed(() => userStore.authUser),
    isAuthenticated: computed(() => userStore.isAuthenticated),
    isLoading: computed(() => userStore.isLoading),
    profile: computed(() => userStore.profile),
    permissions: computed(() => userStore.permissions),
    roles: computed(() => userStore.roles),
    displayName: computed(() => userStore.displayName),
    userAvatar: computed(() => userStore.userAvatar),
    isAdmin: computed(() => userStore.isAdmin),

    hasPermission: userStore.hasPermission,
    hasAnyPermission: userStore.hasAnyPermission,
    hasAllPermissions: userStore.hasAllPermissions,
    hasRole: userStore.hasRole,

    login,
    register,
    logout,
    getSession,
    refreshSession,
    resetPassword,
    updatePassword,
    bootstrapSession,

    refreshUserData: userStore.refreshUserData,
    updateProfile: userStore.updateProfile,
  };
};
