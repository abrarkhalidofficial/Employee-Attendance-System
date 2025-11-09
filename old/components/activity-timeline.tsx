import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ActivityEntry {
  _id: string
  timestamp: number
  action: string
  entityType: string
  changes?: {
    before?: any
    after?: any
  }
}

interface ActivityTimelineProps {
  activities: ActivityEntry[]
  title?: string
  description?: string
}

export function ActivityTimeline({
  activities,
  title = "Activity Timeline",
  description = "Recent activities",
}: ActivityTimelineProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-blue-100 text-blue-800"
      case "UPDATE_STATUS":
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800"
      case "DELETE":
      case "DEACTIVATE":
        return "bg-red-100 text-red-800"
      case "APPROVE":
        return "bg-green-100 text-green-800"
      case "REJECT":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionLabel = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activities recorded</p>
          ) : (
            activities.map((activity, index) => (
              <div key={activity._id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mt-2" />
                  {index < activities.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getActionColor(activity.action)}>{getActionLabel(activity.action)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.entityType}</p>
                  {activity.changes?.after && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                        Details
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(activity.changes.after, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
