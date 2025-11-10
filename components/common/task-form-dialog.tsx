"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignedBy: Id<"users">;
  taskToEdit?: any;
  mode: "create" | "edit";
}

export function TaskFormDialog({
  open,
  onOpenChange,
  assignedBy,
  taskToEdit,
  mode,
}: TaskFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    dueDate: "",
    startDate: "",
    estimatedHours: "",
    tags: "",
  });

  const employees = useQuery(api.users.listEmployees) || [];
  const activeEmployees = employees.filter(
    (emp: any) => emp.role === "employee" && emp.status === "active"
  );

  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);

  useEffect(() => {
    if (mode === "edit" && taskToEdit) {
      setFormData({
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        assignedTo: taskToEdit.assignedTo || "",
        priority: taskToEdit.priority || "medium",
        dueDate: taskToEdit.dueDate || "",
        startDate: taskToEdit.startDate || "",
        estimatedHours: taskToEdit.estimatedHours?.toString() || "",
        tags: taskToEdit.tags?.join(", ") || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
        startDate: "",
        estimatedHours: "",
        tags: "",
      });
    }
  }, [mode, taskToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "❌ Validation Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.assignedTo) {
      toast({
        title: "❌ Validation Error",
        description: "Please select an employee to assign the task",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      if (mode === "create") {
        await createTask({
          title: formData.title,
          description: formData.description,
          assignedTo: formData.assignedTo as Id<"users">,
          assignedBy,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          startDate: formData.startDate || undefined,
          estimatedHours: formData.estimatedHours
            ? parseFloat(formData.estimatedHours)
            : undefined,
          tags: tags.length > 0 ? tags : undefined,
        });

        toast({
          title: "✅ Task Created",
          description: "Task has been created successfully",
        });
      } else {
        await updateTask({
          taskId: taskToEdit._id,
          userId: assignedBy,
          title: formData.title,
          description: formData.description,
          assignedTo: formData.assignedTo as Id<"users">,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          startDate: formData.startDate || undefined,
          estimatedHours: formData.estimatedHours
            ? parseFloat(formData.estimatedHours)
            : undefined,
          tags: tags.length > 0 ? tags : undefined,
        });

        toast({
          title: "✅ Task Updated",
          description: "Task has been updated successfully",
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to save task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Assign a new task to an employee"
              : "Update task details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Task Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          {/* Assign To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">
              Assign To <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) =>
                setFormData({ ...formData, assignedTo: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {activeEmployees.map((emp: any) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority and Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g., 8"
                value={formData.estimatedHours}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedHours: e.target.value })
                }
              />
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., frontend, bug-fix, urgent"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "Create Task" : "Update Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
