-- 创建销售订单表
CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'in_production', 'ready_to_ship', 'shipped', 'completed', 'cancelled')),
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  final_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建销售订单明细表
CREATE TABLE sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  discount_rate DECIMAL(5,2) DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
  line_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_order_date ON sales_orders(order_date);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_sales_orders_order_no ON sales_orders(order_no);
CREATE INDEX idx_sales_order_items_order_id ON sales_order_items(order_id);
CREATE INDEX idx_sales_order_items_product_id ON sales_order_items(product_id);

-- 启用行级安全策略
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view all sales orders" ON sales_orders FOR SELECT USING (true);
CREATE POLICY "Users can insert sales orders" ON sales_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sales orders" ON sales_orders FOR UPDATE USING (true);
CREATE POLICY "Users can delete sales orders" ON sales_orders FOR DELETE USING (true);

CREATE POLICY "Users can view all sales order items" ON sales_order_items FOR SELECT USING (true);
CREATE POLICY "Users can insert sales order items" ON sales_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sales order items" ON sales_order_items FOR UPDATE USING (true);
CREATE POLICY "Users can delete sales order items" ON sales_order_items FOR DELETE USING (true);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_order_items_updated_at BEFORE UPDATE ON sales_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建计算订单总金额的触发器函数
CREATE OR REPLACE FUNCTION calculate_sales_order_total()
RETURNS TRIGGER AS $$
BEGIN
    -- 计算行总金额
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        NEW.line_total = NEW.quantity * NEW.unit_price * (1 - NEW.discount_rate / 100);
    END IF;
    
    -- 更新订单总金额
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE sales_orders 
        SET total_amount = (
            SELECT COALESCE(SUM(line_total), 0) 
            FROM sales_order_items 
            WHERE order_id = NEW.order_id
        ),
        final_amount = total_amount - COALESCE(discount_amount, 0) + COALESCE(tax_amount, 0)
        WHERE id = NEW.order_id;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE sales_orders 
        SET total_amount = (
            SELECT COALESCE(SUM(line_total), 0) 
            FROM sales_order_items 
            WHERE order_id = OLD.order_id
        ),
        final_amount = total_amount - COALESCE(discount_amount, 0) + COALESCE(tax_amount, 0)
        WHERE id = OLD.order_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_calculate_sales_order_total
    AFTER INSERT OR UPDATE OR DELETE ON sales_order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_sales_order_total();

-- 插入示例数据
INSERT INTO sales_orders (order_no, customer_id, order_date, delivery_date, status, discount_amount, tax_amount, notes) VALUES
('SO-2024-001', (SELECT id FROM customers WHERE name = 'ABC科技有限公司' LIMIT 1), '2024-01-15', '2024-02-15', 'confirmed', 0, 0, '重要客户订单'),
('SO-2024-002', (SELECT id FROM customers WHERE name = 'XYZ制造集团' LIMIT 1), '2024-01-18', '2024-02-20', 'in_production', 500, 1200, ''),
('SO-2024-003', (SELECT id FROM customers WHERE name = '123贸易公司' LIMIT 1), '2024-01-20', '2024-02-10', 'ready_to_ship', 0, 800, '加急订单'),
('SO-2024-004', (SELECT id FROM customers WHERE name = 'ABC科技有限公司' LIMIT 1), '2024-01-22', '2024-03-01', 'draft', 1000, 2500, ''),
('SO-2024-005', (SELECT id FROM customers WHERE name = 'DEF电子股份' LIMIT 1), '2024-01-25', '2024-02-25', 'shipped', 0, 1800, '已发货');

-- 插入订单明细示例数据
INSERT INTO sales_order_items (order_id, product_id, quantity, unit_price, discount_rate, notes) VALUES
-- SO-2024-001 的明细
((SELECT id FROM sales_orders WHERE order_no = 'SO-2024-001'), (SELECT id FROM products WHERE name = '高精度传感器' LIMIT 1), 10, 1200, 0, ''),
((SELECT id FROM sales_orders WHERE order_no = 'SO-2024-001'), (SELECT id FROM products WHERE name = '工业控制器' LIMIT 1), 5, 2500, 5, '批量折扣'),

-- SO-2024-002 的明细
((SELECT id FROM sales_orders WHERE order_no = 'SO-2024-002'), (SELECT id FROM products WHERE name = '智能开关' LIMIT 1), 20, 450, 0, ''),
((SELECT id FROM sales_orders WHERE order_no = 'SO-2024-002'), (SELECT id FROM products WHERE name = '数据采集模块' LIMIT 1), 8, 800, 0, ''),

-- SO-2024-003 的明细
((SELECT id FROM sales_orders WHERE order_no = 'SO-2024-003'), (SELECT id FROM products WHERE name = '高精度传感器' LIMIT 1), 15, 1200, 10, '大客户折扣'),
((SELECT id FROM sales_orders WHERE order_no = 'SO-2024-003'), (SELECT id FROM products WHERE name = '工业控制器' LIMIT 1), 3, 2500, 0, '');

-- 授予权限
GRANT ALL PRIVILEGES ON sales_orders TO authenticated;
GRANT ALL PRIVILEGES ON sales_order_items TO authenticated;
GRANT SELECT ON sales_orders TO anon;
GRANT SELECT ON sales_order_items TO anon;