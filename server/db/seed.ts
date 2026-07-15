import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema/auth";
import { menus, roles, rolesMenu, usersRole } from "./schema/system";

type MenuSeed = {
  name: string;
  icon?: string;
  path?: string;
  type: "directory" | "menu" | "permission";
  sort: number;
  permission?: string;
  children?: MenuSeed[];
};

const menuTree: MenuSeed[] = [
  {
    name: "仪表盘",
    icon: "LayoutDashboard",
    path: "/dashboard",
    type: "menu",
    sort: 10,
    permission: "dashboard:view",
  },
  {
    name: "销售管理",
    icon: "ShoppingCart",
    type: "directory",
    sort: 20,
    children: [
      {
        name: "销售订单",
        icon: "FileText",
        path: "/sales/orders",
        type: "menu",
        sort: 1,
        permission: "sales-order:view",
      },
    ],
  },
  {
    name: "采购管理",
    icon: "Truck",
    type: "directory",
    sort: 30,
    children: [
      {
        name: "采购订单",
        icon: "FileText",
        path: "/purchase/orders",
        type: "menu",
        sort: 1,
        permission: "purchase-order:view",
      },
    ],
  },
  {
    name: "生产管理",
    icon: "Factory",
    type: "directory",
    sort: 40,
    children: [
      {
        name: "车间",
        path: "/production/workshops",
        type: "menu",
        sort: 1,
        permission: "workshop:view",
      },
      {
        name: "生产计划",
        path: "/production/plans",
        type: "menu",
        sort: 2,
        permission: "production-plan:view",
      },
      {
        name: "生产工单",
        path: "/production/orders",
        type: "menu",
        sort: 3,
        permission: "production-order:view",
      },
      {
        name: "BOM",
        path: "/production/boms",
        type: "menu",
        sort: 4,
        permission: "bom:view",
      },
    ],
  },
  {
    name: "仓储管理",
    icon: "Warehouse",
    type: "directory",
    sort: 50,
    children: [
      {
        name: "仓库设置",
        path: "/warehouse/settings",
        type: "menu",
        sort: 1,
        permission: "warehouse:settings",
      },
      {
        name: "库存查询",
        path: "/warehouse/inventory",
        type: "menu",
        sort: 2,
        permission: "warehouse:inventory",
      },
    ],
  },
  {
    name: "财务管理",
    icon: "Wallet",
    type: "directory",
    sort: 60,
    children: [
      {
        name: "应收",
        path: "/finance/receivables",
        type: "menu",
        sort: 1,
        permission: "finance:receivables",
      },
      {
        name: "应付",
        path: "/finance/payables",
        type: "menu",
        sort: 2,
        permission: "finance:payables",
      },
      {
        name: "收款",
        path: "/finance/receipts",
        type: "menu",
        sort: 3,
        permission: "receipt:view",
      },
      {
        name: "付款",
        path: "/finance/payments",
        type: "menu",
        sort: 4,
        permission: "payment:view",
      },
      {
        name: "发票",
        path: "/finance/invoices",
        type: "menu",
        sort: 5,
        permission: "invoice:view",
      },
    ],
  },
  {
    name: "基础数据",
    icon: "Database",
    type: "directory",
    sort: 70,
    children: [
      {
        name: "产品",
        path: "/master/products",
        type: "menu",
        sort: 1,
        permission: "product:view",
      },
      {
        name: "客户",
        path: "/master/customers",
        type: "menu",
        sort: 2,
        permission: "customer:view",
      },
      {
        name: "供应商",
        path: "/master/suppliers",
        type: "menu",
        sort: 3,
        permission: "supplier:view",
      },
    ],
  },
  {
    name: "报表中心",
    icon: "BarChart3",
    type: "directory",
    sort: 80,
    children: [
      {
        name: "总览",
        path: "/reports",
        type: "menu",
        sort: 1,
        permission: "reports:view",
      },
      {
        name: "销售报表",
        path: "/reports/sales",
        type: "menu",
        sort: 2,
        permission: "reports:sales",
      },
      {
        name: "采购报表",
        path: "/reports/purchase",
        type: "menu",
        sort: 3,
        permission: "reports:purchase",
      },
      {
        name: "库存报表",
        path: "/reports/inventory",
        type: "menu",
        sort: 4,
        permission: "reports:inventory",
      },
      {
        name: "生产报表",
        path: "/reports/production",
        type: "menu",
        sort: 5,
        permission: "reports:production",
      },
    ],
  },
  {
    name: "系统管理",
    icon: "Settings",
    type: "directory",
    sort: 90,
    children: [
      {
        name: "用户管理",
        path: "/system/users",
        type: "menu",
        sort: 1,
        permission: "system:users",
      },
      {
        name: "角色管理",
        path: "/system/roles",
        type: "menu",
        sort: 2,
        permission: "system:roles",
      },
      {
        name: "菜单管理",
        path: "/system/menus",
        type: "menu",
        sort: 3,
        permission: "system:menus",
      },
      {
        name: "部门管理",
        path: "/system/departments",
        type: "menu",
        sort: 4,
        permission: "system:departments",
      },
    ],
  },
];

async function insertMenus(
  items: MenuSeed[],
  parentId: string | null = null
): Promise<string[]> {
  const ids: string[] = [];
  for (const item of items) {
    const [row] = await db
      .insert(menus)
      .values({
        name: item.name,
        icon: item.icon ?? null,
        path: item.path ?? null,
        parentId,
        sort: item.sort,
        status: "active",
        permission: item.permission ?? null,
        type: item.type,
      })
      .returning({ id: menus.id });
    ids.push(row.id);
    if (item.children?.length) {
      ids.push(...(await insertMenus(item.children, row.id)));
    }
  }
  return ids;
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existingAdmin) {
    console.log(`Seed skipped: admin ${email} already exists`);
    process.exit(0);
  }

  const existingMenus = await db.select({ id: menus.id }).from(menus).limit(1);
  let menuIds: string[] = [];
  if (existingMenus.length === 0) {
    menuIds = await insertMenus(menuTree);
    console.log(`Inserted ${menuIds.length} menus`);
  } else {
    const all = await db.select({ id: menus.id }).from(menus);
    menuIds = all.map((m) => m.id);
    console.log(`Reusing ${menuIds.length} existing menus`);
  }

  let [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.code, "super_admin"))
    .limit(1);

  if (!role) {
    [role] = await db
      .insert(roles)
      .values({
        name: "超级管理员",
        code: "super_admin",
        description: "系统超级管理员",
        status: "active",
        isSystem: true,
      })
      .returning();
    console.log("Created role super_admin");
  }

  for (const menuId of menuIds) {
    await db
      .insert(rolesMenu)
      .values({ roleId: role.id, menuId })
      .onConflictDoNothing();
  }

  const passwordHash = await hash(password, 10);
  const [admin] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name: "超级管理员",
      username: "admin",
      status: "active",
    })
    .returning();

  await db.insert(usersRole).values({
    userId: admin.id,
    roleId: role.id,
  });

  console.log(`Seeded admin ${email} / (password from SEED_ADMIN_PASSWORD)`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
