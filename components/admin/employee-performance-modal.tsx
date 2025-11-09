"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  X,
  User,
  Briefcase,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface EmployeePerformanceModalProps {
  employeeId: Id<"users">;
  onClose: () => void;
}

export function EmployeePerformanceModal({
  employeeId,
  onClose,
}: EmployeePerformanceModalProps) {
  const employee = useQuery(api.users.getUser, { userId: employeeId });
  const workHistory = useQuery(api.workLogs.getEmployeeHistory, { employeeId });
  const employeeStats = useQuery(api.workLogs.getEmployeeStats, { employeeId });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group logs by date for better organization
  const logsByDate = useMemo(() => {
    if (!workHistory) return {};
    return workHistory.reduce((acc, log) => {
      if (!acc[log.date]) {
        acc[log.date] = [];
      }
      acc[log.date].push(log);
      return acc;
    }, {} as Record<string, typeof workHistory>);
  }, [workHistory]);

  const sortedDates = useMemo(() => {
    return Object.keys(logsByDate).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [logsByDate]);

  if (!employee || !workHistory || !employeeStats) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-slate-50">
          <div className="flex items-center justify-center py-8">
            <p className="text-slate-400">Loading employee data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-slate-50 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-50">
                Employee Performance
              </DialogTitle>
              <p className="text-sm text-slate-400 mt-1">
                Complete work history and statistics
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Employee Info Card */}
          <Card className="border-slate-700 bg-slate-900 p-6 flex-shrink-0">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold">
                {employee.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-50 mb-2">
                  {employee.name}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{employee.position || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User className="w-4 h-4" />
                    <span>{employee.department || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined: {formatDate(employee.joinDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Badge
                      className={
                        employee.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {employee.status || "Active"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
            <Card className="border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Total Time</p>
                  <p className="text-lg font-bold text-slate-50">
                    {formatTime(employeeStats.totalTimeSpent)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Total Tasks</p>
                  <p className="text-lg font-bold text-slate-50">
                    {employeeStats.totalTasks}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Days Worked</p>
                  <p className="text-lg font-bold text-slate-50">
                    {employeeStats.daysWorked}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="text-xs text-slate-400">Avg/Day</p>
                  <p className="text-lg font-bold text-slate-50">
                    {employeeStats.avgTasksPerDay}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Work History */}
          <Card className="border-slate-700 bg-slate-900 p-6 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">
              Complete Work History
            </h3>
            <ScrollArea className="flex-1">
              <div className="space-y-6 pr-4">
                {sortedDates.length > 0 ? (
                  sortedDates.map((date) => {
                    const logs = logsByDate[date];
                    const dayTotal = logs.reduce(
                      (sum, log) => sum + log.timeSpent,
                      0
                    );

                    return (
                      <div key={date} className="space-y-3">
                        <div className="flex items-center justify-between sticky top-0 bg-slate-900 py-2">
                          <h4 className="font-semibold text-slate-50">
                            {formatDate(date)}
                          </h4>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {logs.length} tasks • {formatTime(dayTotal)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {logs.map((log) => (
                            <div
                              key={log._id}
                              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-300 mb-2">
                                    {log.taskDescription}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Logged at {log.createdAt}
                                  </p>
                                </div>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0">
                                  {formatTime(log.timeSpent)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>

                        {date !== sortedDates[sortedDates.length - 1] && (
                          <Separator className="bg-slate-700" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-slate-400 py-8">
                    No work history available for this employee
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
