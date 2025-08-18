import { pgTable, serial, varchar, text, timestamp, boolean, decimal, integer, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  avatar: text('avatar'),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  department: varchar('department', { length: 100 }),
  position: varchar('position', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// 客户表
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('individual'), // individual, company
  contactPerson: varchar('contact_person', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  taxNumber: varchar('tax_number', { length: 50 }),
  creditLimit: decimal('credit_limit', { precision: 15, scale: 2 }).default('0'),
  paymentTerms: integer('payment_terms').default(30), // 付款期限（天）
  status: varchar('status', { length: 20 }).notNull().default('active'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// 供应商表
export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  taxNumber: varchar('tax_number', { length: 50 }),
  paymentTerms: integer('payment_terms').default(30),
  rating: integer('rating').default(5), // 供应商评级 1-5
  status: varchar('status', { length: 20 }).notNull().default('active'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// 产品分类表
export const productCategories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  parentId: uuid('parent_id').references(() => productCategories.id),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// 产品表
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  categoryId: uuid('category_id').references(() => productCategories.id),
  specification: text('specification'),
  unit: varchar('unit', { length: 20 }).notNull().default('个'),
  purchasePrice: decimal('purchase_price', { precision: 15, scale: 2 }).default('0'),
  salePrice: decimal('sale_price', { precision: 15, scale: 2 }).default('0'),
  minStock: integer('min_stock').default(0),
  maxStock: integer('max_stock').default(0),
  currentStock: integer('current_stock').default(0),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  images: text('images'), // JSON格式存储图片URLs
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// 销售订单表
export const salesOrders = pgTable('sales_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  customerId: uuid('customer_id').references(() => customers.id),
  orderDate: timestamp('order_date').notNull().defaultNow(),
  deliveryDate: timestamp('delivery_date'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, confirmed, shipped, delivered, cancelled
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).default('0'),
  finalAmount: decimal('final_amount', { precision: 15, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// 销售订单明细表
export const salesOrderItems = pgTable('sales_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => salesOrders.id),
  productId: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// 定义关系
export const usersRelations = relations(users, ({ many }) => ({
  customers: many(customers),
  suppliers: many(suppliers),
  products: many(products),
  salesOrders: many(salesOrders)
}))

export const customersRelations = relations(customers, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [customers.createdBy],
    references: [users.id]
  }),
  salesOrders: many(salesOrders)
}))

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  createdBy: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id]
  })
}))

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  parent: one(productCategories, {
    fields: [productCategories.parentId],
    references: [productCategories.id]
  }),
  children: many(productCategories),
  products: many(products)
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id]
  }),
  createdBy: one(users, {
    fields: [products.createdBy],
    references: [users.id]
  }),
  salesOrderItems: many(salesOrderItems)
}))

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [salesOrders.customerId],
    references: [customers.id]
  }),
  createdBy: one(users, {
    fields: [salesOrders.createdBy],
    references: [users.id]
  }),
  items: many(salesOrderItems)
}))

export const salesOrderItemsRelations = relations(salesOrderItems, ({ one }) => ({
  order: one(salesOrders, {
    fields: [salesOrderItems.orderId],
    references: [salesOrders.id]
  }),
  product: one(products, {
    fields: [salesOrderItems.productId],
    references: [products.id]
  })
}))
