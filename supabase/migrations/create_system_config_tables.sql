-- 创建系统配置相关表

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统字典表
CREATE TABLE IF NOT EXISTS system_dictionaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dict_code VARCHAR(50) NOT NULL,
    dict_name VARCHAR(100) NOT NULL,
    dict_value VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES system_dictionaries(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统通知表
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);
CREATE INDEX IF NOT EXISTS idx_system_dictionaries_code ON system_dictionaries(dict_code);
CREATE INDEX IF NOT EXISTS idx_system_dictionaries_parent ON system_dictionaries(parent_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_notifications_user ON system_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_read ON system_notifications(is_read);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_configs_updated_at 
    BEFORE UPDATE ON system_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_dictionaries_updated_at 
    BEFORE UPDATE ON system_dictionaries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_notifications_updated_at 
    BEFORE UPDATE ON system_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认配置数据
INSERT INTO system_configs (config_key, config_value, config_type, description, is_public) VALUES
('app.name', 'ERP管理系统', 'string', '应用程序名称', true),
('app.version', '1.0.0', 'string', '应用程序版本', true),
('app.timezone', 'Asia/Shanghai', 'string', '默认时区', true),
('app.language', 'zh-CN', 'string', '默认语言', true),
('app.theme', 'light', 'string', '默认主题', true),
('company.name', '示例公司', 'string', '公司名称', true),
('company.address', '上海市浦东新区', 'string', '公司地址', false),
('company.phone', '021-12345678', 'string', '公司电话', false),
('company.email', 'contact@example.com', 'string', '公司邮箱', false),
('system.max_login_attempts', '5', 'number', '最大登录尝试次数', false),
('system.session_timeout', '3600', 'number', '会话超时时间(秒)', false),
('system.enable_audit_log', 'true', 'boolean', '启用审计日志', false)
ON CONFLICT (config_key) DO NOTHING;

-- 插入默认字典数据
INSERT INTO system_dictionaries (dict_code, dict_name, dict_value, description) VALUES
('user_status', '用户状态', 'active', '用户状态字典'),
('user_status', '用户状态', 'inactive', '用户状态字典'),
('order_status', '订单状态', 'draft', '订单状态字典'),
('order_status', '订单状态', 'confirmed', '订单状态字典'),
('order_status', '订单状态', 'shipped', '订单状态字典'),
('order_status', '订单状态', 'delivered', '订单状态字典'),
('order_status', '订单状态', 'cancelled', '订单状态字典'),
('payment_method', '支付方式', 'cash', '支付方式字典'),
('payment_method', '支付方式', 'transfer', '支付方式字典'),
('payment_method', '支付方式', 'card', '支付方式字典'),
('product_category', '产品分类', 'raw_material', '产品分类字典'),
('product_category', '产品分类', 'finished_product', '产品分类字典'),
('product_category', '产品分类', 'semi_finished', '产品分类字典'),
('product_category', '产品分类', 'accessory', '产品分类字典')
ON CONFLICT DO NOTHING;

-- 设置RLS策略
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_dictionaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- 系统配置访问策略
CREATE POLICY "Public configs are viewable by all authenticated users" 
    ON system_configs FOR SELECT 
    USING (auth.role() = 'authenticated' AND is_public = true);

CREATE POLICY "Private configs are viewable by admins only" 
    ON system_configs FOR SELECT 
    USING (auth.role() = 'authenticated' AND is_public = false AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can modify configs" 
    ON system_configs FOR ALL 
    USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- 系统字典访问策略
CREATE POLICY "Dictionaries are viewable by all authenticated users" 
    ON system_dictionaries FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify dictionaries" 
    ON system_dictionaries FOR ALL 
    USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- 系统日志访问策略
CREATE POLICY "Users can view their own logs" 
    ON system_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs" 
    ON system_logs FOR SELECT 
    USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can insert logs" 
    ON system_logs FOR INSERT 
    WITH CHECK (true);

-- 系统通知访问策略
CREATE POLICY "Users can view their own notifications" 
    ON system_notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON system_notifications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" 
    ON system_notifications FOR ALL 
    USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- 注释说明
COMMENT ON TABLE system_configs IS '系统配置表';
COMMENT ON TABLE system_dictionaries IS '系统字典表';
COMMENT ON TABLE system_logs IS '系统操作日志表';
COMMENT ON TABLE system_notifications IS '系统通知表'; 