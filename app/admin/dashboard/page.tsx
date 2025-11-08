"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityTimeline } from "@/components/activity-timeline"
import { StatusBadge } from "@/components/status-badge"

export default function AdminDashboard() {
  const employees = useQuery(api.employees.getAllEmployees)
  const recentActivities = useQuery(api.statusHistory.getRecentStatusHistory, { limit: 10 })

  const stats = employees
    ? {
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === "active").length,
        onBreak: employees.filter((e) => e.currentStatus === "break").length,
        onTask: employees.filter((e) => e.currentStatus === "task").length,
      }
    : null

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of employee attendance and status</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalEmployees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-chart-1">{stats.activeEmployees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">On Break</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-chart-2">{stats.onBreak}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">On Task</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-chart-3">{stats.onTask}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Employee Status</CardTitle>
              <CardDescription>Real-time status of all employees</CardDescription>
            </CardHeader>
            <CardContent>
              {employees === undefined ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : employees.length === 0 ? (
                <p className="text-muted-foreground">No employees found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees.map((employee) => (
                    <Card key={employee._id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                          <StatusBadge status={employee.currentStatus} reason={employee.statusReason} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <ActivityTimeline
          activities={recentActivities || []}
          title="Recent Updates"
          description="Status changes across system"
        />
      </div>
    </div>
  )
}
