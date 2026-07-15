import { defineSimpleCrudHandler } from "../_utils/crud";

export default defineSimpleCrudHandler({
  table: "warehouses",
  permission: "warehouse:settings",
  searchFields: ["name", "code"],
  createFields: ["code", "name", "type", "address", "remark", "status"],
  updateFields: ["code", "name", "type", "address", "remark", "status"],
  requiredCreate: ["code", "name"],
  normalizeStatus: true,
  uniqueMessage: "仓库编码已存在",
});
