import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const max = Math.min(args.limit ?? 100, 500);
    return await ctx.db
      .query("activityLog")
      .withIndex("by_time", (q) => q)
      .order("desc")
      .take(max);
  },
});
