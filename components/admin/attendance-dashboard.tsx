"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Clock, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AttendanceDashboard() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [statusFilter, setStatusFilter] = useState("all");

  const attendance = useQuery(api.attendance.getAllAttendance, {
    date: selectedDate,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const employees = useQuery(api.users.listEmployees);

  const stats = attendance
    ? {
        total: attendance.length,
        present: attendance.filter((a) => a.status === "present").length,
        late: attendance.filter((a) => a.isLate).length,
        absent: attendance.filter((a) => a.status === "absent").length,
        halfDay: attendance.filter((a) => a.status === "half-day").length,
        overtime: attendance.reduce(
          (sum, a) => sum + (a.overtimeHours || 0),
          0
        ),
      }
    : { total: 0, present: 0, late: 0, absent: 0, halfDay: 0, overtime: 0 };

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

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find((e) => e._id === employeeId);
    return employee?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Total Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.present}
              <span className="text-sm text-gray-600 ml-2">
                / {stats.total}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Late Arrivals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.late}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-red-600" />
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.absent}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Overtime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatHours(stats.overtime)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Records
          </CardTitle>
          <CardDescription>View and manage employee attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Late/Early</TableHead>
                  <TableHead>Overtime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!attendance || attendance.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No attendance records for this date
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map((record) => (
                    <TableRow key={record._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {getEmployeeName(record.employeeId)}
                      </TableCell>
                      <TableCell>
                        {record.checkIn || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.checkOut || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.totalHours > 0 ? (
                          formatHours(record.totalHours)
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.isLate && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-300"
                          >
                            Late: {record.lateBy}m
                          </Badge>
                        )}
                        {record.isEarlyDeparture && (
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-300"
                          >
                            Early: {record.earlyBy}m
                          </Badge>
                        )}
                        {!record.isLate && !record.isEarlyDeparture && (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.overtimeHours && record.overtimeHours > 0 ? (
                          <span className="text-green-600 font-medium">
                            +{formatHours(record.overtimeHours)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
