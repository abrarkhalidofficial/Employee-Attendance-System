"use client"

import type { LeaveRequestDoc } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface LeaveAnalyticsProps {
  requests: LeaveRequestDoc[]
}

export function LeaveAnalytics({ requests }: LeaveAnalyticsProps) {
  const leaveTypeData = [
    {
      name: "Vacation",
      value: requests.filter((r) => r.type === "vacation").length,
    },
    {
      name: "Sick Leave",
      value: requests.filter((r) => r.type === "sick").length,
    },
    {
      name: "Personal",
      value: requests.filter((r) => r.type === "personal").length,
    },
    {
      name: "Unpaid",
      value: requests.filter((r) => r.type === "unpaid").length,
    },
  ]

  const COLORS = ["rgb(59, 130, 246)", "rgb(239, 68, 68)", "rgb(251, 146, 60)", "rgb(168, 85, 247)"]

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">Leave Type Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={leaveTypeData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {leaveTypeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(30, 41, 59)",
              border: "1px solid rgb(71, 85, 105)",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "rgb(241, 245, 249)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
