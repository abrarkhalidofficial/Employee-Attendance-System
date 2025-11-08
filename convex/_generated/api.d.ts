/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLog from "../activityLog.js";
import type * as auth from "../auth.js";
import type * as employees from "../employees.js";
import type * as http from "../http.js";
import type * as leaves from "../leaves.js";
import type * as statusHistory from "../statusHistory.js";
import type * as users from "../users.js";
import type * as workingHours from "../workingHours.js";

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
  activityLog: typeof activityLog;
  auth: typeof auth;
  employees: typeof employees;
  http: typeof http;
  leaves: typeof leaves;
  statusHistory: typeof statusHistory;
  users: typeof users;
  workingHours: typeof workingHours;
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
