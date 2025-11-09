import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    role: v.union(v.literal("EMPLOYEE"), v.literal("ADMIN")),
    isActive: v.boolean(),
    displayName: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),

  employees: defineTable({
    userId: v.id("users"),
    employeeCode: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    departmentId: v.optional(v.id("departments")),
    managerId: v.optional(v.id("employees")),
    timezone: v.string(),
    hireDate: v.string(), // YYYY-MM-DD
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_department", ["departmentId"])
    .index("by_manager", ["managerId"])
    .index("by_active", ["isActive"]),

  departments: defineTable({
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  attendanceEntries: defineTable({
    employeeId: v.id("employees"),
    date: v.string(), // YYYY-MM-DD
    clockInAt: v.optional(v.number()),
    clockOutAt: v.optional(v.number()),
    workedSeconds: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_employee_date", ["employeeId", "date"]),

  attendanceEvents: defineTable({
    employeeId: v.id("employees"),
    eventType: v.union(v.literal("CLOCK_IN"), v.literal("CLOCK_OUT")),
    occurredAt: v.number(),
    source: v.union(
      v.literal("WEB"),
      v.literal("ADMIN_OVERRIDE"),
      v.literal("IMPORT")
    ),
    createdBy: v.id("users"),
    meta: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_emp_time", ["employeeId", "occurredAt"]),

  statusSessions: defineTable({
    employeeId: v.id("employees"),
    statusType: v.union(v.literal("BREAK"), v.literal("TASK")),
    reason: v.string(),
    expectedReturnAt: v.optional(v.number()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    createdBy: v.id("users"),
    closedBy: v.optional(v.id("users")),
    meta: v.optional(v.any()),
  })
    .index("by_emp_started", ["employeeId", "startedAt"])
    .index("by_started", ["startedAt"]),

  leaveRequests: defineTable({
    employeeId: v.id("employees"),
    leaveTypeId: v.id("leaveTypes"),
    status: v.union(
      v.literal("PENDING"),
      v.literal("APPROVED"),
      v.literal("REJECTED"),
      v.literal("CANCELLED")
    ),
    startDate: v.string(),
    endDate: v.string(),
    days: v.number(),
    reason: v.optional(v.string()),
    requestedAt: v.number(),
    decidedAt: v.optional(v.number()),
    decidedBy: v.optional(v.id("users")),
    meta: v.optional(v.any()),
  })
    .index("by_emp_dates", ["employeeId", "startDate"])
    .index("by_status", ["status"]),

  leaveTypes: defineTable({
    code: v.string(),
    name: v.string(),
    requiresApproval: v.boolean(),
    allowHalfDay: v.boolean(),
    annualQuotaDays: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_code", ["code"]),

  holidays: defineTable({
    date: v.string(),
    name: v.string(),
    region: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_region", ["region"]),

  activityLog: defineTable({
    actorUserId: v.id("users"),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    action: v.union(
      v.literal("CREATE"),
      v.literal("UPDATE"),
      v.literal("DELETE"),
      v.literal("RENAME"),
      v.literal("STATUS_CHANGE")
    ),
    before: v.optional(v.any()),
    after: v.optional(v.any()),
    occurredAt: v.number(),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_time", ["occurredAt"])
    .index("by_entity", ["entityType"])
    .index("by_actor_time", ["actorUserId", "occurredAt"]),

  reports: defineTable({
    type: v.union(
      v.literal("ATTENDANCE"),
      v.literal("LEAVE"),
      v.literal("PRODUCTIVITY")
    ),
    params: v.optional(v.any()),
    status: v.union(
      v.literal("QUEUED"),
      v.literal("RUNNING"),
      v.literal("DONE"),
      v.literal("FAILED")
    ),
    fileUrl: v.optional(v.string()),
    requestedBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    error: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_requester", ["requestedBy"]),
});
