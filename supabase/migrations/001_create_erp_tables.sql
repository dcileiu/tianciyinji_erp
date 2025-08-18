-- ERP系统数据库表结构
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建客户表
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建供应商表
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建产品分类表
CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建产品表
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES product_categories(id),
  unit_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建销售订单表
CREATE TABLE IF NOT EXISTS sales_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  order_date DATE NOT NULL,
  delivery_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建销售订单明细表
CREATE TABLE IF NOT EXISTS sales_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建采购订单表
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id INTEGER REFERENCES suppliers(id),
  order_date DATE NOT NULL,
  expected_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建采购订单明细表
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建库存记录表
CREATE TABLE IF NOT EXISTS inventory_records (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  type VARCHAR(20) NOT NULL, -- 'in' or 'out'
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(50), -- 'sales_order', 'purchase_order', 'adjustment'
  reference_id INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建财务记录表
CREATE TABLE IF NOT EXISTS financial_records (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_sales_orders_number ON sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_number ON purchase_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_inventory_records_product ON inventory_records(product_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON financial_records(transaction_date);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- 创建基本的RLS策略（允许认证用户访问）
CREATE POLICY "Allow authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON product_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON sales_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON sales_order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON purchase_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON purchase_order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON inventory_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON financial_records FOR ALL USING (auth.role() = 'authenticated');