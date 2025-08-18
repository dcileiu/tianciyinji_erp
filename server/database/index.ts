import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// 从运行时配置获取Supabase连接信息
const config = useRuntimeConfig()

// 构建数据库连接URL - 使用Supabase的直连格式
const connectionString = `postgresql://postgres:${config.supabaseServiceKey}@db.etxgoljsxgkvluecscen.supabase.co:5432/postgres`

// 创建PostgreSQL连接
const client = postgres(connectionString, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
})

// 创建Drizzle数据库实例
export const db = drizzle(client, { schema })

// 导出所有schema
export * from './schema'
