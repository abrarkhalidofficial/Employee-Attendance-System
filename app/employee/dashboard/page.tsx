"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardHeader } from "@/components/dashboard-header";

export default function EmployeeDashboard() {
  const { user, employee } = useAuth();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"break" | "task">(
    "break"
  );

  const todayHours = useQuery(api.workingHours.getTodayWorkingHours, {
    employeeId: employee?._id,
  });
  const startWorkDay = useMutation(api.workingHours.startWorkDay);
  const endWorkDay = useMutation(api.workingHours.endWorkDay);
  const updateStatus = useMutation(api.employees.updateEmployeeStatus);

  // Simulate elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      if (todayHours?.startTime && !todayHours?.endTime) {
        setElapsedTime((Date.now() - todayHours.startTime) / 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [todayHours]);

  const handleStartWork = async () => {
    if (!employee) return;
    try {
      await startWorkDay({ employeeId: employee._id });
    } catch (error) {
      console.error("Failed to start work day:", error);
    }
  };

  const handleEndWork = async () => {
    if (!employee) return;
    try {
      await endWorkDay({ employeeId: employee._id });
    } catch (error) {
      console.error("Failed to end work day:", error);
    }
  };

  const handleStatusChange = async () => {
    if (!employee || !user) return;
    try {
      await updateStatus({
        employeeId: employee._id,
        status: selectedStatus,
        reason: statusReason,
        userId: user._id,
      });
      setStatusDialogOpen(false);
      setStatusReason("");
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Employee Dashboard"
        subtitle="Track your working hours and status"
      />
      <div className="flex-1 overflow-auto p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Working Hours Card */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Working Hours</CardTitle>
              <CardDescription>Record your daily working time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Elapsed Time</p>
                <p className="text-4xl font-bold text-primary">
                  {formatTime(elapsedTime)}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleStartWork}
                  disabled={
                    todayHours?.startTime !== undefined && !todayHours?.endTime
                  }
                  className="flex-1"
                >
                  Start Work
                </Button>
                <Button
                  onClick={handleEndWork}
                  variant="outline"
                  disabled={
                    !todayHours?.startTime || todayHours?.endTime !== undefined
                  }
                  className="flex-1 bg-transparent"
                >
                  End Work
                </Button>
              </div>
              {todayHours && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {todayHours.startTime && (
                    <p>
                      Start:{" "}
                      {new Date(todayHours.startTime).toLocaleTimeString()}
                    </p>
                  )}
                  {todayHours.endTime && (
                    <p>
                      End: {new Date(todayHours.endTime).toLocaleTimeString()}
                    </p>
                  )}
                  {todayHours.totalHours && (
                    <p className="font-semibold text-foreground">
                      Total: {todayHours.totalHours.toFixed(2)}h
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>Update your availability status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge className="text-base py-2 px-3">Working</Badge>
              </div>
              <Dialog
                open={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Your Status</DialogTitle>
                    <DialogDescription>
                      Let your team know your current availability
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Status Type</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            selectedStatus === "break" ? "default" : "outline"
                          }
                          onClick={() => setSelectedStatus("break")}
                        >
                          On Break
                        </Button>
                        <Button
                          variant={
                            selectedStatus === "task" ? "default" : "outline"
                          }
                          onClick={() => setSelectedStatus("task")}
                        >
                          On Task
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        placeholder="Describe your status (e.g., lunch break, meeting)..."
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleStatusChange} className="w-full">
                      Update Status
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>Your work summary this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-foreground">40h</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Break Time</p>
                <p className="text-2xl font-bold text-foreground">2h 30m</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Tasks</p>
                <p className="text-2xl font-bold text-foreground">5</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Leaves</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
