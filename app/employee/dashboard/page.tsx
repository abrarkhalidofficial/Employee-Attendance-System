"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkTimer } from "@/components/employee/work-timer";
import { BreakTimer } from "@/components/employee/break-timer";
import { TimeLogCard } from "@/components/employee/time-log-card";
import { WorkLogForm } from "@/components/employee/work-log-form";
import { WorkLogList } from "@/components/employee/work-log-list";
import { useSession } from "@/components/providers/session-provider";
import type { WorkLogDoc } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";

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
  const timeLogs =
    useQuery(
      api.timeLogs.listForEmployee,
      user ? { employeeId: user._id as Id<"users"> } : "skip"
    ) ?? [];

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
    if (timeLogs.length === 0) {
      return { hoursToday: 0, breakTime: 0, weeklyTotal: 0 };
    }
    const hoursToday = timeLogs[0]?.totalHours ?? 0;
    const breakTime = timeLogs[0]?.breakTime ?? 0;
    const weeklyTotal = timeLogs
      .slice(0, 5)
      .reduce((sum, log) => sum + log.totalHours, 0);
    return { hoursToday, breakTime, weeklyTotal };
  }, [timeLogs]);

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
            <WorkTimer />
            <BreakTimer />
            <WorkLogForm onSubmit={handleAddWorkLog} />
            <WorkLogList logs={sortedWorkLogs} onDelete={handleDeleteWorkLog} />
            <TimeLogCard logs={timeLogs} />
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Hours Today
                  </p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {quickStats.hoursToday.toFixed(1)}h
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Break Time
                  </p>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                    {quickStats.breakTime}m
                  </p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Weekly Total
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {quickStats.weeklyTotal.toFixed(1)}h
                  </p>
                </div>
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
