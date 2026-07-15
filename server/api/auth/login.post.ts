import { compare } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema/auth";
import { createSession } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ email?: string; password?: string }>(event);
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!(email && password)) {
      return { code: 400, message: "请输入邮箱和密码", data: null };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return { code: 401, message: "邮箱或密码错误", data: null };
    }
    if (user.status !== "active") {
      return { code: 401, message: "邮箱或密码错误", data: null };
    }

    const ok = await compare(password, user.passwordHash);
    if (!ok) {
      return { code: 401, message: "邮箱或密码错误", data: null };
    }

    await createSession(event, user.id, {
      ip: getRequestIP(event) ?? undefined,
      userAgent: getHeader(event, "user-agent") ?? undefined,
    });

    await db
      .update(users)
      .set({
        isOnline: true,
        lastLoginAt: new Date(),
        loginCount: sql`${users.loginCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return {
      code: 0,
      message: "登录成功",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "登录失败";
    return { code: -1, message, data: null };
  }
});
