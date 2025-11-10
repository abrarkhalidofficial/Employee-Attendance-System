"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MoreVertical,
  User,
  Edit,
  Trash2,
  CheckCircle,
  PlayCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

interface TaskCardProps {
  task: any;
  userId: Id<"users">;
  userRole: "admin" | "employee";
  onEdit?: (task: any) => void;
  onViewDetails?: (task: any) => void;
}

export function TaskCard({
  task,
  userId,
  userRole,
  onEdit,
  onViewDetails,
}: TaskCardProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 hover:bg-red-600";
      case "high":
        return "bg-orange-500 hover:bg-orange-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "low":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600";
      case "in-progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "pending":
        return "bg-gray-500 hover:bg-gray-600";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in-progress":
        return <PlayCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    setIsUpdating(true);
    try {
      await updateTask({
        taskId: task._id,
        userId,
        status: newStatus,
      });
      toast({
        title: "✅ Status Updated",
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask({
        taskId: task._id,
        userId,
      });
      toast({
        title: "✅ Task Deleted",
        description: "Task has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed" &&
    task.status !== "cancelled";

  const canEdit = userRole === "admin" || task.assignedTo === userId;

  return (
    <>
      <Card
        className={`transition-all hover:shadow-md ${
          isOverdue ? "border-red-300 dark:border-red-800" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className="font-semibold text-lg cursor-pointer hover:text-primary"
                  onClick={() => onViewDetails?.(task)}
                >
                  {task.title}
                </h3>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails?.(task)}>
                  View Details
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(task)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Task
                    </DropdownMenuItem>
                    {task.status !== "in-progress" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("in-progress")}
                        disabled={isUpdating}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Task
                      </DropdownMenuItem>
                    )}
                    {task.status !== "completed" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange("completed")}
                        disabled={isUpdating}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Complete
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {userRole === "admin" && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Task
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Status and Priority */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getStatusColor(task.status)}>
              {getStatusIcon(task.status)}
              <span className="ml-1 capitalize">{task.status}</span>
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {getPriorityIcon(task.priority)} {task.priority}
            </Badge>
          </div>

          {/* Task Meta Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {task.assignedToName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Assigned to: <strong>{task.assignedToName}</strong>
                </span>
              </div>
            )}
            {task.assignedByName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Assigned by: <strong>{task.assignedByName}</strong>
                </span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Due:{" "}
                  <strong>
                    {format(new Date(task.dueDate), "MMM dd, yyyy")}
                  </strong>
                </span>
              </div>
            )}
            {task.estimatedHours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Estimated: <strong>{task.estimatedHours}h</strong>
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {task.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
