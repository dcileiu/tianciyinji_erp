export default defineNuxtPlugin(async () => {
  const userStore = useUserStore();
  const permissionsStore = usePermissionsStore();
  const user = useSupabaseUser();

  // 监听用户状态变化
  watch(
    user,
    async (newUser, oldUser) => {
      if (newUser && newUser !== oldUser) {
        // 用户登录，设置用户状态并初始化数据
        userStore.setAuthUser(newUser);

        try {
          // 并行初始化用户数据和权限数据（权限仅在未加载时获取）
          const tasks: Promise<unknown>[] = [
            userStore.initializeUserData().catch((_err) => {}),
          ];
          if (!permissionsStore.loaded) {
            tasks.push(
              permissionsStore.fetchUserPermissions().catch((_err) => {})
            );
          }
          await Promise.all(tasks);
        } catch (error) {}
      } else if (!newUser && oldUser) {
        // 用户退出，清空所有数据
        userStore.logout();
        permissionsStore.clearPermissions();
      }
    },
    { immediate: true }
  );

  // 页面刷新时，如果用户已登录，初始化数据
  if (process.client && user.value) {
    userStore.setAuthUser(user.value);

    try {
      // 只有在数据为空或未加载时才重新加载
      const promises = [] as Promise<unknown>[];
      if (!userStore.profile) {
        promises.push(userStore.initializeUserData().catch((_err) => {}));
      }
      if (!permissionsStore.loaded) {
        promises.push(
          permissionsStore.fetchUserPermissions().catch((_err) => {})
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }
    } catch (error) {}
  }
});
