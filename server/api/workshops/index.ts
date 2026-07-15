import { defineSimpleCrudHandler } from "../_utils/crud";

export default defineSimpleCrudHandler({
  table: "workshops",
  permission: "workshop:view",
  searchFields: ["name", "code"],
  createFields: ["code", "name", "remark", "status"],
  updateFields: ["code", "name", "remark", "status"],
  requiredCreate: ["code", "name"],
  normalizeStatus: true,
});
