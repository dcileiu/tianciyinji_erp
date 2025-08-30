-- 创建完整的菜单表结构和数据
-- 包含项目中的所有页面和权限

-- 删除现有表（如果需要重新创建）
-- DROP TABLE IF EXISTS menus CASCADE;

-- 创建菜单表
CREATE TABLE IF NOT EXISTS menus (
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
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_status ON menus(status);
CREATE INDEX IF NOT EXISTS idx_menus_type ON menus(type);
CREATE INDEX IF NOT EXISTS idx_menus_sort ON menus(sort);

-- 清空现有数据（如果需要重新插入）
-- DELETE FROM menus;

-- 插入根菜单 (按照项目实际显示顺序)
INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type) VALUES
-- 主要功能模块 (按实际侧边栏顺序)
('仪表盘', 'Home', NULL, NULL, 10, 'active', 'dashboard:view', 'directory'),
('销售管理', 'ShoppingCart', NULL, NULL, 20, 'active', 'sales:view', 'directory'),
('采购管理', 'ShoppingBag', NULL, NULL, 30, 'active', 'purchase:view', 'directory'),
('库存管理', 'Package', NULL, NULL, 40, 'active', 'warehouse:view', 'directory'),
('生产管理', 'Settings2', NULL, NULL, 50, 'active', 'production:view', 'directory'),
('财务管理', 'CreditCard', NULL, NULL, 60, 'active', 'finance:view', 'directory'),
('基础数据', 'Database', NULL, NULL, 70, 'active', 'master:view', 'directory'),
('系统设置', 'Settings', NULL, NULL, 80, 'active', 'system:view', 'directory'),

-- Projects 部分菜单
('报表分析', 'BarChart3', '/reports', NULL, 90, 'active', 'reports:view', 'menu'),
('数据统计', 'PieChart', '/analytics', NULL, 91, 'active', 'analytics:view', 'menu'),
('系统监控', 'Map', '/monitoring', NULL, 92, 'active', 'monitoring:view', 'menu');

