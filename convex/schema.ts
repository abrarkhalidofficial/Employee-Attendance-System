import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("employee")),
    password: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  employees: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    department: v.string(),
    position: v.string(),
    joinDate: v.number(),
    status: v.union(v.literal("active"), v.literal("inactive")),
    currentStatus: v.union(v.literal("working"), v.literal("break"), v.literal("task"), v.literal("offline")),
    statusReason: v.optional(v.string()),
    expectedReturnTime: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  workingHours: defineTable({
    employeeId: v.id("employees"),
    date: v.string(), // YYYY-MM-DD
    startTime: v.number(), // timestamp
    endTime: v.optional(v.number()),
    breakDuration: v.optional(v.number()),
    totalHours: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_employeeId", ["employeeId"])
    .index("by_date", ["date"]),

  leaves: defineTable({
    employeeId: v.id("employees"),
    startDate: v.number(),
    endDate: v.number(),
    type: v.union(v.literal("sick"), v.literal("casual"), v.literal("personal"), v.literal("other")),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    approvedBy: v.optional(v.id("users")),
    comments: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_employeeId", ["employeeId"])
    .index("by_status", ["status"]),

  statusHistory: defineTable({
    employeeId: v.id("employees"),
    status: v.union(v.literal("working"), v.literal("break"), v.literal("task"), v.literal("offline")),
    reason: v.optional(v.string()),
    expectedReturnTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_employeeId", ["employeeId"])
    .index("by_createdAt", ["createdAt"]),

  activityLog: defineTable({
    userId: v.id("users"),
    action: v.string(),
    entityType: v.string(), // "employee", "leave", "working_hours"
    entityId: v.string(),
    changes: v.object({
      before: v.optional(v.any()),
      after: v.optional(v.any()),
    }),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  tasks: defineTable({
    employeeId: v.id("employees"),
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_employeeId", ["employeeId"]),
})
