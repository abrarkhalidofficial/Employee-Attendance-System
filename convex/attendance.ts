import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { todayISO, getCurrentPakistanTime, getPakistanTime } from "./utils";

// Get shift settings (defaulting if not set)
const getShiftSettings = async (ctx: any) => {
  const shift = await ctx.db
    .query("shiftSettings")
    .filter((q: any) => q.eq(q.field("isDefault"), true))
    .first();

  return (
    shift || {
      startTime: "09:00",
      endTime: "18:00",
      gracePeriod: 15,
      halfDayHours: 4,
      fullDayHours: 8,
    }
  );
};

// Calculate if late and by how much
const calculateLateArrival = (
  checkInTime: string,
  shiftStart: string,
  gracePeriod: number
) => {
  const [checkInHour, checkInMin] = checkInTime.split(":").map(Number);
  const [shiftHour, shiftMin] = shiftStart.split(":").map(Number);

  const checkInMinutes = checkInHour * 60 + checkInMin;
  const shiftMinutes = shiftHour * 60 + shiftMin;
  const graceMinutes = shiftMinutes + gracePeriod;

  if (checkInMinutes > graceMinutes) {
    return {
      isLate: true,
      lateBy: checkInMinutes - shiftMinutes,
    };
  }

  return { isLate: false, lateBy: 0 };
};

// Calculate if early departure
const calculateEarlyDeparture = (checkOutTime: string, shiftEnd: string) => {
  const [checkOutHour, checkOutMin] = checkOutTime.split(":").map(Number);
  const [shiftHour, shiftMin] = shiftEnd.split(":").map(Number);

  const checkOutMinutes = checkOutHour * 60 + checkOutMin;
  const shiftMinutes = shiftHour * 60 + shiftMin;

  if (checkOutMinutes < shiftMinutes - 15) {
    // 15 min grace for early departure
    return {
      isEarlyDeparture: true,
      earlyBy: shiftMinutes - checkOutMinutes,
    };
  }

  return { isEarlyDeparture: false, earlyBy: 0 };
};

// Check in
export const checkIn = mutation({
  args: {
    employeeId: v.id("users"),
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        address: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const date = todayISO();
    const time = getCurrentPakistanTime();

    // Check if already checked in today
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", date)
      )
      .first();

    if (existing && existing.checkIn) {
      throw new ConvexError("Already checked in today");
    }

    const shift = await getShiftSettings(ctx);
    const lateInfo = calculateLateArrival(
      time,
      shift.startTime,
      shift.gracePeriod
    );

    const now = Date.now();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        checkIn: time,
        isLate: lateInfo.isLate,
        lateBy: lateInfo.lateBy,
        status: lateInfo.isLate ? "late" : "present",
        location: args.location,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new attendance record
      return await ctx.db.insert("attendance", {
        employeeId: args.employeeId,
        date,
        checkIn: time,
        checkOut: undefined,
        status: lateInfo.isLate ? "late" : "present",
        isLate: lateInfo.isLate,
        lateBy: lateInfo.lateBy,
        isEarlyDeparture: false,
        earlyBy: undefined,
        breakTime: 0,
        totalHours: 0,
        overtimeHours: undefined,
        location: args.location,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Check out
export const checkOut = mutation({
  args: {
    employeeId: v.id("users"),
    breakTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const date = todayISO();
    const time = getCurrentPakistanTime();

    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", date)
      )
      .first();

    if (!attendance) {
      throw new ConvexError("No check-in record found for today");
    }

    if (attendance.checkOut) {
      throw new ConvexError("Already checked out today");
    }

    if (!attendance.checkIn) {
      throw new ConvexError("Cannot check out without checking in first");
    }

    const shift = await getShiftSettings(ctx);
    const earlyInfo = calculateEarlyDeparture(time, shift.endTime);

    // Calculate total hours
    const [checkInHour, checkInMin] = attendance.checkIn.split(":").map(Number);
    const [checkOutHour, checkOutMin] = time.split(":").map(Number);

    const checkInMinutes = checkInHour * 60 + checkInMin;
    const checkOutMinutes = checkOutHour * 60 + checkOutMin;
    const workedMinutes = checkOutMinutes - checkInMinutes;
    const breakMinutes = args.breakTime || attendance.breakTime || 0;
    const netMinutes = workedMinutes - breakMinutes;
    const totalHours = netMinutes / 60;

    // Calculate overtime
    const overtimeHours =
      totalHours > shift.fullDayHours ? totalHours - shift.fullDayHours : 0;

    // Determine status
    let status = attendance.status;
    if (totalHours < shift.halfDayHours) {
      status = "half-day";
    } else if (
      totalHours >= shift.halfDayHours &&
      totalHours < shift.fullDayHours
    ) {
      status = attendance.isLate ? "late" : "present";
    } else {
      status = "present";
    }

    await ctx.db.patch(attendance._id, {
      checkOut: time,
      breakTime: breakMinutes,
      totalHours,
      overtimeHours: overtimeHours > 0 ? overtimeHours : undefined,
      isEarlyDeparture: earlyInfo.isEarlyDeparture,
      earlyBy: earlyInfo.earlyBy,
      status,
      updatedAt: Date.now(),
    });

    return attendance._id;
  },
});

// Get today's attendance
export const getTodayAttendance = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    const date = todayISO();
    return await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", date)
      )
      .first();
  },
});

