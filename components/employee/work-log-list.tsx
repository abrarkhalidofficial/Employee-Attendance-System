"use client";

import type { WorkLogDoc } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Clock, Trash2 } from "lucide-react";

interface WorkLogListProps {
  logs: WorkLogDoc[];
  onDelete?: (id: string) => void;
}

export function WorkLogList({ logs, onDelete }: WorkLogListProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const totalTime = logs.reduce((sum, log) => sum + log.timeSpent, 0);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Work Logs Today
            </h3>
          </div>
          {totalTime > 0 && (
            <p className="text-sm text-muted-foreground">
              Total time logged:{" "}
              <span className="text-primary font-semibold">
                {formatTime(totalTime)}
              </span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log._id}
                className="bg-muted/50 rounded-lg p-4 space-y-2 border"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-foreground text-sm">
                      {log.taskDescription}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Logged at {log.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded border border-primary/20">
                      {formatTime(log.timeSpent)}
                    </span>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(log._id)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition"
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
            <p className="text-sm text-muted-foreground text-center py-4">
              No work logs yet. Start logging your tasks!
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
