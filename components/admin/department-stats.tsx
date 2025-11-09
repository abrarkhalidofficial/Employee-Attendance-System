"use client"

import type { EmployeeDoc, TimeLogDoc } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DepartmentStatsProps {
  employees: EmployeeDoc[]
  timeLogs: TimeLogDoc[]
}

export function DepartmentStats({ employees, timeLogs }: DepartmentStatsProps) {
  const departments = Array.from(new Set(employees.map((e) => e.department)))

  const departmentData = departments.map((dept) => {
    const deptEmployees = employees.filter((e) => e.department === dept)
    const deptLogs = timeLogs.filter((log) => deptEmployees.some((emp) => emp._id === log.employeeId))
    const avgHours =
      deptLogs.length > 0 ? deptLogs.reduce((sum, log) => sum + log.totalHours, 0) / deptLogs.length : 0

    return {
      name: dept,
      employees: deptEmployees.length,
      avgHours: Number(avgHours.toFixed(1)),
    }
  })

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">Department Analytics</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={departmentData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
          <Bar dataKey="avgHours" fill="rgb(16, 185, 129)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
