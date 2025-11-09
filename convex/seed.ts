import { mutation } from "./_generated/server";
import { hashPassword, todayISO } from "./utils";

const sampleEmployees = [
  {
    name: "Alex Johnson",
    email: "alex.johnson@company.com",
    department: "Engineering",
    position: "Senior Developer",
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    department: "Product",
    position: "Product Manager",
  },
  {
    name: "Michael Rodriguez",
    email: "michael.r@company.com",
    department: "Sales",
    position: "Sales Director",
  },
];

export const populate = mutation({
  handler: async (ctx) => {
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@gmail.com"))
      .unique();

    if (existingAdmin) {
      return "Seed skipped, data already present.";
    }

    const now = Date.now();
    const adminPasswordHash = await hashPassword("12345678");
    await ctx.db.insert("users", {
      name: "Administrator",
      email: "admin@gmail.com",
      department: "Operations",
      position: "System Admin",
      joinDate: todayISO(),
      role: "admin",
      status: "active",
      passwordHash: adminPasswordHash,
      createdAt: now,
    });

    const employeePasswordHash = await hashPassword("password123");
    const employeeIds = await Promise.all(
      sampleEmployees.map(async (employee, index) => {
        const id = await ctx.db.insert("users", {
          name: employee.name,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          joinDate: "2022-0" + (index + 3).toString() + "-15",
          role: "employee",
          status: "active",
          passwordHash: employeePasswordHash,
          createdAt: now + index + 1,
        });
        return id;
      })
    );

    for (const employeeId of employeeIds) {
      await ctx.db.insert("timeLogs", {
        employeeId,
        date: todayISO(),
        checkIn: "09:00",
        checkOut: "17:30",
        breakTime: 60,
        totalHours: 8.5,
        createdAt: Date.now(),
      });

      await ctx.db.insert("workLogs", {
        employeeId,
        date: todayISO(),
        taskDescription: "Initial work log entry",
        timeSpent: 120,
        createdAt: "10:00",
        insertedAt: Date.now(),
      });

      await ctx.db.insert("leaveRequests", {
        employeeId,
        type: "vacation",
        startDate: todayISO(),
        endDate: todayISO(),
        reason: "Sample seeded leave",
        status: "pending",
        requestDate: todayISO(),
        createdAt: Date.now(),
      });
    }

    return "Seed data inserted.";
  },
});
