import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RENAME"
  | "STATUS_CHANGE";

type AuditPayload = {
  actorUserId: Id<"users">;
  entityType: string;
  entityId?: string | Id<any>;
  action: AuditAction;
  before?: unknown;
  after?: unknown;
  meta?: Record<string, unknown>;
};

export async function recordAudit(
  ctx: MutationCtx,
  payload: AuditPayload,
): Promise<void> {
  const { actorUserId, entityType, entityId, action, before, after, meta } =
    payload;

  await ctx.db.insert("activityLog", {
    actorUserId,
    entityType,
    entityId: entityId ? entityId.toString() : undefined,
    action,
    before,
    after,
    occurredAt: Date.now(),
    ...meta,
  });
}
