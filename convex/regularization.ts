import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Create regularization request
export const createRequest = mutation({
  args: {
    employeeId: v.id("users"),
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
  },
  handler: async (ctx, args) => {
    // Validate reason is not empty
    if (!args.reason || args.reason.trim().length === 0) {
      throw new ConvexError("Reason is required");
    }

    // Check if there's already a pending request for this date
    const existingRequest = await ctx.db
      .query("attendanceRegularization")
      .filter((q) =>
        q.and(
          q.eq(q.field("employeeId"), args.employeeId),
          q.eq(q.field("date"), args.date),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (existingRequest) {
      throw new ConvexError("You already have a pending request for this date");
    }

    const now = Date.now();

    // Find or create attendance record for this date
    let attendanceRecord = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", args.date)
      )
      .first();

    let attendanceId;
    if (!attendanceRecord) {
      // Create a placeholder attendance record
      attendanceId = await ctx.db.insert("attendance", {
        employeeId: args.employeeId,
        date: args.date,
        checkIn: undefined,
        checkOut: undefined,
        status: "absent",
        isLate: false,
        isEarlyDeparture: false,
        breakTime: 0,
        totalHours: 0,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      attendanceId = attendanceRecord._id;
    }

    return await ctx.db.insert("attendanceRegularization", {
      employeeId: args.employeeId,
      attendanceId,
      date: args.date,
      requestType: args.requestType,
      requestedCheckIn: args.requestedCheckIn,
      requestedCheckOut: args.requestedCheckOut,
      reason: args.reason,
      status: "pending",
      reviewedBy: undefined,
      reviewedAt: undefined,
      reviewNotes: undefined,
      createdAt: now,
    });
  },
});

// Approve regularization request
export const approveRequest = mutation({
  args: {
    requestId: v.id("attendanceRegularization"),
    reviewerId: v.id("users"), // Admin who is approving
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new ConvexError("Request not found");
    }

    if (request.status !== "pending") {
      throw new ConvexError("Request has already been processed");
    }

    // Update regularization request
    await ctx.db.patch(args.requestId, {
      status: "approved",
      reviewedBy: args.reviewerId,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
    });

    // Update or create attendance record
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q) =>
        q.eq("employeeId", request.employeeId).eq("date", request.date)
      )
      .first();

    const now = Date.now();

    if (attendance) {
      // Update existing attendance
      const updates: any = { updatedAt: now };

      if (request.requestedCheckIn) {
        updates.checkIn = request.requestedCheckIn;
      }
      if (request.requestedCheckOut) {
        updates.checkOut = request.requestedCheckOut;
      }

      // Recalculate total hours if both times are present
      if (updates.checkIn || updates.checkOut) {
        const checkIn = updates.checkIn || attendance.checkIn;
        const checkOut = updates.checkOut || attendance.checkOut;

        if (checkIn && checkOut) {
          const [checkInHour, checkInMin] = checkIn.split(":").map(Number);
          const [checkOutHour, checkOutMin] = checkOut.split(":").map(Number);

          const checkInMinutes = checkInHour * 60 + checkInMin;
          const checkOutMinutes = checkOutHour * 60 + checkOutMin;
          const workedMinutes = checkOutMinutes - checkInMinutes;
          const breakMinutes = attendance.breakTime || 0;
          const netMinutes = workedMinutes - breakMinutes;
          updates.totalHours = netMinutes / 60;
        }
      }

      // Update status if it was absent
      if (
        attendance.status === "absent" &&
        (updates.checkIn || updates.checkOut)
      ) {
        updates.status = "present";
      }

      await ctx.db.patch(attendance._id, updates);
    } else {
      // Create new attendance record
      await ctx.db.insert("attendance", {
        employeeId: request.employeeId,
        date: request.date,
        checkIn: request.requestedCheckIn,
        checkOut: request.requestedCheckOut,
        status: "present",
        isLate: false,
        lateBy: undefined,
        isEarlyDeparture: false,
        earlyBy: undefined,
        breakTime: 0,
        totalHours: 0,
        overtimeHours: undefined,
        notes: "Regularized",
        createdAt: now,
        updatedAt: now,
      });
    }

    return args.requestId;
  },
});

// Reject regularization request
export const rejectRequest = mutation({
  args: {
    requestId: v.id("attendanceRegularization"),
    reviewerId: v.id("users"), // Admin who is rejecting
    reviewNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new ConvexError("Request not found");
    }

    if (request.status !== "pending") {
      throw new ConvexError("Request has already been processed");
    }

    if (!args.reviewNotes || args.reviewNotes.trim().length === 0) {
      throw new ConvexError("Review notes are required for rejection");
    }

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      reviewedBy: args.reviewerId,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
    });

    return args.requestId;
  },
});

// Get pending requests (admin)
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db
      .query("attendanceRegularization")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Fetch employee details for each request
    const requestsWithEmployees = await Promise.all(
      requests.map(async (request) => {
        const employee = await ctx.db.get(request.employeeId);
        return {
          ...request,
          employee: employee
            ? {
                name: employee.name,
                email: employee.email,
                department: employee.department,
              }
            : null,
        };
      })
    );

    return requestsWithEmployees.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get all requests (admin)
export const listAll = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("attendanceRegularization");

    const requests = await query.collect();

    let filtered = requests;
    if (args.status && args.status !== "all") {
      filtered = requests.filter((r) => r.status === args.status);
    }

    // Fetch employee details
    const requestsWithEmployees = await Promise.all(
      filtered.map(async (request) => {
        const employee = await ctx.db.get(request.employeeId);
        const reviewer = request.reviewedBy
          ? await ctx.db.get(request.reviewedBy)
          : null;

        return {
          ...request,
          employee: employee
            ? {
                name: employee.name,
                email: employee.email,
                department: employee.department,
              }
            : null,
          reviewer: reviewer
            ? {
                name: reviewer.name,
                email: reviewer.email,
              }
            : null,
        };
      })
    );

    const sorted = requestsWithEmployees.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    if (args.limit) {
      return sorted.slice(0, args.limit);
    }

    return sorted;
  },
});

// Get requests by employee
export const listByEmployee = query({
  args: {
    employeeId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("attendanceRegularization")
      .filter((q) => q.eq(q.field("employeeId"), args.employeeId))
      .collect();

    // Fetch reviewer details
    const requestsWithReviewers = await Promise.all(
      requests.map(async (request) => {
        const reviewer = request.reviewedBy
          ? await ctx.db.get(request.reviewedBy)
          : null;

        return {
          ...request,
          reviewer: reviewer
            ? {
                name: reviewer.name,
                email: reviewer.email,
              }
            : null,
        };
      })
    );

    const sorted = requestsWithReviewers.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    if (args.limit) {
      return sorted.slice(0, args.limit);
    }

    return sorted;
  },
});

// Get request by ID
export const getRequestById = query({
  args: { requestId: v.id("attendanceRegularization") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new ConvexError("Request not found");
    }

    const employee = await ctx.db.get(request.employeeId);
    const reviewer = request.reviewedBy
      ? await ctx.db.get(request.reviewedBy)
      : null;

    return {
      ...request,
      employee: employee
        ? {
            name: employee.name,
            email: employee.email,
            department: employee.department,
          }
        : null,
      reviewer: reviewer
        ? {
            name: reviewer.name,
            email: reviewer.email,
          }
        : null,
    };
  },
});
