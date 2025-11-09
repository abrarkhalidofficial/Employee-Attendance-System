import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("employee")),
    department: v.optional(v.string()),
    position: v.optional(v.string()),
    joinDate: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    passwordHash: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
  timeLogs: defineTable({
    employeeId: v.id("users"),
    date: v.string(),
    checkIn: v.string(),
    checkOut: v.optional(v.string()),
    breakTime: v.number(),
    totalHours: v.number(),
    createdAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_date", ["date"]),
  workLogs: defineTable({
    employeeId: v.id("users"),
    date: v.string(),
    taskDescription: v.string(),
    timeSpent: v.number(),
    createdAt: v.string(),
    insertedAt: v.number(),
  }).index("by_employee", ["employeeId"]),
  leaveRequests: defineTable({
    employeeId: v.id("users"),
    type: v.union(v.literal("sick"), v.literal("vacation"), v.literal("personal"), v.literal("unpaid")),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    requestDate: v.string(),
    createdAt: v.number(),
  }).index("by_employee", ["employeeId"]),
})
