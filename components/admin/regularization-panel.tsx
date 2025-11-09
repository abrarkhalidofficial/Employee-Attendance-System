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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, XCircle, Clock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewDialogProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  adminId: Id<"users">;
}

function ReviewDialog({
  request,
  isOpen,
  onClose,
  adminId,
}: ReviewDialogProps) {
  const { toast } = useToast();
  const approveRequest = useMutation(api.regularization.approveRequest);
  const rejectRequest = useMutation(api.regularization.rejectRequest);

  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await approveRequest({
        requestId: request._id,
        reviewerId: adminId,
        reviewNotes: reviewNotes || undefined,
      });
      toast({
        title: "✅ Request Approved",
        description: "The regularization request has been approved.",
      });
      onClose();
      setReviewNotes("");
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      toast({
        title: "❌ Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await rejectRequest({
        requestId: request._id,
        reviewerId: adminId,
        reviewNotes,
      });
      toast({
        title: "✅ Request Rejected",
        description: "The regularization request has been rejected.",
      });
      onClose();
      setReviewNotes("");
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Regularization Request</DialogTitle>
          <DialogDescription>
            Review and approve or reject this attendance regularization request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Details */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="font-semibold">Employee:</span>
              <span>{request.employee?.name}</span>
              <Badge variant="outline">{request.employee?.department}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="font-semibold">Date:</span>
              <span>{request.date}</span>
            </div>
            <div>
              <span className="font-semibold">Request Type:</span>{" "}
              {getRequestTypeLabel(request.requestType)}
            </div>
            {request.requestedCheckIn && (
              <div>
                <span className="font-semibold">Requested Check-in:</span>{" "}
                <span className="text-green-600 font-mono">
                  {request.requestedCheckIn}
                </span>
              </div>
            )}
            {request.requestedCheckOut && (
              <div>
                <span className="font-semibold">Requested Check-out:</span>{" "}
                <span className="text-red-600 font-mono">
                  {request.requestedCheckOut}
                </span>
              </div>
            )}
            <div className="pt-2 border-t">
              <div className="font-semibold mb-1">Reason:</div>
              <div className="bg-white p-3 rounded border">
                {request.reason}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Submitted:{" "}
              {new Date(request.createdAt).toLocaleString("en-US", {
                timeZone: "Asia/Karachi",
              })}
            </div>
          </div>

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Review Notes{" "}
              <span className="text-gray-500">
                (optional for approval, required for rejection)
              </span>
            </label>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add your comments..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RegularizationPanel({ adminId }: { adminId: Id<"users"> }) {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const allRequests = useQuery(api.regularization.listAll, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const pendingCount = useQuery(api.regularization.listPending)?.length || 0;

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
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-linear-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Regularization Requests
          </CardTitle>
          <CardDescription>
            Review and process attendance regularization requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter */}
          <div className="flex gap-4">
            <div className="flex-1 max-w-xs">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requests */}
          {!allRequests || allRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No requests found
            </div>
          ) : (
            <div className="space-y-3">
              {allRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer space-y-2"
                  onClick={() =>
                    request.status === "pending" && setSelectedRequest(request)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">
                          {request.employee?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {request.employee?.email}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {request.employee?.department}
                      </Badge>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date:</span>{" "}
                      <span className="font-medium">{request.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>{" "}
                      <span className="font-medium">
                        {getRequestTypeLabel(request.requestType)}
                      </span>
                    </div>
                  </div>

                  {(request.requestedCheckIn || request.requestedCheckOut) && (
                    <div className="flex gap-4 text-sm">
                      {request.requestedCheckIn && (
                        <div>
                          <span className="text-gray-600">Check-in:</span>{" "}
                          <span className="font-mono font-medium text-green-600">
                            {request.requestedCheckIn}
                          </span>
                        </div>
                      )}
                      {request.requestedCheckOut && (
                        <div>
                          <span className="text-gray-600">Check-out:</span>{" "}
                          <span className="font-mono font-medium text-red-600">
                            {request.requestedCheckOut}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                    <strong>Reason:</strong> {request.reason}
                  </div>

                  {request.reviewNotes && (
                    <div
                      className={`text-sm p-2 rounded ${
                        request.status === "approved"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <strong>Review:</strong> {request.reviewNotes}
                      {request.reviewer && (
                        <span className="block text-xs mt-1">
                          by {request.reviewer.name}
                          {request.reviewedAt && (
                            <>
                              {" "}
                              on{" "}
                              {new Date(request.reviewedAt).toLocaleString(
                                "en-US",
                                {
                                  timeZone: "Asia/Karachi",
                                }
                              )}
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  )}

                  {request.status === "pending" && (
                    <Button
                      onClick={() => setSelectedRequest(request)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Review Request
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedRequest && (
        <ReviewDialog
          request={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          adminId={adminId}
        />
      )}
    </div>
  );
}
