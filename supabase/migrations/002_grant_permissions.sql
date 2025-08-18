-- 为anon和authenticated角色授予表权限

-- 授予基本读取权限给anon角色（用于公开数据）
GRANT SELECT ON product_categories TO anon;
GRANT SELECT ON products TO anon;

-- 授予完整权限给authenticated角色
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON customers TO authenticated;
GRANT ALL PRIVILEGES ON suppliers TO authenticated;
GRANT ALL PRIVILEGES ON product_categories TO authenticated;
GRANT ALL PRIVILEGES ON products TO authenticated;
GRANT ALL PRIVILEGES ON sales_orders TO authenticated;
GRANT ALL PRIVILEGES ON sales_order_items TO authenticated;
GRANT ALL PRIVILEGES ON purchase_orders TO authenticated;
GRANT ALL PRIVILEGES ON purchase_order_items TO authenticated;
GRANT ALL PRIVILEGES ON inventory_records TO authenticated;
GRANT ALL PRIVILEGES ON financial_records TO authenticated;

-- 授予序列权限
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;