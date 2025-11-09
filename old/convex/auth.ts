import { query } from "./_generated/server";
import { getEmployeeForUser, getViewer } from "./lib/rbac";

export const getIdentity = query({
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) {
      return null;
    }

    const employee = await getEmployeeForUser(ctx, viewer.user._id);
    return {
      user: {
        _id: viewer.user._id,
        email: viewer.user.email,
        role: viewer.user.role,
        displayName:
          viewer.user.displayName ?? viewer.identity.name ?? viewer.user.email,
      },
      employee: employee
        ? {
            _id: employee._id,
            employeeCode: employee.employeeCode,
            firstName: employee.firstName,
            lastName: employee.lastName,
            departmentId: employee.departmentId,
          }
        : null,
    };
  },
});
