import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { todayISO } from "./utils"

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50
    return ctx.db.query("timeLogs").order("desc").take(limit)
  },
})

export const listForEmployee = query({
  args: {
    employeeId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("timeLogs")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect()
    return logs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 30)
  },
})

export const recordTimeLog = mutation({
  args: {
    employeeId: v.id("users"),
    checkIn: v.string(),
    checkOut: v.optional(v.string()),
    breakTime: v.number(),
    totalHours: v.number(),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const insertedAt = Date.now()
    await ctx.db.insert("timeLogs", {
      employeeId: args.employeeId,
      date: args.date ?? todayISO(),
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      breakTime: args.breakTime,
      totalHours: args.totalHours,
      createdAt: insertedAt,
    })
  },
})
