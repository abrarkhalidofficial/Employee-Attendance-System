import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { recordAudit } from "./lib/audit";
import { throwError } from "./lib/errors";
import { getEntryForDate } from "./lib/attendance";
import { requireEmployee, requireRole } from "./lib/rbac";
import { getLocalDate, now } from "./lib/time";

export const start = mutation({
  args: {
    statusType: v.union(v.literal("BREAK"), v.literal("TASK")),
    reason: v.string(),
    expectedReturnAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["EMPLOYEE", "ADMIN"]);
    const employee = await requireEmployee(ctx, viewer.user);
    const open = await getOpenSession(ctx, employee._id);
    if (open) {
      throwError({
        code: "STATUS_SESSION_OPEN_EXISTS",
        message: "There is already an open status session.",
      });
    }
    const timestamp = now();
    const sessionId = await ctx.db.insert("statusSessions", {
      employeeId: employee._id,
      statusType: args.statusType,
      reason: args.reason,
      expectedReturnAt: args.expectedReturnAt,
      startedAt: timestamp,
      createdBy: viewer.user._id,
      meta: {},
    });
    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "statusSession",
      entityId: sessionId,
      action: "STATUS_CHANGE",
      after: args,
    });
    return sessionId;
  },
});

export const end = mutation({
  args: {
    sessionId: v.optional(v.id("statusSessions")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["EMPLOYEE", "ADMIN"]);
    const employee = await requireEmployee(ctx, viewer.user);
    const session =
      (args.sessionId && (await ctx.db.get(args.sessionId))) ||
      (await getOpenSession(ctx, employee._id));

    if (!session || session.endedAt) {
      throwError({
        code: "NOT_FOUND",
        message: "No open status session found.",
      });
    }

    const timestamp = now();
    await ctx.db.patch(session._id, {
      endedAt: timestamp,
      closedBy: viewer.user._id,
      meta: { note: args.note },
    });

    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "statusSession",
      entityId: session._id,
      action: "STATUS_CHANGE",
      before: session,
      after: { ...session, endedAt: timestamp },
    });

    return session._id;
  },
});

export const current = query({
  handler: async (ctx) => {
    const viewer = await requireRole(ctx, ["EMPLOYEE", "ADMIN"]);
    const employee = await requireEmployee(ctx, viewer.user);
    return await getOpenSession(ctx, employee._id);
  },
});

export const freeNow = query({
  args: { departmentId: v.optional(v.id("departments")) },
  handler: async (ctx, { departmentId }) => {
    await requireRole(ctx, ["ADMIN"]);
    const employees = departmentId
      ? (
          await ctx.db
            .query("employees")
            .withIndex("by_department", (q) =>
              q.eq("departmentId", departmentId)
            )
            .collect()
        ).filter((employee) => employee.isActive)
      : await ctx.db
          .query("employees")
          .withIndex("by_active", (q) => q.eq("isActive", true))
          .collect();
    const nowTs = now();

    const entries = await Promise.all(
      employees.map(async (employee) => {
        const date = getLocalDate(nowTs, employee.timezone);
        const attendance = await getEntryForDate(ctx, employee._id, date);
        const session = await getOpenSession(ctx, employee._id);

        let state: "FREE" | "BUSY" | "OFFLINE" = "OFFLINE";
        if (attendance?.clockInAt && !attendance.clockOutAt) {
          state = session ? "BUSY" : "FREE";
        }

        return {
          employeeId: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          state,
          status: session
            ? {
                statusType: session.statusType,
                reason: session.reason,
                expectedReturnAt: session.expectedReturnAt,
                startedAt: session.startedAt,
              }
            : null,
        };
      })
    );

    return {
      asOf: nowTs,
      employees: entries,
    };
  },
});

type AnyCtx = QueryCtx | MutationCtx;

async function getOpenSession(ctx: AnyCtx, employeeId: Id<"employees">) {
  const sessions = await ctx.db
    .query("statusSessions")
    .withIndex("by_emp_started", (q) => q.eq("employeeId", employeeId))
    .collect();

  return (
    sessions
      .filter((session) => !session.endedAt)
      .sort((a, b) => b.startedAt - a.startedAt)[0] ?? null
  );
}
