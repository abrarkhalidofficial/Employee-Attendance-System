"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmployeeTable } from "@/components/admin/employee-table"
import { LeaveRequestsCard } from "@/components/admin/leave-requests-card"
import { AttendanceOverview } from "@/components/admin/attendance-overview"
import { CreateEmployeeDialog } from "@/components/admin/create-employee-dialog"
import { WorkOverview } from "@/components/admin/work-overview"
import { mockEmployees, mockTimeLogs, mockLeaveRequests, mockWorkLogs } from "@/lib/mock-data"
import type { Employee } from "@/lib/mock-data"
import { LogOut, Users, Calendar, Clock, BarChart3, Settings, Plus } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [employees, setEmployees] = useState(mockEmployees)
  const [leaveRequests] = useState(mockLeaveRequests)
  const [timeLogs] = useState(mockTimeLogs)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [workLogs] = useState(mockWorkLogs)

  const stats = {
    totalEmployees: employees.length,
    presentToday: timeLogs.filter((log) => new Date(log.date).toDateString() === new Date().toDateString()).length,
    pendingRequests: leaveRequests.filter((r) => r.status === "pending").length,
    avgHoursPerDay:
      timeLogs.length > 0 ? (timeLogs.reduce((sum, log) => sum + log.totalHours, 0) / timeLogs.length).toFixed(1) : "0",
  }

  const handleCreateEmployee = (newEmployeeData: {
    name: string
    email: string
    password: string
    department: string
    position: string
  }) => {
    const newEmployee: Employee = {
      id: `emp_${String(employees.length + 1).padStart(3, "0")}`,
      name: newEmployeeData.name,
      email: newEmployeeData.email,
      department: newEmployeeData.department,
      position: newEmployeeData.position,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
    }
    setEmployees([...employees, newEmployee])
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">TimeTrack</h1>
            <p className="text-sm text-slate-400">Admin Dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Employee
            </Button>
            <Button
              onClick={() => router.push("/admin/analytics")}
              variant="outline"
              className="border-slate-600 text-slate-50 hover:bg-slate-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              onClick={() => router.push("/admin/settings")}
              variant="outline"
              className="border-slate-600 text-slate-50 hover:bg-slate-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
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
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Total Employees</p>
                <p className="text-2xl font-bold text-slate-50">{stats.totalEmployees}</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-xs text-slate-400">Present Today</p>
                <p className="text-2xl font-bold text-slate-50">{stats.presentToday}</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-xs text-slate-400">Pending Requests</p>
                <p className="text-2xl font-bold text-slate-50">{stats.pendingRequests}</p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-xs text-slate-400">Avg Hours/Day</p>
                <p className="text-2xl font-bold text-slate-50">{stats.avgHoursPerDay}h</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Employee Management and Work Overview */}
          <div className="lg:col-span-2 space-y-6">
            <EmployeeTable employees={employees} />
            <WorkOverview workLogs={workLogs} employees={employees} />
            <AttendanceOverview timeLogs={timeLogs} employees={employees} />
          </div>

          {/* Right Column - Leave Requests */}
          <div>
            <LeaveRequestsCard requests={leaveRequests} employees={employees} />
          </div>
        </div>
      </main>

      {/* Create Employee Dialog */}
      <CreateEmployeeDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateEmployee}
      />
    </div>
  )
}
