<script lang="ts" setup>
  import type { MasterField } from "~/types/master-data";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "supplier:view",
  });

  useHead({ title: "供应商管理" });

  const fields: MasterField[] = [
    { key: "code", label: "编码", required: true },
    { key: "name", label: "供应商名称", required: true },
    { key: "contact_name", label: "联系人" },
    { key: "phone", label: "电话" },
    { key: "email", label: "邮箱" },
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
    code-prefix="S"
    description="管理供应商档案"
    endpoint="/api/suppliers"
    title="供应商管理"
    :fields="fields"
  />
</template>