// Get attendance history
export const getAttendanceHistory = query({
  args: {
    employeeId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 30;
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    return records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },
});

// Get monthly attendance report
export const getMonthlyReport = query({
  args: {
    employeeId: v.id("users"),
    month: v.string(), // Format: "2025-01"
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    const monthRecords = records.filter((r) => r.date.startsWith(args.month));

    const stats = {
      totalDays: monthRecords.length,
      presentDays: monthRecords.filter((r) => r.status === "present").length,
      lateDays: monthRecords.filter((r) => r.isLate).length,
      halfDays: monthRecords.filter((r) => r.status === "half-day").length,
      absentDays: monthRecords.filter((r) => r.status === "absent").length,
      totalHours: monthRecords.reduce((sum, r) => sum + r.totalHours, 0),
      totalOvertimeHours: monthRecords.reduce(
        (sum, r) => sum + (r.overtimeHours || 0),
        0
      ),
      avgHoursPerDay:
        monthRecords.length > 0
          ? monthRecords.reduce((sum, r) => sum + r.totalHours, 0) /
            monthRecords.length
          : 0,
    };

    return { records: monthRecords, stats };
  },
});

// Get all attendance (admin)
export const getAllAttendance = query({
  args: {
    date: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let records;

    if (args.date && args.date !== "") {
      records = await ctx.db
        .query("attendance")
        .withIndex("by_date", (q) => q.eq("date", args.date!))
        .collect();
    } else {
      records = await ctx.db.query("attendance").collect();
    }
    let filtered = records;
    if (args.status) {
      filtered = records.filter((r) => r.status === args.status);
    }

    const sorted = filtered.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      return sorted.slice(0, args.limit);
    }

    return sorted;
  },
});

// Mark absent (admin)
export const markAbsent = mutation({
  args: {
    employeeId: v.id("users"),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", args.date)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "absent",
        notes: args.notes,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("attendance", {
        employeeId: args.employeeId,
        date: args.date,
        checkIn: undefined,
        checkOut: undefined,
        status: "absent",
        isLate: false,
        lateBy: undefined,
        isEarlyDeparture: false,
        earlyBy: undefined,
        breakTime: 0,
        totalHours: 0,
        overtimeHours: undefined,
        notes: args.notes,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Update break time
export const updateBreakTime = mutation({
  args: {
    employeeId: v.id("users"),
    breakTime: v.number(),
  },
  handler: async (ctx, args) => {
    const date = todayISO();
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_employee_and_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", date)
      )
      .first();

    if (!attendance) {
      throw new ConvexError("No attendance record found for today");
    }

    await ctx.db.patch(attendance._id, {
      breakTime: args.breakTime,
      updatedAt: Date.now(),
    });
  },
});
