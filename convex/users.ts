import { query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal query to check if user exists
export const checkUserExists = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user !== null;
  },
});

// Internal mutation to create user
export const createUser = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("employee")),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role,
      password: args.password,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return userId;
  },
});

// Internal query to get user by email
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    // This should be called with proper authentication context
    // For now, returning null as placeholder
    return null;
  },
});
