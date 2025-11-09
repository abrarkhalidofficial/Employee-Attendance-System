"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { LeaveAnalytics } from "@/components/admin/leave-analytics"
import { DepartmentStats } from "@/components/admin/department-stats"
import { MonthlyReport } from "@/components/admin/monthly-report"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { useSession } from "@/components/providers/session-provider"

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, hydrated } = useSession()
  const employees = useQuery(api.users.listEmployees) ?? []
  const timeLogs = useQuery(api.timeLogs.listRecent, { limit: 200 }) ?? []
  const leaveRequests = useQuery(api.leaveRequests.listAll) ?? []

  useEffect(() => {
    if (!hydrated) return
    if (!user || user.role !== "admin") {
      router.replace("/")
    }
  }, [hydrated, router, user])

  const stats = useMemo(() => {
    const totalHoursWorked = timeLogs.reduce((sum, log) => sum + log.totalHours, 0)
    const processed = leaveRequests.filter((r) => r.status !== "pending").length
    const approved = leaveRequests.filter((r) => r.status === "approved").length
    const approvalRate = leaveRequests.length > 0 ? Math.round((approved / leaveRequests.length) * 100) : 0

    return {
      totalHoursWorked: totalHoursWorked.toFixed(1),
      leaveRequestsProcessed: processed,
      approvalRate,
    }
  }, [leaveRequests, timeLogs])

  if (!hydrated || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        Loading analytics...
      </div>
    )
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
