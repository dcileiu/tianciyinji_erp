export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = [
    "/login",
    "/login/forgot-password",
    "/auth/callback",
    "/login/reset-password",
    "/getting-started",
    "/403",
    "/404",
  ];

  if (publicRoutes.includes(to.path)) {
    return;
  }

  const { user, isLoading } = useAuth();

  // 等待会话就绪，避免加载中误放行受保护路由
  if (isLoading.value) {
    try {
      await until(isLoading).toBe(false, { timeout: 10_000 });
    } catch {
      return navigateTo("/login");
    }
  }

  if (!user.value) {
    return navigateTo("/login");
  }

  if (to.path === "/") {
    return navigateTo("/dashboard");
  }
});
