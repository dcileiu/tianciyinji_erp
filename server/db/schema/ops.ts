import { sql } from "drizzle-orm";
import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  customers,
  products,
  purchaseOrders,
  salesOrders,
  suppliers,
} from "./master";

export const workshops = pgTable("workshops", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  status: text("status").notNull().default("active"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const productionPlans = pgTable("production_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  planNo: varchar("plan_no", { length: 50 }).notNull().unique(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  workshopId: uuid("workshop_id").references(() => workshops.id),
  quantity: numeric("quantity", { precision: 14, scale: 3 })
    .notNull()
    .default("0"),
  plannedStart: date("planned_start"),
  plannedEnd: date("planned_end"),
  status: text("status").notNull().default("draft"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const productionOrders = pgTable("production_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNo: varchar("order_no", { length: 50 }).notNull().unique(),
  planId: uuid("plan_id").references(() => productionPlans.id, {
    onDelete: "set null",
  }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  workshopId: uuid("workshop_id").references(() => workshops.id),
  quantity: numeric("quantity", { precision: 14, scale: 3 })
    .notNull()
    .default("0"),
  status: text("status").notNull().default("pending"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const boms = pgTable("boms", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .unique()
    .references(() => products.id),
  version: text("version").notNull().default("1.0"),
  status: text("status").notNull().default("active"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const bomItems = pgTable(
  "bom_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bomId: uuid("bom_id")
      .notNull()
      .references(() => boms.id, { onDelete: "cascade" }),
    componentProductId: uuid("component_product_id")
      .notNull()
      .references(() => products.id),
    quantity: numeric("quantity", { precision: 14, scale: 3 })
      .notNull()
      .default("1"),
    unit: text("unit"),
  },
  (table) => [
    unique("bom_items_bom_component_uid").on(
      table.bomId,
      table.componentProductId
    ),
  ]
);

export const financeReceivables = pgTable("finance_receivables", {
  id: uuid("id").defaultRandom().primaryKey(),
  docNo: varchar("doc_no", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  salesOrderId: uuid("sales_order_id").references(() => salesOrders.id, {
    onDelete: "set null",
  }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  dueDate: date("due_date"),
  status: text("status").notNull().default("open"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const financePayables = pgTable("finance_payables", {
  id: uuid("id").defaultRandom().primaryKey(),
  docNo: varchar("doc_no", { length: 50 }).notNull().unique(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  purchaseOrderId: uuid("purchase_order_id").references(
    () => purchaseOrders.id,
    { onDelete: "set null" }
  ),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  dueDate: date("due_date"),
  status: text("status").notNull().default("open"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const financeReceipts = pgTable("finance_receipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  receiptNo: varchar("receipt_no", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  receivableId: uuid("receivable_id").references(() => financeReceivables.id, {
    onDelete: "set null",
  }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  receiptDate: date("receipt_date").default(sql`CURRENT_DATE`),
  method: text("method").default("transfer"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const financePayments = pgTable("finance_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  paymentNo: varchar("payment_no", { length: 50 }).notNull().unique(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  payableId: uuid("payable_id").references(() => financePayables.id, {
    onDelete: "set null",
  }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  paymentDate: date("payment_date").default(sql`CURRENT_DATE`),
  method: text("method").default("transfer"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const financeInvoices = pgTable("finance_invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull().unique(),
  direction: text("direction").notNull(),
  partyId: uuid("party_id").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  invoiceDate: date("invoice_date").default(sql`CURRENT_DATE`),
  status: text("status").notNull().default("issued"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
