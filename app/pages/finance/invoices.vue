<script lang="ts" setup>
  import type { MasterField } from "~/types/master-data";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "invoice:view",
  });

  useHead({ title: "发票管理" });

  const fields: MasterField[] = [
    { key: "invoice_no", label: "发票号" },
    {
      key: "direction",
      label: "方向",
      type: "select",
      required: true,
      options: [
        { label: "销售", value: "sales" },
        { label: "采购", value: "purchase" },
      ],
    },
    {
      key: "party_id",
      label: "往来方ID",
      required: true,
      placeholder: "客户或供应商 UUID",
    },
    { key: "amount", label: "金额", type: "number", required: true },
    { key: "invoice_date", label: "发票日期" },
    {
      key: "status",
      label: "状态",
      type: "select",
      options: [
        { label: "草稿", value: "draft" },
        { label: "已开", value: "issued" },
        { label: "作废", value: "void" },
      ],
    },
    { key: "remark", label: "备注", type: "textarea" },
  ];
</script>

<template>
  <MasterDataManager
    code-prefix="INV"
    description="登记销售/采购发票（往来方填写对应客户或供应商 ID）"
    endpoint="/api/finance/invoices"
    title="发票管理"
    :fields="fields"
  />
</template>
