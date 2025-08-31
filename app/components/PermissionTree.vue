<template>
  <div class="permission-tree">
    <!-- 操作栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          {{ title }}
        </h4>
        <div class="text-xs text-gray-500">
          已选择 {{ selectedCount }} / {{ totalCount }} 项
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <Button size="sm" variant="outline" class="text-xs" @click="expandAll">
          <ChevronDown class="w-3 h-3 mr-1" />
          展开全部
        </Button>

        <Button
          size="sm"
          variant="outline"
          class="text-xs"
          @click="collapseAll"
        >
          <ChevronUp class="w-3 h-3 mr-1" />
          收起全部
        </Button>

        <Button size="sm" variant="outline" class="text-xs" @click="selectAll">
          <Check class="w-3 h-3 mr-1" />
          全选
        </Button>

        <Button size="sm" variant="outline" class="text-xs" @click="clearAll">
          <X class="w-3 h-3 mr-1" />
          清空
        </Button>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="mb-4">
      <div class="relative">
        <Search
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
        />
        <Input
          v-model="searchQuery"
          placeholder="搜索权限项..."
          class="pl-10 w-full"
        />
      </div>
    </div>

    <!-- 权限树 -->
    <div
      class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto"
    >
      <div
        v-if="filteredTreeData.length === 0"
        class="p-8 text-center text-gray-500"
      >
        <div class="text-4xl mb-2">🔍</div>
        <div>{{ searchQuery ? "未找到匹配的权限项" : "暂无权限数据" }}</div>
      </div>

      <div v-else class="p-2">
        <PermissionTreeNode
          v-for="item in filteredTreeData"
          :key="item.id"
          :item="item"
          :selected-ids="selectedIds"
          :expanded-ids="expandedIds"
          :level="0"
          @toggle-selection="handleToggleSelection"
          @toggle-expand="handleToggleExpand"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import { computed, ref, watch } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '权限配置',
  },
  treeData: {
    type: Array,
    default: () => [],
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:selectedIds'])

// 状态
const searchQuery = ref('')
const expandedIds = ref(new Set())

// 计算属性
const selectedCount = computed(() => props.selectedIds.length)

const totalCount = computed(() => {
  const countItems = (items: any) => {
    let count = 0
    for (const item of items) {
      count++
      if (item.children && item.children.length > 0) {
        count += countItems(item.children)
      }
    }
    return count
  }
  return countItems(props.treeData)
})

// 过滤后的树形数据
const filteredTreeData = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.treeData
  }

  const filterItems = (items: any[]): any[] => {
    const filtered: any[] = []

    for (const item of items) {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.key?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.description
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase())

      let filteredChildren: any[] = []
      if (item.children && item.children.length > 0) {
        filteredChildren = filterItems(item.children)
      }

      // 如果当前项匹配或有匹配的子项，则包含此项
      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...item,
          children: filteredChildren,
        })

        // 自动展开包含搜索结果的节点
        if (filteredChildren.length > 0) {
          expandedIds.value.add(item.id)
        }
      }
    }

    return filtered
  }

  return filterItems(props.treeData)
})

// 方法
const handleToggleSelection = (id: any, selected: boolean) => {
  if (props.disabled) {
    return
  }

  const newSelectedIds = [...props.selectedIds]

  if (selected) {
    // 添加选中项及其所有子项
    const addItemAndChildren = (items: any[]) => {
      for (const item of items) {
        if (!newSelectedIds.includes(item.id)) {
          newSelectedIds.push(item.id)
        }
        if (item.children && item.children.length > 0) {
          addItemAndChildren(item.children)
        }
      }
    }

    const findItem = (items: any[], targetId: any): any => {
      for (const item of items) {
        if (item.id === targetId) {
          return item
        }
        if (item.children && item.children.length > 0) {
          const found: any = findItem(item.children, targetId)
          if (found) {
            return found
          }
        }
      }
      return null
    }

    const targetItem = findItem(props.treeData, id)
    if (targetItem) {
      addItemAndChildren([targetItem])
    }
  } else {
    // 移除选中项及其所有子项
    const removeItemAndChildren = (items: any[]) => {
      for (const item of items) {
        const index = newSelectedIds.indexOf(item.id)
        if (index > -1) {
          newSelectedIds.splice(index, 1)
        }
        if (item.children && item.children.length > 0) {
          removeItemAndChildren(item.children)
        }
      }
    }

    const findItem = (items: any[], targetId: any): any => {
      for (const item of items) {
        if (item.id === targetId) {
          return item
        }
        if (item.children && item.children.length > 0) {
          const found: any = findItem(item.children, targetId)
          if (found) {
            return found
          }
        }
      }
      return null
    }

    const targetItem = findItem(props.treeData, id)
    if (targetItem) {
      removeItemAndChildren([targetItem])
    }
  }

  emit('update:selectedIds', newSelectedIds)
}

const handleToggleExpand = (id: any) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

const expandAll = () => {
  const getAllIds = (items: any[]): any[] => {
    const ids: any[] = []
    for (const item of items) {
      ids.push(item.id)
      if (item.children && item.children.length > 0) {
        ids.push(...getAllIds(item.children))
      }
    }
    return ids
  }

  expandedIds.value = new Set(getAllIds(props.treeData))
}

const collapseAll = () => {
  expandedIds.value.clear()
}

const selectAll = () => {
  if (props.disabled) {
    return
  }

  const getAllIds = (items: any[]): any[] => {
    const ids: any[] = []
    for (const item of items) {
      ids.push(item.id)
      if (item.children && item.children.length > 0) {
        ids.push(...getAllIds(item.children))
      }
    }
    return ids
  }

  emit('update:selectedIds', getAllIds(props.treeData))
}

const clearAll = () => {
  if (props.disabled) {
    return
  }
  emit('update:selectedIds', [])
}

// 监听搜索变化，自动展开相关节点
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    // 搜索时自动展开所有匹配的父节点
    // 这个逻辑已经在 filteredTreeData 中处理了
  }
})

// 初始化时展开第一级节点
const initializeExpanded = () => {
  const firstLevelIds = props.treeData.map((item: any) => item.id)
  expandedIds.value = new Set(firstLevelIds)
}

// 监听数据变化
watch(
  () => props.treeData,
  () => {
    if (props.treeData.length > 0 && expandedIds.value.size === 0) {
      initializeExpanded()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.permission-tree {
  @apply bg-white dark:bg-gray-800 rounded-lg;
}
</style>
