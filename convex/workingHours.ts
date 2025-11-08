import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const startWorkDay = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const { employeeId } = args
    const today = new Date().toISOString().split("T")[0]

    // Check if already started today
    const existingEntry = await ctx.db
      .query("workingHours")
      .withIndex("by_date", (q) => q.eq("date", today).eq("employeeId", employeeId))
      .filter((q) => q.eq(q.field("endTime"), undefined))
      .first()

    if (existingEntry) {
      throw new Error("You have already started working today")
    }

    const workingHourId = await ctx.db.insert("workingHours", {
      employeeId,
      date: today,
      startTime: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return workingHourId
  },
})

export const endWorkDay = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const { employeeId } = args
    const today = new Date().toISOString().split("T")[0]

    const workEntry = await ctx.db
      .query("workingHours")
      .withIndex("by_date", (q) => q.eq("date", today).eq("employeeId", employeeId))
      .filter((q) => q.eq(q.field("endTime"), undefined))
      .first()

    if (!workEntry) {
      throw new Error("No active work session found")
    }

    const endTime = Date.now()
    const totalHours = (endTime - workEntry.startTime) / (1000 * 60 * 60)

    await ctx.db.patch(workEntry._id, {
      endTime,
      totalHours,
      updatedAt: Date.now(),
    })

    return workEntry._id
  },
})

export const getWorkingHoursByEmployee = query({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workingHours")
      .withIndex("by_employeeId", (q) => q.eq("employeeId", args.employeeId))
      .order("desc")
      .collect()
  },
})

export const getTodayWorkingHours = query({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const { employeeId } = args
    const today = new Date().toISOString().split("T")[0]

    return await ctx.db
      .query("workingHours")
      .withIndex("by_date", (q) => q.eq("date", today).eq("employeeId", employeeId))
      .first()
  },
})
