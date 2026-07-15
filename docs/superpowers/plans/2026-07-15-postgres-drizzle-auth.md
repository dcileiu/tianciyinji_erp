# Postgres + Drizzle + Self-hosted Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Supabase; run the ERP on Docker Postgres + Drizzle + email/password sessions with HttpOnly cookies.

**Architecture:** Nitro APIs use a Drizzle singleton against Postgres. Auth stores bcrypt hashes in `users` and opaque session tokens in `sessions`, exposed via Cookie `erp_session`. Permissions stay menu/role based via `assertPermission`.

**Tech Stack:** Nuxt 4, Drizzle ORM, `postgres` (postgres.js), bcryptjs, Docker Postgres 16.

**Spec:** `docs/superpowers/specs/2026-07-15-postgres-drizzle-auth-design.md`

## Global Constraints

- No `@nuxtjs/supabase` after cleanup task
- Cookie name: `erp_session` (HttpOnly, SameSite=Lax; Secure in production)
- Session TTL: 7 days with sliding renewal when < 1 day remains
- Super admin role code: `super_admin`
- No SMTP / no Supabase data import in this plan
- Package manager: pnpm only
- Commit after each completed task

## File map

| Path | Responsibility |
|------|----------------|
| `docker-compose.yml` | Local Postgres 16 |
| `drizzle.config.ts` | Drizzle Kit config |
| `server/db/schema/*.ts` | Table definitions |
| `server/db/index.ts` | Drizzle client export |
| `server/db/seed.ts` | Menus, roles, admin user |
| `server/utils/auth.ts` | Session cookie helpers, `requireUser` |
| `server/api/_utils/permissions.ts` | `assertPermission` via Drizzle |
| `server/api/auth/login.post.ts` | Real login (email/password) |
| `server/api/auth/logout.post.ts` | Destroy session |
| `app/composables/useAuth.ts` | Call auth APIs only |
| `app/middleware/*.ts` | Use `/api/user` session, not Supabase |
| `.env.example`, `docs/AUTH.md`, `AGENTS.md` | New env and docs |

---

### Task 1: Docker + Drizzle scaffold + core schema

**Files:**
- Create: `docker-compose.yml`, `drizzle.config.ts`, `server/db/schema/*`, `server/db/index.ts`
- Modify: `package.json`, `.env.example`

- [ ] Add deps: `drizzle-orm`, `postgres`; dev: `drizzle-kit`, `tsx`
- [ ] Add Compose Postgres 16 (`erp` db/user/password), healthcheck
- [ ] Write schema: auth (`users`,`sessions`), system, master, ops — match existing SQL + new auth tables
- [ ] `drizzle.config.ts` → `server/db/migrations`
- [ ] Scripts: `db:up`, `db:down`, `db:generate`, `db:migrate`, `db:push`, `db:seed`
- [ ] `.env.example`: `DATABASE_URL`, `SESSION_SECRET`, `SEED_ADMIN_*`; remove Supabase keys
- [ ] Verify: `docker compose up -d` + `pnpm db:push`
- [ ] Commit: `chore: add docker postgres and drizzle schema`

---

### Task 2: Seed (super_admin + menus)

**Files:**
- Create: `server/db/seed.ts`

- [ ] Seed roles, menus (permission codes), admin user (bcrypt), bindings
- [ ] Verify: `pnpm db:seed`
- [ ] Commit: `feat: add database seed for admin and menus`

---

### Task 3: Session helpers + Auth APIs

**Files:**
- Create: `server/utils/auth.ts`
- Modify: `server/api/auth/login.post.ts`, `logout.post.ts`, `user/index.ts`, `_utils/permissions.ts`

**Produces:** `getSessionUser`, `requireUser`, `createSession`, `destroySession`, `setSessionCookie`

- [ ] Auth utils + login/logout + `/api/user` + `assertPermission` on Drizzle
- [ ] Smoke: login sets cookie; permissions non-empty for seed admin
- [ ] Commit: `feat: replace supabase auth with session cookies`

---

### Task 4: Frontend auth cutover

**Files:**
- Modify: `useAuth.ts`, auth/permission middleware, `user-init` plugin, user store, `nuxt.config.ts`, login/forgot-password pages

- [ ] Frontend calls session APIs only; remove supabase module usage
- [ ] Forgot-password: contact admin message
- [ ] Smoke: seed admin reaches dashboard
- [ ] Commit: `feat: wire frontend to session-based auth`

---

### Task 5: System domain APIs

**Files:**
- Modify: `server/api/users|roles|menus|departments/**`, related composables

- [ ] Drizzle rewrite; admin password create/reset; keep `super_admin` guards
- [ ] Commit: `feat: migrate system APIs to drizzle`

---

### Task 6: Business APIs + utils

**Files:**
- Modify: `_utils/crud.ts`, `inventory.ts`, all business `server/api/**`

- [ ] Port helpers and APIs; grep zero `supabase` in `app/` + `server/`
- [ ] Commit: `feat: migrate business APIs to drizzle`

---

### Task 7: Cleanup + docs

**Files:**
- Modify: `package.json`, `docs/AUTH.md`, `docs/README.md`, `AGENTS.md`, `nuxt.config.ts`

- [ ] Uninstall `@nuxtjs/supabase`; update docs
- [ ] `pnpm type-check` + `pnpm lint`
- [ ] Commit: `chore: remove supabase and update docs`

---

## End-to-end verification

```bash
docker compose up -d
pnpm db:push
pnpm db:seed
pnpm dev
pnpm type-check
pnpm lint
```

Grep must find no `supabase` / `useSupabase` / `serverSupabase` under `app`, `server`, `nuxt.config.ts`, `package.json`.
