import { query } from "./_generated/server"

export const getActivityLogs = query({
  handler: async (ctx) => {
    const logs = await ctx.db
      .query("activityLog")
      .withIndex("by_timestamp", (q) => q)
      .order("desc")
      .take(100)

    return logs
  },
})
