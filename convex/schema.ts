import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    // Extended profile fields
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_department", ["department"]),
  attendance: defineTable({
    employeeId: v.id("users"),
    date: v.string(),
    checkIn: v.optional(v.string()),
    checkOut: v.optional(v.string()),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("half-day"),
      v.literal("late"),
      v.literal("on-leave")
    ),
    isLate: v.boolean(),
    lateBy: v.optional(v.number()), // minutes
    isEarlyDeparture: v.boolean(),
    earlyBy: v.optional(v.number()), // minutes
    breakTime: v.number(),
    totalHours: v.number(),
    workingHours: v.optional(v.number()), // actual working time excluding breaks
    overtimeHours: v.optional(v.number()),
    // Break tracking
    isOnBreak: v.optional(v.boolean()),
    currentBreakStartTime: v.optional(v.string()),
    breakPeriods: v.optional(
      v.array(
        v.object({
          startTime: v.string(),
          endTime: v.optional(v.string()),
          duration: v.optional(v.number()), // minutes
          reason: v.optional(v.string()), // reason for break
        })
      )
    ),
    // Penalty tracking
    latePenalty: v.optional(v.number()), // penalty points for being late
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        address: v.optional(v.string()),
      })
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_date", ["date"])
    .index("by_employee_and_date", ["employeeId", "date"])
    .index("by_status", ["status"]),
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
    type: v.union(
      v.literal("sick"),
      v.literal("vacation"),
      v.literal("personal"),
      v.literal("unpaid")
    ),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    requestDate: v.string(),
    createdAt: v.number(),
  }).index("by_employee", ["employeeId"]),
  attendanceRegularization: defineTable({
    employeeId: v.id("users"),
    attendanceId: v.id("attendance"),
    date: v.string(),
    requestType: v.union(
      v.literal("missing-checkin"),
      v.literal("missing-checkout"),
      v.literal("wrong-time"),
      v.literal("forgot-checkin")
    ),
    requestedCheckIn: v.optional(v.string()),
    requestedCheckOut: v.optional(v.string()),
    reason: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"])
    .index("by_attendance", ["attendanceId"]),
  shiftSettings: defineTable({
    name: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    gracePeriod: v.number(), // minutes
    halfDayHours: v.number(),
    fullDayHours: v.number(),
    isDefault: v.boolean(),
    createdAt: v.number(),
  }),
  penalties: defineTable({
    employeeId: v.id("users"),
    attendanceId: v.id("attendance"),
    date: v.string(),
    type: v.union(
      v.literal("late-arrival"),
      v.literal("early-departure"),
      v.literal("absent"),
      v.literal("half-day")
    ),
    points: v.number(),
    description: v.string(),
    createdAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_date", ["date"])
    .index("by_attendance", ["attendanceId"]),
});
