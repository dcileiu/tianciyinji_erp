import type { Config } from 'drizzle-kit'

export default {
  schema: './server/database/schema/*',
  out: './server/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/erp_db'
  },
  verbose: true,
  strict: true
} satisfies Config
