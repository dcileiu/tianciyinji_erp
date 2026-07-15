import { requireUser } from "../../utils/auth";
import { getUserPermissionCodes, getUserRoleRows } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === "production") {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  const user = await requireUser(event);
  const roles = await getUserRoleRows(user.id);
  const permissions = await getUserPermissionCodes(user.id);

  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
      roles,
      permissions,
    },
  };
});
