import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createLeaveRequest = mutation({
  args: {
    employeeId: v.id("employees"),
    startDate: v.number(),
    endDate: v.number(),
    type: v.union(v.literal("sick"), v.literal("casual"), v.literal("personal"), v.literal("other")),
    reason: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { employeeId, startDate, endDate, type, reason, userId } = args

    const leaveId = await ctx.db.insert("leaves", {
      employeeId,
      startDate,
      endDate,
      type,
      reason,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Log activity
    await ctx.db.insert("activityLog", {
      userId,
      action: "CREATE",
      entityType: "leave",
      entityId: leaveId,
      changes: {
        after: { type, reason },
      },
      timestamp: Date.now(),
    })

    return leaveId
  },
})

export const getLeavesByEmployee = query({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leaves")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId))
      .collect()
  },
})

export const getAllLeaves = query({
  handler: async (ctx) => {
    return await ctx.db.query("leaves").collect()
  },
})

export const approveLeave = mutation({
  args: {
    leaveId: v.id("leaves"),
    comments: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { leaveId, comments, userId } = args

    const leave = await ctx.db.get(leaveId)
    if (!leave) throw new Error("Leave request not found")

    await ctx.db.patch(leaveId, {
      status: "approved",
      approvedBy: userId,
      comments,
      updatedAt: Date.now(),
    })

    await ctx.db.insert("activityLog", {
      userId,
      action: "APPROVE",
      entityType: "leave",
      entityId: leaveId,
      changes: {
        before: { status: leave.status },
        after: { status: "approved" },
      },
      timestamp: Date.now(),
    })

    return leaveId
  },
})

export const rejectLeave = mutation({
  args: {
    leaveId: v.id("leaves"),
    comments: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { leaveId, comments, userId } = args

    const leave = await ctx.db.get(leaveId)
    if (!leave) throw new Error("Leave request not found")

    await ctx.db.patch(leaveId, {
      status: "rejected",
      approvedBy: userId,
      comments,
      updatedAt: Date.now(),
    })

    await ctx.db.insert("activityLog", {
      userId,
      action: "REJECT",
      entityType: "leave",
      entityId: leaveId,
      changes: {
        before: { status: leave.status },
        after: { status: "rejected" },
      },
      timestamp: Date.now(),
    })

    return leaveId
  },
})
