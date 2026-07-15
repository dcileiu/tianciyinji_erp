export interface InitStep {
  id: string;
  progress: number;
  status: "pending" | "running" | "completed" | "error";
  title: string;
}

export interface InitLog {
  id: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: string;
}

/**
 * 旧版 Web 初始化页已废弃。请使用：
 * pnpm db:up && pnpm db:push && pnpm db:seed
 */
export const useDbInit = () => {
  const isInitializing = ref(false);
  const logs = ref<InitLog[]>([]);
  const connectionStatus = ref<"checking" | "connected" | "error">("checking");
  const initializationProgress = ref(0);
  const canInitialize = computed(() => false);

  const addLog = (level: InitLog["level"], message: string) => {
    logs.value.push({
      id: crypto.randomUUID(),
      level,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  const checkConnection = async () => {
    connectionStatus.value = "connected";
    addLog(
      "info",
      "请使用 Docker + Drizzle：pnpm db:up && pnpm db:push && pnpm db:seed"
    );
    return true;
  };

  const initializeDatabase = async () => {
    addLog("error", "db-init 已停用，请改用 pnpm db:seed");
    return false;
  };

  return {
    isInitializing,
    logs,
    connectionStatus,
    initializationProgress,
    canInitialize,
    checkConnection,
    initializeDatabase,
    steps: ref<InitStep[]>([]),
  };
};
