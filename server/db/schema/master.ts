import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  category: text("category"),
  specification: text("specification"),
  unit: text("unit"),
  price: numeric("price", { precision: 14, scale: 2 }).notNull().default("0"),
  cost: numeric("cost", { precision: 14, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("active"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  contactName: varchar("contact_name", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 200 }),
  address: text("address"),
  status: text("status").notNull().default("active"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  contactName: varchar("contact_name", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 200 }),
  address: text("address"),
  status: text("status").notNull().default("active"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const warehouses = pgTable("warehouses", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  type: text("type").notNull().default("finished_goods"),
  address: text("address"),
  status: text("status").notNull().default("active"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inventoryStocks = pgTable(
  "inventory_stocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: numeric("quantity", { precision: 14, scale: 3 })
      .notNull()
      .default("0"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("inventory_stocks_warehouse_product_uid").on(
      table.warehouseId,
      table.productId
    ),
  ]
);

export const salesOrders = pgTable("sales_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNo: varchar("order_no", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  status: text("status").notNull().default("draft"),
  orderDate: date("order_date").notNull().default(sql`CURRENT_DATE`),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  inventoryApplied: boolean("inventory_applied").notNull().default(false),
  remark: text("remark"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const salesOrderItems = pgTable("sales_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => salesOrders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: numeric("quantity", { precision: 14, scale: 3 })
    .notNull()
    .default("0"),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNo: varchar("order_no", { length: 50 }).notNull().unique(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "restrict" }),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  status: text("status").notNull().default("draft"),
  orderDate: date("order_date").notNull().default(sql`CURRENT_DATE`),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  inventoryApplied: boolean("inventory_applied").notNull().default(false),
  remark: text("remark"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: numeric("quantity", { precision: 14, scale: 3 })
    .notNull()
    .default("0"),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
});
