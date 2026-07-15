-- 生产 / 财务 / 报表 + 订单库存字段
-- 依赖: 20260715_master_data_and_orders.sql

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS inventory_applied BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS inventory_applied BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_no VARCHAR(50) NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES products(id),
  workshop_id UUID REFERENCES workshops(id),
  quantity NUMERIC(14,3) NOT NULL DEFAULT 0,
  planned_start DATE,
  planned_end DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(50) NOT NULL UNIQUE,
  plan_id UUID REFERENCES production_plans(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  workshop_id UUID REFERENCES workshops(id),
  quantity NUMERIC(14,3) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id),
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bom_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
  component_product_id UUID NOT NULL REFERENCES products(id),
  quantity NUMERIC(14,3) NOT NULL DEFAULT 1,
  unit TEXT,
  UNIQUE (bom_id, component_product_id)
);

CREATE TABLE IF NOT EXISTS finance_receivables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_no VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'paid', 'cancelled')),
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_payables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_no VARCHAR(50) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'paid', 'cancelled')),
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  receivable_id UUID REFERENCES finance_receivables(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  receipt_date DATE DEFAULT CURRENT_DATE,
  method TEXT DEFAULT 'transfer',
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_no VARCHAR(50) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  payable_id UUID REFERENCES finance_payables(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  payment_date DATE DEFAULT CURRENT_DATE,
  method TEXT DEFAULT 'transfer',
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no VARCHAR(50) NOT NULL UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('sales', 'purchase')),
  party_id UUID NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  invoice_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'void')),
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['workshops','production_plans','production_orders','boms','finance_receivables','finance_payables','finance_receipts','finance_payments','finance_invoices']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %I', t, t);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['workshops','production_plans','production_orders','boms','bom_items','finance_receivables','finance_payables','finance_receipts','finance_payments','finance_invoices']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "auth read %s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "auth read %s" ON %I FOR SELECT TO authenticated USING (true)', t, t);
  END LOOP;
END $$;

DO $$
DECLARE
  prod_id UUID;
  fin_id UUID;
  rpt_id UUID;
BEGIN
  SELECT id INTO prod_id FROM menus WHERE type = 'directory' AND name = '生产管理' LIMIT 1;
  IF prod_id IS NULL THEN
    INSERT INTO menus (name, icon, type, sort, status) VALUES ('生产管理', 'Factory', 'directory', 40, 'active') RETURNING id INTO prod_id;
  END IF;
  SELECT id INTO fin_id FROM menus WHERE type = 'directory' AND name = '财务管理' LIMIT 1;
  IF fin_id IS NULL THEN
    INSERT INTO menus (name, icon, type, sort, status) VALUES ('财务管理', 'Wallet', 'directory', 60, 'active') RETURNING id INTO fin_id;
  END IF;
  SELECT id INTO rpt_id FROM menus WHERE type = 'directory' AND name = '报表中心' LIMIT 1;
  IF rpt_id IS NULL THEN
    INSERT INTO menus (name, icon, type, sort, status) VALUES ('报表中心', 'BarChart3', 'directory', 70, 'active') RETURNING id INTO rpt_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'workshop:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('车间管理', 'Building2', '/production/workshops', prod_id, 1, 'active', 'workshop:view', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'production-plan:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('生产计划', 'Calendar', '/production/plans', prod_id, 2, 'active', 'production-plan:view', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'production-order:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('生产工单', 'ClipboardList', '/production/orders', prod_id, 3, 'active', 'production-order:view', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'bom:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('物料清单', 'ListTree', '/production/bom', prod_id, 4, 'active', 'bom:view', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'finance:receivables') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('应收账款', 'ArrowDownLeft', '/finance/receivables', fin_id, 1, 'active', 'finance:receivables', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'finance:payables') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('应付账款', 'ArrowUpRight', '/finance/payables', fin_id, 2, 'active', 'finance:payables', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'receipt:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('收款单', 'Banknote', '/finance/receipts', fin_id, 3, 'active', 'receipt:view', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'payment:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('付款单', 'CreditCard', '/finance/payments', fin_id, 4, 'active', 'payment:view', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'invoice:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('发票管理', 'FileSpreadsheet', '/finance/invoices', fin_id, 5, 'active', 'invoice:view', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'reports:view') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('报表总览', 'LayoutDashboard', '/reports', rpt_id, 1, 'active', 'reports:view', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'reports:sales') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('销售报表', 'TrendingUp', '/reports/sales', rpt_id, 2, 'active', 'reports:sales', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'reports:purchase') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('采购报表', 'TrendingDown', '/reports/purchase', rpt_id, 3, 'active', 'reports:purchase', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'reports:inventory') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('库存报表', 'Boxes', '/reports/inventory', rpt_id, 4, 'active', 'reports:inventory', 'menu');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM menus WHERE permission = 'reports:production') THEN
    INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
    VALUES ('生产报表', 'Activity', '/reports/production', rpt_id, 5, 'active', 'reports:production', 'menu');
  END IF;
END $$;