-- 获取父菜单ID并插入子菜单 (按照实际侧边栏顺序)
WITH parent_menus AS (
  SELECT id, name FROM menus WHERE parent_id IS NULL
)
INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
SELECT * FROM (
  VALUES
  -- 仪表盘子菜单 (实际项目中的仪表盘结构)
  ('概览', 'Home', '/dashboard', (SELECT id FROM parent_menus WHERE name = '仪表盘'), 1, 'active', 'dashboard:overview', 'menu'),
  ('统计', 'BarChart3', '/dashboard/stats', (SELECT id FROM parent_menus WHERE name = '仪表盘'), 2, 'active', 'dashboard:stats', 'menu'),

  -- 销售管理子菜单
  ('销售订单', 'FileText', '/sales/orders', (SELECT id FROM parent_menus WHERE name = '销售管理'), 1, 'active', 'sales-order:view', 'menu'),
  ('客户管理', 'Users', '/sales/customers', (SELECT id FROM parent_menus WHERE name = '销售管理'), 2, 'active', 'customer:view', 'menu'),

  -- 采购管理子菜单
  ('采购订单', 'FileText', '/purchase/orders', (SELECT id FROM parent_menus WHERE name = '采购管理'), 1, 'active', 'purchase-order:view', 'menu'),
  ('供应商管理', 'Building', '/purchase/suppliers', (SELECT id FROM parent_menus WHERE name = '采购管理'), 2, 'active', 'purchase-supplier:view', 'menu'),

  -- 库存管理子菜单 (注意：侧边栏中叫库存管理，但路径是warehouse)
  ('库存管理', 'Package', '/warehouse/inventory', (SELECT id FROM parent_menus WHERE name = '库存管理'), 1, 'active', 'inventory:view', 'menu'),
  ('仓库管理', 'Building', '/warehouse/warehouses', (SELECT id FROM parent_menus WHERE name = '库存管理'), 2, 'active', 'warehouse:manage', 'menu'),
  ('库存调拨', 'ArrowRightLeft', '/warehouse/transfers', (SELECT id FROM parent_menus WHERE name = '库存管理'), 3, 'active', 'transfer:view', 'menu'),

  -- 生产管理子菜单
  ('生产订单', 'FileText', '/production/orders', (SELECT id FROM parent_menus WHERE name = '生产管理'), 1, 'active', 'production-order:view', 'menu'),
  ('生产计划', 'Calendar', '/production/plans', (SELECT id FROM parent_menus WHERE name = '生产管理'), 2, 'active', 'production-plan:view', 'menu'),
  ('物料清单', 'List', '/production/bom', (SELECT id FROM parent_menus WHERE name = '生产管理'), 3, 'active', 'bom:view', 'menu'),
  ('车间管理', 'Factory', '/production/workshops', (SELECT id FROM parent_menus WHERE name = '生产管理'), 4, 'active', 'workshop:view', 'menu'),

  -- 财务管理子菜单
  ('发票管理', 'FileText', '/finance/invoices', (SELECT id FROM parent_menus WHERE name = '财务管理'), 1, 'active', 'invoice:view', 'menu'),
  ('付款管理', 'CreditCard', '/finance/payments', (SELECT id FROM parent_menus WHERE name = '财务管理'), 2, 'active', 'payment:view', 'menu'),
  ('收款管理', 'Wallet', '/finance/receipts', (SELECT id FROM parent_menus WHERE name = '财务管理'), 3, 'active', 'receipt:view', 'menu'),

  -- 基础数据子菜单 (按照侧边栏顺序)
  ('产品管理', 'Package', '/master-data/products', (SELECT id FROM parent_menus WHERE name = '基础数据'), 1, 'active', 'product:view', 'menu'),
  ('客户管理', 'Users', '/master-data/customers', (SELECT id FROM parent_menus WHERE name = '基础数据'), 2, 'active', 'master-customer:view', 'menu'),
  ('供应商管理', 'Building', '/master-data/suppliers', (SELECT id FROM parent_menus WHERE name = '基础数据'), 3, 'active', 'supplier:view', 'menu'),

  -- 系统设置子菜单 (按照侧边栏顺序)
  ('系统配置', 'Settings', '/system/config', (SELECT id FROM parent_menus WHERE name = '系统设置'), 1, 'active', 'config:view', 'menu'),
  ('用户管理', 'Users', '/system/users', (SELECT id FROM parent_menus WHERE name = '系统设置'), 2, 'active', 'user:view', 'menu'),
  ('角色权限', 'Shield', '/system/roles', (SELECT id FROM parent_menus WHERE name = '系统设置'), 3, 'active', 'role:view', 'menu'),
  ('部门管理', 'Building', '/system/departments', (SELECT id FROM parent_menus WHERE name = '系统设置'), 4, 'active', 'department:view', 'menu'),
  ('菜单管理', 'Menu', '/system/menus', (SELECT id FROM parent_menus WHERE name = '系统设置'), 5, 'active', 'menu:view', 'menu'),

  -- 其他系统功能页面
  ('角色权限管理', 'UserCheck', '/system/role-permissions', (SELECT id FROM parent_menus WHERE name = '系统设置'), 6, 'active', 'role-permission:view', 'menu'),
  ('岗位管理', 'Briefcase', '/system/positions', (SELECT id FROM parent_menus WHERE name = '系统设置'), 7, 'active', 'position:view', 'menu'),
  ('资源管理', 'FolderOpen', '/system/resources', (SELECT id FROM parent_menus WHERE name = '系统设置'), 8, 'active', 'resource:view', 'menu'),
  ('字典管理', 'FileText', '/system/dictionaries', (SELECT id FROM parent_menus WHERE name = '系统设置'), 9, 'active', 'dict:view', 'menu'),
  ('系统日志', 'FileSearch', '/system/logs', (SELECT id FROM parent_menus WHERE name = '系统设置'), 10, 'active', 'log:view', 'menu')
) AS t(name, icon, path, parent_id, sort, status, permission, type);

