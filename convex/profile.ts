import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Get employee profile
export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Don't return password hash
    const { passwordHash, ...profile } = user;
    return profile;
  },
});

// Update employee profile (self)
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(userId, updates);
    return userId;
  },
});

// Update profile picture
export const updateProfilePicture = mutation({
  args: {
    userId: v.id("users"),
    profilePicture: v.string(), // URL to uploaded image
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(args.userId, {
      profilePicture: args.profilePicture,
    });

    return args.userId;
  },
});

// Change password
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Verify current password (in production, use proper password hashing like bcrypt)
    if (user.passwordHash !== args.currentPassword) {
      throw new ConvexError("Current password is incorrect");
    }

    // Validate new password
    if (args.newPassword.length < 6) {
      throw new ConvexError("New password must be at least 6 characters");
    }

    // Update password (in production, hash this with bcrypt)
    await ctx.db.patch(args.userId, {
      passwordHash: args.newPassword,
    });
    return { success: true };
  },
});

// Update employee profile (admin only)
export const updateEmployeeProfile = mutation({
  args: {
    employeeId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    department: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { employeeId, ...updates } = args;

    const employee = await ctx.db.get(employeeId);
    if (!employee) {
      throw new ConvexError("Employee not found");
    }

    // Check if email is being updated and if it's already taken
    if (updates.email && updates.email !== employee.email) {
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), updates.email))
        .first();

      if (existingUser) {
        throw new ConvexError("Email already in use");
      }
    }

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(employeeId, cleanUpdates);
    return employeeId;
  },
});

// Get all employees (admin)
export const getAllEmployees = query({
  args: {
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "employee"));

    const employees = await query.collect();

    let filtered = employees;
    if (args.department && args.department !== "all") {
      filtered = employees.filter((e) => e.department === args.department);
    }

    // Remove password hashes from response
    return filtered.map(({ passwordHash, ...employee }) => employee);
  },
});

// Get employee by ID (admin)
export const getEmployeeById = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);

    if (!employee) {
      throw new ConvexError("Employee not found");
    }

    if (employee.role !== "employee") {
      throw new ConvexError("User is not an employee");
    }

    const { passwordHash, ...profile } = employee;
    return profile;
  },
});

// Reset employee password (admin only)
export const resetEmployeePassword = mutation({
  args: {
    employeeId: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);

    if (!employee) {
      throw new ConvexError("Employee not found");
    }

    if (args.newPassword.length < 6) {
      throw new ConvexError("Password must be at least 6 characters");
    }

    // Update password (in production, hash this with bcrypt)
    await ctx.db.patch(args.employeeId, {
      passwordHash: args.newPassword,
    });

    return { success: true };
  },
});
