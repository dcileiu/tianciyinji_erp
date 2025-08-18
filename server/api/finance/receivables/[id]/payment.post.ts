import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const paymentSchema = z.object({
  amount: z.number().positive('收款金额必须大于0'),
  payment_method: z.enum(['cash', 'bank_transfer', 'check', 'other'], {
    message: '请选择有效的付款方式'
  }),
  payment_date: z.string().min(1, '请选择付款日期'),
  reference_number: z.string().optional(),
  notes: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const receivableId = getRouterParam(event, 'id')
    const body = await readBody(event)

    // 验证请求数据
    const validatedData = paymentSchema.parse(body)

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 开始事务
    const { data: receivable, error: receivableError } = await supabase
      .from('receivables')
      .select('*')
      .eq('id', receivableId)
      .single()

    if (receivableError || !receivable) {
      throw createError({
        statusCode: 404,
        statusMessage: '应收账款记录不存在'
      })
    }

    // 检查收款金额是否超过未收金额
    const unpaidAmount = receivable.total_amount - receivable.paid_amount
    if (validatedData.amount > unpaidAmount) {
      throw createError({
        statusCode: 400,
        statusMessage: `收款金额不能超过未收金额 ${unpaidAmount}`
      })
    }

    // 创建收款记录
    const { data: payment, error: paymentError } = await supabase
      .from('receivable_payments')
      .insert({
        receivable_id: Number(receivableId),
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

    // 更新应收账款状态
    const newPaidAmount = receivable.paid_amount + validatedData.amount
    let newStatus = 'pending'

    if (newPaidAmount >= receivable.total_amount) {
      newStatus = 'paid'
    } else if (newPaidAmount > 0) {
      newStatus = 'partial'
    }

    // 检查是否逾期
    if (newStatus !== 'paid' && new Date(receivable.due_date) < new Date()) {
      newStatus = 'overdue'
    }

    const { error: updateError } = await supabase
      .from('receivables')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', receivableId)

    if (updateError) {
      // 如果更新失败，删除已创建的收款记录
      await supabase
        .from('receivable_payments')
        .delete()
        .eq('id', payment.id)

      throw updateError
    }

    return {
      success: true,
      message: '收款记录创建成功',
      data: payment
    }
  } catch (error) {
    console.error('创建收款记录失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '创建收款记录失败'
    })
  }
})
