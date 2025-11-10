"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  User,
  Tag,
  MessageSquare,
  CheckCircle,
  PlayCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  userId: Id<"users">;
  userName: string;
  userRole: "admin" | "employee";
}

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
  userId,
  userName,
  userRole,
}: TaskDetailsDialogProps) {
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addComment = useMutation(api.tasks.addComment);
  const updateTask = useMutation(api.tasks.update);

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast({
        title: "❌ Validation Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment({
        taskId: task._id,
        userId,
        comment: comment.trim(),
      });
      setComment("");
      toast({
        title: "✅ Comment Added",
        description: "Your comment has been added successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: any) => {
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
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed" &&
    task.status !== "cancelled";

  const canEdit = userRole === "admin" || task.assignedTo === userId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-2xl">{task.title}</DialogTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(task.status)}>
                {getStatusIcon(task.status)}
                <span className="ml-1 capitalize">{task.status}</span>
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {task.description || "No description provided"}
            </p>
          </div>

          <Separator />

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* Assigned To */}
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{task.assignedToName}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.assignedToEmail}
                  </p>
                </div>
              </div>

              {/* Assigned By */}
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Assigned By</p>
                  <p className="font-medium">{task.assignedByName}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.assignedByEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Start Date */}
              {task.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {format(new Date(task.startDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p
                      className={`font-medium ${
                        isOverdue ? "text-red-600" : ""
                      }`}
                    >
                      {format(new Date(task.dueDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              {/* Estimated Hours */}
              {task.estimatedHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Estimated Hours
                    </p>
                    <p className="font-medium">{task.estimatedHours}h</p>
                  </div>
                </div>
              )}

              {/* Actual Hours */}
              {task.actualHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Actual Hours
                    </p>
                    <p className="font-medium">{task.actualHours}h</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Tags</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {task.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Quick Actions */}
          {canEdit && task.status !== "completed" && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="flex gap-2 flex-wrap">
                  {task.status !== "in-progress" && (
                    <Button
                      onClick={() => handleStatusChange("in-progress")}
                      size="sm"
                      variant="outline"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Task
                    </Button>
                  )}
                  {task.status !== "completed" && (
                    <Button
                      onClick={() => handleStatusChange("completed")}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Comments Section */}
          <Separator />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Comments</h3>
            </div>

            {/* Existing Comments */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment: any, index: number) => (
                  <div
                    key={index}
                    className="bg-muted/50 rounded-lg p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.timestamp), "MMM dd, hh:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {comment.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet
                </p>
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAddComment}
                disabled={isSubmitting || !comment.trim()}
                size="sm"
              >
                Add Comment
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
