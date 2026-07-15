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

  const userStore = useUserStore();
  const { bootstrapSession } = useAuth();

  if (userStore.isLoading) {
    try {
      await until(() => !userStore.isLoading).toBe(true, { timeout: 10_000 });
    } catch {
      return navigateTo("/login");
    }
  }

  if (!(userStore.isAuthenticated || (await bootstrapSession()))) {
    return navigateTo("/login");
  }

  if (to.path === "/") {
    return navigateTo("/dashboard");
  }
});
