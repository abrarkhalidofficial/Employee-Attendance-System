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
import { LogOut, Menu } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import type { WorkLogDoc } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, hydrated, clearUser } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  const handleSignOut = () => {
    clearUser();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">TimeTrack</h1>
            <p className="text-sm text-slate-400">Employee Dashboard</p>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-slate-700 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-50">{user.name}</p>
              <p className="text-xs text-slate-400">{user.department}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-slate-600 text-slate-50 hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <WorkTimer />
            <BreakTimer />
            <WorkLogForm onSubmit={handleAddWorkLog} />
            <WorkLogList logs={sortedWorkLogs} onDelete={handleDeleteWorkLog} />
            <TimeLogCard logs={timeLogs} />
          </div>

          <div className="space-y-6">
            <Card className="border-slate-700 bg-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Hours Today</p>
                  <p className="text-3xl font-bold text-green-400">
                    {quickStats.hoursToday.toFixed(1)}h
                  </p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Break Time</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {quickStats.breakTime}m
                  </p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Weekly Total</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {quickStats.weeklyTotal.toFixed(1)}h
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/employee/attendance")}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                📅 Attendance
              </Button>
              <Button
                onClick={() => router.push("/employee/profile")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                👤 My Profile
              </Button>
              <Button
                onClick={() => router.push("/employee/leave-requests")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
