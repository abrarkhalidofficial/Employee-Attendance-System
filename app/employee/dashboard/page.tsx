"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WorkTimer } from "@/components/employee/work-timer"
import { BreakTimer } from "@/components/employee/break-timer"
import { TimeLogCard } from "@/components/employee/time-log-card"
import { WorkLogForm } from "@/components/employee/work-log-form"
import { WorkLogList } from "@/components/employee/work-log-list"
import { mockTimeLogs, mockEmployees, mockWorkLogs } from "@/lib/mock-data"
import { LogOut, Menu } from "lucide-react"

export default function EmployeeDashboard() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [workLogs, setWorkLogs] = useState(mockWorkLogs.filter((log) => log.employeeId === mockEmployees[0].id))
  const currentEmployee = mockEmployees[0] // Alex Johnson

  const handleAddWorkLog = (taskDescription: string, timeSpent: number) => {
    const newLog = {
      id: `work_${Date.now()}`,
      employeeId: currentEmployee.id,
      date: new Date().toISOString().split("T")[0],
      taskDescription,
      timeSpent,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setWorkLogs([...workLogs, newLog])
  }

  const handleDeleteWorkLog = (id: string) => {
    setWorkLogs(workLogs.filter((log) => log.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">TimeTrack</h1>
            <p className="text-sm text-slate-400">Employee Dashboard</p>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-slate-700 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-50">{currentEmployee.name}</p>
              <p className="text-xs text-slate-400">{currentEmployee.department}</p>
            </div>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-slate-600 text-slate-50 hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Timers and Work Logs */}
          <div className="md:col-span-2 space-y-6">
            <WorkTimer />
            <BreakTimer />
            <WorkLogForm onSubmit={handleAddWorkLog} />
            <WorkLogList logs={workLogs} onDelete={handleDeleteWorkLog} />
            <TimeLogCard logs={mockTimeLogs.filter((log) => log.employeeId === currentEmployee.id)} />
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            <Card className="border-slate-700 bg-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Hours Today</p>
                  <p className="text-3xl font-bold text-green-400">8.5h</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Break Time</p>
                  <p className="text-3xl font-bold text-amber-400">60m</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Weekly Total</p>
                  <p className="text-3xl font-bold text-blue-400">42.5h</p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-700 bg-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Leave Balance</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Vacation</p>
                  <p className="font-semibold text-slate-50">18 days</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sick Leave</p>
                  <p className="font-semibold text-slate-50">8 days</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Personal</p>
                  <p className="font-semibold text-slate-50">3 days</p>
                </div>
              </div>
            </Card>

            <Button
              onClick={() => router.push("/employee/leave-requests")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Request Leave
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
