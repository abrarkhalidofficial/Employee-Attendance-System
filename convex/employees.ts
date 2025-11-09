import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { recordAudit } from "./lib/audit";
import { throwError } from "./lib/errors";
import { requireRole, requireViewer } from "./lib/rbac";
import { now } from "./lib/time";

type ListArgs = {
  q?: string;
  departmentId?: Id<"departments">;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
};

const MAX_PAGE_SIZE = 100;

export const list = query({
  args: {
    q: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    isActive: v.optional(v.boolean()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args: ListArgs) => {
    await requireRole(ctx, ["ADMIN"]);
    const employees = await fetchEmployees(ctx, args);
    const page = Math.max(args.page ?? 0, 0);
    const pageSize = Math.min(args.pageSize ?? 20, MAX_PAGE_SIZE);
    const start = page * pageSize;

    return {
      total: employees.length,
      page,
      pageSize,
      items: employees.slice(start, start + pageSize),
    };
  },
});

export const get = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, { employeeId }) => {
    const viewer = await requireViewer(ctx);
    const employee = await ctx.db.get(employeeId);
    if (!employee) {
      throwError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    if (viewer.user.role !== "ADMIN" && employee.userId !== viewer.user._id) {
      throwError({
        code: "FORBIDDEN",
        message: "You cannot view this employee.",
      });
    }

    const user = await ctx.db.get(employee.userId);
    return {
      ...employee,
      email: user?.email,
    };
  },
});

export const getEmployeeByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      return null;
    }

    const user = await ctx.db.get(employee.userId);
    return {
      ...employee,
      email: user?.email,
    };
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    employeeCode: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    departmentId: v.optional(v.id("departments")),
    managerId: v.optional(v.id("employees")),
    timezone: v.string(),
    hireDate: v.string(),
    role: v.optional(v.union(v.literal("EMPLOYEE"), v.literal("ADMIN"))),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["ADMIN"]);
    const timestamp = now();

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existingUser) {
      throwError({
        code: "VALIDATION_ERROR",
        message: "Email already exists.",
        details: { field: "email" },
      });
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      role: args.role ?? "EMPLOYEE",
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const employeeId = await ctx.db.insert("employees", {
      userId,
      employeeCode: args.employeeCode,
      firstName: args.firstName,
      lastName: args.lastName,
      departmentId: args.departmentId,
      managerId: args.managerId,
      timezone: args.timezone,
      hireDate: args.hireDate,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "employee",
      entityId: employeeId,
      action: "CREATE",
      after: args,
    });

    return employeeId;
  },
});

export const update = mutation({
  args: {
    employeeId: v.id("employees"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    managerId: v.optional(v.id("employees")),
    timezone: v.optional(v.string()),
    hireDate: v.optional(v.string()),
    employeeCode: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["ADMIN"]);
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) {
      throwError({ code: "NOT_FOUND", message: "Employee not found." });
    }

    const updates: Record<string, unknown> = {};
    for (const key of [
      "firstName",
      "lastName",
      "departmentId",
      "managerId",
      "timezone",
      "hireDate",
      "employeeCode",
      "isActive",
    ] as const) {
      if (args[key] !== undefined && args[key] !== employee[key]) {
        updates[key] = args[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return employee._id;
    }

    updates.updatedAt = now();

    await ctx.db.patch(employee._id, updates);

    if (updates.isActive !== undefined) {
      await ctx.db.patch(employee.userId, {
        isActive: updates.isActive as boolean,
      });
    }

    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "employee",
      entityId: employee._id,
      action: "UPDATE",
      before: employee,
      after: { ...employee, ...updates },
    });

    return employee._id;
  },
});

async function fetchEmployees(ctx: QueryCtx, args: ListArgs) {
  let rows;
  if (args.departmentId) {
    rows = await ctx.db
      .query("employees")
      .withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId!)
      )
      .collect();
  } else if (typeof args.isActive === "boolean") {
    rows = await ctx.db
      .query("employees")
      .withIndex("by_active", (q) => q.eq("isActive", args.isActive!))
      .collect();
  } else {
    rows = await ctx.db.query("employees").collect();
  }

  const filtered = rows.filter((employee) => {
    if (
      typeof args.isActive === "boolean" &&
      employee.isActive !== args.isActive
    ) {
      return false;
    }
    if (!args.q) {
      return true;
    }
    const needle = args.q.toLowerCase();
    return (
      employee.firstName.toLowerCase().includes(needle) ||
      employee.lastName.toLowerCase().includes(needle) ||
      employee.employeeCode.toLowerCase().includes(needle)
    );
  });

  return Promise.all(
    filtered.map(async (employee) => {
      const user = await ctx.db.get(employee.userId);
      return {
        ...employee,
        email: user?.email,
      };
    })
  );
}
