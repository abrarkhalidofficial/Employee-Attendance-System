import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { hashPassword, todayISO } from "./utils";

export const listEmployees = query({
  handler: async (ctx) => {
    const employees = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "employee"))
      .collect();

    return employees.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});

export const stats = query({
  handler: async (ctx) => {
    const employees = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "employee"))
      .collect();

    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "active").length,
      admins: admins.length,
    };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("employee")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user || user.role !== args.role) {
      throw new ConvexError("Invalid credentials");
    }

    const hashedPassword = await hashPassword(args.password);
    if (user.passwordHash !== hashedPassword) {
      throw new ConvexError("Invalid credentials");
    }

    return user;
  },
});

export const createEmployee = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    department: v.string(),
    position: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new ConvexError("Email already exists");
    }

    const now = Date.now();
    const hashedPassword = await hashPassword(args.password);
    const newUserId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      department: args.department,
      position: args.position,
      joinDate: todayISO(),
      role: "employee",
      status: "active",
      passwordHash: hashedPassword,
      createdAt: now,
    });

    return ctx.db.get(newUserId);
  },
});

export const createAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    department: v.string(),
    position: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new ConvexError("Email already exists");
    }

    const now = Date.now();
    const hashedPassword = await hashPassword(args.password);
    const newUserId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      department: args.department,
      position: args.position,
      joinDate: todayISO(),
      role: "admin",
      status: "active",
      passwordHash: hashedPassword,
      createdAt: now,
    });

    return ctx.db.get(newUserId);
  },
});
