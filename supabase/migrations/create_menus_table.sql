-- 创建菜单表
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  path VARCHAR(200),
  parent_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  sort INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  permission VARCHAR(100),
  type VARCHAR(20) NOT NULL DEFAULT 'menu' CHECK (type IN ('directory', 'menu', 'permission')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_menus_parent_id ON menus(parent_id);
CREATE INDEX idx_menus_status ON menus(status);
CREATE INDEX idx_menus_type ON menus(type);
CREATE INDEX idx_menus_sort ON menus(sort);

-- 插入初始菜单数据
INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type) VALUES
-- 根菜单
('仪表盘', 'Home', '/dashboard', NULL, 1, 'active', 'dashboard:view', 'menu'),
('系统管理', 'Settings', NULL, NULL, 99, 'active', 'system:view', 'directory'),
('基础数据', 'Database', NULL, NULL, 2, 'active', 'master:view', 'directory'),
('销售管理', 'ShoppingCart', NULL, NULL, 3, 'active', 'sales:view', 'directory'),
('采购管理', 'ShoppingBag', NULL, NULL, 4, 'active', 'purchase:view', 'directory'),
('生产管理', 'Settings2', NULL, NULL, 5, 'active', 'production:view', 'directory'),
('仓库管理', 'Package', NULL, NULL, 6, 'active', 'warehouse:view', 'directory'),
('财务管理', 'CreditCard', NULL, NULL, 7, 'active', 'finance:view', 'directory'),
('报表分析', 'BarChart3', NULL, NULL, 8, 'active', 'reports:view', 'directory');

-- 获取父菜单ID用于插入子菜单
WITH parent_menus AS (
  SELECT id, name FROM menus WHERE parent_id IS NULL
)
INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
SELECT * FROM (
  VALUES
  -- 系统管理子菜单
  ('用户管理', 'Users', '/system/users', (SELECT id FROM parent_menus WHERE name = '系统管理'), 1, 'active', 'user:view', 'menu'),
  ('角色管理', 'Shield', '/system/roles', (SELECT id FROM parent_menus WHERE name = '系统管理'), 2, 'active', 'role:view', 'menu'),
  ('菜单管理', 'Menu', '/system/menus', (SELECT id FROM parent_menus WHERE name = '系统管理'), 3, 'active', 'menu:view', 'menu'),
  ('部门管理', 'Building', '/system/departments', (SELECT id FROM parent_menus WHERE name = '系统管理'), 4, 'active', 'department:view', 'menu'),
  ('字典管理', 'FileText', '/system/dictionaries', (SELECT id FROM parent_menus WHERE name = '系统管理'), 5, 'active', 'dict:view', 'menu'),
  ('系统配置', 'Settings', '/system/config', (SELECT id FROM parent_menus WHERE name = '系统管理'), 6, 'active', 'config:view', 'menu'),

  -- 基础数据子菜单
  ('产品管理', 'Package', '/master-data/products', (SELECT id FROM parent_menus WHERE name = '基础数据'), 1, 'active', 'product:view', 'menu'),
  ('客户管理', 'Users', '/master-data/customers', (SELECT id FROM parent_menus WHERE name = '基础数据'), 2, 'active', 'customer:view', 'menu'),
  ('供应商管理', 'Building', '/master-data/suppliers', (SELECT id FROM parent_menus WHERE name = '基础数据'), 3, 'active', 'supplier:view', 'menu'),

  -- 销售管理子菜单
  ('销售订单', 'FileText', '/sales/orders', (SELECT id FROM parent_menus WHERE name = '销售管理'), 1, 'active', 'sales-order:view', 'menu'),
  ('客户档案', 'Users', '/sales/customers', (SELECT id FROM parent_menus WHERE name = '销售管理'), 2, 'active', 'sales-customer:view', 'menu'),

  -- 采购管理子菜单
  ('采购订单', 'FileText', '/purchase/orders', (SELECT id FROM parent_menus WHERE name = '采购管理'), 1, 'active', 'purchase-order:view', 'menu'),
  ('供应商档案', 'Building', '/purchase/suppliers', (SELECT id FROM parent_menus WHERE name = '采购管理'), 2, 'active', 'purchase-supplier:view', 'menu'),

  -- 生产管理子菜单
  ('生产订单', 'FileText', '/production/orders', (SELECT id FROM parent_menus WHERE name = '生产管理'), 1, 'active', 'production-order:view', 'menu'),
  ('生产计划', 'Calendar', '/production/plans', (SELECT id FROM parent_menus WHERE name = '生产管理'), 2, 'active', 'production-plan:view', 'menu'),
  ('物料清单', 'List', '/production/bom', (SELECT id FROM parent_menus WHERE name = '生产管理'), 3, 'active', 'bom:view', 'menu'),
  ('车间管理', 'Factory', '/production/workshops', (SELECT id FROM parent_menus WHERE name = '生产管理'), 4, 'active', 'workshop:view', 'menu'),

  -- 仓库管理子菜单
  ('库存管理', 'Package', '/warehouse/inventory', (SELECT id FROM parent_menus WHERE name = '仓库管理'), 1, 'active', 'inventory:view', 'menu'),
  ('仓库设置', 'Building', '/warehouse/warehouses', (SELECT id FROM parent_menus WHERE name = '仓库管理'), 2, 'active', 'warehouse:view', 'menu'),
  ('库存调拨', 'ArrowRightLeft', '/warehouse/transfers', (SELECT id FROM parent_menus WHERE name = '仓库管理'), 3, 'active', 'transfer:view', 'menu'),

  -- 财务管理子菜单
  ('发票管理', 'FileText', '/finance/invoices', (SELECT id FROM parent_menus WHERE name = '财务管理'), 1, 'active', 'invoice:view', 'menu'),
  ('付款管理', 'CreditCard', '/finance/payments', (SELECT id FROM parent_menus WHERE name = '财务管理'), 2, 'active', 'payment:view', 'menu'),
  ('收款管理', 'Wallet', '/finance/receipts', (SELECT id FROM parent_menus WHERE name = '财务管理'), 3, 'active', 'receipt:view', 'menu'),

  -- 报表分析子菜单
  ('销售报表', 'TrendingUp', '/reports/sales', (SELECT id FROM parent_menus WHERE name = '报表分析'), 1, 'active', 'report-sales:view', 'menu'),
  ('采购报表', 'TrendingDown', '/reports/purchase', (SELECT id FROM parent_menus WHERE name = '报表分析'), 2, 'active', 'report-purchase:view', 'menu'),
  ('生产报表', 'Activity', '/reports/production', (SELECT id FROM parent_menus WHERE name = '报表分析'), 3, 'active', 'report-production:view', 'menu'),
  ('库存报表', 'BarChart', '/reports/inventory', (SELECT id FROM parent_menus WHERE name = '报表分析'), 4, 'active', 'report-inventory:view', 'menu')
) AS t(name, icon, path, parent_id, sort, status, permission, type);

-- 添加权限类型的菜单示例
INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
SELECT
  perm.name,
  NULL as icon,
  NULL as path,
  m.id as parent_id,
  perm.sort,
  'active' as status,
  perm.permission,
  'permission' as type
FROM (
  VALUES
  ('查看', 1, 'user:view'),
  ('新增', 2, 'user:create'),
  ('编辑', 3, 'user:update'),
  ('删除', 4, 'user:delete')
) AS perm(name, sort, permission)
CROSS JOIN menus m
WHERE m.name = '用户管理' AND m.type = 'menu'
LIMIT 4;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
