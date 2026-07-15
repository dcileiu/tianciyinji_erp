import { defineSimpleCrudHandler } from "../_utils/crud";

export default defineSimpleCrudHandler({
  table: "products",
  permission: "product:view",
  searchFields: ["name", "code"],
  createFields: [
    "code",
    "name",
    "category",
    "specification",
    "unit",
    "price",
    "cost",
    "remark",
    "status",
  ],
  updateFields: [
    "code",
    "name",
    "category",
    "specification",
    "unit",
    "price",
    "cost",
    "remark",
    "status",
  ],
  requiredCreate: ["code", "name"],
  normalizeStatus: true,
  uniqueMessage: "产品编码已存在",
});
