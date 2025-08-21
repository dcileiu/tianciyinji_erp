-- 生产管理模块数据库表结构
-- 创建时间: 2024-01-30
-- 描述: 包含生产订单、生产计划、车间管理、BOM物料清单等相关表

-- 1. 车间表 (workshops)
CREATE TABLE IF NOT EXISTS workshops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workshop_code VARCHAR(50) UNIQUE NOT NULL,
    workshop_name VARCHAR(100) NOT NULL,
    workshop_type VARCHAR(50) NOT NULL, -- assembly, machining, painting, packaging, quality
    location VARCHAR(200),
    manager_name VARCHAR(100),
    manager_phone VARCHAR(20),
    equipment_count INTEGER DEFAULT 0,
    active_equipment_count INTEGER DEFAULT 0,
    capacity_utilization DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active', -- active, maintenance, inactive
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. BOM物料清单主表 (bom_headers)
CREATE TABLE IF NOT EXISTS bom_headers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_category VARCHAR(50),
    version VARCHAR(20) NOT NULL,
    is_current BOOLEAN DEFAULT false,
    material_count INTEGER DEFAULT 0,
    total_quantity DECIMAL(10,3) DEFAULT 0.000,
    total_cost DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft', -- draft, approved, active, inactive
    effective_date DATE,
    expiry_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 3. BOM物料清单明细表 (bom_items)
