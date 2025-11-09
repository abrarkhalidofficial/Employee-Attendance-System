import { ConvexError } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { throwError } from "./errors";

type AnyCtx = QueryCtx | MutationCtx;

export type Role = "ADMIN" | "EMPLOYEE";

type Viewer = {
  identity: {
    tokenIdentifier: string;
    subject: string;
    email?: string | null;
    name?: string | null;
  };
  user: Doc<"users">;
};

export async function getViewer(ctx: AnyCtx): Promise<Viewer | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .first();

  if (!user || !user.isActive) {
    return null;
  }

  return { identity, user };
}

export async function requireViewer(ctx: AnyCtx): Promise<Viewer> {
  const viewer = await getViewer(ctx);
  if (!viewer) {
    throwError({
      code: "AUTH_INVALID_CREDENTIALS",
      message: "You must be signed in to perform this action.",
    });
  }
  return viewer;
}

export async function requireRole(
  ctx: AnyCtx,
  allowedRoles: Role[],
): Promise<Viewer> {
  const viewer = await requireViewer(ctx);
  if (!allowedRoles.includes(viewer.user.role as Role)) {
    throwError({
      code: "FORBIDDEN",
      message: "You are not allowed to perform this action.",
    });
  }
  return viewer;
}

export async function getEmployeeForUser(
  ctx: AnyCtx,
  userId: Id<"users">,
): Promise<Doc<"employees"> | null> {
  return await ctx.db
    .query("employees")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

export async function requireEmployee(
  ctx: AnyCtx,
  user?: Doc<"users">,
): Promise<Doc<"employees">> {
  const baseUser = user ?? (await requireViewer(ctx)).user;
  const employee = await getEmployeeForUser(ctx, baseUser._id);
  if (!employee || !employee.isActive) {
    throwError({
      code: "AUTH_ACCOUNT_DISABLED",
      message: "Employee profile not found or inactive.",
    });
  }
  return employee;
}
