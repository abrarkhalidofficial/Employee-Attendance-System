"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";

export default function WorkingHoursPage() {
  const { employee } = useAuth();
  const workingHours = employee
    ? useQuery(api.workingHours.getWeeklySummary, { employeeId: employee._id })
    : null;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Working Hours History
        </h1>
        <p className="text-muted-foreground">
          View your complete working hours record
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Work Sessions</CardTitle>
          <CardDescription>Detailed list of your work sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {!workingHours ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : workingHours.entries.length === 0 ? (
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
                  {workingHours.entries.map((session: any) => (
                    <TableRow key={session._id}>
                      <TableCell className="font-medium">
                        {session.date}
                      </TableCell>
                      <TableCell>
                        {session.clockInAt
                          ? new Date(session.clockInAt).toLocaleTimeString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {session.clockOutAt
                          ? new Date(session.clockOutAt).toLocaleTimeString()
                          : "In Progress"}
                      </TableCell>
                      <TableCell>
                        {session.workedSeconds
                          ? `${(session.workedSeconds / 3600).toFixed(2)}h`
                          : "-"}
                      </TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
