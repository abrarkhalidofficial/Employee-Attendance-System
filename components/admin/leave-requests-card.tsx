"use client"

import type { LeaveRequest, Employee } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

interface LeaveRequestsCardProps {
  requests: LeaveRequest[]
  employees: Employee[]
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
}

export function LeaveRequestsCard({ requests, employees, onApprove, onReject }: LeaveRequestsCardProps) {
  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || "Unknown"
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">Pending Leave Requests ({pendingRequests.length})</h3>

      <div className="space-y-3">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <div key={request.id} className="bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-50">{getEmployeeName(request.employeeId)}</p>
                  <p className="text-xs text-slate-400">
                    {request.startDate} to {request.endDate}
                  </p>
                  <p className="text-sm text-slate-300 mt-1">{request.reason}</p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                  {request.type}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onApprove?.(request.id)}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => onReject?.(request.id)}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No pending requests</p>
        )}
      </div>
    </Card>
  )
}
