-- 创建权限管理系统所需的所有表

-- 部门表
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户表（扩展auth.users）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    department_id UUID REFERENCES departments(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 菜单表
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES menus(id),
    name VARCHAR(100) NOT NULL, -- 菜单名称
    title VARCHAR(100) NOT NULL, -- 菜单标题
    icon VARCHAR(50), -- 菜单图标
    route VARCHAR(200), -- 路由地址
    component VARCHAR(200), -- 组件路径
    sort_order INTEGER DEFAULT 0, -- 排序
    is_hidden BOOLEAN DEFAULT false, -- 是否隐藏
    is_external BOOLEAN DEFAULT false, -- 是否外部链接
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')), -- 状态
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 资源表
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- 资源名称
    code VARCHAR(100) UNIQUE NOT NULL, -- 资源代码
    type VARCHAR(20) NOT NULL CHECK (type IN ('api', 'button', 'data')), -- 资源类型
    resource_url VARCHAR(500), -- 资源URL
    method VARCHAR(10), -- HTTP方法
    description TEXT, -- 描述
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')), -- 状态
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色菜单关联表
CREATE TABLE IF NOT EXISTS role_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE, -- 角色ID
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE, -- 菜单ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, menu_id)
);

-- 角色资源关联表
CREATE TABLE IF NOT EXISTS role_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE, -- 角色ID
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE, -- 资源ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, resource_id)
);

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 用户ID
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE, -- 角色ID
    assigned_by UUID REFERENCES users(id), -- 分配者
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 分配时间
    expires_at TIMESTAMP WITH TIME ZONE, -- 过期时间
    UNIQUE(user_id, role_id)
);

