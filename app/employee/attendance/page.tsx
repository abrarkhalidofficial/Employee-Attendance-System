"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AttendanceTracker } from "@/components/employee/attendance-tracker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/components/providers/session-provider";
import { Calendar, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function AttendancePage() {
  const router = useRouter();
  const { user, hydrated } = useSession();

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "employee") {
      router.replace("/");
    }
  }, [hydrated, router, user]);
  const attendanceHistory = useQuery(
    api.attendance.getAttendanceHistory,
    user ? { employeeId: user._id as Id<"users">, limit: 30 } : "skip"
  );

  const currentMonth = format(new Date(), "yyyy-MM");
  const monthlyReport = useQuery(
    api.attendance.getMonthlyReport,
    user ? { employeeId: user._id as Id<"users">, month: currentMonth } : "skip"
  );

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      present: "bg-green-500",
      late: "bg-yellow-500",
      absent: "bg-red-500",
      "half-day": "bg-orange-500",
      "on-leave": "bg-blue-500",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-500"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (!hydrated || !user || user.role !== "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            📅 Attendance Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your daily attendance and view history
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Left Column - Attendance Tracker */}
        <div className="lg:col-span-1">
          <AttendanceTracker employeeId={user._id as Id<"users">} />
          <div className="mt-6">
            <Button
              onClick={() => router.push("/employee/regularization")}
              variant="outline"
              className="w-full"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Request Regularization
            </Button>
          </div>
        </div>

        {/* Right Column - Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Stats */}
          {monthlyReport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    Present
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {monthlyReport.stats.presentDays}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-linear-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Late
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {monthlyReport.stats.lateDays}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Total Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatHours(monthlyReport.stats.totalHours)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    Overtime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatHours(monthlyReport.stats.totalOvertimeHours)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Your recent attendance records (last 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!attendanceHistory || attendanceHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No attendance records yet
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {attendanceHistory.map((record) => (
                    <div
                      key={record._id}
                      className="p-4 border rounded-lg hover:bg-gray-50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{record.date}</span>
                        {getStatusBadge(record.status)}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Check-in:</span>{" "}
                          <span className="font-mono">
                            {record.checkIn || (
                              <span className="text-gray-400">-</span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Check-out:</span>{" "}
                          <span className="font-mono">
                            {record.checkOut || (
                              <span className="text-gray-400">-</span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total:</span>{" "}
                          <span className="font-medium">
                            {record.totalHours > 0 ? (
                              formatHours(record.totalHours)
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </span>
                        </div>
                      </div>
                      {record.isLate && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4" />
                          <span>Late by {record.lateBy} minutes</span>
                        </div>
                      )}
                      {record.overtimeHours && record.overtimeHours > 0 && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                          🎉 Overtime: {formatHours(record.overtimeHours)}
                        </div>
                      )}
                      {record.notes && (
                        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                          <strong>Note:</strong> {record.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
