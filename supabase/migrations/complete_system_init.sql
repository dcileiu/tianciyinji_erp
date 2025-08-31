-- 完整的ERP系统初始化脚本
-- 包含: menus, roles, users_role, roles_menu 表的创建和初始数据
-- 如果表已存在则跳过创建，如果数据已存在则跳过插入

-- =============================================
-- 1. 创建菜单表 (如果不存在)
-- =============================================
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  path VARCHAR(200),
  parent_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  sort INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  permission VARCHAR(100),
  type VARCHAR(20) NOT NULL DEFAULT 'menu' CHECK (type IN ('directory', 'menu', 'permission')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE menus IS '系统菜单表';
COMMENT ON COLUMN menus.name IS '菜单名称';
COMMENT ON COLUMN menus.icon IS '菜单图标';
COMMENT ON COLUMN menus.path IS '菜单路径';
COMMENT ON COLUMN menus.parent_id IS '父菜单ID';
COMMENT ON COLUMN menus.sort IS '排序号';
COMMENT ON COLUMN menus.status IS '状态: active=启用, inactive=禁用';
COMMENT ON COLUMN menus.permission IS '权限标识';
COMMENT ON COLUMN menus.type IS '类型: directory=目录, menu=菜单, permission=权限';

-- =============================================
-- 2. 创建角色表 (如果不存在)
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  status SMALLINT NOT NULL DEFAULT 1 CHECK (status IN (0, 1)),
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles IS '角色表';
COMMENT ON COLUMN roles.name IS '角色名称';
COMMENT ON COLUMN roles.code IS '角色编码，唯一标识';
COMMENT ON COLUMN roles.description IS '角色描述';
COMMENT ON COLUMN roles.status IS '状态（0：禁用，1：启用）';
COMMENT ON COLUMN roles.is_system IS '是否系统角色';

-- =============================================
-- 3. 创建部门表 (如果不存在)
-- =============================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  manager_id UUID, -- 部门经理的用户ID，暂不设外键约束
  sort INTEGER NOT NULL DEFAULT 0,
  status SMALLINT NOT NULL DEFAULT 1 CHECK (status IN (0, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE departments IS '部门表';
COMMENT ON COLUMN departments.name IS '部门名称';
COMMENT ON COLUMN departments.code IS '部门编码，唯一标识';
COMMENT ON COLUMN departments.description IS '部门描述';
COMMENT ON COLUMN departments.parent_id IS '上级部门ID';
COMMENT ON COLUMN departments.manager_id IS '部门经理用户ID';
COMMENT ON COLUMN departments.sort IS '排序号';
COMMENT ON COLUMN departments.status IS '状态（0：禁用，1：启用）';

-- =============================================
-- 4. 创建用户角色关联表 (如果不存在)
-- =============================================
CREATE TABLE IF NOT EXISTS users_role (
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

COMMENT ON TABLE users_role IS '用户角色关联表';
COMMENT ON COLUMN users_role.user_id IS '用户ID，关联auth.users';
COMMENT ON COLUMN users_role.role_id IS '角色ID，关联roles';
COMMENT ON COLUMN users_role.assigned_at IS '分配时间';
COMMENT ON COLUMN users_role.assigned_by IS '分配人';

-- =============================================
-- 4. 创建角色菜单权限关联表 (如果不存在)
-- =============================================
CREATE TABLE IF NOT EXISTS roles_menu (
  role_id UUID NOT NULL,
  menu_id UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (role_id, menu_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);

COMMENT ON TABLE roles_menu IS '角色菜单权限关联表';
COMMENT ON COLUMN roles_menu.role_id IS '角色ID，关联roles';
COMMENT ON COLUMN roles_menu.menu_id IS '菜单ID，关联menus';
COMMENT ON COLUMN roles_menu.granted_at IS '授权时间';
COMMENT ON COLUMN roles_menu.granted_by IS '授权人';

-- =============================================
-- 5. 创建索引 (如果不存在)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_status ON menus(status);
CREATE INDEX IF NOT EXISTS idx_menus_sort ON menus(sort);

CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_status ON roles(status);

CREATE INDEX IF NOT EXISTS idx_users_role_user_id ON users_role(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role_role_id ON users_role(role_id);

CREATE INDEX IF NOT EXISTS idx_roles_menu_role_id ON roles_menu(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_menu_menu_id ON roles_menu(menu_id);

-- =============================================
-- 6. 创建触发器 (如果不存在)
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. 插入基础菜单数据 (如果不存在)
-- =============================================
DO $$
DECLARE
  dashboard_id UUID;
  system_id UUID;
  master_data_id UUID;
  production_id UUID;
  purchase_id UUID;
  sales_id UUID;
  warehouse_id UUID;
  finance_id UUID;
  reports_id UUID;
BEGIN
  -- 插入主菜单 (仅在不存在时插入)

  -- 仪表盘
  INSERT INTO menus (name, icon, path, type, sort, permission)
  SELECT '仪表盘', 'BarChart3', '/dashboard', 'menu', 1, 'dashboard:view'
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE path = '/dashboard')
  RETURNING id INTO dashboard_id;

  -- 系统管理
  INSERT INTO menus (name, icon, type, sort)
  SELECT '系统管理', 'Settings', 'directory', 100
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '系统管理' AND type = 'directory')
  RETURNING id INTO system_id;

  -- 如果系统管理菜单已存在，获取其ID
  IF system_id IS NULL THEN
    SELECT id INTO system_id FROM menus WHERE name = '系统管理' AND type = 'directory';
  END IF;

  -- 基础数据
  INSERT INTO menus (name, icon, type, sort)
  SELECT '基础数据', 'Database', 'directory', 10
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '基础数据' AND type = 'directory')
  RETURNING id INTO master_data_id;

  IF master_data_id IS NULL THEN
    SELECT id INTO master_data_id FROM menus WHERE name = '基础数据' AND type = 'directory';
  END IF;

  -- 生产管理
  INSERT INTO menus (name, icon, type, sort)
  SELECT '生产管理', 'Factory', 'directory', 20
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '生产管理' AND type = 'directory')
  RETURNING id INTO production_id;

  IF production_id IS NULL THEN
    SELECT id INTO production_id FROM menus WHERE name = '生产管理' AND type = 'directory';
  END IF;

  -- 采购管理
  INSERT INTO menus (name, icon, type, sort)
  SELECT '采购管理', 'ShoppingCart', 'directory', 30
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '采购管理' AND type = 'directory')
  RETURNING id INTO purchase_id;

  IF purchase_id IS NULL THEN
    SELECT id INTO purchase_id FROM menus WHERE name = '采购管理' AND type = 'directory';
  END IF;

  -- 销售管理
  INSERT INTO menus (name, icon, type, sort)
  SELECT '销售管理', 'TrendingUp', 'directory', 40
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '销售管理' AND type = 'directory')
  RETURNING id INTO sales_id;

  IF sales_id IS NULL THEN
    SELECT id INTO sales_id FROM menus WHERE name = '销售管理' AND type = 'directory';
  END IF;

  -- 仓库管理
  INSERT INTO menus (name, icon, type, sort)
  SELECT '仓库管理', 'Package', 'directory', 50
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '仓库管理' AND type = 'directory')
  RETURNING id INTO warehouse_id;

  IF warehouse_id IS NULL THEN
    SELECT id INTO warehouse_id FROM menus WHERE name = '仓库管理' AND type = 'directory';
  END IF;

  -- 财务管理
  INSERT INTO menus (name, icon, type, sort)
  SELECT '财务管理', 'CreditCard', 'directory', 60
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '财务管理' AND type = 'directory')
  RETURNING id INTO finance_id;

  IF finance_id IS NULL THEN
    SELECT id INTO finance_id FROM menus WHERE name = '财务管理' AND type = 'directory';
  END IF;

  -- 报表分析
  INSERT INTO menus (name, icon, type, sort)
  SELECT '报表分析', 'BarChart', 'directory', 70
  WHERE NOT EXISTS (SELECT 1 FROM menus WHERE name = '报表分析' AND type = 'directory')
  RETURNING id INTO reports_id;

  IF reports_id IS NULL THEN
    SELECT id INTO reports_id FROM menus WHERE name = '报表分析' AND type = 'directory';
  END IF;

  -- 插入子菜单

  -- 系统管理子菜单
  INSERT INTO menus (name, icon, path, parent_id, type, sort, permission)
  SELECT * FROM (VALUES
    ('用户管理', 'Users', '/system/users', system_id, 'menu', 1, 'system:users'),
    ('角色管理', 'Shield', '/system/roles', system_id, 'menu', 2, 'system:roles'),
    ('菜单管理', 'Menu', '/system/menus', system_id, 'menu', 3, 'system:menus'),
    ('部门管理', 'Building2', '/system/departments', system_id, 'menu', 4, 'system:departments'),
    ('岗位管理', 'UserCheck', '/system/positions', system_id, 'menu', 5, 'system:positions'),
    ('字典管理', 'Book', '/system/dictionaries', system_id, 'menu', 6, 'system:dictionaries'),
    ('系统配置', 'Settings', '/system/config', system_id, 'menu', 7, 'system:config'),
    ('系统日志', 'FileText', '/system/logs', system_id, 'menu', 8, 'system:logs')
  ) AS v(name, icon, path, parent_id, type, sort, permission)
  WHERE NOT EXISTS (
    SELECT 1 FROM menus
    WHERE menus.name = v.name AND menus.parent_id = v.parent_id
  );

  -- 基础数据子菜单
  INSERT INTO menus (name, icon, path, parent_id, type, sort, permission)
  SELECT * FROM (VALUES
    ('产品管理', 'Package2', '/master-data/products', master_data_id, 'menu', 1, 'master:products'),
    ('供应商管理', 'Truck', '/master-data/suppliers', master_data_id, 'menu', 2, 'master:suppliers'),
    ('客户管理', 'Users', '/master-data/customers', master_data_id, 'menu', 3, 'master:customers'),
    ('仓库管理', 'Warehouse', '/master-data/warehouses', master_data_id, 'menu', 4, 'master:warehouses')
  ) AS v(name, icon, path, parent_id, type, sort, permission)
  WHERE NOT EXISTS (
    SELECT 1 FROM menus
    WHERE menus.name = v.name AND menus.parent_id = v.parent_id
  );

  -- 生产管理子菜单
  INSERT INTO menus (name, icon, path, parent_id, type, sort, permission)
  SELECT * FROM (VALUES
    ('生产计划', 'Calendar', '/production/plans', production_id, 'menu', 1, 'production:plans'),
    ('生产订单', 'ClipboardList', '/production/orders', production_id, 'menu', 2, 'production:orders'),
    ('物料清单', 'List', '/production/bom', production_id, 'menu', 3, 'production:bom'),
    ('车间管理', 'Factory', '/production/workshops', production_id, 'menu', 4, 'production:workshops')
  ) AS v(name, icon, path, parent_id, type, sort, permission)
  WHERE NOT EXISTS (
    SELECT 1 FROM menus
    WHERE menus.name = v.name AND menus.parent_id = v.parent_id
  );

  -- 采购管理子菜单
  INSERT INTO menus (name, icon, path, parent_id, type, sort, permission)
  SELECT * FROM (VALUES
    ('采购订单', 'ShoppingCart', '/purchase/orders', purchase_id, 'menu', 1, 'purchase:orders'),
    ('供应商管理', 'Truck', '/purchase/suppliers', purchase_id, 'menu', 2, 'purchase:suppliers')
  ) AS v(name, icon, path, parent_id, type, sort, permission)
  WHERE NOT EXISTS (
    SELECT 1 FROM menus
    WHERE menus.name = v.name AND menus.parent_id = v.parent_id
  );

  -- 销售管理子菜单
  INSERT INTO menus (name, icon, path, parent_id, type, sort, permission)
  SELECT * FROM (VALUES
    ('销售订单', 'FileText', '/sales/orders', sales_id, 'menu', 1, 'sales:orders'),
    ('客户管理', 'Users', '/sales/customers', sales_id, 'menu', 2, 'sales:customers')
  ) AS v(name, icon, path, parent_id, type, sort, permission)
  WHERE NOT EXISTS (
    SELECT 1 FROM menus
    WHERE menus.name = v.name AND menus.parent_id = v.parent_id
  );

  -- 仓库管理子菜单
  INSERT INTO menus (name, icon, path, parent_id, type, sort, permission)
  SELECT * FROM (VALUES
    ('库存管理', 'Package', '/warehouse/inventory', warehouse_id, 'menu', 1, 'warehouse:inventory'),
    ('库存调拨', 'ArrowLeftRight', '/warehouse/transfers', warehouse_id, 'menu', 2, 'warehouse:transfers'),
    ('仓库设置', 'Warehouse', '/warehouse/warehouses', warehouse_id, 'menu', 3, 'warehouse:settings')
  ) AS v(name, icon, path, parent_id, type, sort, permission)
  WHERE NOT EXISTS (
    SELECT 1 FROM menus
    WHERE menus.name = v.name AND menus.parent_id = v.parent_id
  );

  -- 财务管理子菜单
  INSERT INTO menus (name, icon, path, parent_id, type, sort, permission)
  SELECT * FROM (VALUES
    ('应收管理', 'CreditCard', '/finance/receivables', finance_id, 'menu', 1, 'finance:receivables'),
    ('应付管理', 'Wallet', '/finance/payables', finance_id, 'menu', 2, 'finance:payables'),
    ('发票管理', 'Receipt', '/finance/invoices', finance_id, 'menu', 3, 'finance:invoices'),
    ('收付款管理', 'Banknote', '/finance/payments', finance_id, 'menu', 4, 'finance:payments')
  ) AS v(name, icon, path, parent_id, type, sort, permission)
  WHERE NOT EXISTS (
    SELECT 1 FROM menus
    WHERE menus.name = v.name AND menus.parent_id = v.parent_id
  );

  -- 报表分析子菜单
  INSERT INTO menus (name, icon, path, parent_id, type, sort, permission)
  SELECT * FROM (VALUES
    ('销售报表', 'TrendingUp', '/reports/sales', reports_id, 'menu', 1, 'reports:sales'),
    ('采购报表', 'ShoppingBag', '/reports/purchase', reports_id, 'menu', 2, 'reports:purchase'),
    ('库存报表', 'Package', '/reports/inventory', reports_id, 'menu', 3, 'reports:inventory'),
    ('生产报表', 'Factory', '/reports/production', reports_id, 'menu', 4, 'reports:production'),
    ('财务报表', 'PieChart', '/reports/finance', reports_id, 'menu', 5, 'reports:finance')
  ) AS v(name, icon, path, parent_id, type, sort, permission)
  WHERE NOT EXISTS (
    SELECT 1 FROM menus
    WHERE menus.name = v.name AND menus.parent_id = v.parent_id
  );

