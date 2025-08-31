-- 查询角色权限情况
-- 检查哪个角色有权限，以及分配了哪些菜单

-- 1. 查看有权限的角色
SELECT
  r.id,
  r.name,
  r.code,
  r.description,
  r.is_system,
  COUNT(rm.menu_id) as menu_count
FROM roles r
LEFT JOIN roles_menu rm ON r.id = rm.role_id
GROUP BY r.id, r.name, r.code, r.description, r.is_system
ORDER BY menu_count DESC;

-- 2. 查看具体的权限分配（针对有权限的角色）
SELECT
  r.name as role_name,
  r.code as role_code,
  m.id as menu_id,
  m.name as menu_name,
  m.path as menu_path,
  m.type as menu_type
FROM roles r
JOIN roles_menu rm ON r.id = rm.role_id
JOIN menus m ON rm.menu_id = m.id
WHERE r.id = '9baad900-7816-4d8a-a2c3-66150bd2f0b9'
ORDER BY m.sort, m.name;

-- 3. 检查所有角色的权限数量
SELECT
  r.name,
  r.code,
  r.id,
  COUNT(rm.menu_id) as permission_count
FROM roles r
LEFT JOIN roles_menu rm ON r.id = rm.role_id
GROUP BY r.id, r.name, r.code
ORDER BY permission_count DESC;
