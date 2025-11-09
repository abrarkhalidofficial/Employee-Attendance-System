import { mutation, query } from "./_generated/server"
import { ConvexError, v } from "convex/values"
import { todayISO } from "./utils"

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20
    return ctx.db.query("workLogs").order("desc").take(limit)
  },
})

export const listForEmployee = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("workLogs")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect()
    return logs.sort((a, b) => (b.insertedAt ?? 0) - (a.insertedAt ?? 0)).slice(0, 50)
  },
})

export const create = mutation({
  args: {
    employeeId: v.id("users"),
    taskDescription: v.string(),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const insertedAt = Date.now()
    return ctx.db.insert("workLogs", {
      employeeId: args.employeeId,
      date: todayISO(),
      taskDescription: args.taskDescription,
      timeSpent: args.timeSpent,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      insertedAt,
    })
  },
})

export const remove = mutation({
  args: {
    id: v.id("workLogs"),
    employeeId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db.get(args.id)
    if (!log) {
      throw new ConvexError("Work log not found")
    }
    if (log.employeeId !== args.employeeId) {
      throw new ConvexError("Not authorized")
    }
    await ctx.db.delete(args.id)
  },
})
