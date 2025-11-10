import type { Doc, Id } from "@/convex/_generated/dataModel";

export type UserDoc = Doc<"users">;
export type EmployeeDoc = UserDoc;
export type AdminDoc = UserDoc;
export type TimeLogDoc = Doc<"timeLogs">;
export type LeaveRequestDoc = Doc<"leaveRequests">;
export type WorkLogDoc = Doc<"workLogs">;
export type TaskDoc = Doc<"tasks">;

export type UserId = Id<"users">;
export type WorkLogId = Id<"workLogs">;
export type LeaveRequestId = Id<"leaveRequests">;
export type TaskId = Id<"tasks">;

export type UserRole = UserDoc["role"];
export type TaskStatus = TaskDoc["status"];
export type TaskPriority = TaskDoc["priority"];
