"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";
import { internal } from "./_generated/api";

// Action for sign up (uses Node.js crypto)
export const signUp = action({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("employee")),
  },
  handler: async (ctx, args) => {
    const { email, name, password, role } = args;

    // Check if user already exists
    const existingUser = await ctx.runQuery(internal.users.checkUserExists, {
      email,
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const userId = await ctx.runMutation(internal.users.createUser, {
      email,
      name,
      role,
      password: hashedPassword,
    });

    return userId;
  },
});

// Action for sign in (uses Node.js crypto)
export const signIn = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const { email, password } = args;

    const user = await ctx.runQuery(internal.users.getUserByEmail, { email });

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (user.password !== hashedPassword) {
      throw new Error("Invalid password");
    }

    return user;
  },
});
