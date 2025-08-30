<template>
  <div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12">
            <Skeleton class="h-4 w-4 rounded" />
          </TableHead>
          <TableHead>菜单名称</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>路径</TableHead>
          <TableHead>图标</TableHead>
          <TableHead>权限标识</TableHead>
          <TableHead>排序</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead class="w-40">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- 简单的骨架屏行 -->
        <TableRow v-for="i in 5" :key="`skeleton-${i}`">
          <TableCell>
            <Skeleton class="h-4 w-4 rounded" />
          </TableCell>
          <TableCell>
            <div class="flex items-center space-x-2">
              <Skeleton class="h-4 w-4 rounded" />
              <Skeleton class="h-4 w-20" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton class="h-5 w-12 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-24 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-4 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-20 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-5 w-12 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-24" />
          </TableCell>
          <TableCell>
            <div class="flex items-center space-x-1">
              <Skeleton class="h-8 w-8 rounded" />
              <Skeleton class="h-8 w-8 rounded" />
              <Skeleton class="h-8 w-8 rounded" />
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
// 菜单表格骨架屏组件
</script>
