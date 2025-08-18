import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const paymentSchema = z.object({
  amount: z.number().positive('付款金额必须大于0'),
  payment_method: z.enum(['cash', 'bank_transfer', 'check', 'other'], {
    message: '请选择有效的付款方式'
  }),
  payment_date: z.string().min(1, '请选择付款日期'),
  reference_number: z.string().optional(),
  notes: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const payableId = getRouterParam(event, 'id')
    const body = await readBody(event)

    // 验证请求数据
    const validatedData = paymentSchema.parse(body)

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 获取应付账款记录
    const { data: payable, error: payableError } = await supabase
      .from('payables')
      .select('*')
      .eq('id', payableId)
      .single()

    if (payableError || !payable) {
      throw createError({
        statusCode: 404,
        statusMessage: '应付账款记录不存在'
      })
    }

    // 检查付款金额是否超过未付金额
    const unpaidAmount = payable.total_amount - payable.paid_amount
    if (validatedData.amount > unpaidAmount) {
      throw createError({
        statusCode: 400,
        statusMessage: `付款金额不能超过未付金额 ${unpaidAmount}`
      })
    }

    // 创建付款记录
    const { data: payment, error: paymentError } = await supabase
      .from('payable_payments')
      .insert({
        payable_id: Number(payableId),
        amount: validatedData.amount,
        payment_method: validatedData.payment_method,
        payment_date: validatedData.payment_date,
        reference_number: validatedData.reference_number,
        notes: validatedData.notes
      })
      .select()
      .single()

    if (paymentError) {
      throw paymentError
    }

    // 更新应付账款状态
    const newPaidAmount = payable.paid_amount + validatedData.amount
    let newStatus = 'pending'

    if (newPaidAmount >= payable.total_amount) {
      newStatus = 'paid'
    } else if (newPaidAmount > 0) {
      newStatus = 'partial'
    }

    // 检查是否逾期
    if (newStatus !== 'paid' && new Date(payable.due_date) < new Date()) {
      newStatus = 'overdue'
    }

    const { error: updateError } = await supabase
      .from('payables')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', payableId)

    if (updateError) {
      // 如果更新失败，删除已创建的付款记录
      await supabase
        .from('payable_payments')
        .delete()
        .eq('id', payment.id)

      throw updateError
    }

    return {
      success: true,
      message: '付款记录创建成功',
      data: payment
    }
  } catch (error) {
    console.error('创建付款记录失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '创建付款记录失败'
    })
  }
})
