-- 创建客户表
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_no VARCHAR(50) UNIQUE NOT NULL,
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
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    payment_terms VARCHAR(50) DEFAULT '现金',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- 创建客户表索引
CREATE INDEX idx_customers_customer_no ON customers(customer_no);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- 启用客户表RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 创建客户表RLS策略
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON customers FOR DELETE USING (auth.role() = 'authenticated');

-- 创建客户表updated_at触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建销售订单表
CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'in_production', 'shipped', 'delivered', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,4) DEFAULT 0.13,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_rate DECIMAL(5,4) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    payment_terms VARCHAR(50),
    shipping_address TEXT,
    shipping_method VARCHAR(50),
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- 创建销售订单明细表
CREATE TABLE sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    discount_rate DECIMAL(5,4) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建销售订单表索引
CREATE INDEX idx_sales_orders_order_no ON sales_orders(order_no);
CREATE INDEX idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_order_date ON sales_orders(order_date);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_sales_orders_created_at ON sales_orders(created_at);

-- 创建销售订单明细表索引
CREATE INDEX idx_sales_order_items_order_id ON sales_order_items(order_id);
CREATE INDEX idx_sales_order_items_product_id ON sales_order_items(product_id);

-- 启用销售订单表RLS
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

-- 创建销售订单表RLS策略
CREATE POLICY "Enable read access for all users" ON sales_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON sales_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON sales_orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON sales_orders FOR DELETE USING (auth.role() = 'authenticated');

-- 创建销售订单明细表RLS策略
CREATE POLICY "Enable read access for all users" ON sales_order_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON sales_order_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON sales_order_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON sales_order_items FOR DELETE USING (auth.role() = 'authenticated');

-- 创建销售订单表updated_at触发器
CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_order_items_updated_at BEFORE UPDATE ON sales_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建计算订单总金额的触发器函数
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    order_subtotal DECIMAL(15,2);
    order_tax_amount DECIMAL(15,2);
    order_total DECIMAL(15,2);
    order_discount_amount DECIMAL(15,2);
    order_record RECORD;
BEGIN
    -- 获取订单记录
    SELECT * INTO order_record FROM sales_orders WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- 计算订单小计
    SELECT COALESCE(SUM(line_total), 0) INTO order_subtotal
    FROM sales_order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- 计算折扣金额
    order_discount_amount := order_subtotal * order_record.discount_rate;
    
    -- 计算税额
    order_tax_amount := (order_subtotal - order_discount_amount) * order_record.tax_rate;
    
    -- 计算总金额
    order_total := order_subtotal - order_discount_amount + order_tax_amount + COALESCE(order_record.shipping_cost, 0);
    
    -- 更新订单总金额
    UPDATE sales_orders 
    SET 
        subtotal = order_subtotal,
        discount_amount = order_discount_amount,
        tax_amount = order_tax_amount,
        total_amount = order_total,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 创建订单明细变更时自动计算总金额的触发器
CREATE TRIGGER trigger_calculate_order_totals_on_insert
    AFTER INSERT ON sales_order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_totals();

CREATE TRIGGER trigger_calculate_order_totals_on_update
    AFTER UPDATE ON sales_order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_totals();

CREATE TRIGGER trigger_calculate_order_totals_on_delete
    AFTER DELETE ON sales_order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_totals();

-- 插入客户测试数据
INSERT INTO customers (customer_no, name, contact_person, phone, email, address, city, province, payment_terms, credit_limit) VALUES
('C001', '北京科技有限公司', '张经理', '010-12345678', 'zhang@bjtech.com', '北京市朝阳区科技园区1号', '北京', '北京市', '月结30天', 100000.00),
('C002', '上海制造集团', '李总监', '021-87654321', 'li@shmanuf.com', '上海市浦东新区工业园区2号', '上海', '上海市', '现金', 50000.00),
('C003', '广州贸易公司', '王部长', '020-11111111', 'wang@gztrade.com', '广州市天河区商务中心3号', '广州', '广东省', '月结15天', 80000.00),
('C004', '深圳电子科技', '陈工程师', '0755-22222222', 'chen@sztech.com', '深圳市南山区高新园区4号', '深圳', '广东省', '现金', 60000.00);

-- 插入销售订单测试数据（不包含订单明细，避免产品ID问题）
INSERT INTO sales_orders (order_no, customer_id, order_date, delivery_date, status, priority, payment_terms, shipping_address, notes) VALUES
('SO2024001', (SELECT id FROM customers WHERE customer_no = 'C001'), '2024-01-15', '2024-01-25', 'confirmed', 'high', '月结30天', '北京市朝阳区科技园区1号', '紧急订单，请优先处理'),
('SO2024002', (SELECT id FROM customers WHERE customer_no = 'C002'), '2024-01-16', '2024-01-30', 'in_production', 'normal', '现金', '上海市浦东新区工业园区2号', '标准订单'),
('SO2024003', (SELECT id FROM customers WHERE customer_no = 'C003'), '2024-01-17', '2024-02-05', 'draft', 'normal', '月结15天', '广州市天河区商务中心3号', '待客户确认'),
('SO2024004', (SELECT id FROM customers WHERE customer_no = 'C004'), '2024-01-18', '2024-02-10', 'shipped', 'low', '现金', '深圳市南山区高新园区4号', '已发货');

-- 为anon和authenticated角色授予权限
GRANT SELECT ON customers TO anon;
GRANT ALL PRIVILEGES ON customers TO authenticated;

GRANT SELECT ON sales_orders TO anon;
GRANT ALL PRIVILEGES ON sales_orders TO authenticated;

GRANT SELECT ON sales_order_items TO anon;
GRANT ALL PRIVILEGES ON sales_order_items TO authenticated;