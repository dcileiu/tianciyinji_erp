-- 更新角色表状态字段类型
-- 将状态从数字 (0,1) 改为字符串 ('active', 'inactive')

-- 1. 添加新的临时列
ALTER TABLE roles ADD COLUMN status_new VARCHAR(20);

-- 2. 更新数据：将数字状态转换为字符串状态
UPDATE roles SET status_new =
  CASE
    WHEN status = 1 THEN 'active'
    WHEN status = 0 THEN 'inactive'
    ELSE 'inactive'
  END;

-- 3. 删除旧的状态列
ALTER TABLE roles DROP COLUMN status;

-- 4. 重命名新列为 status
ALTER TABLE roles RENAME COLUMN status_new TO status;

-- 5. 设置默认值
ALTER TABLE roles ALTER COLUMN status SET DEFAULT 'active';

-- 6. 添加约束确保数据一致性
ALTER TABLE roles ADD CONSTRAINT check_status CHECK (status IN ('active', 'inactive'));

-- 7. 设置列为非空
ALTER TABLE roles ALTER COLUMN status SET NOT NULL;

-- 验证更新结果
-- SELECT id, name, code, status FROM roles ORDER BY created_at;
