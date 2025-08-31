
export default defineEventHandler(async (event) => {
  try {
    // 暂时返回完整的菜单数据用于测试
    const mockMenuData = [
      {
        "title": "仪表盘",
        "menu": [
          {
            "name": "概览",
            "path": "/dashboard",
            "icon": "view",
            "permission": "dashboard:overview",
            "enabled": true
          },
          {
            "name": "统计",
            "path": "/dashboard/stats",
            "icon": "BarChart3",
            "permission": "dashboard:stats",
            "enabled": true
          }
        ]
      },
      {
        "title": "销售管理",
        "menu": [
          {
            "name": "销售订单",
            "path": "/sales/orders",
            "icon": "FileText",
            "permission": "sales-order:view",
            "enabled": true
          },
          {
            "name": "客户管理",
            "path": "/sales/customers",
            "icon": "Users",
            "permission": "customer:view",
            "enabled": true
          }
        ]
      },
      {
        "title": "采购管理",
        "menu": [
          {
            "name": "采购订单",
            "path": "/purchase/orders",
            "icon": "FileText",
            "permission": "purchase-order:view",
            "enabled": true
          },
          {
            "name": "供应商管理",
            "path": "/purchase/suppliers",
            "icon": "Building",
            "permission": "purchase-supplier:view",
            "enabled": true
          }
        ]
      },
      {
        "title": "库存管理",
        "menu": [
          {
            "name": "库存管理",
            "path": "/warehouse/inventory",
            "icon": "Package",
            "permission": "inventory:view",
            "enabled": true
          },
          {
            "name": "仓库管理",
            "path": "/warehouse/warehouses",
            "icon": "Building",
            "permission": "warehouse:manage",
            "enabled": true
          },
          {
            "name": "库存调拨",
            "path": "/warehouse/transfers",
            "icon": "ArrowRightLeft",
            "permission": "transfer:view",
            "enabled": true
          }
        ]
      },
      {
        "title": "生产管理",
        "menu": [
          {
            "name": "生产订单",
            "path": "/production/orders",
            "icon": "FileText",
            "permission": "production-order:view",
            "enabled": true
          },
          {
            "name": "生产计划",
            "path": "/production/plans",
            "icon": "Calendar",
            "permission": "production-plan:view",
            "enabled": true
          },
          {
            "name": "物料清单",
            "path": "/production/bom",
            "icon": "List",
            "permission": "bom:view",
            "enabled": true
          },
          {
            "name": "车间管理",
            "path": "/production/workshops",
            "icon": "Factory",
            "permission": "workshop:view",
            "enabled": true
          }
        ]
      },
      {
        "title": "财务管理",
        "menu": [
          {
            "name": "发票管理",
            "path": "/finance/invoices",
            "icon": "FileText",
            "permission": "invoice:view",
            "enabled": true
          },
          {
            "name": "应收管理",
            "path": "/finance/receivables",
            "icon": "CreditCard",
            "permission": "finance:receivables",
            "enabled": true
          },
          {
            "name": "付款管理",
            "path": "/finance/payments",
            "icon": "CreditCard",
            "permission": "payment:view",
            "enabled": true
          },
          {
            "name": "收款管理",
            "path": "/finance/receipts",
            "icon": "Wallet",
            "permission": "receipt:view",
            "enabled": true
          }
        ]
      },
      {
        "title": "基础数据",
        "menu": [
          {
            "name": "产品管理",
            "path": "/master-data/products",
            "icon": "Package",
            "permission": "product:view",
            "enabled": true
          },
          {
            "name": "供应商管理",
            "path": "/master-data/suppliers",
            "icon": "Building",
            "permission": "supplier:view",
            "enabled": true
          }
        ]
      },
      {
        "title": "数据统计",
        "menu": [
          {
            "name": "数据统计",
            "path": "/analytics",
            "icon": "PieChart",
            "permission": "analytics:view",
            "enabled": true
          }
        ]
      },
      {
        "title": "系统监控",
        "menu": [
          {
            "name": "系统监控",
            "path": "/monitoring",
            "icon": "Map",
            "permission": "monitoring:view",
            "enabled": true
          }
        ]
      },
      {
        "title": "系统管理",
        "menu": [
          {
            "name": "用户管理",
            "path": "/system/users",
            "icon": "Users",
            "permission": "system:users",
            "enabled": true
          },
          {
            "name": "角色管理",
            "path": "/system/roles",
            "icon": "Shield",
            "permission": "system:roles",
            "enabled": true
          },
          {
            "name": "菜单管理",
            "path": "/system/menus",
            "icon": "Menu",
            "permission": "system:menus",
            "enabled": true
          },
          {
            "name": "部门管理",
            "path": "/system/departments",
            "icon": "Building2",
            "permission": "system:departments",
            "enabled": true
          },
          {
            "name": "岗位管理",
            "path": "/system/positions",
            "icon": "UserCheck",
            "permission": "system:positions",
            "enabled": true
          },
          {
            "name": "字典管理",
            "path": "/system/dictionaries",
            "icon": "Book",
            "permission": "system:dictionaries",
            "enabled": true
          },
          {
            "name": "系统配置",
            "path": "/system/config",
            "icon": "Settings",
            "permission": "system:config",
            "enabled": true
          },
          {
            "name": "系统日志",
            "path": "/system/logs",
            "icon": "FileText",
            "permission": "system:logs",
            "enabled": true
          }
        ]
      }
    ]

    return {
      code: 0,
      message: '获取成功',
      data: mockMenuData
    }

  } catch (error: any) {
    console.error('获取用户菜单失败:', error)
    return {
      code: -1,
      message: error.message || '获取菜单权限失败',
      data: []
    }
  }
})
