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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

interface AttendanceTrackerProps {
  employeeId: Id<"users">;
}

export function AttendanceTracker({ employeeId }: AttendanceTrackerProps) {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState<string>("");
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
  const updateBreakTime = useMutation(api.attendance.updateBreakTime);

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

      {/* Check In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>Track your daily attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          {todayAttendance && (
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
                <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/50 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>Late by {todayAttendance.lateBy} minutes</span>
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
