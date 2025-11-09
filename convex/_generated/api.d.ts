/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as attendance from "../attendance.js";
import type * as leaveRequests from "../leaveRequests.js";
import type * as migrations from "../migrations.js";
import type * as profile from "../profile.js";
import type * as regularization from "../regularization.js";
import type * as seed from "../seed.js";
import type * as timeLogs from "../timeLogs.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as workLogs from "../workLogs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  attendance: typeof attendance;
  leaveRequests: typeof leaveRequests;
  migrations: typeof migrations;
  profile: typeof profile;
  regularization: typeof regularization;
  seed: typeof seed;
  timeLogs: typeof timeLogs;
  users: typeof users;
  utils: typeof utils;
  workLogs: typeof workLogs;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
