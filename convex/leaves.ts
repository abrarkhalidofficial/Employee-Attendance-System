import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { recordAudit } from "./lib/audit";
import { throwError } from "./lib/errors";
import { requireEmployee, requireRole, requireViewer } from "./lib/rbac";
import { now } from "./lib/time";

export const types = query({
  handler: async (ctx) => {
    return await ctx.db.query("leaveTypes").collect();
  },
});

export const mine = query({
  handler: async (ctx) => {
    const viewer = await requireViewer(ctx);
    const employee = await requireEmployee(ctx, viewer.user);
    return await ctx.db
      .query("leaveRequests")
      .withIndex("by_emp_dates", (q) => q.eq("employeeId", employee._id))
      .collect();
  },
});

export const request = mutation({
  args: {
    leaveTypeId: v.id("leaveTypes"),
    startDate: v.string(),
    endDate: v.string(),
    days: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["EMPLOYEE", "ADMIN"]);
    const employee = await requireEmployee(ctx, viewer.user);
    validateDateRange(args.startDate, args.endDate);

    await assertNoOverlap(ctx, employee._id, args.startDate, args.endDate);

    const timestamp = now();
    const requestId = await ctx.db.insert("leaveRequests", {
      employeeId: employee._id,
      leaveTypeId: args.leaveTypeId,
      status: "PENDING",
      startDate: args.startDate,
      endDate: args.endDate,
      days: args.days,
      reason: args.reason,
      requestedAt: timestamp,
    });

    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "leaveRequest",
      entityId: requestId,
      action: "CREATE",
      after: args,
    });

    return requestId;
  },
});

export const approve = mutation({
  args: {
    leaveId: v.id("leaveRequests"),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["ADMIN"]);
    const leave = await ctx.db.get(args.leaveId);
    if (!leave) {
      throwError({ code: "NOT_FOUND", message: "Leave request not found." });
    }
    if (leave.status === "APPROVED") {
      return leave._id;
    }
    await ctx.db.patch(leave._id, {
      status: "APPROVED",
      decidedAt: now(),
      decidedBy: viewer.user._id,
      meta: { comment: args.comment },
    });
    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "leaveRequest",
      entityId: leave._id,
      action: "UPDATE",
      before: leave,
      after: { ...leave, status: "APPROVED" },
    });
    return leave._id;
  },
});

export const reject = mutation({
  args: {
    leaveId: v.id("leaveRequests"),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["ADMIN"]);
    const leave = await ctx.db.get(args.leaveId);
    if (!leave) {
      throwError({ code: "NOT_FOUND", message: "Leave request not found." });
    }
    await ctx.db.patch(leave._id, {
      status: "REJECTED",
      decidedAt: now(),
      decidedBy: viewer.user._id,
      meta: { comment: args.comment },
    });
    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "leaveRequest",
      entityId: leave._id,
      action: "UPDATE",
      before: leave,
      after: { ...leave, status: "REJECTED" },
    });
    return leave._id;
  },
});

export const cancel = mutation({
  args: {
    leaveId: v.id("leaveRequests"),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["EMPLOYEE", "ADMIN"]);
    const leave = await ctx.db.get(args.leaveId);
    if (!leave) {
      throwError({ code: "NOT_FOUND", message: "Leave request not found." });
    }

    const employee = await requireEmployee(ctx, viewer.user);
    if (viewer.user.role !== "ADMIN" && leave.employeeId !== employee._id) {
      throwError({
        code: "FORBIDDEN",
        message: "You cannot cancel this leave.",
      });
    }

    await ctx.db.patch(leave._id, {
      status: "CANCELLED",
      decidedAt: now(),
      decidedBy: viewer.user._id,
    });

    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "leaveRequest",
      entityId: leave._id,
      action: "UPDATE",
      before: leave,
      after: { ...leave, status: "CANCELLED" },
    });
    return leave._id;
  },
});

function validateDateRange(start: string, end: string) {
  if (start > end) {
    throwError({
      code: "VALIDATION_ERROR",
      message: "Start date must be before end date.",
      details: { field: "startDate" },
    });
  }
}

async function assertNoOverlap(
  ctx: MutationCtx,
  employeeId: Id<"employees">,
  start: string,
  end: string
) {
  const entries = await ctx.db
    .query("leaveRequests")
    .withIndex("by_emp_dates", (q) => q.eq("employeeId", employeeId))
    .collect();

  const conflicts = entries.some(
    (leave: Doc<"leaveRequests">) =>
      ["PENDING", "APPROVED"].includes(leave.status) &&
      !(leave.endDate < start || leave.startDate > end)
  );

  if (conflicts) {
    throwError({
      code: "LEAVE_OVERLAP",
      message: "Leave request overlaps with an existing one.",
    });
  }
}
