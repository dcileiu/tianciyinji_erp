<script lang="ts" setup>
  import type { MasterField } from "~/types/master-data";

  definePageMeta({
    title: "仓库主数据",
    layout: "default",
    requiresAuth: true,
    permission: "warehouse:settings",
  });

  useHead({ title: "仓库设置" });

  const fields: MasterField[] = [
    { key: "code", label: "编码", required: true },
    { key: "name", label: "仓库名称", required: true },
    {
      key: "type",
      label: "类型",
      type: "select",
      options: [
        { label: "成品仓", value: "finished_goods" },
        { label: "原料仓", value: "raw_materials" },
        { label: "半成品仓", value: "semi_finished" },
        { label: "工具仓", value: "tools" },
      ],
    },
    { key: "address", label: "地址", type: "textarea" },
    {
      key: "status",
      label: "状态",
      type: "select",
      options: [
        { label: "启用", value: "active" },
        { label: "停用", value: "inactive" },
      ],
    },
    { key: "remark", label: "备注", type: "textarea" },
  ];
</script>

<template>
  <MasterDataManager
    code-prefix="W"
    description="维护仓库主数据"
    endpoint="/api/warehouses"
    title="仓库设置"
    :fields="fields"
  />
</template>
