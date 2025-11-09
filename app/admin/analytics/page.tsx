"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { LeaveAnalytics } from "@/components/admin/leave-analytics";
import { DepartmentStats } from "@/components/admin/department-stats";
import { MonthlyReport } from "@/components/admin/monthly-report";
import { TrendingUp } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, hydrated } = useSession();
  const employees = useQuery(api.users.listEmployees) ?? [];
  const timeLogs = useQuery(api.timeLogs.listRecent, { limit: 200 }) ?? [];
  const leaveRequests = useQuery(api.leaveRequests.listAll) ?? [];

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  const stats = useMemo(() => {
    const totalHoursWorked = timeLogs.reduce(
      (sum, log) => sum + log.totalHours,
      0
    );
    const processed = leaveRequests.filter(
      (r) => r.status !== "pending"
    ).length;
    const approved = leaveRequests.filter(
      (r) => r.status === "approved"
    ).length;
    const approvalRate =
      leaveRequests.length > 0
        ? Math.round((approved / leaveRequests.length) * 100)
        : 0;

    return {
      totalHoursWorked: totalHoursWorked.toFixed(1),
      leaveRequestsProcessed: processed,
      approvalRate,
    };
  }, [leaveRequests, timeLogs]);

  if (!hydrated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">📊 Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance insights and statistics
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalHoursWorked}h
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Requests Processed
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.leaveRequestsProcessed}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.approvalRate}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeaveAnalytics requests={leaveRequests} />
          <DepartmentStats employees={employees} timeLogs={timeLogs} />
        </div>

        <MonthlyReport timeLogs={timeLogs} employees={employees} />
      </main>
    </div>
  );
}
