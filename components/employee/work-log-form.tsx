"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";

interface WorkLogFormProps {
  onSubmit: (
    taskDescription: string,
    timeSpent: number
  ) => Promise<void> | void;
}

export function WorkLogForm({ onSubmit }: WorkLogFormProps) {
  const [taskDescription, setTaskDescription] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim() || !timeSpent) return;

    setIsSubmitting(true);
    try {
      await onSubmit(taskDescription, Number.parseInt(timeSpent));
      setTaskDescription("");
      setTimeSpent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Log Work</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              What did you work on?
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe the task or work completed..."
              className="w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Time spent (minutes)
            </label>
            <input
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="e.g., 60"
              min="1"
              className="w-full px-3 py-2 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !taskDescription.trim() || !timeSpent}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? "Adding..." : "Add Work Log"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
