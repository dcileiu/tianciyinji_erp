import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const {
      start_date = '',
      end_date = '',
      report_type = 'summary'
    } = query

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let dateFilter = ''
    if (start_date && end_date) {
      dateFilter = `and created_at >= '${start_date}' and created_at <= '${end_date}'`
    }

    // 获取销售数据
    const { data: salesData, error: salesError } = await supabase
      .from('sales_orders')
      .select('total_amount, status, created_at')
      .gte('created_at', start_date || '1900-01-01')
      .lte('created_at', end_date || '2099-12-31')

    if (salesError) {
      throw salesError
    }

    // 获取采购数据
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchase_orders')
      .select('total_amount, status, created_at')
      .gte('created_at', start_date || '1900-01-01')
      .lte('created_at', end_date || '2099-12-31')

    if (purchaseError) {
      throw purchaseError
    }

    // 获取应收账款数据
    const { data: receivablesData, error: receivablesError } = await supabase
      .from('receivables')
      .select('total_amount, paid_amount, status, due_date')
      .gte('created_at', start_date || '1900-01-01')
      .lte('created_at', end_date || '2099-12-31')

    if (receivablesError) {
      throw receivablesError
    }

    // 获取应付账款数据
    const { data: payablesData, error: payablesError } = await supabase
      .from('payables')
      .select('total_amount, paid_amount, status, due_date')
      .gte('created_at', start_date || '1900-01-01')
      .lte('created_at', end_date || '2099-12-31')

    if (payablesError) {
      throw payablesError
    }

    // 获取收款记录
    const { data: receivablePayments, error: receivablePaymentsError } = await supabase
      .from('receivable_payments')
      .select('amount, payment_date')
      .gte('payment_date', start_date || '1900-01-01')
      .lte('payment_date', end_date || '2099-12-31')

    if (receivablePaymentsError) {
      throw receivablePaymentsError
    }

    // 获取付款记录
    const { data: payablePayments, error: payablePaymentsError } = await supabase
      .from('payable_payments')
      .select('amount, payment_date')
      .gte('payment_date', start_date || '1900-01-01')
      .lte('payment_date', end_date || '2099-12-31')

    if (payablePaymentsError) {
      throw payablePaymentsError
    }

    // 计算财务指标
    const salesSummary = calculateSalesSummary(salesData || [])
    const purchaseSummary = calculatePurchaseSummary(purchaseData || [])
    const receivablesSummary = calculateReceivablesSummary(receivablesData || [])
    const payablesSummary = calculatePayablesSummary(payablesData || [])
    const cashFlowSummary = calculateCashFlowSummary(
      receivablePayments || [],
      payablePayments || []
    )

    const report = {
      period: {
        start_date: start_date || '全部',
        end_date: end_date || '全部'
      },
      sales: salesSummary,
      purchase: purchaseSummary,
      receivables: receivablesSummary,
      payables: payablesSummary,
      cash_flow: cashFlowSummary,
      profit_loss: {
        revenue: salesSummary.confirmed_amount,
        cost: purchaseSummary.confirmed_amount,
        gross_profit: salesSummary.confirmed_amount - purchaseSummary.confirmed_amount,
        gross_profit_margin: salesSummary.confirmed_amount > 0
          ? ((salesSummary.confirmed_amount - purchaseSummary.confirmed_amount) / salesSummary.confirmed_amount * 100).toFixed(2) + '%'
          : '0%'
      }
    }

    return {
      success: true,
      data: report
    }
  } catch (error) {
    console.error('获取财务报表失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取财务报表失败'
    })
  }
})

function calculateSalesSummary (salesData: any[]) {
  const total_amount = salesData.reduce((sum, item) => sum + (item.total_amount || 0), 0)
  const confirmed_amount = salesData
    .filter(item => ['confirmed', 'shipped'].includes(item.status))
    .reduce((sum, item) => sum + (item.total_amount || 0), 0)
  const pending_amount = salesData
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + (item.total_amount || 0), 0)

  return {
    total_orders: salesData.length,
    total_amount,
    confirmed_amount,
    pending_amount,
    confirmed_orders: salesData.filter(item => ['confirmed', 'shipped'].includes(item.status)).length
  }
}

function calculatePurchaseSummary (purchaseData: any[]) {
  const total_amount = purchaseData.reduce((sum, item) => sum + (item.total_amount || 0), 0)
  const confirmed_amount = purchaseData
    .filter(item => ['confirmed', 'received'].includes(item.status))
    .reduce((sum, item) => sum + (item.total_amount || 0), 0)
  const pending_amount = purchaseData
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + (item.total_amount || 0), 0)

  return {
    total_orders: purchaseData.length,
    total_amount,
    confirmed_amount,
    pending_amount,
    confirmed_orders: purchaseData.filter(item => ['confirmed', 'received'].includes(item.status)).length
  }
}

function calculateReceivablesSummary (receivablesData: any[]) {
  const total_amount = receivablesData.reduce((sum, item) => sum + (item.total_amount || 0), 0)
  const paid_amount = receivablesData.reduce((sum, item) => sum + (item.paid_amount || 0), 0)
  const outstanding_amount = total_amount - paid_amount
  const overdue_amount = receivablesData
    .filter(item => item.status === 'overdue')
    .reduce((sum, item) => sum + (item.total_amount - item.paid_amount), 0)

  return {
    total_amount,
    paid_amount,
    outstanding_amount,
    overdue_amount,
    total_count: receivablesData.length,
    overdue_count: receivablesData.filter(item => item.status === 'overdue').length
  }
}

function calculatePayablesSummary (payablesData: any[]) {
  const total_amount = payablesData.reduce((sum, item) => sum + (item.total_amount || 0), 0)
  const paid_amount = payablesData.reduce((sum, item) => sum + (item.paid_amount || 0), 0)
  const outstanding_amount = total_amount - paid_amount
  const overdue_amount = payablesData
    .filter(item => item.status === 'overdue')
    .reduce((sum, item) => sum + (item.total_amount - item.paid_amount), 0)

  return {
    total_amount,
    paid_amount,
    outstanding_amount,
    overdue_amount,
    total_count: payablesData.length,
    overdue_count: payablesData.filter(item => item.status === 'overdue').length
  }
}

function calculateCashFlowSummary (receivablePayments: any[], payablePayments: any[]) {
  const cash_in = receivablePayments.reduce((sum, item) => sum + (item.amount || 0), 0)
  const cash_out = payablePayments.reduce((sum, item) => sum + (item.amount || 0), 0)
  const net_cash_flow = cash_in - cash_out

  return {
    cash_in,
    cash_out,
    net_cash_flow,
    receivable_payments_count: receivablePayments.length,
    payable_payments_count: payablePayments.length
  }
}
