"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function WorkingHoursPage() {
  // TODO: Get employee ID from auth context
  const workingHours = useQuery(api.workingHours.getWorkingHoursByEmployee, { employeeId: null as any })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Working Hours History</h1>
        <p className="text-muted-foreground">View your complete working hours record</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Work Sessions</CardTitle>
          <CardDescription>Detailed list of your work sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {workingHours === undefined ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : workingHours.length === 0 ? (
            <p className="text-muted-foreground">No work sessions recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Break Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workingHours.map((session) => (
                    <TableRow key={session._id}>
                      <TableCell className="font-medium">{session.date}</TableCell>
                      <TableCell>{new Date(session.startTime).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        {session.endTime ? new Date(session.endTime).toLocaleTimeString() : "In Progress"}
                      </TableCell>
                      <TableCell>{session.totalHours ? `${session.totalHours.toFixed(2)}h` : "-"}</TableCell>
                      <TableCell>{session.breakDuration ? `${session.breakDuration}m` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
