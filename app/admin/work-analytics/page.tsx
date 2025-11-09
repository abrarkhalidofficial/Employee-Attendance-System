"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSession } from "@/components/providers/session-provider";
import {
  ArrowLeft,
  Filter,
  Search,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { WorkLogStats } from "@/components/admin/work-log-stats";
import { WorkLogTable } from "@/components/admin/work-log-table";
import { EmployeePerformanceModal } from "@/components/admin/employee-performance-modal";

export default function WorkAnalyticsPage() {
  const router = useRouter();
  const { user, hydrated } = useSession();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingEmployeeId, setViewingEmployeeId] =
    useState<Id<"users"> | null>(null);

  const employees = useQuery(api.users.listEmployees) ?? [];
  const workLogs =
    useQuery(api.workLogs.getAnalytics, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      employeeId: (selectedEmployee || undefined) as Id<"users"> | undefined,
      department: selectedDepartment || undefined,
    }) ?? [];

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(
      employees.map((e) => e.department).filter((d): d is string => Boolean(d))
    );
    return Array.from(depts).sort();
  }, [employees]);

  // Filter logs by search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return workLogs;
    const query = searchQuery.toLowerCase();
    return workLogs.filter((log) => {
      const employee = employees.find((e) => e._id === log.employeeId);
      return (
        log.taskDescription.toLowerCase().includes(query) ||
        employee?.name.toLowerCase().includes(query) ||
        employee?.department?.toLowerCase().includes(query)
      );
    });
  }, [workLogs, searchQuery, employees]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTime = filteredLogs.reduce((sum, log) => sum + log.timeSpent, 0);
    const totalTasks = filteredLogs.length;
    const uniqueEmployees = new Set(filteredLogs.map((log) => log.employeeId))
      .size;

    // Group by employee for top performers
    const employeeStats = filteredLogs.reduce((acc, log) => {
      if (!acc[log.employeeId]) {
        acc[log.employeeId] = { tasks: 0, time: 0 };
      }
      acc[log.employeeId].tasks++;
      acc[log.employeeId].time += log.timeSpent;
      return acc;
    }, {} as Record<string, { tasks: number; time: number }>);

    return {
      totalTime,
      totalTasks,
      uniqueEmployees,
      employeeStats,
      avgTimePerTask: totalTasks > 0 ? Math.round(totalTime / totalTasks) : 0,
    };
  }, [filteredLogs]);

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedDepartment("");
    setSelectedEmployee("");
    setSearchQuery("");
  };

  if (!hydrated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        Loading work analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-50">
                📊 Work Analytics
              </h1>
              <p className="text-sm text-slate-400">
                Employee performance & work logs
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">
              Pakistan Standard Time (PKT)
            </p>
            <p className="text-sm font-medium text-slate-300">
              {new Date().toLocaleString("en-PK", {
                timeZone: "Asia/Karachi",
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-700 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 hover:from-blue-500/15 hover:to-blue-600/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Clock className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  Total Time Worked
                </p>
                <p className="text-2xl font-bold text-slate-50">
                  {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-gradient-to-br from-green-500/10 to-green-600/5 p-6 hover:from-green-500/15 hover:to-green-600/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-slate-50">
                  {stats.totalTasks}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 hover:from-purple-500/15 hover:to-purple-600/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Users className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  Active Employees
                </p>
                <p className="text-2xl font-bold text-slate-50">
                  {stats.uniqueEmployees}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6 hover:from-orange-500/15 hover:to-orange-600/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <TrendingUp className="w-7 h-7 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  Avg Time/Task
                </p>
                <p className="text-2xl font-bold text-slate-50">
                  {stats.avgTimePerTask}m
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-700 bg-slate-800/80 backdrop-blur p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-700/50 rounded-lg">
              <Filter className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                🔍 Filter Options
              </h2>
              <p className="text-xs text-slate-400">
                Narrow down your search results
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-slate-300 mb-2 block font-medium flex items-center gap-1">
                📅 Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900/70 border-slate-600 hover:border-slate-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-2 block font-medium flex items-center gap-1">
                📅 End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900/70 border-slate-600 hover:border-slate-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-2 flex items-center gap-1 font-medium">
                🏢 Department
              </label>
              <Select
                value={selectedDepartment || "all"}
                onValueChange={(val) =>
                  setSelectedDepartment(val === "all" ? "" : val)
                }
              >
                <SelectTrigger className="bg-slate-900/70 border-slate-600 hover:border-slate-500 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌐 All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-2 flex items-center gap-1 font-medium">
                👤 Employee
              </label>
              <Select
                value={selectedEmployee || "all"}
                onValueChange={(val) =>
                  setSelectedEmployee(val === "all" ? "" : val)
                }
              >
                <SelectTrigger className="bg-slate-900/70 border-slate-600 hover:border-slate-500 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">👥 All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all"
              >
                🔄 Reset Filters
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
              <Input
                type="text"
                placeholder="🔎 Search tasks, employees, departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-slate-900/70 border-slate-600 hover:border-slate-500 focus:border-blue-500 text-slate-100 placeholder:text-slate-400 transition-colors"
              />
            </div>
            {searchQuery && (
              <p className="text-xs text-slate-400 mt-2">
                Found {filteredLogs.length} result
                {filteredLogs.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </Card>

        {/* Work Log Statistics Chart */}
        <WorkLogStats
          workLogs={filteredLogs}
          employees={employees}
          stats={stats}
        />

        {/* Work Log Table */}
        <WorkLogTable
          workLogs={filteredLogs}
          employees={employees}
          onViewEmployee={(employeeId: Id<"users">) =>
            setViewingEmployeeId(employeeId)
          }
        />
      </main>

      {/* Employee Performance Modal */}
      {viewingEmployeeId && (
        <EmployeePerformanceModal
          employeeId={viewingEmployeeId}
          onClose={() => setViewingEmployeeId(null)}
        />
      )}
    </div>
  );
}
