<script lang="ts" setup>
  import type { MasterField } from "~/types/master-data";

  definePageMeta({
    title: "客户管理",
    layout: "default",
    requiresAuth: true,
    permission: "customer:view",
  });

  useHead({ title: "客户管理" });

  const fields: MasterField[] = [
    { key: "code", label: "编码", required: true },
    { key: "name", label: "客户名称", required: true },
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
    code-prefix="C"
    description="管理客户档案与联系方式"
    endpoint="/api/customers"
    title="客户管理"
    :fields="fields"
  />
</template>
