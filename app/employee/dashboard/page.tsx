"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AttendanceTracker } from "@/components/employee/attendance-tracker";
import { TimeLogCard } from "@/components/employee/time-log-card";
import { WorkLogForm } from "@/components/employee/work-log-form";
import { WorkLogList } from "@/components/employee/work-log-list";
import { useSession } from "@/components/providers/session-provider";
import type { WorkLogDoc } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, hydrated } = useSession();
  const createWorkLog = useMutation(api.workLogs.create);
  const deleteWorkLog = useMutation(api.workLogs.remove);

  const workLogs =
    useQuery(
      api.workLogs.listForEmployee,
      user ? { employeeId: user._id as Id<"users"> } : "skip"
    ) ?? [];

  const todayAttendance = useQuery(
    api.attendance.getTodayAttendance,
    user ? { employeeId: user._id as Id<"users"> } : "skip"
  );

  const currentMonth = format(new Date(), "yyyy-MM");
  const monthlyReport = useQuery(
    api.attendance.getMonthlyReport,
    user ? { employeeId: user._id as Id<"users">, month: currentMonth } : "skip"
  );

  const penaltyStats = useQuery(
    api.attendance.getTotalPenaltyPoints,
    user ? { employeeId: user._id as Id<"users">, month: currentMonth } : "skip"
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "employee") {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  const handleAddWorkLog = async (
    taskDescription: string,
    timeSpent: number
  ) => {
    if (!user) return;
    await createWorkLog({
      employeeId: user._id as Id<"users">,
      taskDescription,
      timeSpent,
    });
  };

  const handleDeleteWorkLog = async (id: string) => {
    if (!user) return;
    await deleteWorkLog({
      id: id as Id<"workLogs">,
      employeeId: user._id as Id<"users">,
    });
  };

  const quickStats = useMemo(() => {
    const workingHoursToday =
      todayAttendance?.workingHours ?? todayAttendance?.totalHours ?? 0;
    const breakTimeToday = todayAttendance?.breakTime ?? 0;
    const monthlyHours = monthlyReport?.stats.totalHours ?? 0;
    const monthlyPenalties = penaltyStats?.totalPoints ?? 0;

    return {
      workingHoursToday,
      breakTimeToday,
      monthlyHours,
      monthlyPenalties,
      isCheckedIn: todayAttendance?.checkIn && !todayAttendance?.checkOut,
      isOnBreak: todayAttendance?.isOnBreak ?? false,
    };
  }, [todayAttendance, monthlyReport, penaltyStats]);

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const sortedWorkLogs: WorkLogDoc[] = [...workLogs]
    .sort((a, b) => (a.insertedAt ?? 0) - (b.insertedAt ?? 0))
    .reverse();

  if (!hydrated || !user || user.role !== "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            🏠 Employee Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user.name}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Attendance Tracker (replaces WorkTimer and BreakTimer) */}
            <AttendanceTracker employeeId={user._id as Id<"users">} />

            <WorkLogForm onSubmit={handleAddWorkLog} />
            <WorkLogList logs={sortedWorkLogs} onDelete={handleDeleteWorkLog} />
          </div>

          <div className="space-y-6">
            {/* Quick Stats Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                📊 Quick Stats
              </h3>
              <div className="space-y-4">
                {/* Today's Working Hours */}
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">
                      Working Hours Today
                    </p>
                    {quickStats.isCheckedIn && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {quickStats.isOnBreak ? "On Break" : "Active"}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {formatHours(quickStats.workingHoursToday)}
                  </p>
                </div>

                {/* Break Time Today */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Break Time Today
                  </p>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                    {quickStats.breakTimeToday}m
                  </p>
                </div>

                {/* Monthly Hours */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Monthly Total
                  </p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                    {formatHours(quickStats.monthlyHours)}
                  </p>
                </div>

                {/* Penalty Points */}
                {quickStats.monthlyPenalties > 0 && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Penalty Points
                    </p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                      {quickStats.monthlyPenalties}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                      This month
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/employee/attendance")}
                className="w-full"
                variant="default"
              >
                📅 Attendance
              </Button>
              <Button
                onClick={() => router.push("/employee/profile")}
                className="w-full"
                variant="outline"
              >
                👤 My Profile
              </Button>
              <Button
                onClick={() => router.push("/employee/leave-requests")}
                className="w-full"
                variant="outline"
              >
                📝 Request Leave
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