CREATE TABLE IF NOT EXISTS bom_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bom_id UUID REFERENCES bom_headers(id) ON DELETE CASCADE,
    material_id UUID REFERENCES products(id) ON DELETE CASCADE,
    material_code VARCHAR(50) NOT NULL,
    material_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(12,2) DEFAULT 0.00,
    scrap_rate DECIMAL(5,2) DEFAULT 0.00, -- 损耗率
    lead_time INTEGER DEFAULT 0, -- 提前期(天)
    is_critical BOOLEAN DEFAULT false, -- 是否关键物料
    substitute_materials TEXT, -- 替代物料
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 生产计划表 (production_plans)
CREATE TABLE IF NOT EXISTS production_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_no VARCHAR(50) UNIQUE NOT NULL,
    plan_name VARCHAR(200) NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    workshop_id UUID REFERENCES workshops(id),
    planned_quantity INTEGER NOT NULL,
    completed_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, approved, executing, completed, cancelled
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    priority INTEGER DEFAULT 1, -- 优先级 1-5
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 5. 生产计划明细表 (production_plan_items)
CREATE TABLE IF NOT EXISTS production_plan_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES production_plans(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    planned_quantity INTEGER NOT NULL,
    completed_quantity INTEGER DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    bom_id UUID REFERENCES bom_headers(id),
    workshop_id UUID REFERENCES workshops(id),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 生产订单表 (production_orders)
CREATE TABLE IF NOT EXISTS production_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    sales_order_id UUID, -- 关联销售订单
    plan_id UUID REFERENCES production_plans(id),
    product_id UUID REFERENCES products(id),
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    completed_quantity INTEGER DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    bom_id UUID REFERENCES bom_headers(id),
    workshop_id UUID REFERENCES workshops(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled
    priority INTEGER DEFAULT 1,
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    estimated_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_cost DECIMAL(12,2) DEFAULT 0.00,
    quality_status VARCHAR(20) DEFAULT 'pending', -- pending, passed, failed
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    confirmed_by UUID REFERENCES auth.users(id),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- 7. 生产工序表 (production_processes)
CREATE TABLE IF NOT EXISTS production_processes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    production_order_id UUID REFERENCES production_orders(id) ON DELETE CASCADE,
    process_name VARCHAR(100) NOT NULL,
    process_code VARCHAR(50),
    sequence_no INTEGER NOT NULL,
    workshop_id UUID REFERENCES workshops(id),
    equipment_name VARCHAR(100),
    standard_time INTEGER, -- 标准工时(分钟)
    actual_time INTEGER, -- 实际工时(分钟)
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, skipped
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    operator_name VARCHAR(100),
    quality_check BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 物料需求计划表 (material_requirements)
CREATE TABLE IF NOT EXISTS material_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    production_order_id UUID REFERENCES production_orders(id) ON DELETE CASCADE,
    material_id UUID REFERENCES products(id),
    material_code VARCHAR(50) NOT NULL,
    material_name VARCHAR(200) NOT NULL,
    required_quantity DECIMAL(10,3) NOT NULL,
    allocated_quantity DECIMAL(10,3) DEFAULT 0.000,
    consumed_quantity DECIMAL(10,3) DEFAULT 0.000,
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending', -- pending, allocated, consumed
    required_date DATE,
    allocated_date DATE,
    consumed_date DATE,
    warehouse_location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_workshops_code ON workshops(workshop_code);
CREATE INDEX IF NOT EXISTS idx_workshops_status ON workshops(status);
CREATE INDEX IF NOT EXISTS idx_workshops_type ON workshops(workshop_type);

CREATE INDEX IF NOT EXISTS idx_bom_headers_product ON bom_headers(product_id);
CREATE INDEX IF NOT EXISTS idx_bom_headers_status ON bom_headers(status);
CREATE INDEX IF NOT EXISTS idx_bom_headers_current ON bom_headers(is_current);

CREATE INDEX IF NOT EXISTS idx_bom_items_bom ON bom_items(bom_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_material ON bom_items(material_id);

CREATE INDEX IF NOT EXISTS idx_production_plans_no ON production_plans(plan_no);
CREATE INDEX IF NOT EXISTS idx_production_plans_status ON production_plans(status);
CREATE INDEX IF NOT EXISTS idx_production_plans_workshop ON production_plans(workshop_id);
CREATE INDEX IF NOT EXISTS idx_production_plans_dates ON production_plans(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_production_plan_items_plan ON production_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_production_plan_items_product ON production_plan_items(product_id);
CREATE INDEX IF NOT EXISTS idx_production_plan_items_status ON production_plan_items(status);

CREATE INDEX IF NOT EXISTS idx_production_orders_no ON production_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_orders_product ON production_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_workshop ON production_orders(workshop_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_dates ON production_orders(planned_start_date, planned_end_date);

CREATE INDEX IF NOT EXISTS idx_production_processes_order ON production_processes(production_order_id);
CREATE INDEX IF NOT EXISTS idx_production_processes_workshop ON production_processes(workshop_id);
CREATE INDEX IF NOT EXISTS idx_production_processes_status ON production_processes(status);

CREATE INDEX IF NOT EXISTS idx_material_requirements_order ON material_requirements(production_order_id);
CREATE INDEX IF NOT EXISTS idx_material_requirements_material ON material_requirements(material_id);
CREATE INDEX IF NOT EXISTS idx_material_requirements_status ON material_requirements(status);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON workshops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bom_headers_updated_at BEFORE UPDATE ON bom_headers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bom_items_updated_at BEFORE UPDATE ON bom_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_plans_updated_at BEFORE UPDATE ON production_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_plan_items_updated_at BEFORE UPDATE ON production_plan_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON production_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_processes_updated_at BEFORE UPDATE ON production_processes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_requirements_updated_at BEFORE UPDATE ON material_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_requirements ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 车间表策略
CREATE POLICY "Enable read access for all users" ON workshops FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON workshops FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON workshops FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON workshops FOR DELETE USING (auth.role() = 'authenticated');

-- BOM主表策略
CREATE POLICY "Enable read access for all users" ON bom_headers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON bom_headers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON bom_headers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON bom_headers FOR DELETE USING (auth.role() = 'authenticated');

-- BOM明细表策略
CREATE POLICY "Enable read access for all users" ON bom_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON bom_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON bom_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON bom_items FOR DELETE USING (auth.role() = 'authenticated');

-- 生产计划表策略
CREATE POLICY "Enable read access for all users" ON production_plans FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON production_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON production_plans FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON production_plans FOR DELETE USING (auth.role() = 'authenticated');

-- 生产计划明细表策略
CREATE POLICY "Enable read access for all users" ON production_plan_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON production_plan_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON production_plan_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON production_plan_items FOR DELETE USING (auth.role() = 'authenticated');

-- 生产订单表策略
CREATE POLICY "Enable read access for all users" ON production_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON production_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON production_orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON production_orders FOR DELETE USING (auth.role() = 'authenticated');

-- 生产工序表策略
CREATE POLICY "Enable read access for all users" ON production_processes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON production_processes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON production_processes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON production_processes FOR DELETE USING (auth.role() = 'authenticated');

-- 物料需求表策略
CREATE POLICY "Enable read access for all users" ON material_requirements FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON material_requirements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON material_requirements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON material_requirements FOR DELETE USING (auth.role() = 'authenticated');

-- 授予权限
GRANT ALL PRIVILEGES ON workshops TO anon, authenticated;
GRANT ALL PRIVILEGES ON bom_headers TO anon, authenticated;
GRANT ALL PRIVILEGES ON bom_items TO anon, authenticated;
GRANT ALL PRIVILEGES ON production_plans TO anon, authenticated;
GRANT ALL PRIVILEGES ON production_plan_items TO anon, authenticated;
GRANT ALL PRIVILEGES ON production_orders TO anon, authenticated;
GRANT ALL PRIVILEGES ON production_processes TO anon, authenticated;
GRANT ALL PRIVILEGES ON material_requirements TO anon, authenticated;

-- 插入初始数据
-- 车间数据
INSERT INTO workshops (workshop_code, workshop_name, workshop_type, location, manager_name, manager_phone, equipment_count, active_equipment_count, capacity_utilization, status, description) VALUES
('WS-001', '第一装配车间', 'assembly', 'A栋1楼', '张三', '13800138001', 15, 14, 85.00, 'active', '主要负责电子产品的装配工作'),
('WS-002', '机加工车间', 'machining', 'B栋2楼', '李四', '13800138002', 20, 18, 92.00, 'active', '精密零件加工和机械加工'),
('WS-003', '喷涂车间', 'painting', 'C栋1楼', '王五', '13800138003', 8, 6, 65.00, 'maintenance', '产品表面处理和喷涂作业'),
('WS-004', '包装车间', 'packaging', 'D栋1楼', '赵六', '13800138004', 12, 12, 78.00, 'active', '产品包装和出库准备'),
('WS-005', '质检车间', 'quality', 'E栋2楼', '孙七', '13800138005', 10, 10, 70.00, 'active', '产品质量检测和控制');

-- BOM主表数据
INSERT INTO bom_headers (product_code, product_name, product_category, version, is_current, material_count, total_quantity, total_cost, status, effective_date, description) VALUES
('PRD-001', '智能手机X1', 'electronics', 'V1.0', true, 25, 150.000, 1250.50, 'active', '2024-01-01', '智能手机X1的物料清单'),
('PRD-002', '平板电脑T1', 'electronics', 'V2.1', true, 32, 180.000, 1850.75, 'approved', '2024-01-15', '平板电脑T1的物料清单'),
('PRD-003', '机械键盘K1', 'mechanical', 'V1.5', false, 18, 95.000, 680.25, 'inactive', '2023-12-01', '机械键盘K1的物料清单'),
('PRD-004', '无线耳机E1', 'electronics', 'V1.0', true, 15, 75.000, 420.80, 'draft', '2024-02-01', '无线耳机E1的物料清单'),
('PRD-005', '智能手表W1', 'electronics', 'V3.0', true, 28, 120.000, 980.60, 'active', '2024-01-10', '智能手表W1的物料清单');

-- 生产计划数据
INSERT INTO production_plans (plan_no, plan_name, period_type, workshop_id, planned_quantity, completed_quantity, status, start_date, end_date, priority, description) VALUES
('PP-2024-001', '第一季度生产计划', 'monthly', (SELECT id FROM workshops WHERE workshop_code = 'WS-001'), 5000, 3200, 'executing', '2024-01-01', '2024-03-31', 1, '第一季度主要产品生产计划'),
('PP-2024-002', '智能手机外壳周计划', 'weekly', (SELECT id FROM workshops WHERE workshop_code = 'WS-002'), 1000, 800, 'executing', '2024-01-15', '2024-01-21', 2, '智能手机外壳加工周计划'),
('PP-2024-003', '平板电脑月度计划', 'monthly', (SELECT id FROM workshops WHERE workshop_code = 'WS-001'), 2000, 0, 'approved', '2024-02-01', '2024-02-29', 1, '平板电脑二月份生产计划'),
('PP-2024-004', '键盘组装日计划', 'daily', (SELECT id FROM workshops WHERE workshop_code = 'WS-004'), 200, 150, 'executing', '2024-01-30', '2024-01-30', 3, '机械键盘日常组装计划');

-- 生产订单数据
INSERT INTO production_orders (order_no, product_code, product_name, quantity, completed_quantity, unit, workshop_id, status, priority, planned_start_date, planned_end_date, estimated_cost, notes) VALUES
('PO-2024-001', 'PRD-001', '智能手机X1', 500, 320, '台', (SELECT id FROM workshops WHERE workshop_code = 'WS-001'), 'in_progress', 1, '2024-01-15', '2024-01-25', 625250.00, '第一批智能手机生产订单'),
('PO-2024-002', 'PRD-002', '平板电脑T1', 200, 0, '台', (SELECT id FROM workshops WHERE workshop_code = 'WS-001'), 'confirmed', 2, '2024-02-01', '2024-02-10', 370150.00, '平板电脑生产订单'),
('PO-2024-003', 'PRD-003', '机械键盘K1', 300, 250, '个', (SELECT id FROM workshops WHERE workshop_code = 'WS-004'), 'in_progress', 3, '2024-01-20', '2024-01-30', 204075.00, '机械键盘生产订单'),
('PO-2024-004', 'PRD-005', '智能手表W1', 150, 0, '块', (SELECT id FROM workshops WHERE workshop_code = 'WS-001'), 'pending', 2, '2024-02-05', '2024-02-15', 147090.00, '智能手表生产订单');

COMMIT;