END $$;

-- =============================================
-- 8. 插入角色数据 (如果不存在)
-- =============================================
INSERT INTO roles (name, code, description, is_system, status)
SELECT * FROM (VALUES
  ('超级管理员', 'super_admin', '系统最高权限管理员，拥有所有权限', true, 1),
  ('系统管理员', 'system_admin', '系统管理权限，可管理用户、角色、菜单等', true, 1),
  ('业务管理员', 'business_admin', '业务模块管理权限，可管理业务数据', false, 1),
  ('普通用户', 'user', '基础查看权限，只能查看授权的菜单', false, 1)
) AS v(name, code, description, is_system, status)
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE roles.code = v.code);

-- =============================================
-- 9. 为系统管理员和超级管理员分配所有菜单权限
-- =============================================
DO $$
DECLARE
  system_admin_role_id UUID;
  super_admin_role_id UUID;
  menu_count INTEGER;
BEGIN
  -- 获取系统管理员和超级管理员角色ID
  SELECT id INTO system_admin_role_id FROM roles WHERE code = 'system_admin';
  SELECT id INTO super_admin_role_id FROM roles WHERE code = 'super_admin';

  -- 获取菜单总数
  SELECT COUNT(*) INTO menu_count FROM menus WHERE status = 'active';

  -- 为系统管理员分配所有菜单权限
  IF system_admin_role_id IS NOT NULL THEN
    INSERT INTO roles_menu (role_id, menu_id)
    SELECT system_admin_role_id, m.id
    FROM menus m
    WHERE m.status = 'active'
    ON CONFLICT (role_id, menu_id) DO NOTHING;

    RAISE NOTICE '已为系统管理员角色分配 % 个菜单权限', menu_count;
  END IF;

  -- 为超级管理员分配所有菜单权限
  IF super_admin_role_id IS NOT NULL THEN
    INSERT INTO roles_menu (role_id, menu_id)
    SELECT super_admin_role_id, m.id
    FROM menus m
    WHERE m.status = 'active'
    ON CONFLICT (role_id, menu_id) DO NOTHING;

    RAISE NOTICE '已为超级管理员角色分配 % 个菜单权限', menu_count;
  END IF;

  -- 为业务管理员分配部分权限
  DECLARE
    business_admin_role_id UUID;
  BEGIN
    SELECT id INTO business_admin_role_id FROM roles WHERE code = 'business_admin';

    IF business_admin_role_id IS NOT NULL THEN
      INSERT INTO roles_menu (role_id, menu_id)
      SELECT business_admin_role_id, m.id
      FROM menus m
      WHERE m.status = 'active'
        AND (m.permission LIKE 'master:%'
             OR m.permission LIKE 'production:%'
             OR m.permission LIKE 'purchase:%'
             OR m.permission LIKE 'sales:%'
             OR m.permission LIKE 'warehouse:%'
             OR m.permission = 'dashboard:view')
      ON CONFLICT (role_id, menu_id) DO NOTHING;

      RAISE NOTICE '已为业务管理员角色分配业务相关菜单权限';
    END IF;
  END;

  -- 为普通用户分配基础权限
  DECLARE
    user_role_id UUID;
  BEGIN
    SELECT id INTO user_role_id FROM roles WHERE code = 'user';

    IF user_role_id IS NOT NULL THEN
      INSERT INTO roles_menu (role_id, menu_id)
      SELECT user_role_id, m.id
      FROM menus m
      WHERE m.status = 'active'
        AND m.permission = 'dashboard:view'
      ON CONFLICT (role_id, menu_id) DO NOTHING;

      RAISE NOTICE '已为普通用户角色分配基础权限';
    END IF;
  END;
