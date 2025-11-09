"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, Calendar } from "lucide-react";
import type { WorkLogDoc, EmployeeDoc } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";

interface WorkLogTableProps {
  workLogs: WorkLogDoc[];
  employees: EmployeeDoc[];
  onViewEmployee: (employeeId: Id<"users">) => void;
}

export function WorkLogTable({
  workLogs,
  employees,
  onViewEmployee,
}: WorkLogTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const getEmployeeInfo = (employeeId: string) => {
    return employees.find((e) => e._id === employeeId);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Pagination
  const totalPages = Math.ceil(workLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = workLogs.slice(startIndex, endIndex);

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-50">
          Work Log Details
        </h2>
        <p className="text-sm text-slate-400">
          Showing {startIndex + 1}-{Math.min(endIndex, workLogs.length)} of{" "}
          {workLogs.length} logs
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-700/50">
              <TableHead className="text-slate-300">Employee</TableHead>
              <TableHead className="text-slate-300">Department</TableHead>
              <TableHead className="text-slate-300">Task Description</TableHead>
              <TableHead className="text-slate-300">Date</TableHead>
              <TableHead className="text-slate-300">Time</TableHead>
              <TableHead className="text-slate-300">Time Spent</TableHead>
              <TableHead className="text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLogs.length > 0 ? (
              currentLogs.map((log) => {
                const employee = getEmployeeInfo(log.employeeId);
                return (
                  <TableRow
                    key={log._id}
                    className="border-slate-700 hover:bg-slate-700/50"
                  >
                    <TableCell className="font-medium text-slate-50">
                      {employee?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        {employee?.department || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-slate-300 max-w-xs truncate"
                      title={log.taskDescription}
                    >
                      {log.taskDescription}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(log.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.createdAt}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {formatTime(log.timeSpent)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewEmployee(log.employeeId)}
                        className="hover:bg-slate-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-slate-400 py-8"
                >
                  No work logs found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-slate-700 hover:bg-slate-700"
          >
            Previous
          </Button>
          <div className="text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-slate-700 hover:bg-slate-700"
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
}
