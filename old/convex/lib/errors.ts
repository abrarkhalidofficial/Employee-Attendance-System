import { ConvexError } from "convex/values";

export type ErrorPayload = {
  code:
    | "AUTH_INVALID_CREDENTIALS"
    | "AUTH_ACCOUNT_DISABLED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "ATTENDANCE_CONFLICT"
    | "STATUS_SESSION_OPEN_EXISTS"
    | "VALIDATION_ERROR"
    | "LEAVE_OVERLAP";
  message: string;
  details?: Record<string, string | number | boolean | null>;
};

export function throwError(payload: ErrorPayload): never {
  throw new ConvexError(payload);
}

export function assert(
  condition: unknown,
  payload: ErrorPayload
): asserts condition {
  if (!condition) {
    throwError(payload);
  }
}
