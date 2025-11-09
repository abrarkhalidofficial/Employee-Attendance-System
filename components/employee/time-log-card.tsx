"use client"

import { Card } from "@/components/ui/card"
import type { TimeLogDoc } from "@/lib/types"
import { Calendar } from "lucide-react"

interface TimeLogCardProps {
  logs: TimeLogDoc[]
}

export function TimeLogCard({ logs }: TimeLogCardProps) {
  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-50">Today's Summary</h3>
        </div>

        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log._id} className="bg-slate-900 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Check In</span>
                  <span className="font-mono text-slate-50">{log.checkIn}</span>
                </div>
                {log.checkOut && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Check Out</span>
                    <span className="font-mono text-slate-50">{log.checkOut}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Break Time</span>
                  <span className="font-mono text-slate-50">{log.breakTime} min</span>
                </div>
                {log.totalHours > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <span className="text-sm font-semibold text-slate-50">Total Hours</span>
                    <span className="font-mono text-green-400 font-bold">{log.totalHours}h</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No logs yet</p>
          )}
        </div>
      </div>
    </Card>
  )
}
