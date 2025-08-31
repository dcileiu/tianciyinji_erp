-- 完整的角色权限系统迁移
-- 与现有菜单表兼容，创建角色表和权限关联
-- 可直接在Supabase SQL Editor中执行

-- 1. 创建角色表
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
COMMENT ON COLUMN roles.id IS '角色 ID，唯一标识角色';
COMMENT ON COLUMN roles.name IS '角色名称';
COMMENT ON COLUMN roles.code IS '角色编码，唯一标识，如 admin, user';
COMMENT ON COLUMN roles.description IS '角色描述';
COMMENT ON COLUMN roles.status IS '状态（0：禁用，1：启用）';
COMMENT ON COLUMN roles.is_system IS '是否系统角色';
COMMENT ON COLUMN roles.created_at IS '创建时间';
COMMENT ON COLUMN roles.updated_at IS '更新时间';

-- 2. 创建用户角色关联表
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
COMMENT ON COLUMN users_role.user_id IS '用户 ID，关联 auth.users';
COMMENT ON COLUMN users_role.role_id IS '角色 ID，关联 roles';
COMMENT ON COLUMN users_role.assigned_at IS '分配时间';
COMMENT ON COLUMN users_role.assigned_by IS '分配人';

-- 3. 创建角色菜单权限关联表
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
COMMENT ON COLUMN roles_menu.role_id IS '角色 ID，关联 roles';
COMMENT ON COLUMN roles_menu.menu_id IS '菜单 ID，关联 menus';
COMMENT ON COLUMN roles_menu.granted_at IS '授权时间';
COMMENT ON COLUMN roles_menu.granted_by IS '授权人';

-- 4. 创建索引提升性能
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_status ON roles(status);
CREATE INDEX IF NOT EXISTS idx_users_role_user_id ON users_role(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role_role_id ON users_role(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_menu_role_id ON roles_menu(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_menu_menu_id ON roles_menu(menu_id);

-- 5. 创建触发器自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 启用 RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_menu ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow authenticated read on roles" ON roles;
DROP POLICY IF EXISTS "Allow admin full access on roles" ON roles;
DROP POLICY IF EXISTS "Allow users to view own roles" ON users_role;
DROP POLICY IF EXISTS "Allow admin full access on users_role" ON users_role;
DROP POLICY IF EXISTS "Allow authenticated read on roles_menu" ON roles_menu;
DROP POLICY IF EXISTS "Allow admin full access on roles_menu" ON roles_menu;

-- 7. 创建 RLS 策略
-- 角色表策略
CREATE POLICY "Allow authenticated read on roles" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access on roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_role ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('super_admin', 'system_admin')
    )
  );

-- 用户角色关联表策略
CREATE POLICY "Allow users to view own roles" ON users_role
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Allow admin full access on users_role" ON users_role
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_role ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('super_admin', 'system_admin')
    )
  );

-- 角色菜单权限关联表策略
CREATE POLICY "Allow authenticated read on roles_menu" ON roles_menu
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access on roles_menu" ON roles_menu
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_role ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('super_admin', 'system_admin')
    )
  );

-- 8. 插入默认角色数据
INSERT INTO roles (name, code, description, is_system, status) VALUES
('超级管理员', 'super_admin', '系统最高权限管理员，拥有所有权限', true, 1),
('系统管理员', 'system_admin', '系统管理权限，可管理用户、角色、菜单等', true, 1),
('业务管理员', 'business_admin', '业务模块管理权限，可管理业务数据', false, 1),
('普通用户', 'user', '基础查看权限，只能查看授权的菜单', false, 1)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- 9. 为系统管理员角色分配所有菜单权限
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

  -- 如果找到了系统管理员角色，则为其分配所有菜单权限
  IF system_admin_role_id IS NOT NULL THEN
    -- 删除现有权限（如果有的话）
    DELETE FROM roles_menu WHERE role_id = system_admin_role_id;

    -- 为系统管理员分配所有菜单权限
    INSERT INTO roles_menu (role_id, menu_id)
    SELECT system_admin_role_id, m.id
    FROM menus m
    WHERE m.status = 'active'
    ON CONFLICT (role_id, menu_id) DO NOTHING;

    RAISE NOTICE '已为系统管理员角色分配 % 个菜单权限', menu_count;
  END IF;

  -- 如果找到了超级管理员角色，也为其分配所有菜单权限
  IF super_admin_role_id IS NOT NULL THEN
    -- 删除现有权限（如果有的话）
    DELETE FROM roles_menu WHERE role_id = super_admin_role_id;

    -- 为超级管理员分配所有菜单权限
    INSERT INTO roles_menu (role_id, menu_id)
    SELECT super_admin_role_id, m.id
    FROM menus m
    WHERE m.status = 'active'
    ON CONFLICT (role_id, menu_id) DO NOTHING;

    RAISE NOTICE '已为超级管理员角色分配 % 个菜单权限', menu_count;
  END IF;
END $$;

-- 10. 创建获取用户权限的视图
DROP VIEW IF EXISTS user_menu_permissions;
CREATE VIEW user_menu_permissions AS
SELECT DISTINCT
  ur.user_id,
  m.id as menu_id,
  m.name as menu_name,
  m.path as menu_path,
  m.permission as menu_permission,
  r.code as role_code,
  r.name as role_name
FROM users_role ur
JOIN roles r ON ur.role_id = r.id
JOIN roles_menu rm ON r.id = rm.role_id
JOIN menus m ON rm.menu_id = m.id
WHERE r.status = 1
  AND m.status = 'active';

-- 11. 创建获取用户菜单树的函数
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

-- 12. 创建检查用户权限的函数
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

-- 13. 创建获取用户角色的函数
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

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '角色权限系统创建完成！';
  RAISE NOTICE '已创建表：roles, users_role, roles_menu';
  RAISE NOTICE '已创建视图：user_menu_permissions';
  RAISE NOTICE '已创建函数：get_user_menu_tree, check_user_menu_permission, get_user_roles';
  RAISE NOTICE '已插入默认角色并为管理员分配所有菜单权限';
END $$;
