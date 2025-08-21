-- 创建供应商表
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT '中国',
  tax_number VARCHAR(50),
  bank_name VARCHAR(255),
  bank_account VARCHAR(50),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- 创建采购订单表
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'ordered', 'partial_received', 'received', 'completed', 'cancelled')),
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'CNY',
  payment_terms VARCHAR(100),
  delivery_address TEXT,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- 创建采购订单明细表
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  discount_rate DECIMAL(5,2) DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
  line_total DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_rate / 100)) STORED,
  received_quantity DECIMAL(10,2) DEFAULT 0 CHECK (received_quantity >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_suppliers_supplier_no ON suppliers(supplier_no);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_status ON suppliers(status);

CREATE INDEX idx_purchase_orders_order_no ON purchase_orders(order_no);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_order_date ON purchase_orders(order_date);
CREATE INDEX idx_purchase_orders_created_at ON purchase_orders(created_at);

CREATE INDEX idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_product_id ON purchase_order_items(product_id);

-- 启用行级安全策略
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Enable read access for all users" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON suppliers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON suppliers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON suppliers FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON purchase_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON purchase_orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON purchase_orders FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON purchase_order_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON purchase_order_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON purchase_order_items FOR DELETE USING (auth.role() = 'authenticated');

-- 创建updated_at触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加updated_at触发器
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建计算采购订单总金额的触发器函数
CREATE OR REPLACE FUNCTION calculate_purchase_order_total()
RETURNS TRIGGER AS $$
BEGIN
    -- 计算订单总金额
    UPDATE purchase_orders 
    SET subtotal = (
        SELECT COALESCE(SUM(line_total), 0)
        FROM purchase_order_items 
        WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
    ),
    total_amount = (
        SELECT COALESCE(SUM(line_total), 0) + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0)
        FROM purchase_order_items 
        WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
    )
    WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 为采购订单明细表添加触发器
CREATE TRIGGER trigger_calculate_purchase_order_total
    AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_purchase_order_total();

-- 插入初始供应商数据
INSERT INTO suppliers (supplier_no, name, contact_person, phone, email, address, city, province, payment_terms, status) VALUES
('SUP001', '钢铁供应链公司', '张经理', '138-0000-0001', 'zhang@steel.com', '工业园区钢铁大道100号', '上海市', '上海市', '月结30天', 'active'),
('SUP002', '化工原料集团', '李总监', '138-0000-0002', 'li@chemical.com', '化工园区原料街50号', '天津市', '天津市', '现金', 'active'),
('SUP003', '电子元件有限公司', '王主管', '138-0000-0003', 'wang@electronic.com', '科技园区电子路25号', '深圳市', '广东省', '月结15天', 'active'),
('SUP004', '包装材料厂', '赵经理', '138-0000-0004', 'zhao@package.com', '包装工业区材料街88号', '苏州市', '江苏省', '货到付款', 'active');

-- 插入初始采购订单数据
INSERT INTO purchase_orders (order_no, supplier_id, order_date, expected_delivery_date, status, priority, payment_terms, delivery_address, notes) 
SELECT 
    'PO-2024-001',
    s.id,
    DATE '2024-01-15',
    DATE '2024-01-25',
    'approved',
    'normal',
    '月结30天',
    '工厂仓库A区',
    '紧急采购，请优先处理'
FROM suppliers s WHERE s.supplier_no = 'SUP001'
UNION ALL
SELECT 
    'PO-2024-002',
    s.id,
    DATE '2024-01-18',
    DATE '2024-01-28',
    'pending',
    'high',
    '现金',
    '工厂仓库B区',
    '质量要求严格'
FROM suppliers s WHERE s.supplier_no = 'SUP002'
UNION ALL
SELECT 
    'PO-2024-003',
    s.id,
    DATE '2024-01-20',
    DATE '2024-02-05',
    'draft',
    'low',
    '月结15天',
    '工厂仓库C区',
    '常规采购订单'
FROM suppliers s WHERE s.supplier_no = 'SUP003';

-- 为anon和authenticated角色授予权限
GRANT SELECT ON suppliers TO anon;
GRANT ALL PRIVILEGES ON suppliers TO authenticated;

GRANT SELECT ON purchase_orders TO anon;
GRANT ALL PRIVILEGES ON purchase_orders TO authenticated;

GRANT SELECT ON purchase_order_items TO anon;
GRANT ALL PRIVILEGES ON purchase_order_items TO authenticated;