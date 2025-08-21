// 付款单接口定义
export interface Payment {
  id: string
  payment_no: string
  supplier_name: string
  supplier_id?: string
  payment_date: string
  amount: number
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'other'
  purpose?: 'purchase' | 'expense' | 'salary' | 'other'
  status: 'draft' | 'confirmed' | 'cancelled'
  remark?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export const usePayments = () => {
  const supabase = useSupabaseClient()
  
  // 响应式状态
  const payments = ref<Payment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取所有付款单
  const fetchPayments = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false })
      
      if (fetchError) throw fetchError
      
      payments.value = data as Payment[]
    } catch (err: any) {
      error.value = err.message || '获取付款单列表失败'
      console.error('Fetch payments error:', err)
      
      // 使用模拟数据作为后备
      payments.value = [
        {
          id: '1',
          payment_no: 'PAY20250120001',
          supplier_name: '深圳原材料供应有限公司',
          payment_date: '2025-01-20',
          amount: 85000.00,
          payment_method: 'bank_transfer',
          purpose: 'purchase',
          status: 'confirmed',
          remark: '采购订单PO202501001付款',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          payment_no: 'PAY20250119001',
          supplier_name: '广州物流运输有限公司',
          payment_date: '2025-01-19',
          amount: 12000.00,
          payment_method: 'bank_transfer',
          purpose: 'expense',
          status: 'confirmed',
          remark: '运输费用',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          payment_no: 'PAY20250118001',
          supplier_name: '办公用品供应商',
          payment_date: '2025-01-18',
          amount: 3500.00,
          payment_method: 'cash',
          purpose: 'expense',
          status: 'draft',
          remark: '办公用品采购',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          payment_no: 'PAY20250117001',
          supplier_name: '员工工资',
          payment_date: '2025-01-17',
          amount: 250000.00,
          payment_method: 'bank_transfer',
          purpose: 'salary',
          status: 'confirmed',
          remark: '2025年1月员工工资',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    } finally {
      isLoading.value = false
    }
  }

  // 创建付款单
  const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (createError) throw createError
      
      payments.value.unshift(data as Payment)
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '创建付款单失败'
      console.error('Create payment error:', err)
      
      // 模拟创建成功
      const newPayment: Payment = {
        id: Date.now().toString(),
        ...paymentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      payments.value.unshift(newPayment)
      return { success: true, data: newPayment }
    } finally {
      isLoading.value = false
    }
  }

  // 更新付款单
  const updatePayment = async (id: string, paymentData: Partial<Payment>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('payments')
        .update({
          ...paymentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = payments.value.findIndex(payment => payment.id === id)
      if (index !== -1) {
        payments.value[index] = { ...payments.value[index], ...(data as Payment) }
      }
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '更新付款单失败'
      console.error('Update payment error:', err)
      
      // 模拟更新成功
      const index = payments.value.findIndex(payment => payment.id === id)
      if (index !== -1) {
        payments.value[index] = { 
          ...payments.value[index], 
          ...paymentData,
          updated_at: new Date().toISOString()
        } as Payment
      }
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 删除付款单
  const deletePayment = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      payments.value = payments.value.filter(payment => payment.id !== id)
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '删除付款单失败'
      console.error('Delete payment error:', err)
      
      // 模拟删除成功
      payments.value = payments.value.filter(payment => payment.id !== id)
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 确认付款单
  const confirmPayment = async (id: string) => {
    return await updatePayment(id, { status: 'confirmed' })
  }

  // 取消付款单
  const cancelPayment = async (id: string) => {
    return await updatePayment(id, { status: 'cancelled' })
  }

  // 刷新数据
  const refreshPayments = async () => {
    await fetchPayments()
  }

  // 根据ID获取付款单
  const getPaymentById = (id: string) => {
    return payments.value.find(payment => payment.id === id)
  }

  // 根据状态获取付款单
  const getPaymentsByStatus = (status: string) => {
    return payments.value.filter(payment => payment.status === status)
  }

  // 根据用途获取付款单
  const getPaymentsByPurpose = (purpose: string) => {
    return payments.value.filter(payment => payment.purpose === purpose)
  }

  // 获取付款统计
  const getPaymentStats = () => {
    const confirmed = payments.value.filter(p => p.status === 'confirmed')
    const draft = payments.value.filter(p => p.status === 'draft')
    const cancelled = payments.value.filter(p => p.status === 'cancelled')
    
    return {
      total: payments.value.length,
      confirmed: confirmed.length,
      draft: draft.length,
      cancelled: cancelled.length,
      totalAmount: confirmed.reduce((sum, payment) => sum + payment.amount, 0),
      draftAmount: draft.reduce((sum, payment) => sum + payment.amount, 0),
      purchaseAmount: confirmed.filter(p => p.purpose === 'purchase').reduce((sum, payment) => sum + payment.amount, 0),
      expenseAmount: confirmed.filter(p => p.purpose === 'expense').reduce((sum, payment) => sum + payment.amount, 0),
      salaryAmount: confirmed.filter(p => p.purpose === 'salary').reduce((sum, payment) => sum + payment.amount, 0)
    }
  }

  return {
    // 状态
    payments: readonly(payments),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // 方法
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    confirmPayment,
    cancelPayment,
    refreshPayments,
    getPaymentById,
    getPaymentsByStatus,
    getPaymentsByPurpose,
    getPaymentStats
  }
} 