/**
 * 认证错误处理工具
 */

// 检查是否为认证相关错误
export function isAuthError(error: any): boolean {
  if (!error) {
    return false;
  }

  // 检查错误消息
  const message = error.message || error.error_description || '';
  const authErrorMessages = [
    'JWT expired',
    'Invalid JWT',
    'Session not found',
    'User not authenticated',
    'Token expired',
    'Unauthorized',
    'Authentication required',
  ];

  return authErrorMessages.some((msg) =>
    message.toLowerCase().includes(msg.toLowerCase())
  );
}

// 处理认证错误
export async function handleAuthError(error: any): Promise<void> {
  if (!isAuthError(error)) {
    return;
  }

  const { logout } = useAuth();
  const router = useRouter();

  try {
    // 清除认证状态
    await logout();
  } catch (logoutError) {
    // 强制重定向到登录页
    await router.push('/login');
  }
}

// API 请求包装器，自动处理认证错误
export async function withAuthErrorHandling<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    await handleAuthError(error);
    throw error;
  }
}

// 检查会话有效性
export async function checkSessionValidity(): Promise<boolean> {
  try {
    const { getSession } = useAuth();
    const session = await getSession();

    if (!session) {
      return false;
    }

    // 检查是否过期
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();

      if (expiresAt <= now) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}
