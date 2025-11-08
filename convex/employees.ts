import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createEmployee = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    department: v.string(),
    position: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, name, email, department, position } = args

    const employeeId = await ctx.db.insert("employees", {
      userId,
      name,
      email,
      department,
      position,
      joinDate: Date.now(),
      status: "active",
      currentStatus: "offline",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Log activity
    await ctx.db.insert("activityLog", {
      userId,
      action: "CREATE",
      entityType: "employee",
      entityId: employeeId,
      changes: {
        after: { name, email, department, position },
      },
      timestamp: Date.now(),
    })

    return employeeId
  },
})

export const getAllEmployees = query({
  handler: async (ctx) => {
    return await ctx.db.query("employees").collect()
  },
})

export const getEmployeeById = query({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.employeeId)
  },
})

export const updateEmployeeStatus = mutation({
  args: {
    employeeId: v.id("employees"),
    status: v.union(v.literal("working"), v.literal("break"), v.literal("task"), v.literal("offline")),
    reason: v.optional(v.string()),
    expectedReturnTime: v.optional(v.number()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { employeeId, status, reason, expectedReturnTime, userId } = args

    const employee = await ctx.db.get(employeeId)
    if (!employee) throw new Error("Employee not found")

    // Update employee status
    await ctx.db.patch(employeeId, {
      currentStatus: status,
      statusReason: reason,
      expectedReturnTime: expectedReturnTime,
      updatedAt: Date.now(),
    })

    // Log status history
    await ctx.db.insert("statusHistory", {
      employeeId,
      status,
      reason,
      expectedReturnTime,
      createdAt: Date.now(),
    })

    // Log activity
    await ctx.db.insert("activityLog", {
      userId,
      action: "UPDATE_STATUS",
      entityType: "employee",
      entityId: employeeId,
      changes: {
        before: { currentStatus: employee.currentStatus },
        after: { currentStatus: status, reason },
      },
      timestamp: Date.now(),
    })

    return employeeId
  },
})

export const deactivateEmployee = mutation({
  args: {
    employeeId: v.id("employees"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { employeeId, userId } = args

    const employee = await ctx.db.get(employeeId)
    if (!employee) throw new Error("Employee not found")

    await ctx.db.patch(employeeId, {
      status: "inactive",
      updatedAt: Date.now(),
    })

    await ctx.db.insert("activityLog", {
      userId,
      action: "DEACTIVATE",
      entityType: "employee",
      entityId: employeeId,
      changes: {
        before: { status: employee.status },
        after: { status: "inactive" },
      },
      timestamp: Date.now(),
    })

    return employeeId
  },
})
