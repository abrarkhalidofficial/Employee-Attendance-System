"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function LeavesPage() {
  const leaves = useQuery(api.leaves.list, {});
  const approveLeave = useMutation(api.leaves.approve);
  const rejectLeave = useMutation(api.leaves.reject);
  const [selectedLeave, setSelectedLeave] = useState<string | null>(null);

  const handleApprove = async (leaveId: string) => {
    try {
      // TODO: Get current user ID
      // await approveLeave({ leaveId, userId: currentUserId })
      setSelectedLeave(null);
    } catch (error) {
      console.error("Failed to approve leave:", error);
    }
  };

  const handleReject = async (leaveId: string) => {
    try {
      // TODO: Get current user ID
      // await rejectLeave({ leaveId, comments: 'Rejected', userId: currentUserId })
      setSelectedLeave(null);
    } catch (error) {
      console.error("Failed to reject leave:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
        <p className="text-muted-foreground">
          Manage employee leave requests and approvals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
          <CardDescription>
            Approve or reject employee leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaves === undefined ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : leaves.length === 0 ? (
            <p className="text-muted-foreground">No leave requests found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave: any) => (
                    <TableRow key={leave._id}>
                      <TableCell className="font-medium">
                        {leave.employeeName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{leave.leaveTypeName}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(leave.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(leave.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {leave.reason || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(leave.status)}>
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {leave.status === "PENDING" && (
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedLeave(leave._id)}
                                >
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Approve Leave Request
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to approve this leave
                                    request?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-4">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApprove(leave._id)}
                                  >
                                    Approve
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(leave._id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
