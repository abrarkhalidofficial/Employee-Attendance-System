"use client";

import { useRouter } from "next/navigation";
import type { EmployeeDoc, WorkLogDoc } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, TrendingUp } from "lucide-react";

interface WorkOverviewProps {
  workLogs: WorkLogDoc[];
  employees: EmployeeDoc[];
}

export function WorkOverview({ workLogs, employees }: WorkOverviewProps) {
  const router = useRouter();

  const getEmployeeInfo = (employeeId: string) => {
    return employees.find((e) => e._id === employeeId);
  };

  const totalTimeSpent = workLogs.reduce((sum, log) => sum + log.timeSpent, 0);
  const totalHoursFormatted = Math.floor(totalTimeSpent / 60);
  const totalMinutesFormatted = totalTimeSpent % 60;

  // Get work logs for today
  const todayLogs = workLogs.filter(
    (log) => log.date === new Date().toISOString().split("T")[0]
  );

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-50 mb-2">
              Work Overview
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              Total work time: {totalHoursFormatted}h {totalMinutesFormatted}m
              across {todayLogs.length} tasks
            </div>
          </div>
          <Button
            onClick={() => router.push("/admin/work-analytics")}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {todayLogs.length > 0 ? (
            todayLogs.map((log) => {
              const employee = getEmployeeInfo(log.employeeId);
              const hours = Math.floor(log.timeSpent / 60);
              const minutes = log.timeSpent % 60;

              return (
                <div
                  key={log._id}
                  className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <p className="font-medium text-slate-50 truncate">
                          {employee?.name}
                        </p>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                          {employee?.department}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">
                        {log.taskDescription}
                      </p>
                      <p className="text-xs text-slate-400">
                        Logged at {log.createdAt}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                        <p className="text-sm font-semibold text-blue-400">
                          {hours}h {minutes}m
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-slate-400 py-8">
              No work logs recorded yet today
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
