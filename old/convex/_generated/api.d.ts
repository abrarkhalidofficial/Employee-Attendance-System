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
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as authSimple from "../authSimple.js";
import type * as employees from "../employees.js";
import type * as http from "../http.js";
import type * as leaves from "../leaves.js";
import type * as lib_attendance from "../lib/attendance.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_rbac from "../lib/rbac.js";
import type * as lib_time from "../lib/time.js";
import type * as status from "../status.js";
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
  attendance: typeof attendance;
  auth: typeof auth;
  authSimple: typeof authSimple;
  employees: typeof employees;
  http: typeof http;
  leaves: typeof leaves;
  "lib/attendance": typeof lib_attendance;
  "lib/audit": typeof lib_audit;
  "lib/errors": typeof lib_errors;
  "lib/rbac": typeof lib_rbac;
  "lib/time": typeof lib_time;
  status: typeof status;
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
