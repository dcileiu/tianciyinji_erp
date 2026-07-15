import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { H3Event } from "h3";
import { db } from "../db";
import { sessions, users } from "../db/schema/auth";

export const SESSION_COOKIE = "erp_session";
const SESSION_DAYS = 7;

export type SessionUser = typeof users.$inferSelect;

function sessionExpiry(from = new Date()): Date {
  return new Date(from.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function setSessionCookie(
  event: H3Event,
  token: string,
  expiresAt: Date
) {
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: "/" });
}

export async function createSession(
  event: H3Event,
  userId: string,
  meta?: { ip?: string; userAgent?: string }
) {
  const token = createSessionToken();
  const id = hashToken(token);
  const expiresAt = sessionExpiry();

  await db.insert(sessions).values({
    id,
    userId,
    expiresAt,
    ip: meta?.ip ?? null,
    userAgent: meta?.userAgent ?? null,
  });

  setSessionCookie(event, token, expiresAt);
  return { token, expiresAt };
}

export async function destroySession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE);
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }
  clearSessionCookie(event);
}

export async function getSessionUser(
  event: H3Event
): Promise<SessionUser | null> {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token) {
    return null;
  }

  const sessionId = hashToken(token);
  const now = new Date();

  const row = await db
    .select({
      user: users,
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
    .limit(1);

  const match = row.at(0);
  if (!match) {
    clearSessionCookie(event);
    return null;
  }

  if (match.user.status !== "active") {
    await db.delete(sessions).where(eq(sessions.id, match.sessionId));
    clearSessionCookie(event);
    return null;
  }

  const msLeft = match.expiresAt.getTime() - now.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (msLeft < oneDay) {
    const expiresAt = sessionExpiry(now);
    await db
      .update(sessions)
      .set({ expiresAt })
      .where(eq(sessions.id, match.sessionId));
    setSessionCookie(event, token, expiresAt);
  }

  return match.user;
}

export async function requireUser(event: H3Event): Promise<SessionUser> {
  const user = await getSessionUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "未认证" });
  }
  return user;
}
