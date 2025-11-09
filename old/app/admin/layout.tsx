"use client";

import type { ReactNode } from "react";
import { ResponsiveSidebar } from "@/components/responsive-sidebar";
import { ProtectedRoute } from "@/components/protected-route";

const adminNav = (
  <nav className="p-6 space-y-4">
    <h2 className="text-lg font-bold text-sidebar-foreground">Admin Panel</h2>
    <ul className="space-y-2">
      <li>
        <a
          href="/admin/dashboard"
          className="block px-3 py-2 rounded hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition"
        >
          Dashboard
        </a>
      </li>
      <li>
        <a
          href="/admin/employees"
          className="block px-3 py-2 rounded hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition"
        >
          Employees
        </a>
      </li>
      <li>
        <a
          href="/admin/leaves"
          className="block px-3 py-2 rounded hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition"
        >
          Leave Requests
        </a>
      </li>
      <li>
        <a
          href="/admin/activity"
          className="block px-3 py-2 rounded hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition"
        >
          Activity Log
        </a>
      </li>
    </ul>
  </nav>
);

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <ResponsiveSidebar nav={adminNav}>{children}</ResponsiveSidebar>
    </ProtectedRoute>
  );
}
