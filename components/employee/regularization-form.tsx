"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { AlertCircle, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface RegularizationFormProps {
  employeeId: Id<"users">;
}

export function RegularizationForm({ employeeId }: RegularizationFormProps) {
  const { toast } = useToast();
  const createRequest = useMutation(api.regularization.createRequest);
  const myRequests = useQuery(api.regularization.listByEmployee, {
    employeeId,
    limit: 10,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    requestType: "missing-checkin" as
      | "missing-checkin"
      | "missing-checkout"
      | "wrong-time"
      | "forgot-checkin",
    requestedCheckIn: "",
    requestedCheckOut: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      toast({
        title: "❌ Error",
        description: "Please provide a reason for this request",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        employeeId,
        date: formData.date,
        requestType: formData.requestType,
        requestedCheckIn: formData.requestedCheckIn || undefined,
        requestedCheckOut: formData.requestedCheckOut || undefined,
        reason: formData.reason,
      });
      toast({
        title: "✅ Request Submitted",
        description:
          "Your regularization request has been submitted for approval.",
      });
      // Reset form
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        requestType: "missing-checkin",
        requestedCheckIn: "",
        requestedCheckOut: "",
        reason: "",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-500"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "missing-checkin": "Missing Check-in",
      "missing-checkout": "Missing Check-out",
      "wrong-time": "Wrong Time",
      "forgot-checkin": "Forgot Check-in",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Attendance Regularization Request
          </CardTitle>
          <CardDescription>
            Submit a request to correct your attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                max={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>

            <div>
              <Label htmlFor="requestType">Request Type</Label>
              <Select
                value={formData.requestType}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, requestType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing-checkin">
                    Missing Check-in
                  </SelectItem>
                  <SelectItem value="missing-checkout">
                    Missing Check-out
                  </SelectItem>
                  <SelectItem value="wrong-time">Wrong Time</SelectItem>
                  <SelectItem value="forgot-checkin">
                    Forgot Check-in
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.requestType === "missing-checkin" ||
              formData.requestType === "wrong-time" ||
              formData.requestType === "forgot-checkin") && (
              <div>
                <Label
                  htmlFor="requestedCheckIn"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Requested Check-in Time
                </Label>
                <Input
                  id="requestedCheckIn"
                  type="time"
                  value={formData.requestedCheckIn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requestedCheckIn: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {(formData.requestType === "missing-checkout" ||
              formData.requestType === "wrong-time") && (
              <div>
                <Label
                  htmlFor="requestedCheckOut"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Requested Check-out Time
                </Label>
                <Input
                  id="requestedCheckOut"
                  type="time"
                  value={formData.requestedCheckOut}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requestedCheckOut: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Explain why you need this regularization..."
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>Your recent regularization requests</CardDescription>
        </CardHeader>
        <CardContent>
          {!myRequests || myRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No requests yet
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{request.date}</span>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getRequestTypeLabel(request.requestType)}
                  </div>
                  {request.requestedCheckIn && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Check-in: </span>
                      <span className="font-medium">
                        {request.requestedCheckIn}
                      </span>
                    </div>
                  )}
                  {request.requestedCheckOut && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Check-out: </span>
                      <span className="font-medium">
                        {request.requestedCheckOut}
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                    <strong>Reason:</strong> {request.reason}
                  </div>
                  {request.reviewNotes && (
                    <div
                      className={`text-sm p-2 rounded border ${
                        request.status === "approved"
                          ? "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                      }`}
                    >
                      <strong>Review:</strong> {request.reviewNotes}
                      {request.reviewer && (
                        <span className="block text-xs mt-1 opacity-80">
                          by {request.reviewer.name}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground/60">
                    Submitted:{" "}
                    {new Date(request.createdAt).toLocaleString("en-US", {
                      timeZone: "Asia/Karachi",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
