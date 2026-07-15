-- P1 主数据与核心单据
-- A) departments.status 统一为文本 'active'/'inactive'（安全迁移，兼容已是文本的情况）
-- B) 新建 products / customers / suppliers / warehouses / inventory_stocks /
--    sales_orders / sales_order_items / purchase_orders / purchase_order_items
-- C) 按权限码补充菜单种子 + 启用 RLS（仅允许 authenticated 只读，写操作走服务端 Service Role API）

-- =============================================
-- A. departments.status -> text('active' | 'inactive')
-- =============================================
DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'departments' AND column_name = 'status';

  IF col_type IS NULL THEN
    RETURN;
  END IF;

  IF col_type IN ('smallint', 'integer', 'bigint', 'numeric') THEN
    ALTER TABLE departments ADD COLUMN status_new VARCHAR(20);

    UPDATE departments SET status_new =
      CASE
        WHEN status = 1 THEN 'active'
        WHEN status = 0 THEN 'inactive'
        ELSE 'active'
      END;

    ALTER TABLE departments DROP COLUMN status;
    ALTER TABLE departments RENAME COLUMN status_new TO status;
    ALTER TABLE departments ALTER COLUMN status SET DEFAULT 'active';
    ALTER TABLE departments ALTER COLUMN status SET NOT NULL;
  ELSE
    -- 已是文本类型：归一化历史脏数据（'0'/'1'/NULL 等）
    UPDATE departments SET status =
      CASE
        WHEN status IN ('active', 'inactive') THEN status
        WHEN status IN ('1', 'true') THEN 'active'
        WHEN status IN ('0', 'false') THEN 'inactive'
        ELSE 'active'
      END
    WHERE status IS NULL OR status NOT IN ('active', 'inactive');

    ALTER TABLE departments ALTER COLUMN status SET DEFAULT 'active';
    ALTER TABLE departments ALTER COLUMN status SET NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'departments_status_check'
  ) THEN
    ALTER TABLE departments
      ADD CONSTRAINT departments_status_check CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

-- =============================================
-- 更新时间触发器函数（与既有迁移一致，幂等）
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- B. 主数据表
-- =============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category TEXT,
  specification TEXT,
  unit TEXT,
  price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(200),
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(200),
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  type TEXT NOT NULL DEFAULT 'finished_goods',
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(14, 3) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (warehouse_id, product_id)
);

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'confirmed', 'completed', 'cancelled')),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  remark TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(14, 3) NOT NULL DEFAULT 0,
  unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(50) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'confirmed', 'completed', 'cancelled')),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  remark TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(14, 3) NOT NULL DEFAULT 0,
  unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);
CREATE INDEX IF NOT EXISTS idx_inventory_stocks_warehouse_id ON inventory_stocks(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stocks_product_id ON inventory_stocks(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON sales_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_product_id ON sales_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_id ON purchase_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items(product_id);

-- updated_at 触发器
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_warehouses_updated_at ON warehouses;
CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_orders_updated_at ON sales_orders;
CREATE TRIGGER update_sales_orders_updated_at
  BEFORE UPDATE ON sales_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- C. 菜单种子（仅在权限码不存在时插入）
-- =============================================
DO $$
DECLARE
  master_data_id UUID;
  sales_id UUID;
  purchase_id UUID;
  warehouse_id UUID;
BEGIN
  SELECT id INTO master_data_id FROM menus WHERE type = 'directory' AND name = '基础数据' LIMIT 1;
  IF master_data_id IS NULL THEN
    INSERT INTO menus (name, icon, type, sort, status)
    VALUES ('基础数据', 'Database', 'directory', 70, 'active')
    RETURNING id INTO master_data_id;
  END IF;

  SELECT id INTO sales_id FROM menus WHERE type = 'directory' AND name = '销售管理' LIMIT 1;
  IF sales_id IS NULL THEN
    INSERT INTO menus (name, icon, type, sort, status)
    VALUES ('销售管理', 'ShoppingCart', 'directory', 20, 'active')
    RETURNING id INTO sales_id;
  END IF;

  SELECT id INTO purchase_id FROM menus WHERE type = 'directory' AND name = '采购管理' LIMIT 1;
  IF purchase_id IS NULL THEN
    INSERT INTO menus (name, icon, type, sort, status)
    VALUES ('采购管理', 'ShoppingBag', 'directory', 30, 'active')
    RETURNING id INTO purchase_id;
  END IF;

  SELECT id INTO warehouse_id FROM menus WHERE type = 'directory' AND name IN ('仓库管理', '库存管理') LIMIT 1;
  IF warehouse_id IS NULL THEN
    INSERT INTO menus (name, icon, type, sort, status)
    VALUES ('仓库管理', 'Package', 'directory', 50, 'active')
    RETURNING id INTO warehouse_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'product:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('产品管理', 'Package2', '/master-data/products', master_data_id, 1, 'active', 'product:view', 'menu');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'customer:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('客户管理', 'Users', '/master-data/customers', master_data_id, 2, 'active', 'customer:view', 'menu');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'supplier:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('供应商管理', 'Truck', '/master-data/suppliers', master_data_id, 3, 'active', 'supplier:view', 'menu');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'warehouse:settings') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('仓库设置', 'Warehouse', '/warehouse/warehouses', warehouse_id, 1, 'active', 'warehouse:settings', 'menu');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'warehouse:inventory') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('库存管理', 'Package', '/warehouse/inventory', warehouse_id, 2, 'active', 'warehouse:inventory', 'menu');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'sales-order:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('销售订单', 'FileText', '/sales/orders', sales_id, 1, 'active', 'sales-order:view', 'menu');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'purchase-order:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('采购订单', 'FileText', '/purchase/orders', purchase_id, 1, 'active', 'purchase-order:view', 'menu');
  END IF;
END $$;

-- =============================================
-- RLS：authenticated 仅可读，写操作走服务端 Service Role API
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read products" ON products;
CREATE POLICY "auth read products" ON products FOR SELECT TO authenticated USING (true);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read customers" ON customers;
CREATE POLICY "auth read customers" ON customers FOR SELECT TO authenticated USING (true);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read suppliers" ON suppliers;
CREATE POLICY "auth read suppliers" ON suppliers FOR SELECT TO authenticated USING (true);

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read warehouses" ON warehouses;
CREATE POLICY "auth read warehouses" ON warehouses FOR SELECT TO authenticated USING (true);

ALTER TABLE inventory_stocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read inventory_stocks" ON inventory_stocks;
CREATE POLICY "auth read inventory_stocks" ON inventory_stocks FOR SELECT TO authenticated USING (true);

ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read sales_orders" ON sales_orders;
CREATE POLICY "auth read sales_orders" ON sales_orders FOR SELECT TO authenticated USING (true);

ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read sales_order_items" ON sales_order_items;
CREATE POLICY "auth read sales_order_items" ON sales_order_items FOR SELECT TO authenticated USING (true);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read purchase_orders" ON purchase_orders;
CREATE POLICY "auth read purchase_orders" ON purchase_orders FOR SELECT TO authenticated USING (true);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth read purchase_order_items" ON purchase_order_items;
CREATE POLICY "auth read purchase_order_items" ON purchase_order_items FOR SELECT TO authenticated USING (true);
