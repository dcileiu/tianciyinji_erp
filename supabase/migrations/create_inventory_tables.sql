-- 创建库存表
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse VARCHAR(50) NOT NULL DEFAULT 'main',
    location VARCHAR(100),
    current_stock INTEGER NOT NULL DEFAULT 0,
    available_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    safety_stock INTEGER NOT NULL DEFAULT 0,
    max_stock INTEGER,
    unit_cost DECIMAL(10,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建库存变动记录表
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse VARCHAR(50) NOT NULL,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    reference_type VARCHAR(50), -- 'purchase_order', 'sales_order', 'adjustment', 'transfer'
    reference_id UUID,
    reason TEXT,
    operator_id UUID,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_inventory_product_warehouse ON inventory(product_id, warehouse);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON inventory(warehouse);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);

-- 启用行级安全策略
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Allow authenticated users to view inventory" ON inventory
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert inventory" ON inventory
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update inventory" ON inventory
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete inventory" ON inventory
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view inventory movements" ON inventory_movements
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert inventory movements" ON inventory_movements
    FOR INSERT TO authenticated WITH CHECK (true);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建库存变动触发器函数
CREATE OR REPLACE FUNCTION handle_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新库存表中的当前库存
    IF TG_OP = 'INSERT' THEN
        IF NEW.movement_type = 'in' THEN
            UPDATE inventory 
            SET current_stock = current_stock + NEW.quantity,
                available_stock = available_stock + NEW.quantity,
                last_updated = NOW()
            WHERE product_id = NEW.product_id AND warehouse = NEW.warehouse;
        ELSIF NEW.movement_type = 'out' THEN
            UPDATE inventory 
            SET current_stock = current_stock - NEW.quantity,
                available_stock = available_stock - NEW.quantity,
                last_updated = NOW()
            WHERE product_id = NEW.product_id AND warehouse = NEW.warehouse;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 创建库存变动触发器
CREATE TRIGGER inventory_movement_trigger
    AFTER INSERT ON inventory_movements
    FOR EACH ROW EXECUTE FUNCTION handle_inventory_movement();

-- 插入初始库存数据
INSERT INTO inventory (product_id, warehouse, location, current_stock, available_stock, reserved_stock, safety_stock, max_stock, unit_cost)
SELECT 
    p.id,
    'main' as warehouse,
    'A01-001' as location,
    p.current_stock,
    p.current_stock,
    0 as reserved_stock,
    p.min_stock as safety_stock,
    p.max_stock,
    p.cost_price as unit_cost
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM inventory i 
    WHERE i.product_id = p.id AND i.warehouse = 'main'
);

-- 插入一些库存变动记录示例
INSERT INTO inventory_movements (product_id, warehouse, movement_type, quantity, unit_cost, total_cost, reference_type, reason)
SELECT 
    p.id,
    'main' as warehouse,
    'in' as movement_type,
    50 as quantity,
    p.cost_price as unit_cost,
    50 * p.cost_price as total_cost,
    'adjustment' as reference_type,
    '期初库存调整' as reason
FROM products p
LIMIT 3;

-- 授权给anon和authenticated角色
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory TO authenticated;
GRANT SELECT, INSERT ON inventory_movements TO anon;
GRANT SELECT, INSERT ON inventory_movements TO authenticated;