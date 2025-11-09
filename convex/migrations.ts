import { mutation, query } from "./_generated/server";
import { hashPassword } from "./utils";
import { v } from "convex/values";

/**
 * Debug mutation to check password hashes
 */
export const debugPasswordHash = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return { error: "User not found" };
    }

    const newHash = await hashPassword(args.password);

    return {
      email: user.email,
      role: user.role,
      storedHash: user.passwordHash,
      computedHash: newHash,
      match: user.passwordHash === newHash,
    };
  },
});

/**
 * Migration to update password hashes from old Node.js crypto to Web Crypto API
 * This resets all users to default passwords:
 * - Admin: "12345678"
 * - Employees: "password123"
 */
export const migratePasswordHashes = mutation({
  handler: async (ctx) => {
    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    const adminPasswordHash = await hashPassword("12345678");
    const employeePasswordHash = await hashPassword("password123");

    let updatedCount = 0;

    for (const user of allUsers) {
      const newPasswordHash =
        user.role === "admin" ? adminPasswordHash : employeePasswordHash;

      // Only update if the hash is different
      if (user.passwordHash !== newPasswordHash) {
        await ctx.db.patch(user._id, {
          passwordHash: newPasswordHash,
        });
        updatedCount++;
      }
    }

    return `Migration complete. Updated ${updatedCount} user(s).`;
  },
});

/**
 * Clear all data from the database (use with caution!)
 */
export const clearDatabase = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const timeLogs = await ctx.db.query("timeLogs").collect();
    const workLogs = await ctx.db.query("workLogs").collect();
    const leaveRequests = await ctx.db.query("leaveRequests").collect();

    await Promise.all([
      ...users.map((u) => ctx.db.delete(u._id)),
      ...timeLogs.map((t) => ctx.db.delete(t._id)),
      ...workLogs.map((w) => ctx.db.delete(w._id)),
      ...leaveRequests.map((l) => ctx.db.delete(l._id)),
    ]);

    return "Database cleared successfully. You can now run the seed mutation.";
  },
});
