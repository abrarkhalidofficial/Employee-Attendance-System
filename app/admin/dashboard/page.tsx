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
import { Users, Calendar, Clock, Plus } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import type { LeaveRequestId } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, hydrated } = useSession();
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

  if (!hydrated || !user || user.role !== "admin") {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                📊 Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Employee management and system overview
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Employee
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20 p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalEmployees}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-700 dark:text-green-400" />
              <div>
                <p className="text-xs text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.presentToday}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-amber-700 dark:text-amber-400" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.pendingRequests}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Hours/Day</p>
                <p className="text-2xl font-bold text-foreground">
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
