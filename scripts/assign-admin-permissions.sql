-- 为当前用户分配管理员权限
-- 请将 'YOUR_USER_ID' 替换为实际的用户ID
-- roles.status 使用 'active' / 'inactive'

-- 1. 创建管理员角色（如果不存在）
INSERT INTO roles (name, code, description, status, is_system)
SELECT '超级管理员', 'super_admin', '系统超级管理员，拥有所有权限', 'active', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = 'super_admin');

-- 2. 获取管理员角色ID和所有菜单ID，为管理员角色分配所有菜单权限
INSERT INTO roles_menu (role_id, menu_id)
SELECT r.id, m.id
FROM roles r, menus m
WHERE r.code = 'super_admin'
  AND m.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM roles_menu rm
    WHERE rm.role_id = r.id AND rm.menu_id = m.id
  );

-- 3. 为指定用户分配管理员角色
-- 注意：请将下面的 'YOUR_USER_ID' 替换为实际的用户ID
-- 您可以从 auth.users 表中找到用户ID

-- INSERT INTO users_role (user_id, role_id)
-- SELECT 'YOUR_USER_ID', r.id
-- FROM roles r
-- WHERE r.code = 'super_admin'
--   AND NOT EXISTS (
--     SELECT 1 FROM users_role ur
--     WHERE ur.user_id = 'YOUR_USER_ID' AND ur.role_id = r.id
--   );

-- 4. 查看当前用户（用于获取用户ID）
SELECT
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 5. 查看角色和权限配置
SELECT
  r.name as role_name,
  r.code as role_code,
  COUNT(rm.menu_id) as menu_count
FROM roles r
LEFT JOIN roles_menu rm ON r.id = rm.role_id
WHERE r.status = 'active'
GROUP BY r.id, r.name, r.code
ORDER BY r.created_at;
