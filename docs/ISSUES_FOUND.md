# ERP项目问题发现和修复计划

## 🚨 发现的关键问题

### 1. 依赖问题 ✅ 已修复
- **shadcn-nuxt模块缺失** - 已安装
- **TypeScript ESLint插件缺失** - 已安装

### 2. 配置问题 ✅ 已修复  
- **重复的ESLint配置文件** - 已清理
- **根目录types文件夹重复** - 已删除

### 3. TypeScript类型错误 🔧 需要修复 (133个错误)

#### 类别A: 类型定义不匹配
- 组件属性类型错误
- 接口属性类型冲突
- 枚举值类型不匹配

#### 类别B: 未定义变量
- composables中缺失的导出
- 模板中引用的不存在属性

#### 类别C: 类型安全问题
- null/undefined安全检查
- 隐式any类型
- 类型断言问题

#### 类别D: 路由和中间件
- middleware类型定义问题
- definePageMeta类型错误

## 🔧 修复策略

### 第一阶段：禁用严格类型检查
暂时修改TypeScript配置，让项目能够正常运行

### 第二阶段：修复核心类型问题
1. 修复composables导出问题
2. 修复基础类型定义
3. 修复组件属性类型

### 第三阶段：逐步启用严格检查
渐进式恢复TypeScript严格模式

## 📋 具体问题清单

### 组件问题
- Input组件class属性类型问题
- Button组件interface定义问题
- 表单组件类型匹配问题

### Composables问题
- useCustomers: 缺少customers导出
- useSuppliers: 缺少suppliers导出  
- useSalesOrders: 类型导出问题
- usePurchaseOrders: 接口导出问题

### 页面问题
- middleware类型定义
- 模板变量未定义
- 事件处理函数类型

## 🎯 优先修复项目

1. **修改TypeScript配置** - 降低严格程度
2. **修复composables导出** - 核心功能
3. **修复路由中间件** - 安全问题
4. **修复组件类型** - UI稳定性

## 📝 修复记录

- [x] 安装缺失依赖
- [x] 清理重复配置
- [ ] 修改TypeScript配置
- [ ] 修复composables导出
- [ ] 修复组件类型
- [ ] 修复页面错误

---

**状态**: 🔧 修复中  
**优先级**: 🔥 高优先级  
**预估时间**: 2-3小时 