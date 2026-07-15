<script lang="ts" setup>
  import type { MasterField } from "~/types/master-data";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "product:view",
  });

  useHead({ title: "产品管理" });

  const fields: MasterField[] = [
    { key: "code", label: "编码", required: true },
    { key: "name", label: "名称", required: true },
    { key: "category", label: "分类" },
    { key: "specification", label: "规格" },
    { key: "unit", label: "单位" },
    { key: "price", label: "售价", type: "number", required: true },
    { key: "cost", label: "成本", type: "number" },
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
    code-prefix="P"
    description="维护产品主数据，供销售、采购与库存引用"
    endpoint="/api/products"
    title="产品管理"
    :fields="fields"
  />
</template>
