import { mutation, query } from "./_generated/server"
import { ConvexError, v } from "convex/values"
import { todayISO } from "./utils"

export const listAll = query({
  handler: async (ctx) => {
    return ctx.db.query("leaveRequests").order("desc").collect()
  },
})

export const listForEmployee = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("leaveRequests")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .order("desc")
      .take(50)
  },
})

export const create = mutation({
  args: {
    employeeId: v.id("users"),
    type: v.union(v.literal("sick"), v.literal("vacation"), v.literal("personal"), v.literal("unpaid")),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("leaveRequests", {
      employeeId: args.employeeId,
      type: args.type,
      startDate: args.startDate,
      endDate: args.endDate,
      reason: args.reason,
      status: "pending",
      requestDate: todayISO(),
      createdAt: Date.now(),
    })
  },
})

export const updateStatus = mutation({
  args: {
    id: v.id("leaveRequests"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id)
    if (!request) {
      throw new ConvexError("Leave request not found")
    }
    await ctx.db.patch(args.id, { status: args.status })
  },
})
