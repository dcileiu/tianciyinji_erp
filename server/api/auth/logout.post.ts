import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema/auth";
import { destroySession, getSessionUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const user = await getSessionUser(event);
    if (user) {
      await db
        .update(users)
        .set({ isOnline: false, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }
    await destroySession(event);
    return { code: 0, message: "已登出", data: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "登出失败";
    return { code: -1, message, data: null };
  }
});
