"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmployeeTable } from "@/components/admin/employee-table";
import { LeaveRequestsCard } from "@/components/admin/leave-requests-card";
import { AttendanceOverview } from "@/components/admin/attendance-overview";
import { CreateEmployeeDialog } from "@/components/admin/create-employee-dialog";
import { WorkOverview } from "@/components/admin/work-overview";
import {
  LogOut,
  Users,
  Calendar,
  Clock,
  BarChart3,
  Settings,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import type { LeaveRequestId } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, hydrated, clearUser } = useSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createEmployee = useMutation(api.users.createEmployee);
  const updateLeaveStatus = useMutation(api.leaveRequests.updateStatus);

  const employees = useQuery(api.users.listEmployees) ?? [];
  const leaveRequests = useQuery(api.leaveRequests.listAll) ?? [];
  const timeLogs = useQuery(api.timeLogs.listRecent, { limit: 200 }) ?? [];
  const workLogs = useQuery(api.workLogs.listRecent, { limit: 100 }) ?? [];

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const presentToday = timeLogs.filter((log) => log.date === today).length;
    const pendingRequests = leaveRequests.filter(
      (r) => r.status === "pending"
    ).length;
    const avgHours =
      timeLogs.length > 0
        ? (
            timeLogs.reduce((sum, log) => sum + log.totalHours, 0) /
            timeLogs.length
          ).toFixed(1)
        : "0";

    return {
      totalEmployees: employees.length,
      presentToday,
      pendingRequests,
      avgHoursPerDay: avgHours,
    };
  }, [employees, leaveRequests, timeLogs]);

  const handleCreateEmployee = async (newEmployeeData: {
    name: string;
    email: string;
    password: string;
    department: string;
    position: string;
  }) => {
    await createEmployee(newEmployeeData);
    setIsCreateDialogOpen(false);
  };

  const handleApprove = async (id: LeaveRequestId) => {
    await updateLeaveStatus({ id, status: "approved" });
  };

  const handleReject = async (id: LeaveRequestId) => {
    await updateLeaveStatus({ id, status: "rejected" });
  };

  const handleSignOut = () => {
    clearUser();
    router.push("/");
  };

  if (!hydrated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">TimeTrack</h1>
            <p className="text-sm text-slate-400">Admin Dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Employee
            </Button>
            <Button
              onClick={() => router.push("/admin/analytics")}
              variant="outline"
              className="border-slate-600 text-slate-50 hover:bg-slate-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              onClick={() => router.push("/admin/work-analytics")}
              variant="outline"
              className="border-slate-600 text-slate-50 hover:bg-slate-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Work Logs
            </Button>
            <Button
              onClick={() => router.push("/admin/settings")}
              variant="outline"
              className="border-slate-600 text-slate-50 hover:bg-slate-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
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

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Total Employees</p>
                <p className="text-2xl font-bold text-slate-50">
                  {stats.totalEmployees}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-xs text-slate-400">Present Today</p>
                <p className="text-2xl font-bold text-slate-50">
                  {stats.presentToday}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-xs text-slate-400">Pending Requests</p>
                <p className="text-2xl font-bold text-slate-50">
                  {stats.pendingRequests}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-xs text-slate-400">Avg Hours/Day</p>
                <p className="text-2xl font-bold text-slate-50">
                  {stats.avgHoursPerDay}h
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <EmployeeTable employees={employees} />
            <WorkOverview workLogs={workLogs} employees={employees} />
            <AttendanceOverview timeLogs={timeLogs} employees={employees} />
          </div>

          <div>
            <LeaveRequestsCard
              requests={leaveRequests}
              employees={employees}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        </div>
      </main>

      <CreateEmployeeDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateEmployee}
      />
    </div>
  );
}
