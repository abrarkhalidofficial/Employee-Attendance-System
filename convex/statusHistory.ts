import { query } from "./_generated/server"
import { v } from "convex/values"

export const getEmployeeStatusHistory = query({
  args: {
    employeeId: v.id("employees"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50
    const history = await ctx.db
      .query("statusHistory")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId))
      .order("desc")
      .take(limit)

    return history
  },
})

export const getRecentStatusHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 30
    const history = await ctx.db
      .query("statusHistory")
      .withIndex("by_createdAt", (q) => q)
      .order("desc")
      .take(limit)

    return history
  },
})
