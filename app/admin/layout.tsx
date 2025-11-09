"use client";

import type React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Clock,
  TrendingUp,
  Settings,
  UserPlus,
  LogOut,
} from "lucide-react";
import { useSession } from "@/components/providers/session-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { clearUser } = useSession();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/attendance", label: "Attendance", icon: Calendar },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/admin/regularization", label: "Regularization", icon: Clock },
    { path: "/admin/work-analytics", label: "Work Logs", icon: TrendingUp },
    { path: "/admin/create", label: "Create Employee", icon: UserPlus },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card shadow-sm hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-foreground">TimeTrack</h2>
          <p className="text-xs text-muted-foreground">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                onClick={() => router.push(item.path)}
                variant={isActive(item.path) ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
