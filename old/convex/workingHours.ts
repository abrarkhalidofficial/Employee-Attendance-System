import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get today's working hours for an employee
export const getTodayWorkingHours = query({
  args: {
    employeeId: v.optional(v.id("employees")),
  },
  handler: async (ctx, args) => {
    if (!args.employeeId) {
      return null;
    }

    const employeeId = args.employeeId;

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Find attendance entry for today
    const attendanceEntry = await ctx.db
      .query("attendanceEntries")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", employeeId).eq("date", dateStr)
      )
      .first();

    if (!attendanceEntry) {
      return null;
    }

    // Calculate total hours if both clock in and clock out exist
    let totalHours = null;
    if (attendanceEntry.clockInAt && attendanceEntry.clockOutAt) {
      const diffMs = attendanceEntry.clockOutAt - attendanceEntry.clockInAt;
      totalHours = diffMs / (1000 * 60 * 60); // Convert to hours
    }

    return {
      _id: attendanceEntry._id,
      date: attendanceEntry.date,
      startTime: attendanceEntry.clockInAt,
      endTime: attendanceEntry.clockOutAt,
      totalHours,
      notes: attendanceEntry.notes,
    };
  },
});

// Start work day (clock in)
export const startWorkDay = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const { employeeId } = args;

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const now = Date.now();

    // Check if there's already an entry for today
    const existingEntry = await ctx.db
      .query("attendanceEntries")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", employeeId).eq("date", dateStr)
      )
      .first();

    if (existingEntry) {
      // If already clocked in, don't allow starting again
      if (existingEntry.clockInAt && !existingEntry.clockOutAt) {
        throw new Error("You have already started your work day.");
      }
      // If there's a completed entry, throw error
      if (existingEntry.clockOutAt) {
        throw new Error("You have already completed your work day for today.");
      }
      // Update existing entry with clock in time
      await ctx.db.patch(existingEntry._id, {
        clockInAt: now,
        updatedAt: now,
      });
      return existingEntry._id;
    }

    // Create new attendance entry
    const entryId = await ctx.db.insert("attendanceEntries", {
      employeeId,
      date: dateStr,
      clockInAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create attendance event
    await ctx.db.insert("attendanceEvents", {
      employeeId,
      eventType: "CLOCK_IN",
      occurredAt: now,
      source: "WEB",
      createdBy: (await ctx.db
        .query("employees")
        .filter((q) => q.eq(q.field("_id"), employeeId))
        .first())!.userId,
      createdAt: now,
    });

    return entryId;
  },
});

// End work day (clock out)
export const endWorkDay = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const { employeeId } = args;

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const now = Date.now();

    // Find today's attendance entry
    const entry = await ctx.db
      .query("attendanceEntries")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", employeeId).eq("date", dateStr)
      )
      .first();

    if (!entry) {
      throw new Error(
        "No work session found. Please start your work day first."
      );
    }

    if (!entry.clockInAt) {
      throw new Error("Cannot end work day without starting it first.");
    }

    if (entry.clockOutAt) {
      throw new Error("You have already ended your work day.");
    }

    // Calculate worked seconds
    const workedSeconds = Math.floor((now - entry.clockInAt) / 1000);

    // Update entry with clock out time
    await ctx.db.patch(entry._id, {
      clockOutAt: now,
      workedSeconds,
      updatedAt: now,
    });

    // Create attendance event
    const employee = await ctx.db.get(employeeId);
    await ctx.db.insert("attendanceEvents", {
      employeeId,
      eventType: "CLOCK_OUT",
      occurredAt: now,
      source: "WEB",
      createdBy: employee!.userId,
      createdAt: now,
    });

    return entry._id;
  },
});

// Get weekly working hours summary
export const getWeeklySummary = query({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const { employeeId } = args;

    // Get current week start (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    // Get all attendance entries for this week
    const allEntries = await ctx.db
      .query("attendanceEntries")
      .filter((q) => q.eq(q.field("employeeId"), employeeId))
      .collect();

    // Filter for this week
    const weekEntries = allEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= monday;
    });

    // Calculate totals
    let totalSeconds = 0;
    let daysWorked = 0;

    for (const entry of weekEntries) {
      if (entry.workedSeconds) {
        totalSeconds += entry.workedSeconds;
        daysWorked++;
      }
    }

    const totalHours = totalSeconds / 3600;

    return {
      totalHours: totalHours.toFixed(2),
      daysWorked,
      entries: weekEntries,
    };
  },
});
