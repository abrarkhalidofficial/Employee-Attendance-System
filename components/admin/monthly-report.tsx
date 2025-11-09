"use client"

import type { EmployeeDoc, TimeLogDoc } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MonthlyReportProps {
  timeLogs: TimeLogDoc[]
  employees: EmployeeDoc[]
}

export function MonthlyReport({ timeLogs, employees }: MonthlyReportProps) {
  const weeklyBuckets = timeLogs.reduce<Record<string, number>>((acc, log) => {
    const date = new Date(log.date)
    const weekNumber = `Week ${Math.min(4, Math.ceil(date.getDate() / 7))}`
    acc[weekNumber] = (acc[weekNumber] ?? 0) + log.totalHours
    return acc
  }, {})

  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
  const monthlyData = weeks.map((label) => ({
    week: label,
    hours: Number((weeklyBuckets[label] ?? 0).toFixed(1)),
    employees: employees.length,
  }))

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(71, 85, 105)" />
          <XAxis dataKey="week" stroke="rgb(148, 163, 184)" />
          <YAxis stroke="rgb(148, 163, 184)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(30, 41, 59)",
              border: "1px solid rgb(71, 85, 105)",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "rgb(241, 245, 249)" }}
          />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="rgb(139, 92, 246)"
            strokeWidth={2}
            dot={{ fill: "rgb(139, 92, 246)", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
