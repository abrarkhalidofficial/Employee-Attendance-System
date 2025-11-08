import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to hash password (simple hash for development)
function simpleHash(password: string): string {
  // Simple consistent hash for development
  // In production, use proper password hashing with bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export const signUpMutation = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("employee")),
  },
  handler: async (ctx, args) => {
    const { email, name, password, role } = args;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = simpleHash(password);

    // Create user
    const userId = await ctx.db.insert("users", {
      email,
      name,
      role,
      password: hashedPassword,
      status: "active",
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

    const hashedPassword = simpleHash(password);

    // Log for debugging (remove in production)
    console.log("Stored hash:", user.password);
    console.log("Input hash:", hashedPassword);

    if (user.password !== hashedPassword) {
      throw new Error("Invalid password. Please try again.");
    }

    // Return user without password
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  },
});

// Helper query to check what users exist (for debugging)
export const listUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      // Show first 10 chars of password hash for debugging
      passwordHash: u.password.substring(0, 10) + "...",
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
