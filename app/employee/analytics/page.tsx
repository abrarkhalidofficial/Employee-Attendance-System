"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function AnalyticsPage() {
  // TODO: Get employee ID from auth context
  const workingHours = useQuery(api.workingHours.getWorkingHoursByEmployee, { employeeId: null as any })

  // Sample data for charts
  const weeklyData = [
    { day: "Mon", hours: 8.5, breaks: 0.5 },
    { day: "Tue", hours: 8.2, breaks: 0.8 },
    { day: "Wed", hours: 8.0, breaks: 0.5 },
    { day: "Thu", hours: 8.3, breaks: 0.7 },
    { day: "Fri", hours: 7.5, breaks: 1.0 },
  ]

  const monthlyData = [
    { week: "Week 1", hours: 40 },
    { week: "Week 2", hours: 40 },
    { week: "Week 3", hours: 39.5 },
    { week: "Week 4", hours: 38.5 },
  ]

  const stats = {
    averageDaily: 8.1,
    totalThisMonth: 158,
    leavesTaken: 3,
    upcomingLeaves: 1,
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Work Analytics</h1>
        <p className="text-muted-foreground">View your productivity and working patterns</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Daily Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.averageDaily}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalThisMonth}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leaves Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.leavesTaken}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.upcomingLeaves}</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Working Hours</CardTitle>
          <CardDescription>Hours worked each day this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="var(--color-chart-1)" name="Working Hours" />
              <Bar dataKey="breaks" fill="var(--color-chart-2)" name="Break Time" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Working hours trend across weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hours" stroke="var(--color-chart-2)" name="Weekly Hours" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
