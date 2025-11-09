"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function ActivityPage() {
  const activityLogs = useQuery(api.activityLog.getActivityLogs)

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-blue-100 text-blue-800"
      case "UPDATE":
      case "UPDATE_STATUS":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
      case "DEACTIVATE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>All activities performed in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLogs === undefined ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : activityLogs.length === 0 ? (
            <p className="text-muted-foreground">No activities recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.entityType}</TableCell>
                      <TableCell className="text-sm font-mono">{log.entityId}</TableCell>
                      <TableCell>
                        <details className="cursor-pointer">
                          <summary className="text-sm text-muted-foreground hover:text-foreground">View</summary>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-xs">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </details>
                      </TableCell>
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