END $$;

-- =============================================
-- 10. 创建实用的视图和函数
-- =============================================

-- 用户菜单权限视图
DROP VIEW IF EXISTS user_menu_permissions;
CREATE VIEW user_menu_permissions AS
SELECT DISTINCT
  ur.user_id,
  m.id as menu_id,
  m.name as menu_name,
  m.path as menu_path,
  m.permission as menu_permission,
  m.icon as menu_icon,
  m.type as menu_type,
  m.parent_id,
  m.sort,
  r.code as role_code,
  r.name as role_name
FROM users_role ur
JOIN roles r ON ur.role_id = r.id
JOIN roles_menu rm ON r.id = rm.role_id
JOIN menus m ON rm.menu_id = m.id
WHERE r.status = 1
  AND m.status = 'active';

-- 获取用户菜单树的函数
CREATE OR REPLACE FUNCTION get_user_menu_tree(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  menu_tree JSON;
BEGIN
  WITH RECURSIVE menu_hierarchy AS (
    -- 获取用户有权限的顶级菜单
    SELECT DISTINCT
      m.id,
      m.name,
      m.icon,
      m.path,
      m.parent_id,
      m.sort,
      m.type,
      m.permission,
      0 as level
    FROM menus m
    JOIN roles_menu rm ON m.id = rm.menu_id
    JOIN users_role ur ON rm.role_id = ur.role_id
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND r.status = 1
      AND m.status = 'active'
      AND m.parent_id IS NULL

    UNION ALL

    -- 递归获取子菜单
    SELECT
      m.id,
      m.name,
      m.icon,
      m.path,
      m.parent_id,
      m.sort,
      m.type,
      m.permission,
      mh.level + 1
    FROM menus m
    JOIN menu_hierarchy mh ON m.parent_id = mh.id
    JOIN roles_menu rm ON m.id = rm.menu_id
    JOIN users_role ur ON rm.role_id = ur.role_id
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND r.status = 1
      AND m.status = 'active'
  )
  SELECT json_agg(
    json_build_object(
      'id', id,
      'name', name,
      'icon', icon,
      'path', path,
      'parent_id', parent_id,
      'sort', sort,
      'type', type,
      'permission', permission
    ) ORDER BY sort, name
  )
  INTO menu_tree
  FROM menu_hierarchy;

  RETURN COALESCE(menu_tree, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户权限的函数
CREATE OR REPLACE FUNCTION check_user_menu_permission(
  p_user_id UUID,
  p_menu_path VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_menu_permissions ump
    WHERE ump.user_id = p_user_id
    AND (ump.menu_path = p_menu_path OR ump.menu_permission = p_menu_path)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户角色的函数
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE(
  role_id UUID,
  role_code VARCHAR,
  role_name VARCHAR,
  role_description VARCHAR,
  assigned_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.code,
    r.name,
    r.description,
    ur.assigned_at
  FROM users_role ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND r.status = 1
  ORDER BY ur.assigned_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 完成提示
-- =============================================
DO $$
DECLARE
  menu_count INTEGER;
  role_count INTEGER;
  permission_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO menu_count FROM menus;
  SELECT COUNT(*) INTO role_count FROM roles;
  SELECT COUNT(*) INTO permission_count FROM roles_menu;

  RAISE NOTICE '=== ERP系统初始化完成 ===';
  RAISE NOTICE '已创建菜单数量: %', menu_count;
  RAISE NOTICE '已创建角色数量: %', role_count;
  RAISE NOTICE '已分配权限数量: %', permission_count;
  RAISE NOTICE '系统已就绪，可以开始使用！';
END $$;
