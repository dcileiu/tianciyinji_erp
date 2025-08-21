-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('raw_material', 'finished_product', 'semi_finished', 'accessory')),
    specification VARCHAR(200),
    unit VARCHAR(20) NOT NULL,
    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
    min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
    max_stock INTEGER DEFAULT 0 CHECK (max_stock >= 0),
    unit_price DECIMAL(10,2) DEFAULT 0.00 CHECK (unit_price >= 0),
    cost_price DECIMAL(10,2) DEFAULT 0.00 CHECK (cost_price >= 0),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    barcode VARCHAR(100),
    image_url TEXT,
    supplier_name VARCHAR(200), -- 暂时使用供应商名称而不是外键
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_product_no ON products(product_no);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_current_stock ON products(current_stock);

-- 启用行级安全策略
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始测试数据
INSERT INTO products (product_no, name, description, category, specification, unit, current_stock, min_stock, max_stock, unit_price, cost_price, status, supplier_name) VALUES
('PRD-001', '优质钢材A型', '高强度建筑用钢材', 'raw_material', '10mm×2000mm', '根', 1250, 100, 2000, 125.50, 98.00, 'active', '钢铁供应商A'),
('PRD-002', '精密齿轮组件', '机械传动齿轮', 'finished_product', '模数2.5 齿数48', '套', 85, 50, 200, 285.00, 220.00, 'active', '机械配件厂'),
('PRD-003', '电路板半成品', '控制器电路板', 'semi_finished', '120mm×80mm', '片', 25, 50, 300, 68.50, 45.00, 'active', '电子元件公司'),
('PRD-004', '标准螺栓M8', '不锈钢螺栓', 'accessory', 'M8×25mm', '个', 0, 100, 1000, 2.50, 1.80, 'active', '五金配件厂'),
('PRD-005', '废料回收钢铁', '已停产的旧型号钢材', 'raw_material', '8mm×1500mm', '根', 150, 0, 0, 85.00, 65.00, 'discontinued', '回收公司'),
('PRD-006', '铝合金板材', '轻质铝合金材料', 'raw_material', '5mm×1000mm×2000mm', '张', 320, 50, 500, 180.00, 145.00, 'active', '有色金属公司'),
('PRD-007', '电机控制器', '变频电机控制器', 'finished_product', '380V 15KW', '台', 12, 10, 50, 1250.00, 980.00, 'active', '电气设备厂'),
('PRD-008', '橡胶密封圈', '耐高温橡胶密封圈', 'accessory', '内径50mm 外径65mm', '个', 580, 200, 1000, 8.50, 5.20, 'active', '橡胶制品厂');

-- 授权给anon和authenticated角色
GRANT SELECT ON products TO anon;
GRANT ALL PRIVILEGES ON products TO authenticated;