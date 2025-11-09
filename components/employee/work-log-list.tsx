"use client"

import type { WorkLogDoc } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Clock, Trash2 } from "lucide-react"

interface WorkLogListProps {
  logs: WorkLogDoc[]
  onDelete?: (id: string) => void
}

export function WorkLogList({ logs, onDelete }: WorkLogListProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const totalTime = logs.reduce((sum, log) => sum + log.timeSpent, 0)

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-slate-50">Work Logs Today</h3>
          </div>
          {totalTime > 0 && (
            <p className="text-sm text-slate-400">
              Total time logged: <span className="text-cyan-400 font-semibold">{formatTime(totalTime)}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log._id} className="bg-slate-900 rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-slate-50 text-sm">{log.taskDescription}</p>
                    <p className="text-xs text-slate-500 mt-2">Logged at {log.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 text-xs font-semibold rounded">
                      {formatTime(log.timeSpent)}
                    </span>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(log._id)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition"
                        aria-label="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No work logs yet. Start logging your tasks!</p>
          )}
        </div>
      </div>
    </Card>
  )
}
