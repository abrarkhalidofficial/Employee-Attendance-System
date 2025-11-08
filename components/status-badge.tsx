import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: "working" | "break" | "task" | "offline"
  reason?: string
}

export function StatusBadge({ status, reason }: StatusBadgeProps) {
  const colors: Record<string, string> = {
    working: "bg-green-100 text-green-800",
    break: "bg-yellow-100 text-yellow-800",
    task: "bg-blue-100 text-blue-800",
    offline: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={colors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
      {reason && <span className="text-xs text-muted-foreground">• {reason}</span>}
    </div>
  )
}
