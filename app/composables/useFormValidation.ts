// 通用表单验证工具
import { reactive, ref } from 'vue'
import type { Customer, Supplier } from '~/types/database'

// 验证规则类型
interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

// 验证规则集合
interface ValidationRules {
  [key: string]: ValidationRule
}

// 错误信息类型
interface ValidationErrors {
  [key: string]: string
}

export const useFormValidation = () => {
  // 通用验证函数
  const validateField = (value: any, rules: ValidationRule): string => {
    // 必填验证
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return '此字段为必填项'
    }

    // 如果字段为空且不是必填，跳过其他验证
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return ''
    }

    // 最小长度验证
    if (rules.minLength && value.length < rules.minLength) {
      return `最少需要${rules.minLength}个字符`
    }

    // 最大长度验证
    if (rules.maxLength && value.length > rules.maxLength) {
      return `最多允许${rules.maxLength}个字符`
    }

    // 正则表达式验证
    if (rules.pattern && !rules.pattern.test(value)) {
      return '格式不正确'
    }

    // 自定义验证
    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) {
        return customError
      }
    }

    return ''
  }

  // 验证整个表单
  const validateForm = (data: any, rules: ValidationRules): ValidationErrors => {
    const errors: ValidationErrors = {}

    Object.keys(rules).forEach(field => {
      const rule = rules[field]
      if (rule) {
        const error = validateField(data[field], rule)
      if (error) {
        errors[field] = error
        }
      }
    })

    return errors
  }

  // 客户表单验证规则
  const customerValidationRules: ValidationRules = {
    customer_no: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[A-Z0-9-]+$/,
      custom: (value: string) => {
        if (!/^[A-Z]/.test(value)) {
          return '客户编号必须以大写字母开头'
        }
        return null
      }
    },
    name: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    contact_person: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    contact_phone: {
      required: true,
      pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/,
      custom: (value: string) => {
        if (!/^1[3-9]\d{9}$/.test(value) && !/^0\d{2,3}-?\d{7,8}$/.test(value)) {
          return '请输入有效的手机号码或固定电话'
        }
        return null
      }
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return '请输入有效的邮箱地址'
        }
        return null
      }
    },
    address: {
      maxLength: 200
    },
    customer_type: {
      required: true,
      custom: (value: string) => {
        const validTypes = ['enterprise', 'individual', 'government', 'other']
        if (!validTypes.includes(value)) {
          return '请选择有效的客户类型'
        }
        return null
      }
    },
    region: {
      required: true,
      maxLength: 50
    }
  }

  // 供应商表单验证规则
  const supplierValidationRules: ValidationRules = {
    supplier_no: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[A-Z0-9-]+$/,
      custom: (value: string) => {
        if (!/^[A-Z]/.test(value)) {
          return '供应商编号必须以大写字母开头'
        }
        return null
      }
    },
    name: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    contact_person: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    contact_phone: {
      required: true,
      pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/,
      custom: (value: string) => {
        if (!/^1[3-9]\d{9}$/.test(value) && !/^0\d{2,3}-?\d{7,8}$/.test(value)) {
          return '请输入有效的手机号码或固定电话'
        }
        return null
      }
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return '请输入有效的邮箱地址'
        }
        return null
      }
    },
    address: {
      maxLength: 200
    },
    supplier_type: {
      required: true,
      custom: (value: string) => {
        const validTypes = ['manufacturer', 'distributor', 'service', 'other']
        if (!validTypes.includes(value)) {
          return '请选择有效的供应商类型'
        }
        return null
      }
    },
    rating: {
      custom: (value: string) => {
        const validRatings = ['A', 'B', 'C', 'D']
        if (value && !validRatings.includes(value)) {
          return '请选择有效的供应商评级'
        }
        return null
      }
    }
  }

  // 创建表单验证状态
  const createFormValidation = (rules: ValidationRules) => {
    const errors = reactive<ValidationErrors>({})
    const isValid = ref(true)

    // 验证单个字段
    const validateSingleField = (field: string, value: any) => {
      if (rules[field]) {
        const error = validateField(value, rules[field])
        if (error) {
          errors[field] = error
        } else {
          delete errors[field]
        }
      }
    }

    // 验证所有字段
    const validateAllFields = (data: any) => {
      const newErrors = validateForm(data, rules)
      
      // 清空现有错误
      Object.keys(errors).forEach(key => {
        delete errors[key]
      })
      
      // 设置新错误
      Object.assign(errors, newErrors)
      
      isValid.value = Object.keys(newErrors).length === 0
      return isValid.value
    }

    // 清空所有错误
    const clearErrors = () => {
      Object.keys(errors).forEach(key => {
        delete errors[key]
      })
      isValid.value = true
    }

    return {
      errors,
      isValid,
      validateSingleField,
      validateAllFields,
      clearErrors
    }
  }

  return {
    validateField,
    validateForm,
    customerValidationRules,
    supplierValidationRules,
    createFormValidation
  }
}