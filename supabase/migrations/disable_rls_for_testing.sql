-- 临时禁用RLS以便测试角色管理功能
-- 注意：这仅适用于开发环境，生产环境需要正确配置RLS策略

-- 禁用角色相关表的RLS
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users_role DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles_menu DISABLE ROW LEVEL SECURITY;

-- 也可以禁用菜单表的RLS（如果有的话）
ALTER TABLE menus DISABLE ROW LEVEL SECURITY;

-- 提示信息
DO $$
BEGIN
  RAISE NOTICE '已禁用RLS，仅用于开发测试！';
  RAISE NOTICE '生产环境请重新启用RLS并配置正确的策略';
END $$;
