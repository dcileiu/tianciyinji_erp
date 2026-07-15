import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  bomItems,
  boms,
  customers,
  departments,
  financeInvoices,
  financePayables,
  financePayments,
  financeReceipts,
  financeReceivables,
  inventoryStocks,
  menus,
  productionOrders,
  productionPlans,
  products,
  purchaseOrderItems,
  purchaseOrders,
  roles,
  rolesMenu,
  salesOrderItems,
  salesOrders,
  sessions,
  suppliers,
  users,
  usersRole,
  warehouses,
  workshops,
} from "./schema";

const schema = {
  users,
  sessions,
  departments,
  roles,
  menus,
  usersRole,
  rolesMenu,
  products,
  customers,
  suppliers,
  warehouses,
  inventoryStocks,
  salesOrders,
  salesOrderItems,
  purchaseOrders,
  purchaseOrderItems,
  workshops,
  productionPlans,
  productionOrders,
  boms,
  bomItems,
  financeReceivables,
  financePayables,
  financeReceipts,
  financePayments,
  financeInvoices,
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client, { schema });
export type Database = typeof db;
