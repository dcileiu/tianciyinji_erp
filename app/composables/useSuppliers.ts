import type { Supplier } from '~/types/database'
import { useDatabase } from './useDatabase'

export const useSuppliers = () => {
  const { findMany, findById, create, update, remove, removeMany, exists, getStats } = useDatabase()
  
  // 获取供应商列表
  const getSuppliers = async (options?: {
    search?: string
    type?: string
    region?: string
    status?: string
    page?: number
    pageSize?: number
  }) => {
    const filters: any[] = []
    
    if (options?.search) {
      filters.push(
        `name.ilike.%${options.search}%,supplier_no.ilike.%${options.search}%,contact_person.ilike.%${options.search}%`
      )
    }
    
    if (options?.type) {
      filters.push(`supplier_type.eq.${options.type}`)
    }
    
    if (options?.region) {
      filters.push(`region.eq.${options.region}`)
    }
    
    if (options?.status) {
      filters.push(`status.eq.${options.status}`)
    }
    
    return await findMany<Supplier>('suppliers', {
      filters,
      orderBy: { column: 'created_at', ascending: false },
      page: options?.page || 1,
      pageSize: options?.pageSize || 10
    })
  }
  
  // 根据ID获取供应商
  const getSupplierById = async (id: string) => {
    return await findById<Supplier>('suppliers', id)
  }
  
  // 创建供应商
  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    // 生成供应商编号
    const supplierNo = await generateSupplierNo()
    
    // 检查供应商编号唯一性
    const existingByNo = await checkSupplierNoExists(supplierNo)
    if (existingByNo) {
      throw new Error('供应商编号已存在')
    }
    
    // 检查邮箱唯一性
    if (supplierData.email) {
      const existingByEmail = await checkEmailExists(supplierData.email)
      if (existingByEmail) {
        throw new Error('邮箱地址已存在')
      }
    }
    
    const newSupplier = {
      ...supplierData,
      supplier_no: supplierNo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return await create<Supplier>('suppliers', newSupplier)
  }
  
  // 更新供应商
  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    // 如果更新邮箱，检查唯一性
    if (supplierData.email) {
      const existingByEmail = await checkEmailExists(supplierData.email, id)
      if (existingByEmail) {
        throw new Error('邮箱地址已存在')
      }
    }
    
    const updatedData = {
      ...supplierData,
      updated_at: new Date().toISOString()
    }
    
    return await update<Supplier>('suppliers', id, updatedData)
  }
  
  // 删除供应商
  const deleteSupplier = async (id: string) => {
    // 检查是否有关联的采购订单
    const hasPurchaseOrders = await checkSupplierHasPurchaseOrders(id)
    if (hasPurchaseOrders) {
      throw new Error('该供应商存在关联的采购订单，无法删除')
    }
    
    return await remove('suppliers', id)
  }
  
  // 批量删除供应商
  const deleteSuppliers = async (ids: string[]) => {
    // 检查每个供应商是否有关联的采购订单
    for (const id of ids) {
      const hasPurchaseOrders = await checkSupplierHasPurchaseOrders(id)
      if (hasPurchaseOrders) {
        const supplier = await getSupplierById(id)
        throw new Error(`供应商 ${supplier?.name} 存在关联的采购订单，无法删除`)
      }
    }
    
    return await removeMany('suppliers', ids)
  }
  
  // 生成供应商编号
  const generateSupplierNo = async (): Promise<string> => {
    const today = new Date()
    const year = today.getFullYear().toString().slice(-2)
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const prefix = `SP${year}${month}`
    
    // 查询当月最大编号
    const { data } = await findMany<Supplier>('suppliers', {
      filters: [`supplier_no.like.${prefix}%`],
      orderBy: { column: 'supplier_no', ascending: false },
      pageSize: 1
    })
    
    let nextNumber = 1
    if (data && data.length > 0) {
      const lastNo = data[0].supplier_no
      const lastNumber = parseInt(lastNo.slice(-4))
      nextNumber = lastNumber + 1
    }
    
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`
  }
  
  // 检查供应商编号是否存在
  const checkSupplierNoExists = async (supplierNo: string): Promise<boolean> => {
    return await exists('suppliers', [{ column: 'supplier_no', value: supplierNo }])
  }
  
  // 检查邮箱是否存在
  const checkEmailExists = async (email: string, excludeId?: string): Promise<boolean> => {
    const conditions = [{ column: 'email', value: email }]
    if (excludeId) {
      conditions.push({ column: 'id', value: excludeId })
    }
    return await exists('suppliers', conditions)
  }
  
  // 检查供应商是否有关联的采购订单
  const checkSupplierHasPurchaseOrders = async (supplierId: string): Promise<boolean> => {
    return await exists('purchase_orders', [{ column: 'supplier_id', value: supplierId }])
  }
  
  // 获取供应商统计数据
  const getSupplierStats = async () => {
    const totalSuppliers = await getStats('suppliers', 'count')
    
    // 活跃供应商（状态为active）
    const activeSuppliers = await getStats('suppliers', 'count', [
      { column: 'status', value: 'active' }
    ])
    
    // 本月新增供应商
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const newSuppliersThisMonth = await getStats('suppliers', 'count', [
      { column: 'created_at', value: thisMonth.toISOString(), operator: 'gte' }
    ])
    
    // 总采购金额（从采购订单表统计）
    const totalPurchaseAmount = await getStats('purchase_orders', 'sum', [], 'total_amount')
    
    return {
      totalSuppliers,
      activeSuppliers,
      newSuppliersThisMonth,
      totalPurchaseAmount: totalPurchaseAmount || 0
    }
  }
  
  return {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    deleteSuppliers,
    generateSupplierNo,
    checkSupplierNoExists,
    checkEmailExists,
    getSupplierStats
  }
}