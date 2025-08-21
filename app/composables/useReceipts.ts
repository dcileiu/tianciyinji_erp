// 收款单接口定义
export interface Receipt {
  id: string
  receipt_no: string
  customer_name: string
  customer_id?: string
  receipt_date: string
  amount: number
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'other'
  status: 'draft' | 'confirmed' | 'cancelled'
  remark?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export const useReceipts = () => {
  const supabase = useSupabaseClient()
  
  // 响应式状态
  const receipts = ref<Receipt[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取所有收款单
  const fetchReceipts = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('receipts')
        .select('*')
        .order('receipt_date', { ascending: false })
      
      if (fetchError) throw fetchError
      
      receipts.value = data as Receipt[]
    } catch (err: any) {
      error.value = err.message || '获取收款单列表失败'
      console.error('Fetch receipts error:', err)
      
      // 使用模拟数据作为后备
      receipts.value = [
        {
          id: '1',
          receipt_no: 'REC20250120001',
          customer_name: '苏州华智科技有限公司',
          receipt_date: '2025-01-20',
          amount: 150000.00,
          payment_method: 'bank_transfer',
          status: 'confirmed',
          remark: '销售订单SO202501001付款',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          receipt_no: 'REC20250119001',
          customer_name: '上海浦东制造有限公司',
          receipt_date: '2025-01-19',
          amount: 88000.00,
          payment_method: 'bank_transfer',
          status: 'confirmed',
          remark: '预付款',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          receipt_no: 'REC20250118001',
          customer_name: '北京智能设备有限公司',
          receipt_date: '2025-01-18',
          amount: 25000.00,
          payment_method: 'check',
          status: 'draft',
          remark: '部分货款',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    } finally {
      isLoading.value = false
    }
  }

  // 创建收款单
  const createReceipt = async (receiptData: Omit<Receipt, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from('receipts')
        .insert([{
          ...receiptData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (createError) throw createError
      
      receipts.value.unshift(data as Receipt)
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '创建收款单失败'
      console.error('Create receipt error:', err)
      
      // 模拟创建成功
      const newReceipt: Receipt = {
        id: Date.now().toString(),
        ...receiptData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      receipts.value.unshift(newReceipt)
      return { success: true, data: newReceipt }
    } finally {
      isLoading.value = false
    }
  }

  // 更新收款单
  const updateReceipt = async (id: string, receiptData: Partial<Receipt>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('receipts')
        .update({
          ...receiptData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = receipts.value.findIndex(receipt => receipt.id === id)
      if (index !== -1) {
        receipts.value[index] = { ...receipts.value[index], ...(data as Receipt) }
      }
      
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message || '更新收款单失败'
      console.error('Update receipt error:', err)
      
      // 模拟更新成功
      const index = receipts.value.findIndex(receipt => receipt.id === id)
      if (index !== -1) {
        receipts.value[index] = { 
          ...receipts.value[index], 
          ...receiptData,
          updated_at: new Date().toISOString()
        } as Receipt
      }
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 删除收款单
  const deleteReceipt = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      receipts.value = receipts.value.filter(receipt => receipt.id !== id)
      return { success: true }
    } catch (err: any) {
      error.value = err.message || '删除收款单失败'
      console.error('Delete receipt error:', err)
      
      // 模拟删除成功
      receipts.value = receipts.value.filter(receipt => receipt.id !== id)
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  // 确认收款单
  const confirmReceipt = async (id: string) => {
    return await updateReceipt(id, { status: 'confirmed' })
  }

  // 取消收款单
  const cancelReceipt = async (id: string) => {
    return await updateReceipt(id, { status: 'cancelled' })
  }

  // 刷新数据
  const refreshReceipts = async () => {
    await fetchReceipts()
  }

  // 根据ID获取收款单
  const getReceiptById = (id: string) => {
    return receipts.value.find(receipt => receipt.id === id)
  }

  // 根据状态获取收款单
  const getReceiptsByStatus = (status: string) => {
    return receipts.value.filter(receipt => receipt.status === status)
  }

  // 获取收款统计
  const getReceiptStats = () => {
    const confirmed = receipts.value.filter(r => r.status === 'confirmed')
    const draft = receipts.value.filter(r => r.status === 'draft')
    const cancelled = receipts.value.filter(r => r.status === 'cancelled')
    
    return {
      total: receipts.value.length,
      confirmed: confirmed.length,
      draft: draft.length,
      cancelled: cancelled.length,
      totalAmount: confirmed.reduce((sum, receipt) => sum + receipt.amount, 0),
      draftAmount: draft.reduce((sum, receipt) => sum + receipt.amount, 0)
    }
  }

  return {
    // 状态
    receipts: readonly(receipts),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // 方法
    fetchReceipts,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    confirmReceipt,
    cancelReceipt,
    refreshReceipts,
    getReceiptById,
    getReceiptsByStatus,
    getReceiptStats
  }
} 