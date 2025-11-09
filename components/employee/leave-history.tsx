"use client"

import type { LeaveRequestDoc } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle } from "lucide-react"

interface LeaveHistoryProps {
  requests: LeaveRequestDoc[]
}

export function LeaveHistory({ requests }: LeaveHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-amber-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400"
      case "rejected":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-amber-500/20 text-amber-400"
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">Leave History</h3>

      <div className="space-y-3">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request._id} className="bg-slate-900 rounded-lg p-4 flex items-start justify-between">
              <div className="flex gap-3 flex-1">
                <div className="mt-1">{getStatusIcon(request.status)}</div>
                <div className="flex-1">
                  <p className="font-medium text-slate-50 capitalize">{request.type} Leave</p>
                  <p className="text-xs text-slate-400">
                    {request.startDate} to {request.endDate}
                  </p>
                  <p className="text-sm text-slate-300 mt-1">{request.reason}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(
                  request.status,
                )}`}
              >
                {request.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No leave requests yet</p>
        )}
      </div>
    </Card>
  )
}
