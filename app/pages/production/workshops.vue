<script lang="ts" setup>
  import type { MasterField } from "~/types/master-data";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "workshop:view",
  });

  useHead({ title: "车间管理" });

  const fields: MasterField[] = [
    { key: "code", label: "编码", required: true },
    { key: "name", label: "名称", required: true },
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
    code-prefix="WS"
    description="维护生产车间主数据"
    endpoint="/api/workshops"
    title="车间管理"
    :fields="fields"
  />
</template>
