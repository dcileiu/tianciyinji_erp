<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          商品管理
        </h1>
        <p class="text-muted-foreground mt-1">
          管理产品和物料的基础信息，维护商品规格和库存设置
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button class="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
          </svg>
          <span>批量导入</span>
        </button>
        <button 
          @click="openProductDialog()"
          class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>新增商品</span>
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-card p-6 rounded-lg border">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- 搜索框 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            搜索商品
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              placeholder="商品名称、编号、规格..."
              class="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- 商品分类筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            商品分类
          </label>
          <select v-model="categoryFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部分类</option>
            <option value="raw_material">原材料</option>
            <option value="finished_product">成品</option>
            <option value="semi_finished">半成品</option>
            <option value="accessory">配件</option>
          </select>
        </div>

        <!-- 状态筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            商品状态
          </label>
          <select v-model="statusFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部状态</option>
            <option value="active">正常</option>
            <option value="inactive">停用</option>
            <option value="discontinued">停产</option>
          </select>
        </div>

        <!-- 库存状态筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            库存状态
          </label>
          <select v-model="stockFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部库存</option>
            <option value="sufficient">库存充足</option>
            <option value="low">库存不足</option>
            <option value="out">缺货</option>
          </select>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-end">
          <button class="w-full h-10 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            重置筛选
          </button>
        </div>
      </div>
    </div>

    <!-- 商品统计 -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">商品总数</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalProducts }}</p>
          </div>
          <div class="p-2 bg-blue-500/10 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">在售商品</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.activeProducts }}</p>
          </div>
          <div class="p-2 bg-green-500/10 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">库存不足</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.lowStockProducts }}</p>
          </div>
          <div class="p-2 bg-yellow-500/10 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.16 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">缺货商品</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.outOfStockProducts }}</p>
          </div>
          <div class="p-2 bg-red-500/10 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">库存总值</p>
            <p class="text-2xl font-bold text-foreground">¥{{ stats.totalStockValue.toLocaleString() }}</p>
          </div>
          <div class="p-2 bg-purple-500/10 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="bg-card rounded-lg border overflow-hidden">
      <div class="px-6 py-4 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold text-foreground">商品列表</h3>
        <div class="flex items-center space-x-2">
          <button class="text-sm px-3 py-1 border border-input rounded-md hover:bg-accent">
            批量操作
          </button>
          <button class="text-sm px-3 py-1 border border-input rounded-md hover:bg-accent">
            导出数据
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-border">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-6 py-3 text-left">
                <input type="checkbox" class="rounded border-input">
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">商品编号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">商品信息</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">分类</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">规格型号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">单位</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">当前库存</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">单价</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-background divide-y divide-border">
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="hover:bg-muted/20 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="rounded border-input">
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                {{ product.product_no }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-foreground">{{ product.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ product.description || '暂无描述' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getCategoryColor(product.category)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getCategoryText(product.category) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                {{ product.specification }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                {{ product.unit }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-foreground">{{ product.current_stock }}</div>
                <div class="text-xs text-muted-foreground">
                  最低: {{ product.min_stock }} | 最高: {{ product.max_stock }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                ¥{{ product.unit_price.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusColor(product.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusText(product.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button class="text-blue-600 hover:text-blue-900 p-1" title="查看详情">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button 
                    @click="openProductDialog(product)"
                    class="text-green-600 hover:text-green-900 p-1" 
                    title="编辑"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button class="text-purple-600 hover:text-purple-900 p-1" title="库存调整">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-3 16h16L17 4M9 8v8m6-8v8"></path>
                    </svg>
                  </button>
                  <button 
                    @click="deleteProduct(product.id)"
                    class="text-red-600 hover:text-red-900 p-1" 
                    title="删除"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                  <button class="text-orange-600 hover:text-orange-900 p-1" title="复制商品">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="bg-background px-4 py-3 border-t border-border sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <p class="text-sm text-muted-foreground">
              显示 
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              到
              <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredProducts.length) }}</span>
              项，共
              <span class="font-medium">{{ filteredProducts.length }}</span>
              项
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage * pageSize >= filteredProducts.length"
              class="px-3 py-1 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 商品表单对话框 -->
  <div v-if="showProductDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-card rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-foreground">
            {{ editingProduct ? '编辑商品' : '新增商品' }}
          </h3>
          <button @click="closeProductDialog" class="text-muted-foreground hover:text-foreground">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">商品编号</label>
              <input
                v-model="productForm.product_no"
                type="text"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入商品编号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">商品名称</label>
              <input
                v-model="productForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入商品名称"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-1">商品描述</label>
            <textarea
              v-model="productForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="请输入商品描述"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">分类</label>
              <select
                v-model="productForm.category"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">请选择分类</option>
                <option value="raw_material">原材料</option>
                <option value="semi_finished">半成品</option>
                <option value="finished_product">成品</option>
                <option value="accessory">配件</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">单位</label>
              <input
                v-model="productForm.unit"
                type="text"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="如：个、套、米"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">状态</label>
              <select
                v-model="productForm.status"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">启用</option>
                <option value="inactive">停用</option>
                <option value="discontinued">停产</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">当前库存</label>
              <input
                v-model.number="productForm.current_stock"
                type="number"
                min="0"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">最低库存</label>
              <input
                v-model.number="productForm.min_stock"
                type="number"
                min="0"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">最高库存</label>
              <input
                v-model.number="productForm.max_stock"
                type="number"
                min="0"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">销售单价</label>
              <input
                v-model.number="productForm.unit_price"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">成本价格</label>
              <input
                v-model.number="productForm.cost_price"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">规格型号</label>
              <input
                v-model="productForm.specification"
                type="text"
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入规格型号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1">条形码</label>
              <input
                v-model="productForm.barcode"
                type="text"
                class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入条形码"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-1">供应商</label>
            <input
              v-model="productForm.supplier_name"
              type="text"
              class="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="请输入供应商名称"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeProductDialog"
              class="px-4 py-2 border border-input rounded-md text-foreground hover:bg-accent"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useProducts } from '~/composables/useSupabase'
import type { Product } from '~/types/database'

// 商品表单数据
const showProductDialog = ref(false)
const editingProduct = ref<Product | null>(null)
const saving = ref(false)

// 商品表单
const productForm = reactive({
  product_no: '',
  name: '',
  description: '',
  category: '',
  specification: '',
  unit: '',
  current_stock: 0,
  min_stock: 0,
  max_stock: 0,
  unit_price: 0,
  cost_price: 0,
  barcode: '',
  supplier_name: '',
  status: 'active'
})

// 打开商品对话框
const openProductDialog = (product?: Product) => {
  if (product) {
    editingProduct.value = product
    Object.assign(productForm, {
      product_no: product.product_no,
      name: product.name,
      description: product.description || '',
      category: product.category,
      specification: product.specification || '',
      unit: product.unit,
      current_stock: product.current_stock,
      min_stock: product.min_stock,
      max_stock: product.max_stock,
      unit_price: product.unit_price,
      cost_price: product.cost_price || 0,
      barcode: product.barcode || '',
      supplier_name: product.supplier_name || '',
      status: product.status
    })
  } else {
    editingProduct.value = null
    Object.assign(productForm, {
      product_no: '',
      name: '',
      description: '',
      category: '',
      specification: '',
      unit: '',
      current_stock: 0,
      min_stock: 0,
      max_stock: 0,
      unit_price: 0,
      cost_price: 0,
      barcode: '',
      supplier_name: '',
      status: 'active'
    })
  }
  showProductDialog.value = true
}

// 关闭商品对话框
const closeProductDialog = () => {
  showProductDialog.value = false
  editingProduct.value = null
}

// 保存商品
const saveProduct = async () => {
  try {
    saving.value = true
    
    if (editingProduct.value) {
      // 编辑商品
      await updateProduct(editingProduct.value.id, productForm)
    } else {
      // 新增商品
      await createProduct(productForm)
    }
    
    closeProductDialog()
    await loadProducts()
    await loadStats()
  } catch (err: any) {
    error.value = err.message || '保存商品失败'
    console.error('保存商品失败:', err)
  } finally {
    saving.value = false
  }
}

// 响应式数据
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const stockFilter = ref('')
const currentPage = ref(1)
const pageSize = 12
const loading = ref(false)
const error = ref('')

// 统计数据
const stats = reactive({
  totalProducts: 0,
  activeProducts: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,
  totalStockValue: 0
})

// 商品数据
const products = ref<Product[]>([
])

// 使用商品数据操作
const {
  getProducts,
  getProductStats,
  createProduct,
  updateProduct,
  deleteProduct: removeProduct,
  searchProducts,
  getProductsByCategory,
  getProductsByStatus,
  getLowStockProducts,
  getOutOfStockProducts
} = useProducts()

// 删除商品
const deleteProduct = async (id: string) => {
  if (!confirm('确定要删除这个商品吗？')) {
    return
  }
  
  try {
    await removeProduct(id)
    await loadProducts()
    await loadStats()
  } catch (err: any) {
    error.value = err.message || '删除商品失败'
    console.error('删除商品失败:', err)
  }
}

// 加载商品数据
const loadProducts = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await getProducts()
    products.value = data
  } catch (err: any) {
    error.value = err.message || '加载商品数据失败'
    console.error('加载商品数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const data = await getProductStats()
    Object.assign(stats, data)
  } catch (err: any) {
    console.error('加载统计数据失败:', err)
  }
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  statusFilter.value = ''
  stockFilter.value = ''
  currentPage.value = 1
}

// 组件挂载时加载数据
onMounted(async () => {
  await Promise.all([loadProducts(), loadStats()])
})

// 筛选商品
const filteredProducts = computed(() => {
  let filtered = products.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.product_no.toLowerCase().includes(query) ||
      (product.specification && product.specification.toLowerCase().includes(query))
    )
  }

  // 分类筛选
  if (categoryFilter.value) {
    filtered = filtered.filter(product => product.category === categoryFilter.value)
  }

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(product => product.status === statusFilter.value)
  }

  // 库存状态筛选
  if (stockFilter.value) {
    filtered = filtered.filter(product => {
      if (stockFilter.value === 'sufficient') {
        return product.current_stock > product.min_stock
      } else if (stockFilter.value === 'low') {
        return product.current_stock <= product.min_stock && product.current_stock > 0
      } else if (stockFilter.value === 'out') {
        return product.current_stock === 0
      }
      return true
    })
  }

  return filtered
})

// 获取分类颜色
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    raw_material: 'bg-blue-100 text-blue-800',
    finished_product: 'bg-green-100 text-green-800',
    semi_finished: 'bg-yellow-100 text-yellow-800',
    accessory: 'bg-purple-100 text-purple-800'
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

// 获取分类文本
const getCategoryText = (category: string): string => {
  const texts: Record<string, string> = {
    raw_material: '原材料',
    finished_product: '成品',
    semi_finished: '半成品',
    accessory: '配件'
  }
  return texts[category] || category
}

// 获取状态颜色
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    discontinued: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: '正常',
    inactive: '停用',
    discontinued: '停产'
  }
  return texts[status] || status
}

// 页面标题
useHead({
  title: '商品管理 - ERP 管理系统'
})

// 页面元数据
definePageMeta({
  middleware: 'auth'
})
</script>