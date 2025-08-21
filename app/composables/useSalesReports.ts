export const useSalesReports = () => {
  const supabase = useSupabaseClient()
  
  // 响应式状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取销售报表统计
  const getSalesReport = async (params: {
    startDate: string
    endDate: string
    customerId?: string
  }) => {
    try {
      isLoading.value = true
      error.value = null
      
      // TODO: 从数据库获取真实数据
      const mockData = {
        totalAmount: 1250000,
        totalOrders: 156,
        avgOrderAmount: 8013,
        activeCustomers: 45,
        growthRate: {
          amount: 12.5,
          orders: 8.2,
          avgOrder: 3.8,
          customers: 15.3
        }
      }
      
      return mockData
    } catch (err: any) {
      error.value = err.message || '获取销售报表失败'
      console.error('Get sales report error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 获取销售明细
  const getSalesDetails = async (params: {
    startDate: string
    endDate: string
    customerId?: string
    limit?: number
  }) => {
    try {
      isLoading.value = true
      error.value = null
      
      // TODO: 从数据库获取真实数据
      const mockData = [
        {
          id: '1',
          order_no: 'SO202501001',
          customer_name: '苏州华智科技有限公司',
          order_date: '2025-01-20',
          final_amount: 150000,
          status: 'delivered',
          profit_margin: 0.35
        },
        {
          id: '2',
          order_no: 'SO202501002',
          customer_name: '上海浦东制造有限公司',
          order_date: '2025-01-19',
          final_amount: 88000,
          status: 'shipped',
          profit_margin: 0.28
        },
        {
          id: '3',
          order_no: 'SO202501003',
          customer_name: '北京智能设备有限公司',
          order_date: '2025-01-18',
          final_amount: 125000,
          status: 'confirmed',
          profit_margin: 0.42
        }
      ]
      
      return mockData
    } catch (err: any) {
      error.value = err.message || '获取销售明细失败'
      console.error('Get sales details error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 获取客户销售排行
  const getTopCustomers = async (params: {
    startDate: string
    endDate: string
    limit?: number
  }) => {
    try {
      isLoading.value = true
      error.value = null
      
      // TODO: 从数据库获取真实数据
      const mockData = [
        { id: '1', name: '苏州华智科技有限公司', amount: 350000, orders: 8, percentage: 28 },
        { id: '2', name: '上海浦东制造有限公司', amount: 280000, orders: 6, percentage: 22 },
        { id: '3', name: '北京智能设备有限公司', amount: 220000, orders: 5, percentage: 18 },
        { id: '4', name: '深圳创新科技有限公司', amount: 180000, orders: 4, percentage: 14 },
        { id: '5', name: '广州自动化设备有限公司', amount: 150000, orders: 3, percentage: 12 }
      ]
      
      return mockData.slice(0, params.limit || 10)
    } catch (err: any) {
      error.value = err.message || '获取客户排行失败'
      console.error('Get top customers error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 获取产品销售排行
  const getTopProducts = async (params: {
    startDate: string
    endDate: string
    limit?: number
  }) => {
    try {
      isLoading.value = true
      error.value = null
      
      // TODO: 从数据库获取真实数据
      const mockData = [
        { id: '1', name: '智能控制器 Model-A', amount: 450000, quantity: 120, percentage: 36 },
        { id: '2', name: '传感器套装 Pro', amount: 280000, quantity: 200, percentage: 22 },
        { id: '3', name: '工业显示屏 15寸', amount: 220000, quantity: 80, percentage: 18 },
        { id: '4', name: '数据采集模块', amount: 180000, quantity: 150, percentage: 14 },
        { id: '5', name: '通讯接口卡', amount: 120000, quantity: 300, percentage: 10 }
      ]
      
      return mockData.slice(0, params.limit || 10)
    } catch (err: any) {
      error.value = err.message || '获取产品排行失败'
      console.error('Get top products error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 获取销售趋势数据
  const getSalesTrend = async (params: {
    startDate: string
    endDate: string
    period: 'day' | 'week' | 'month'
  }) => {
    try {
      isLoading.value = true
      error.value = null
      
      // TODO: 从数据库获取真实数据
      const mockData = {
        labels: ['1月1日', '1月2日', '1月3日', '1月4日', '1月5日', '1月6日', '1月7日'],
        datasets: [
          {
            label: '销售额',
            data: [15000, 22000, 18000, 28000, 32000, 25000, 35000],
            color: '#10B981'
          },
          {
            label: '订单数',
            data: [5, 8, 6, 10, 12, 9, 14],
            color: '#3B82F6'
          }
        ]
      }
      
      return mockData
    } catch (err: any) {
      error.value = err.message || '获取销售趋势失败'
      console.error('Get sales trend error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 获取销售分析数据
  const getSalesAnalysis = async (params: {
    startDate: string
    endDate: string
  }) => {
    try {
      isLoading.value = true
      error.value = null
      
      // TODO: 从数据库获取真实数据
      const mockData = {
        regionDistribution: [
          { region: '华东', amount: 450000, percentage: 36 },
          { region: '华南', amount: 350000, percentage: 28 },
          { region: '华北', amount: 280000, percentage: 22.4 },
          { region: '西南', amount: 120000, percentage: 9.6 },
          { region: '其他', amount: 50000, percentage: 4 }
        ],
        monthlyComparison: {
          currentMonth: { amount: 1250000, orders: 156 },
          lastMonth: { amount: 1120000, orders: 145 },
          growth: { amount: 11.6, orders: 7.6 }
        },
        profitAnalysis: {
          totalProfit: 375000,
          profitMargin: 30,
          costOfSales: 875000
        }
      }
      
      return mockData
    } catch (err: any) {
      error.value = err.message || '获取销售分析失败'
      console.error('Get sales analysis error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // 方法
    getSalesReport,
    getSalesDetails,
    getTopCustomers,
    getTopProducts,
    getSalesTrend,
    getSalesAnalysis
  }
} 