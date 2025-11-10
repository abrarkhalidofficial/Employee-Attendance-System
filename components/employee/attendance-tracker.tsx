"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  LogIn,
  LogOut,
  Coffee,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

interface AttendanceTrackerProps {
  employeeId: Id<"users">;
}

export function AttendanceTracker({ employeeId }: AttendanceTrackerProps) {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [workingTime, setWorkingTime] = useState<number>(0); // in seconds
  const [breakTime, setBreakTime] = useState<number>(0); // in seconds
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const todayAttendance = useQuery(api.attendance.getTodayAttendance, {
    employeeId,
  });
  const checkIn = useMutation(api.attendance.checkIn);
  const checkOut = useMutation(api.attendance.checkOut);
  const startBreak = useMutation(api.attendance.startBreak);
  const endBreak = useMutation(api.attendance.endBreak);

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate working time in real-time
  useEffect(() => {
    if (!todayAttendance?.checkIn || todayAttendance?.checkOut) {
      return;
    }

    const calculateWorkingTime = () => {
      const [checkInHour, checkInMin] = todayAttendance
        .checkIn!.split(":")
        .map(Number);
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentSec = now.getSeconds();

      const checkInSeconds = checkInHour * 3600 + checkInMin * 60;
      const currentSeconds = currentHour * 3600 + currentMin * 60 + currentSec;
      const elapsedSeconds = currentSeconds - checkInSeconds;

      // Subtract break time
      const totalBreakSeconds = (todayAttendance.breakTime || 0) * 60;

      // If on break, don't count current break time in working hours
      if (todayAttendance.isOnBreak && todayAttendance.currentBreakStartTime) {
        const [breakStartHour, breakStartMin] =
          todayAttendance.currentBreakStartTime.split(":").map(Number);
        const breakStartSeconds = breakStartHour * 3600 + breakStartMin * 60;
        const currentBreakSeconds = currentSeconds - breakStartSeconds;
        setBreakTime(totalBreakSeconds + currentBreakSeconds);
        setWorkingTime(
          Math.max(0, elapsedSeconds - totalBreakSeconds - currentBreakSeconds)
        );
      } else {
        setBreakTime(totalBreakSeconds);
        setWorkingTime(Math.max(0, elapsedSeconds - totalBreakSeconds));
      }
    };

    calculateWorkingTime();
    const interval = setInterval(calculateWorkingTime, 1000);
    return () => clearInterval(interval);
  }, [todayAttendance]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError(
            "Unable to get location. Please enable location services."
          );
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleCheckIn = async () => {
    try {
      await checkIn({
        employeeId,
        location: location || undefined,
      });
      toast({
        title: "✅ Checked In",
        description: "Your check-in has been recorded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to check in",
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut({
        employeeId,
        breakTime: todayAttendance?.breakTime,
      });
      toast({
        title: "✅ Checked Out",
        description: "Your check-out has been recorded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to check out",
        variant: "destructive",
      });
    }
  };

  const handleStartBreak = async () => {
    try {
      await startBreak({ employeeId });
      toast({
        title: "☕ Break Started",
        description: "Enjoy your break! Your working time is paused.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to start break",
        variant: "destructive",
      });
    }
  };

  const handleEndBreak = async () => {
    try {
      await endBreak({ employeeId });
      toast({
        title: "✅ Break Ended",
        description: "Welcome back! Your working time has resumed.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to end break",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    if (!todayAttendance) return null;

    const statusColors: Record<string, string> = {
      present: "bg-green-500",
      late: "bg-yellow-500",
      absent: "bg-red-500",
      "half-day": "bg-orange-500",
      "on-leave": "bg-blue-500",
    };

    return (
      <Badge className={statusColors[todayAttendance.status] || "bg-gray-500"}>
        {todayAttendance.status.toUpperCase()}
      </Badge>
    );
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;

  return (
    <div className="space-y-4">
      {/* Current Time Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Current Time (PKT)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">{currentTime}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              timeZone: "Asia/Karachi",
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </CardContent>
      </Card>

      {/* Working Hours Display (when checked in) */}
      {isCheckedIn && (
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    {todayAttendance?.isOnBreak ? "On Break" : "Working"}
                  </span>
                </div>
                {getStatusBadge()}
              </div>

              {/* Working Time Counter */}
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-xs text-muted-foreground mb-1">
                  Working Time
                </div>
                <div className="text-3xl font-mono font-bold text-primary">
                  {formatTime(workingTime)}
                </div>
              </div>

              {/* Break Time Display */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-card rounded-lg p-3 border">
                  <div className="text-xs text-muted-foreground mb-1">
                    Break Time
                  </div>
                  <div className="text-lg font-mono font-semibold text-foreground">
                    {formatTime(breakTime)}
                  </div>
                </div>
                <div className="bg-card rounded-lg p-3 border">
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Time
                  </div>
                  <div className="text-lg font-mono font-semibold text-foreground">
                    {formatTime(workingTime + breakTime)}
                  </div>
                </div>
              </div>

              {/* Break Controls */}
              {!todayAttendance?.isOnBreak ? (
                <Button
                  onClick={handleStartBreak}
                  variant="outline"
                  className="w-full"
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  Start Break
                </Button>
              ) : (
                <Button
                  onClick={handleEndBreak}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  End Break & Resume Work
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>Track your daily attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          {todayAttendance && !isCheckedIn && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge()}
            </div>
          )}

          {/* Check-in/out Times */}
          {todayAttendance && (
            <div className="space-y-2">
              {todayAttendance.checkIn && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-green-600" />
                    Check-in:
                  </span>
                  <span className="font-medium">{todayAttendance.checkIn}</span>
                </div>
              )}
              {todayAttendance.checkOut && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-red-600" />
                    Check-out:
                  </span>
                  <span className="font-medium">
                    {todayAttendance.checkOut}
                  </span>
                </div>
              )}
              {todayAttendance.totalHours > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Total Hours:
                  </span>
                  <span className="font-medium">
                    {formatHours(todayAttendance.totalHours)}
                  </span>
                </div>
              )}
              {todayAttendance.isLate && (
                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-2 rounded border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">
                      Late by {todayAttendance.lateBy} minutes
                    </div>
                    <div className="text-xs">
                      ⚠️ Penalty: {todayAttendance.latePenalty || 1} point(s)
                    </div>
                  </div>
                </div>
              )}
              {todayAttendance.overtimeHours &&
                todayAttendance.overtimeHours > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 p-2 rounded border border-green-200 dark:border-green-800">
                    <span>🎉 Overtime:</span>
                    <span className="font-medium">
                      {formatHours(todayAttendance.overtimeHours)}
                    </span>
                  </div>
                )}
            </div>
          )}

          {/* Location Status */}
          {locationError ? (
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2 rounded border border-amber-200 dark:border-amber-800">
              <MapPin className="h-4 w-4" />
              <span>{locationError}</span>
            </div>
          ) : location ? (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 p-2 rounded border border-green-200 dark:border-green-800">
              <MapPin className="h-4 w-4" />
              <span>Location detected ✓</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 animate-pulse" />
              <span>Getting location...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!todayAttendance?.checkIn ? (
              <Button
                onClick={handleCheckIn}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Check In
              </Button>
            ) : !todayAttendance?.checkOut ? (
              <Button
                onClick={handleCheckOut}
                className="flex-1 bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Check Out
              </Button>
            ) : (
              <div className="flex-1 text-center py-3 bg-muted rounded-md text-sm text-muted-foreground">
                ✓ Attendance completed for today
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
