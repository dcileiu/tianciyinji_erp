-- 修复角色状态字段类型，处理视图依赖问题
-- 这个脚本会先删除依赖的视图，修改字段类型，然后重新创建视图

-- 1. 先查看现有的视图定义（用于后续重建）
-- 如果你想保存现有视图定义，可以先运行这个查询：
-- SELECT definition FROM pg_views WHERE viewname = 'user_menu_permissions';

-- 2. 删除依赖的视图（如果存在）
DROP VIEW IF EXISTS user_menu_permissions CASCADE;

-- 3. 删除可能存在的其他依赖视图
DROP VIEW IF EXISTS role_permissions CASCADE;
DROP VIEW IF EXISTS user_permissions CASCADE;

-- 4. 现在可以安全地修改 roles 表的 status 字段类型
-- 方法1：直接修改类型（如果数据兼容）
DO $$
BEGIN
    -- 首先尝试直接转换
    EXECUTE 'ALTER TABLE roles ALTER COLUMN status TYPE VARCHAR(20) USING
        CASE
            WHEN status::text = ''1'' THEN ''active''
            WHEN status::text = ''0'' THEN ''inactive''
            ELSE ''inactive''
        END';
EXCEPTION
    WHEN OTHERS THEN
        -- 如果直接转换失败，使用临时列方法
        RAISE NOTICE '直接转换失败，使用临时列方法';

        -- 添加临时列
        ALTER TABLE roles ADD COLUMN status_temp VARCHAR(20);

        -- 转换数据
        UPDATE roles SET status_temp =
            CASE
                WHEN status::text = '1' THEN 'active'
                WHEN status::text = '0' THEN 'inactive'
                ELSE 'inactive'
            END;

        -- 删除旧列
        ALTER TABLE roles DROP COLUMN status;

        -- 重命名新列
        ALTER TABLE roles RENAME COLUMN status_temp TO status;
END $$;

-- 5. 设置默认值和约束
ALTER TABLE roles ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE roles ALTER COLUMN status SET NOT NULL;
ALTER TABLE roles ADD CONSTRAINT check_roles_status CHECK (status IN ('active', 'inactive'));

-- 6. 重新创建常用的视图（如果需要）
-- 用户菜单权限视图
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

-- 7. 验证修改结果
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'roles' AND column_name = 'status';

-- 8. 检查数据
SELECT id, name, code, status, created_at FROM roles ORDER BY created_at;

-- 9. 验证约束
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'roles'::regclass AND conname LIKE '%status%';
