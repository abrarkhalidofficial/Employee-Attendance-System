"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { LeaveAnalytics } from "@/components/admin/leave-analytics"
import { DepartmentStats } from "@/components/admin/department-stats"
import { MonthlyReport } from "@/components/admin/monthly-report"
import { mockEmployees, mockTimeLogs, mockLeaveRequests } from "@/lib/mock-data"
import { ArrowLeft, TrendingUp } from "lucide-react"

export default function AnalyticsPage() {
  const router = useRouter()
  const [employees] = useState(mockEmployees)
  const [timeLogs] = useState(mockTimeLogs)
  const [leaveRequests] = useState(mockLeaveRequests)

  const stats = {
    totalHoursWorked: timeLogs.reduce((sum, log) => sum + log.totalHours, 0).toFixed(1),
    leaveRequestsProcessed: leaveRequests.filter((r) => r.status !== "pending").length,
    approvalRate: ((leaveRequests.filter((r) => r.status === "approved").length / leaveRequests.length) * 100).toFixed(
      0,
    ),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Analytics</h1>
            <p className="text-sm text-slate-400">Performance & Insights</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Total Hours</p>
                <p className="text-2xl font-bold text-slate-50">{stats.totalHoursWorked}h</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-xs text-slate-400">Requests Processed</p>
                <p className="text-2xl font-bold text-slate-50">{stats.leaveRequestsProcessed}</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-xs text-slate-400">Approval Rate</p>
                <p className="text-2xl font-bold text-slate-50">{stats.approvalRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeaveAnalytics requests={leaveRequests} />
          <DepartmentStats employees={employees} timeLogs={timeLogs} />
        </div>

        <MonthlyReport timeLogs={timeLogs} employees={employees} />
      </main>
    </div>
  )
}
