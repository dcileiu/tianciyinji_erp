// 数据库初始化工具
// 用于手动创建表结构和初始数据

export const useDbInit = () => {
  const supabase = useSupabaseClient()

  // 创建表结构的SQL语句
  const createTablesSQL = `
    -- 启用UUID扩展
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- 用户表 (扩展Supabase Auth用户信息)
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee', 'viewer')),
      department VARCHAR(100),
      position VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 客户表
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_no VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      contact_person VARCHAR(100),
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      type VARCHAR(20) NOT NULL DEFAULT 'enterprise' CHECK (type IN ('enterprise', 'individual', 'distributor')),
      region VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'potential')),
      credit_limit DECIMAL(15,2) DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 供应商表
    CREATE TABLE IF NOT EXISTS suppliers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      supplier_no VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      contact_person VARCHAR(100),
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      type VARCHAR(20) NOT NULL DEFAULT 'raw_material' CHECK (type IN ('raw_material', 'equipment', 'service', 'logistics')),
      rating VARCHAR(1) DEFAULT 'C' CHECK (rating IN ('A', 'B', 'C', 'D')),
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated', 'potential')),
      payment_terms VARCHAR(200),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 商品表
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_no VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      category VARCHAR(20) NOT NULL DEFAULT 'finished_product' CHECK (category IN ('raw_material', 'finished_product', 'semi_finished', 'accessory')),
      specification TEXT,
      unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
      unit_price DECIMAL(15,2) DEFAULT 0,
      cost_price DECIMAL(15,2) DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      max_stock INTEGER DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
      supplier_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 仓库表
    CREATE TABLE IF NOT EXISTS warehouses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      warehouse_no VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'main' CHECK (type IN ('main', 'raw_material', 'finished_goods', 'backup')),
      location VARCHAR(200),
      manager VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 库存表
    CREATE TABLE IF NOT EXISTS inventory (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_id UUID NOT NULL,
      warehouse_id UUID NOT NULL,
      location VARCHAR(100),
      current_stock INTEGER DEFAULT 0,
      available_stock INTEGER DEFAULT 0,
      reserved_stock INTEGER DEFAULT 0,
      safety_stock INTEGER DEFAULT 0,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(product_id, warehouse_id)
    );

    -- 销售订单表
    CREATE TABLE IF NOT EXISTS sales_orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_no VARCHAR(50) UNIQUE NOT NULL,
      customer_id UUID NOT NULL,
      order_date DATE NOT NULL DEFAULT CURRENT_DATE,
      delivery_date DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      total_amount DECIMAL(15,2) DEFAULT 0,
      discount DECIMAL(15,2) DEFAULT 0,
      tax_amount DECIMAL(15,2) DEFAULT 0,
      final_amount DECIMAL(15,2) DEFAULT 0,
      remark TEXT,
      created_by UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 采购订单表
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_no VARCHAR(50) UNIQUE NOT NULL,
      supplier_id UUID NOT NULL,
      order_date DATE NOT NULL DEFAULT CURRENT_DATE,
      expected_date DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'received', 'completed', 'cancelled')),
      total_amount DECIMAL(15,2) DEFAULT 0,
      discount DECIMAL(15,2) DEFAULT 0,
      tax_amount DECIMAL(15,2) DEFAULT 0,
      final_amount DECIMAL(15,2) DEFAULT 0,
      remark TEXT,
      created_by UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  // 初始化数据库表结构
  const initializeTables = async () => {
    try {
      console.log('开始初始化数据库表结构...')
      
      // 由于Supabase客户端不支持直接执行DDL，我们需要使用RPC调用
      // 或者通过Supabase Dashboard手动创建表
      
      // 检查表是否存在的方法
      const checkTable = async (tableName: string) => {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          return !error
        } catch {
          return false
        }
      }

      const tables = ['users', 'customers', 'suppliers', 'products', 'warehouses', 'inventory', 'sales_orders', 'purchase_orders']
      const existingTables = []
      const missingTables = []

      for (const table of tables) {
        const exists = await checkTable(table)
        if (exists) {
          existingTables.push(table)
        } else {
          missingTables.push(table)
        }
      }

      console.log('已存在的表:', existingTables)
      console.log('缺失的表:', missingTables)

      if (missingTables.length > 0) {
        console.warn('检测到缺失的数据库表，请手动在Supabase Dashboard中创建以下表:')
        console.warn(missingTables.join(', '))
        console.warn('或者使用以下SQL脚本:')
        console.warn(createTablesSQL)
        
        return {
          success: false,
          message: `缺失数据库表: ${missingTables.join(', ')}`,
          missingTables,
          sql: createTablesSQL
        }
      }

      console.log('数据库表结构检查完成，所有必要的表都已存在')
      return {
        success: true,
        message: '数据库表结构正常',
        existingTables
      }
    } catch (error) {
      console.error('初始化数据库表结构失败:', error)
      return {
        success: false,
        message: '数据库初始化失败',
        error
      }
    }
  }

  // 创建初始测试数据
  const createSampleData = async () => {
    try {
      console.log('开始创建初始测试数据...')

      // 创建测试客户
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('id')
        .limit(1)

      if (!existingCustomers || existingCustomers.length === 0) {
        const sampleCustomers = [
          {
            customer_no: 'C001',
            name: '北京科技有限公司',
            contact_person: '张经理',
            phone: '010-12345678',
            email: 'zhang@bjtech.com',
            address: '北京市朝阳区科技园区',
            type: 'enterprise',
            region: '华北',
            status: 'active',
            credit_limit: 100000
          },
          {
            customer_no: 'C002',
            name: '上海贸易公司',
            contact_person: '李总',
            phone: '021-87654321',
            email: 'li@shtrade.com',
            address: '上海市浦东新区金融街',
            type: 'distributor',
            region: '华东',
            status: 'active',
            credit_limit: 200000
          }
        ]

        const { error: customerError } = await supabase
          .from('customers')
          .insert(sampleCustomers)

        if (customerError) {
          console.error('创建测试客户失败:', customerError)
        } else {
          console.log('测试客户创建成功')
        }
      }

      // 创建测试供应商
      const { data: existingSuppliers } = await supabase
        .from('suppliers')
        .select('id')
        .limit(1)

      if (!existingSuppliers || existingSuppliers.length === 0) {
        const sampleSuppliers = [
          {
            supplier_no: 'S001',
            name: '原材料供应商A',
            contact_person: '王经理',
            phone: '0755-11111111',
            email: 'wang@supplier-a.com',
            address: '深圳市南山区工业园',
            type: 'raw_material',
            rating: 'A',
            status: 'active',
            payment_terms: '月结30天'
          },
          {
            supplier_no: 'S002',
            name: '设备供应商B',
            contact_person: '刘总',
            phone: '0571-22222222',
            email: 'liu@supplier-b.com',
            address: '杭州市西湖区科技城',
            type: 'equipment',
            rating: 'B',
            status: 'active',
            payment_terms: '现金'
          }
        ]

        const { error: supplierError } = await supabase
          .from('suppliers')
          .insert(sampleSuppliers)

        if (supplierError) {
          console.error('创建测试供应商失败:', supplierError)
        } else {
          console.log('测试供应商创建成功')
        }
      }

      // 创建测试商品
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id')
        .limit(1)

      if (!existingProducts || existingProducts.length === 0) {
        const sampleProducts = [
          {
            product_no: 'P001',
            name: '标准螺丝',
            description: 'M6x20mm 不锈钢螺丝',
            category: 'raw_material',
            specification: 'M6x20mm',
            unit: 'pcs',
            unit_price: 0.5,
            cost_price: 0.3,
            min_stock: 1000,
            max_stock: 10000,
            status: 'active'
          },
          {
            product_no: 'P002',
            name: '成品组件A',
            description: '电子产品主要组件',
            category: 'finished_product',
            specification: '标准规格',
            unit: 'pcs',
            unit_price: 25.0,
            cost_price: 15.0,
            min_stock: 100,
            max_stock: 1000,
            status: 'active'
          }
        ]

        const { error: productError } = await supabase
          .from('products')
          .insert(sampleProducts)

        if (productError) {
          console.error('创建测试商品失败:', productError)
        } else {
          console.log('测试商品创建成功')
        }
      }

      console.log('初始测试数据创建完成')
      return { success: true, message: '测试数据创建成功' }
    } catch (error) {
      console.error('创建测试数据失败:', error)
      return { success: false, message: '测试数据创建失败', error }
    }
  }

  return {
    initializeTables,
    createSampleData,
    createTablesSQL
  }
}