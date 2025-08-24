import type { Database } from '~/types/database.types'

export const useProductionReports = () => {
  const supabase = useSupabaseClient<Database>()

  // 响应式状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取生产报表统计
  const getProductionReport = async (params: { startDate: string; endDate: string; workshopId?: string }) => {
    try {
      isLoading.value = true
      error.value = null

      // TODO: 从数据库获取真实数据
      const mockData = {
        totalOrders: 156,
        completionRate: 87.5,
        efficiency: 92.3,
        defectRate: 2.1,
        growthRate: {
          orders: 15.2,
          completion: 3.8,
          efficiency: 7.5,
          defect: -2.1,
        },
      }

      return mockData
    } catch (err: any) {
      error.value = err.message || '获取生产报表失败'
      console.error('Get production report error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 获取生产明细
  const getProductionDetails = async (params: {
    startDate: string
    endDate: string
    workshopId?: string
    limit?: number
  }) => {
    try {
      isLoading.value = true
      error.value = null

      // TODO: 从数据库获取真实数据
      const mockData = [
        {
          id: '1',
          order_no: 'PO202501001',
          product_name: '智能手机A型',
          planned_quantity: 1000,
          completed_quantity: 950,
          workshop_name: '组装车间',
          status: 'completed',
          completion_rate: 0.95,
        },
        {
          id: '2',
          order_no: 'PO202501002',
          product_name: '笔记本电脑B型',
          planned_quantity: 500,
          completed_quantity: 420,
          workshop_name: '测试车间',
          status: 'in_progress',
          completion_rate: 0.84,
        },
        {
          id: '3',
          order_no: 'PO202501003',
          product_name: '平板电脑C型',
          planned_quantity: 800,
          completed_quantity: 720,
          workshop_name: '包装车间',
          status: 'in_progress',
          completion_rate: 0.9,
        },
      ]

      return mockData
    } catch (err: any) {
      error.value = err.message || '获取生产明细失败'
      console.error('Get production details error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 获取车间生产排行
  const getTopWorkshops = async (params: { startDate: string; endDate: string; limit?: number }) => {
    try {
      isLoading.value = true
      error.value = null

      // TODO: 从数据库获取真实数据
      const mockData = [
        { id: '1', name: '组装车间', orders: 45, completion_rate: 95.2, output: 4500 },
        { id: '2', name: '测试车间', orders: 38, completion_rate: 88.7, output: 3800 },
        { id: '3', name: '包装车间', orders: 32, completion_rate: 92.1, output: 3200 },
        { id: '4', name: '质检车间', orders: 28, completion_rate: 85.3, output: 2800 },
        { id: '5', name: '维修车间', orders: 15, completion_rate: 78.9, output: 1500 },
      ]

      return mockData.slice(0, params.limit || 10)
    } catch (err: any) {
      error.value = err.message || '获取车间排行失败'
      console.error('Get top workshops error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 获取产品生产排行
  const getTopProducts = async (params: { startDate: string; endDate: string; limit?: number }) => {
    try {
      isLoading.value = true
      error.value = null

      // TODO: 从数据库获取真实数据
      const mockData = [
        { id: '1', name: '智能手机A型', orders: 25, total_quantity: 25000, completion_rate: 96.5 },
        { id: '2', name: '笔记本电脑B型', orders: 18, total_quantity: 18000, completion_rate: 89.2 },
        { id: '3', name: '平板电脑C型', orders: 15, total_quantity: 15000, completion_rate: 91.8 },
        { id: '4', name: '智能手表D型', orders: 12, total_quantity: 12000, completion_rate: 87.3 },
        { id: '5', name: '耳机E型', orders: 10, total_quantity: 10000, completion_rate: 94.1 },
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

  // 获取生产趋势数据
  const getProductionTrend = async (params: {
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
            label: '生产订单数',
            data: [12, 15, 18, 14, 20, 16, 19],
            color: '#3B82F6',
          },
          {
            label: '完成率',
            data: [85, 88, 92, 87, 95, 90, 93],
            color: '#10B981',
          },
        ],
      }

      return mockData
    } catch (err: any) {
      error.value = err.message || '获取生产趋势失败'
      console.error('Get production trend error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 获取生产效率分析
  const getProductionEfficiency = async (params: { startDate: string; endDate: string }) => {
    try {
      isLoading.value = true
      error.value = null

      // TODO: 从数据库获取真实数据
      const mockData = {
        overallEfficiency: 92.3,
        workshopEfficiency: [
          { workshop: '组装车间', efficiency: 95.2, orders: 45 },
          { workshop: '测试车间', efficiency: 88.7, orders: 38 },
          { workshop: '包装车间', efficiency: 92.1, orders: 32 },
          { workshop: '质检车间', efficiency: 85.3, orders: 28 },
          { workshop: '维修车间', efficiency: 78.9, orders: 15 },
        ],
        productEfficiency: [
          { product: '智能手机A型', efficiency: 96.5, quantity: 25000 },
          { product: '笔记本电脑B型', efficiency: 89.2, quantity: 18000 },
          { product: '平板电脑C型', efficiency: 91.8, quantity: 15000 },
        ],
      }

      return mockData
    } catch (err: any) {
      error.value = err.message || '获取生产效率分析失败'
      console.error('Get production efficiency error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 获取质量分析
  const getQualityAnalysis = async (params: { startDate: string; endDate: string }) => {
    try {
      isLoading.value = true
      error.value = null

      // TODO: 从数据库获取真实数据
      const mockData = {
        overallDefectRate: 2.1,
        defectByProduct: [
          { product: '智能手机A型', defectRate: 1.8, quantity: 450 },
          { product: '笔记本电脑B型', defectRate: 2.5, quantity: 450 },
          { product: '平板电脑C型', defectRate: 1.9, quantity: 342 },
        ],
        defectByWorkshop: [
          { workshop: '组装车间', defectRate: 1.5, quantity: 675 },
          { workshop: '测试车间', defectRate: 2.8, quantity: 1064 },
          { workshop: '包装车间', defectRate: 1.2, quantity: 384 },
        ],
        defectTrend: {
          labels: ['1月1日', '1月2日', '1月3日', '1月4日', '1月5日', '1月6日', '1月7日'],
          data: [2.5, 2.1, 1.8, 2.3, 1.9, 2.0, 2.1],
        },
      }

      return mockData
    } catch (err: any) {
      error.value = err.message || '获取质量分析失败'
      console.error('Get quality analysis error:', err)
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
    getProductionReport,
    getProductionDetails,
    getTopWorkshops,
    getTopProducts,
    getProductionTrend,
    getProductionEfficiency,
    getQualityAnalysis,
  }
}
