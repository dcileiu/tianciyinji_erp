export default defineNuxtPlugin(async () => {
  if (!import.meta.client) {
    return;
  }

  const { bootstrapSession } = useAuth();
  const permissionsStore = usePermissionsStore();

  const ok = await bootstrapSession();
  if (ok && !permissionsStore.loaded) {
    try {
      await permissionsStore.fetchUserPermissions();
    } catch {
      // ignore
    }
  }
});