-- 权限操作日志表
CREATE TABLE IF NOT EXISTS permission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id), -- 用户ID
    action VARCHAR(50) NOT NULL, -- 操作类型
    resource_type VARCHAR(50), -- 资源类型
    resource_id UUID, -- 资源ID
    details JSONB, -- 详细信息
    ip_address INET, -- IP地址
    user_agent TEXT, -- 用户代理
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_route ON menus(route);
CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_code ON resources(code);
CREATE INDEX IF NOT EXISTS idx_role_menus_role_id ON role_menus(role_id);
CREATE INDEX IF NOT EXISTS idx_role_menus_menu_id ON role_menus(menu_id);
CREATE INDEX IF NOT EXISTS idx_role_resources_role_id ON role_resources(role_id);
CREATE INDEX IF NOT EXISTS idx_role_resources_resource_id ON role_resources(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_permission_logs_user_id ON permission_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_logs_created_at ON permission_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_permission_logs_action ON permission_logs(action);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建更新时间触发器
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_logs ENABLE ROW LEVEL SECURITY;

-- 授予基础权限
GRANT SELECT ON departments TO anon;
GRANT ALL PRIVILEGES ON departments TO authenticated;
GRANT SELECT ON roles TO anon;
GRANT ALL PRIVILEGES ON roles TO authenticated;
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT SELECT ON menus TO anon;
GRANT ALL PRIVILEGES ON menus TO authenticated;
GRANT SELECT ON resources TO anon;
GRANT ALL PRIVILEGES ON resources TO authenticated;
GRANT ALL PRIVILEGES ON role_menus TO authenticated;
GRANT ALL PRIVILEGES ON role_resources TO authenticated;
GRANT ALL PRIVILEGES ON user_roles TO authenticated;
GRANT ALL PRIVILEGES ON permission_logs TO authenticated;

-- 初始化部门数据
INSERT INTO departments (name, code, description) VALUES
('信息技术部', 'IT', '负责系统开发和维护'),
('销售部', 'SALES', '负责产品销售和客户关系'),
('采购部', 'PURCHASE', '负责原材料采购'),
('生产部', 'PRODUCTION', '负责产品生产制造'),
('财务部', 'FINANCE', '负责财务管理和会计'),
('人事部', 'HR', '负责人力资源管理')
ON CONFLICT (code) DO NOTHING;

-- 初始化角色数据
INSERT INTO roles (name, code, description) VALUES
('系统管理员', 'admin', '拥有系统所有权限'),
('部门管理员', 'dept_manager', '拥有部门管理权限'),
('销售经理', 'sales_manager', '拥有销售管理权限'),
('采购经理', 'purchase_manager', '拥有采购管理权限'),
('生产经理', 'production_manager', '拥有生产管理权限'),
('财务经理', 'finance_manager', '拥有财务管理权限'),
('普通用户', 'user', '基础业务操作权限')
ON CONFLICT (code) DO NOTHING;

-- 初始化菜单数据
INSERT INTO menus (name, title, icon, route, sort_order) VALUES
('dashboard', '仪表板', 'LayoutDashboard', '/dashboard', 1),
('master-data', '主数据', 'Database', NULL, 2),
('warehouse', '仓库管理', 'Warehouse', NULL, 3),
('sales', '销售管理', 'ShoppingCart', NULL, 4),
('purchase', '采购管理', 'ShoppingBag', NULL, 5),
('production', '生产管理', 'Factory', NULL, 6),
('finance', '财务管理', 'CreditCard', NULL, 7),
('reports', '报表中心', 'BarChart3', NULL, 8),
('system', '系统管理', 'Settings', NULL, 9)
ON CONFLICT DO NOTHING;

-- 获取父菜单ID并插入子菜单
WITH parent_menus AS (
    SELECT id, name FROM menus WHERE parent_id IS NULL
)
INSERT INTO menus (parent_id, name, title, icon, route, sort_order)
SELECT 
    p.id,
    sub.name,
    sub.title,
    sub.icon,
    sub.route,
    sub.sort_order
FROM parent_menus p
CROSS JOIN (
    VALUES 
        ('master-data', 'customers', '客户管理', 'Users', '/master-data/customers', 1),
        ('master-data', 'suppliers', '供应商管理', 'Truck', '/master-data/suppliers', 2),
        ('master-data', 'products', '产品管理', 'Package', '/master-data/products', 3),
        ('warehouse', 'inventory', '库存管理', 'Package2', '/warehouse/inventory', 1),
        ('warehouse', 'movements', '库存变动', 'ArrowUpDown', '/warehouse/movements', 2),
        ('sales', 'orders', '销售订单', 'FileText', '/sales/orders', 1),
        ('sales', 'quotations', '销售报价', 'FileEdit', '/sales/quotations', 2),
        ('purchase', 'orders', '采购订单', 'FileText', '/purchase/orders', 1),
        ('purchase', 'requests', '采购申请', 'FileEdit', '/purchase/requests', 2),
        ('production', 'plans', '生产计划', 'Calendar', '/production/plans', 1),
        ('production', 'orders', '生产订单', 'FileText', '/production/orders', 2),
        ('production', 'bom', 'BOM管理', 'GitBranch', '/production/bom', 3),
        ('system', 'users', '用户管理', 'Users', '/system/users', 1),
        ('system', 'roles', '角色管理', 'Shield', '/system/roles', 2),
        ('system', 'menus', '菜单管理', 'Menu', '/system/menus', 3),
        ('system', 'permissions', '权限管理', 'Lock', '/system/permissions', 4)
) AS sub(parent_name, name, title, icon, route, sort_order)
WHERE p.name = sub.parent_name
ON CONFLICT DO NOTHING;

-- 初始化资源数据
INSERT INTO resources (name, code, type, resource_url, method, description) VALUES
-- 用户管理资源
('查看用户列表', 'user:list', 'api', '/api/users', 'GET', '查看用户列表权限'),
('创建用户', 'user:create', 'api', '/api/users', 'POST', '创建用户权限'),
('编辑用户', 'user:update', 'api', '/api/users/*', 'PUT', '编辑用户权限'),
('删除用户', 'user:delete', 'api', '/api/users/*', 'DELETE', '删除用户权限'),
('重置密码', 'user:reset-password', 'button', NULL, NULL, '重置用户密码权限'),

-- 角色管理资源
('查看角色列表', 'role:list', 'api', '/api/roles', 'GET', '查看角色列表权限'),
('创建角色', 'role:create', 'api', '/api/roles', 'POST', '创建角色权限'),
('编辑角色', 'role:update', 'api', '/api/roles/*', 'PUT', '编辑角色权限'),
('删除角色', 'role:delete', 'api', '/api/roles/*', 'DELETE', '删除角色权限'),
('分配权限', 'role:assign-permission', 'button', NULL, NULL, '为角色分配权限'),

-- 菜单管理资源
('查看菜单列表', 'menu:list', 'api', '/api/menus', 'GET', '查看菜单列表权限'),
('创建菜单', 'menu:create', 'api', '/api/menus', 'POST', '创建菜单权限'),
('编辑菜单', 'menu:update', 'api', '/api/menus/*', 'PUT', '编辑菜单权限'),
('删除菜单', 'menu:delete', 'api', '/api/menus/*', 'DELETE', '删除菜单权限'),

-- 客户管理资源
('查看客户列表', 'customer:list', 'api', '/api/customers', 'GET', '查看客户列表权限'),
('创建客户', 'customer:create', 'api', '/api/customers', 'POST', '创建客户权限'),
('编辑客户', 'customer:update', 'api', '/api/customers/*', 'PUT', '编辑客户权限'),
('删除客户', 'customer:delete', 'api', '/api/customers/*', 'DELETE', '删除客户权限'),

-- 产品管理资源
('查看产品列表', 'product:list', 'api', '/api/products', 'GET', '查看产品列表权限'),
('创建产品', 'product:create', 'api', '/api/products', 'POST', '创建产品权限'),
('编辑产品', 'product:update', 'api', '/api/products/*', 'PUT', '编辑产品权限'),
('删除产品', 'product:delete', 'api', '/api/products/*', 'DELETE', '删除产品权限'),

-- 库存管理资源
('查看库存', 'inventory:list', 'api', '/api/inventory', 'GET', '查看库存权限'),
('库存调整', 'inventory:adjust', 'api', '/api/inventory/adjust', 'POST', '库存调整权限'),
('库存盘点', 'inventory:count', 'button', NULL, NULL, '库存盘点权限'),

-- 销售管理资源
('查看销售订单', 'sales-order:list', 'api', '/api/sales-orders', 'GET', '查看销售订单权限'),
('创建销售订单', 'sales-order:create', 'api', '/api/sales-orders', 'POST', '创建销售订单权限'),
('编辑销售订单', 'sales-order:update', 'api', '/api/sales-orders/*', 'PUT', '编辑销售订单权限'),
('删除销售订单', 'sales-order:delete', 'api', '/api/sales-orders/*', 'DELETE', '删除销售订单权限'),
('确认订单', 'sales-order:confirm', 'button', NULL, NULL, '确认销售订单权限'),

-- 采购管理资源
('查看采购订单', 'purchase-order:list', 'api', '/api/purchase-orders', 'GET', '查看采购订单权限'),
('创建采购订单', 'purchase-order:create', 'api', '/api/purchase-orders', 'POST', '创建采购订单权限'),
('编辑采购订单', 'purchase-order:update', 'api', '/api/purchase-orders/*', 'PUT', '编辑采购订单权限'),
('删除采购订单', 'purchase-order:delete', 'api', '/api/purchase-orders/*', 'DELETE', '删除采购订单权限'),

-- 生产管理资源
('查看生产计划', 'production-plan:list', 'api', '/api/production-plans', 'GET', '查看生产计划权限'),
('创建生产计划', 'production-plan:create', 'api', '/api/production-plans', 'POST', '创建生产计划权限'),
('编辑生产计划', 'production-plan:update', 'api', '/api/production-plans/*', 'PUT', '编辑生产计划权限'),
('删除生产计划', 'production-plan:delete', 'api', '/api/production-plans/*', 'DELETE', '删除生产计划权限')
ON CONFLICT (code) DO NOTHING;

-- 为admin角色分配所有菜单权限
WITH admin_role AS (
    SELECT id FROM roles WHERE code = 'admin'
),
all_menus AS (
    SELECT id FROM menus
)
INSERT INTO role_menus (role_id, menu_id)
SELECT ar.id, am.id
FROM admin_role ar
CROSS JOIN all_menus am
ON CONFLICT (role_id, menu_id) DO NOTHING;

-- 为admin角色分配所有资源权限
WITH admin_role AS (
    SELECT id FROM roles WHERE code = 'admin'
),
all_resources AS (
    SELECT id FROM resources
)
INSERT INTO role_resources (role_id, resource_id)
SELECT ar.id, ares.id
FROM admin_role ar
CROSS JOIN all_resources ares
ON CONFLICT (role_id, resource_id) DO NOTHING;

-- 创建权限查询函数
CREATE OR REPLACE FUNCTION get_user_menus(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    parent_id UUID,
    name VARCHAR,
    title VARCHAR,
    icon VARCHAR,
    route VARCHAR,
    component VARCHAR,
    sort_order INTEGER,
    is_hidden BOOLEAN,
    is_external BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        m.id,
        m.parent_id,
        m.name,
        m.title,
        m.icon,
        m.route,
        m.component,
        m.sort_order,
        m.is_hidden,
        m.is_external
    FROM menus m
    INNER JOIN role_menus rm ON m.id = rm.menu_id
    INNER JOIN user_roles ur ON rm.role_id = ur.role_id
    WHERE ur.user_id = p_user_id
      AND m.status = 'active'
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ORDER BY m.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建权限检查函数
CREATE OR REPLACE FUNCTION check_user_permission(p_user_id UUID, p_resource_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM user_roles ur
        INNER JOIN role_resources rr ON ur.role_id = rr.role_id
        INNER JOIN resources r ON rr.resource_id = r.id
        WHERE ur.user_id = p_user_id
          AND r.code = p_resource_code
          AND r.status = 'active'
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建权限日志记录函数
CREATE OR REPLACE FUNCTION log_permission_action(
    p_user_id UUID,
    p_action VARCHAR,
    p_resource_type VARCHAR DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO permission_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;