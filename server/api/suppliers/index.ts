import { defineSimpleCrudHandler } from "../_utils/crud";

export default defineSimpleCrudHandler({
  table: "suppliers",
  permission: "supplier:view",
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
  uniqueMessage: "供应商编码已存在",
});
