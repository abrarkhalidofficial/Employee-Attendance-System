import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const signUpMutation = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("employee")),
  },
  handler: async (ctx, args) => {
    const { email, name, password, role } = args;
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    const normalizedRole = role === "admin" ? "ADMIN" : "EMPLOYEE";
    const userId = await ctx.db.insert("users", {
      email,
      displayName: name,
      role: normalizedRole,
      passwordHash: password, // Storing plain password (development only!)
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return userId;
  },
});

export const signInQuery = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const { email, password } = args;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("User not found. Please check your email or sign up.");
    }
    if (!user.isActive) {
      throw new Error("User account is disabled.");
    }
    // Compare plain password (development only!)
    if (user.passwordHash !== password) {
      throw new Error("Invalid password. Please try again.");
    }

    // Return user data with role (ADMIN/EMPLOYEE format from database)
    return {
      _id: user._id,
      email: user.email,
      name: user.displayName ?? "",
      role: user.role, // Returns "ADMIN" or "EMPLOYEE"
      isActive: user.isActive,
    };
  },
}); // Helper query to check what users exist (for debugging)
export const listUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      email: u.email,
      name: u.displayName,
      role: u.role,
      isActive: u.isActive,
      passwordHash: u.passwordHash?.substring(0, 10) ?? "",
    }));
  },
});

// Helper mutation to delete a user (for development/testing)
export const deleteUserByEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
      return { success: true, message: `User ${args.email} deleted` };
    }
    return { success: false, message: "User not found" };
  },
});

// Helper mutation to delete all users (for development/testing - USE CAREFULLY!)
export const deleteAllUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    return { success: true, message: `Deleted ${users.length} users` };
  },
});
