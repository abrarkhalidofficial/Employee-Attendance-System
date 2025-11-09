"use client"

import type { TimeLog, Employee } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AttendanceOverviewProps {
  timeLogs: TimeLog[]
  employees: Employee[]
}

export function AttendanceOverview({ timeLogs, employees }: AttendanceOverviewProps) {
  // Aggregate hours by employee
  const employeeHours = employees.map((emp) => {
    const logs = timeLogs.filter((log) => log.employeeId === emp.id)
    const totalHours = logs.reduce((sum, log) => sum + log.totalHours, 0)
    return {
      name: emp.name.split(" ")[0], // First name only
      hours: totalHours,
    }
  })

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">Attendance Overview</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={employeeHours} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(71, 85, 105)" />
          <XAxis dataKey="name" stroke="rgb(148, 163, 184)" />
          <YAxis stroke="rgb(148, 163, 184)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(30, 41, 59)",
              border: "1px solid rgb(71, 85, 105)",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "rgb(241, 245, 249)" }}
          />
          <Bar dataKey="hours" fill="rgb(59, 130, 246)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
