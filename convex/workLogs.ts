import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { todayISO, getCurrentPakistanTime } from "./utils";

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return ctx.db.query("workLogs").order("desc").take(limit);
  },
});

export const listAll = query({
  handler: async (ctx) => {
    const logs = await ctx.db.query("workLogs").collect();
    return logs.sort((a, b) => (b.insertedAt ?? 0) - (a.insertedAt ?? 0));
  },
});

export const listForEmployee = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("workLogs")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();
    return logs
      .sort((a, b) => (b.insertedAt ?? 0) - (a.insertedAt ?? 0))
      .slice(0, 50);
  },
});

export const getEmployeeHistory = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("workLogs")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();
    return logs.sort((a, b) => (b.insertedAt ?? 0) - (a.insertedAt ?? 0));
  },
});

export const getAnalytics = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    employeeId: v.optional(v.id("users")),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db.query("workLogs").collect();

    // Filter by date range
    if (args.startDate) {
      logs = logs.filter((log) => log.date >= args.startDate!);
    }
    if (args.endDate) {
      logs = logs.filter((log) => log.date <= args.endDate!);
    }

    // Filter by employee
    if (args.employeeId) {
      logs = logs.filter((log) => log.employeeId === args.employeeId);
    }

    // Filter by department
    if (args.department) {
      const deptEmployees = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("department"), args.department))
        .collect();
      const deptEmployeeIds = new Set(deptEmployees.map((e) => e._id));
      logs = logs.filter((log) => deptEmployeeIds.has(log.employeeId));
    }

    return logs.sort((a, b) => (b.insertedAt ?? 0) - (a.insertedAt ?? 0));
  },
});

export const getEmployeeStats = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("workLogs")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    const totalTimeSpent = logs.reduce((sum, log) => sum + log.timeSpent, 0);
    const totalTasks = logs.length;

    // Group by date for daily average
    const logsByDate = logs.reduce((acc, log) => {
      if (!acc[log.date]) acc[log.date] = [];
      acc[log.date].push(log);
      return acc;
    }, {} as Record<string, typeof logs>);

    const daysWorked = Object.keys(logsByDate).length;
    const avgTasksPerDay = daysWorked > 0 ? totalTasks / daysWorked : 0;
    const avgTimePerDay = daysWorked > 0 ? totalTimeSpent / daysWorked : 0;

    return {
      totalTimeSpent,
      totalTasks,
      daysWorked,
      avgTasksPerDay: Math.round(avgTasksPerDay * 10) / 10,
      avgTimePerDay: Math.round(avgTimePerDay),
      logsByDate,
    };
  },
});

export const create = mutation({
  args: {
    employeeId: v.id("users"),
    taskDescription: v.string(),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const insertedAt = Date.now();
    return ctx.db.insert("workLogs", {
      employeeId: args.employeeId,
      date: todayISO(),
      taskDescription: args.taskDescription,
      timeSpent: args.timeSpent,
      createdAt: getCurrentPakistanTime(),
      insertedAt,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("workLogs"),
    employeeId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db.get(args.id);
    if (!log) {
      throw new ConvexError("Work log not found");
    }
    if (log.employeeId !== args.employeeId) {
      throw new ConvexError("Not authorized");
    }
    await ctx.db.delete(args.id);
  },
});
