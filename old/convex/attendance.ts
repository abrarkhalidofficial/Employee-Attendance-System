import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { recordAudit } from "./lib/audit";
import {
  assertClockedIn,
  ensureEntryForToday,
  getEntryForDate,
} from "./lib/attendance";
import { throwError } from "./lib/errors";
import { requireEmployee, requireRole } from "./lib/rbac";
import { ensureDateRange, getLocalDate, now } from "./lib/time";

export const clockIn = mutation({
  args: { notes: v.optional(v.string()) },
  handler: async (ctx, { notes }) => {
    const viewer = await requireRole(ctx, ["EMPLOYEE", "ADMIN"]);
    const employee = await requireEmployee(ctx, viewer.user);
    const { entry, date, timestamp } = await ensureEntryForToday(ctx, employee);

    if (entry.clockInAt && !entry.clockOutAt) {
      throwError({
        code: "ATTENDANCE_CONFLICT",
        message: "Already clocked in.",
      });
    }

    await ctx.db.patch(entry._id, {
      clockInAt: timestamp,
      notes,
      updatedAt: timestamp,
    });

    await ctx.db.insert("attendanceEvents", {
      employeeId: employee._id,
      eventType: "CLOCK_IN",
      occurredAt: timestamp,
      source: "WEB",
      createdBy: viewer.user._id,
      createdAt: timestamp,
    });

    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "attendanceEntry",
      entityId: entry._id,
      action: "CREATE",
      after: { date, clockInAt: timestamp },
    });

    return { entryId: entry._id, date };
  },
});

export const clockOut = mutation({
  args: { notes: v.optional(v.string()) },
  handler: async (ctx, { notes }) => {
    const viewer = await requireRole(ctx, ["EMPLOYEE", "ADMIN"]);
    const employee = await requireEmployee(ctx, viewer.user);
    const today = getLocalDate(now(), employee.timezone);
    const entry = await getEntryForDate(ctx, employee._id, today);
    await assertClockedIn(entry);

    const timestamp = now();
    const workedSeconds = entry!.clockInAt
      ? Math.max(0, Math.floor((timestamp - entry!.clockInAt) / 1000))
      : undefined;

    await ctx.db.patch(entry!._id, {
      clockOutAt: timestamp,
      workedSeconds,
      notes: notes ?? entry!.notes,
      updatedAt: timestamp,
    });

    await ctx.db.insert("attendanceEvents", {
      employeeId: employee._id,
      eventType: "CLOCK_OUT",
      occurredAt: timestamp,
      source: "WEB",
      createdBy: viewer.user._id,
      createdAt: timestamp,
    });

    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "attendanceEntry",
      entityId: entry!._id,
      action: "UPDATE",
      before: entry,
      after: { ...entry, clockOutAt: timestamp, workedSeconds },
    });

    return { entryId: entry!._id, workedSeconds };
  },
});

export const mine = query({
  args: {
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["EMPLOYEE", "ADMIN"]);
    const employee = await requireEmployee(ctx, viewer.user);
    const range = ensureDateRange(args.from, args.to);

    const entries = await ctx.db
      .query("attendanceEntries")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", employee._id).gte("date", range.from),
      )
      .collect();

    return entries
      .filter((entry) => entry.date >= range.from && entry.date <= range.to)
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const correct = mutation({
  args: {
    entryId: v.id("attendanceEntries"),
    clockInAt: v.optional(v.number()),
    clockOutAt: v.optional(v.number()),
    workedSeconds: v.optional(v.number()),
    notes: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireRole(ctx, ["ADMIN"]);
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throwError({ code: "NOT_FOUND", message: "Entry not found." });
    }

    const updates: Record<string, unknown> = {};
    for (const key of ["clockInAt", "clockOutAt", "workedSeconds", "notes"] as const) {
      if (args[key] !== undefined) {
        updates[key] = args[key];
      }
    }
    if (Object.keys(updates).length === 0) {
      return entry._id;
    }

    updates.updatedAt = now();

    await ctx.db.patch(entry._id, updates);

    await ctx.db.insert("attendanceEvents", {
      employeeId: entry.employeeId,
      eventType: args.clockOutAt ? "CLOCK_OUT" : "CLOCK_IN",
      occurredAt: now(),
      source: "ADMIN_OVERRIDE",
      createdBy: viewer.user._id,
      meta: { reason: args.reason },
      createdAt: now(),
    });

    await recordAudit(ctx, {
      actorUserId: viewer.user._id,
      entityType: "attendanceEntry",
      entityId: entry._id,
      action: "UPDATE",
      before: entry,
      after: { ...entry, ...updates },
      meta: { reason: args.reason },
    });

    return entry._id;
  },
});
