import { defineSimpleCrudHandler } from "../_utils/crud";

export default defineSimpleCrudHandler({
  table: "customers",
  permission: "customer:view",
  searchFields: ["name", "code"],
  createFields: [
    "code",
    "name",
    "contact_name",
    "phone",
    "email",
    "address",
    "remark",
    "status",
  ],
  updateFields: [
    "code",
    "name",
    "contact_name",
    "phone",
    "email",
    "address",
    "remark",
    "status",
  ],
  requiredCreate: ["code", "name"],
  normalizeStatus: true,
  uniqueMessage: "客户编码已存在",
});