-- 为所有主要功能菜单添加 查看、新增、编辑、删除 权限
WITH menu_permissions AS (
  SELECT
    m.id as menu_id,
    m.name as menu_name,
    CASE
      WHEN m.permission LIKE '%:view' THEN SUBSTRING(m.permission FROM '^(.+):view$')
      ELSE SPLIT_PART(m.permission, ':', 1)
    END as permission_prefix
  FROM menus m
  WHERE m.type = 'menu'
    AND m.permission IS NOT NULL
    AND m.path IS NOT NULL
    AND m.name NOT IN ('仪表盘', '统计分析', '分析报告', '监控中心', '报表总览')
)
INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
SELECT
  perm.name,
  NULL as icon,
  NULL as path,
  mp.menu_id as parent_id,
  perm.sort,
  'active' as status,
  mp.permission_prefix || ':' || perm.action as permission,
  'permission' as type
FROM menu_permissions mp
CROSS JOIN (
  VALUES
  ('查看', 1, 'view'),
  ('新增', 2, 'create'),
  ('编辑', 3, 'update'),
  ('删除', 4, 'delete'),
  ('导出', 5, 'export'),
  ('导入', 6, 'import')
) AS perm(name, sort, action);

-- 为报表分析菜单添加子菜单
WITH parent_menus AS (
  SELECT id, name FROM menus WHERE parent_id IS NULL
)
INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
SELECT * FROM (
  VALUES
  -- 报表分析子菜单 (根据实际项目页面)
  ('销售报表', 'TrendingUp', '/reports/sales', (SELECT id FROM parent_menus WHERE name = '报表分析'), 1, 'active', 'report-sales:view', 'menu'),
  ('采购报表', 'TrendingDown', '/reports/purchase', (SELECT id FROM parent_menus WHERE name = '报表分析'), 2, 'active', 'report-purchase:view', 'menu'),
  ('生产报表', 'Activity', '/reports/production', (SELECT id FROM parent_menus WHERE name = '报表分析'), 3, 'active', 'report-production:view', 'menu'),
  ('库存报表', 'BarChart', '/reports/inventory', (SELECT id FROM parent_menus WHERE name = '报表分析'), 4, 'active', 'report-inventory:view', 'menu')
) AS t(name, icon, path, parent_id, sort, status, permission, type);

-- 为报表类菜单添加特殊权限
WITH report_menus AS (
  SELECT id, name FROM menus
  WHERE type = 'menu'
    AND (name LIKE '%报表%' OR path LIKE '/reports%')
    AND name NOT IN ('报表分析')
)
INSERT INTO menus (name, icon, path, parent_id, sort, status, permission, type)
SELECT
  perm.name,
  NULL as icon,
  NULL as path,
  rm.id as parent_id,
  perm.sort,
  'active' as status,
  CASE
    WHEN rm.name = '销售报表' THEN 'report-sales:' || perm.action
    WHEN rm.name = '采购报表' THEN 'report-purchase:' || perm.action
    WHEN rm.name = '生产报表' THEN 'report-production:' || perm.action
    WHEN rm.name = '库存报表' THEN 'report-inventory:' || perm.action
    ELSE 'report:' || perm.action
  END as permission,
  'permission' as type
FROM report_menus rm
CROSS JOIN (
  VALUES
  ('查看报表', 1, 'view'),
  ('导出报表', 2, 'export'),
  ('打印报表', 3, 'print')
) AS perm(name, sort, action);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 查看结果
SELECT
  CASE
    WHEN parent_id IS NULL THEN name
    ELSE '  └─ ' || name
  END as menu_structure,
  type,
  path,
  permission,
  sort
FROM menus
WHERE parent_id IS NULL OR parent_id IN (
  SELECT id FROM menus WHERE parent_id IS NULL
)
ORDER BY
  COALESCE((SELECT sort FROM menus p WHERE p.id = menus.parent_id), sort),
  parent_id NULLS FIRST,
  sort;
