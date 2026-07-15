-- 简化版本：修改角色状态字段类型
-- 请按顺序执行以下步骤

-- 步骤1：删除依赖的视图
DROP VIEW IF EXISTS user_menu_permissions CASCADE;
DROP VIEW IF EXISTS role_permissions CASCADE;
DROP VIEW IF EXISTS user_permissions CASCADE;

-- 步骤2：添加新的状态列
ALTER TABLE roles ADD COLUMN status_new VARCHAR(20);

-- 步骤3：转换现有数据
UPDATE roles SET status_new =
    CASE
        WHEN status::text = '1' THEN 'active'
        WHEN status::text = '0' THEN 'inactive'
        ELSE 'inactive'
    END;

-- 步骤4：删除旧的状态列
ALTER TABLE roles DROP COLUMN status;

-- 步骤5：重命名新列
ALTER TABLE roles RENAME COLUMN status_new TO status;

-- 步骤6：设置默认值和约束
ALTER TABLE roles ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE roles ALTER COLUMN status SET NOT NULL;
ALTER TABLE roles ADD CONSTRAINT check_roles_status CHECK (status IN ('active', 'inactive'));

-- 步骤7：重新创建用户菜单权限视图（如果需要）
CREATE OR REPLACE VIEW user_menu_permissions AS
SELECT
    u.id as user_id,
    u.email,
    r.id as role_id,
    r.name as role_name,
    r.status as role_status,
    m.id as menu_id,
    m.name as menu_name,
    m.path as menu_path,
    m.type as menu_type
FROM auth.users u
JOIN users_role ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id AND r.status = 'active'
JOIN roles_menu rm ON r.id = rm.role_id
JOIN menus m ON rm.menu_id = m.id AND m.status = 'active';

-- 步骤8：验证结果
SELECT id, name, code, status, created_at FROM roles ORDER BY created_at;
