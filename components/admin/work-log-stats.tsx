"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { WorkLogDoc, EmployeeDoc } from "@/lib/types";

interface WorkLogStatsProps {
  workLogs: WorkLogDoc[];
  employees: EmployeeDoc[];
  stats: {
    totalTime: number;
    totalTasks: number;
    uniqueEmployees: number;
    employeeStats: Record<string, { tasks: number; time: number }>;
    avgTimePerTask: number;
  };
}

export function WorkLogStats({
  workLogs,
  employees,
  stats,
}: WorkLogStatsProps) {
  // Prepare data for top performers chart
  const topPerformersData = useMemo(() => {
    const performersArray = Object.entries(stats.employeeStats)
      .map(([employeeId, data]) => {
        const employee = employees.find((e) => e._id === employeeId);
        return {
          name: employee?.name || "Unknown",
          tasks: data.tasks,
          hours: Math.round((data.time / 60) * 10) / 10,
        };
      })
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 10);

    return performersArray;
  }, [stats.employeeStats, employees]);

  // Prepare data for daily work trend
  const dailyTrendData = useMemo(() => {
    const logsByDate = workLogs.reduce((acc, log) => {
      if (!acc[log.date]) {
        acc[log.date] = { tasks: 0, time: 0 };
      }
      acc[log.date].tasks++;
      acc[log.date].time += log.timeSpent;
      return acc;
    }, {} as Record<string, { tasks: number; time: number }>);

    return Object.entries(logsByDate)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        tasks: data.tasks,
        hours: Math.round((data.time / 60) * 10) / 10,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  }, [workLogs]);

  // Prepare data for department performance
  const departmentData = useMemo(() => {
    const deptStats = workLogs.reduce((acc, log) => {
      const employee = employees.find((e) => e._id === log.employeeId);
      const dept = employee?.department || "Unknown";
      if (!acc[dept]) {
        acc[dept] = { tasks: 0, time: 0 };
      }
      acc[dept].tasks++;
      acc[dept].time += log.timeSpent;
      return acc;
    }, {} as Record<string, { tasks: number; time: number }>);

    return Object.entries(deptStats)
      .map(([department, data]) => ({
        department,
        tasks: data.tasks,
        hours: Math.round((data.time / 60) * 10) / 10,
      }))
      .sort((a, b) => b.tasks - a.tasks);
  }, [workLogs, employees]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performers */}
      <Card className="border-slate-700 bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-4">
          Top Performers (By Tasks)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topPerformersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
            />
            <Legend wrapperStyle={{ color: "#94a3b8" }} />
            <Bar dataKey="tasks" fill="#3b82f6" name="Tasks" />
            <Bar dataKey="hours" fill="#8b5cf6" name="Hours" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Daily Trend */}
      <Card className="border-slate-700 bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-4">
          Daily Work Trend (Last 14 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
            />
            <Legend wrapperStyle={{ color: "#94a3b8" }} />
            <Bar dataKey="tasks" fill="#10b981" name="Tasks" />
            <Bar dataKey="hours" fill="#f59e0b" name="Hours" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Department Performance */}
      {departmentData.length > 0 && (
        <Card className="border-slate-700 bg-slate-800 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">
            Department Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8" }}
              />
              <YAxis
                dataKey="department"
                type="category"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Legend wrapperStyle={{ color: "#94a3b8" }} />
              <Bar dataKey="tasks" fill="#06b6d4" name="Tasks" />
              <Bar dataKey="hours" fill="#ec4899" name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
