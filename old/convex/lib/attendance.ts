import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { throwError } from "./errors";
import { getLocalDate, now } from "./time";

type AnyCtx = QueryCtx | MutationCtx;

export async function getEntryForDate(
  ctx: AnyCtx,
  employeeId: Id<"employees">,
  date: string,
) {
  return await ctx.db
    .query("attendanceEntries")
    .withIndex("by_employee_date", (q) =>
      q.eq("employeeId", employeeId).eq("date", date),
    )
    .first();
}

export async function ensureEntryForToday(
  ctx: MutationCtx,
  employee: Doc<"employees">,
) {
  const currentTs = now();
  const date = getLocalDate(currentTs, employee.timezone);
  let entry = await getEntryForDate(ctx, employee._id, date);
  if (!entry) {
    const entryId = await ctx.db.insert("attendanceEntries", {
      employeeId: employee._id,
      date,
      createdAt: currentTs,
      updatedAt: currentTs,
    });
    entry = (await ctx.db.get(entryId))!;
  }

  return { entry, date, timestamp: currentTs };
}

export async function assertClockedIn(entry?: Doc<"attendanceEntries"> | null) {
  if (!entry?.clockInAt || entry.clockOutAt) {
    throwError({
      code: "ATTENDANCE_CONFLICT",
      message: "No active clock-in session for this employee.",
    });
  }
}
