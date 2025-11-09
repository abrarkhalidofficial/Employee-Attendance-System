"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LeaveRequestForm } from "@/components/employee/leave-request-form";
import { LeaveHistory } from "@/components/employee/leave-history";
import { useSession } from "@/components/providers/session-provider";
import type { LeaveRequestDoc } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";

export default function LeaveRequestsPage() {
  const router = useRouter();
  const { user, hydrated } = useSession();
  const leaveRequests = useQuery(
    api.leaveRequests.listForEmployee,
    user ? { employeeId: user._id as Id<"users"> } : "skip"
  ) as LeaveRequestDoc[] | undefined;
  const createLeaveRequest = useMutation(api.leaveRequests.create);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "employee") {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  const handleSubmit = async ({
    type,
    startDate,
    endDate,
    reason,
  }: {
    type: "sick" | "vacation" | "personal" | "unpaid";
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    if (!user) return;
    await createLeaveRequest({
      employeeId: user._id as Id<"users">,
      type,
      startDate,
      endDate,
      reason,
    });
  };

  if (!hydrated || !user || user.role !== "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            📝 Leave Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Request and manage your time off
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeaveRequestForm onSubmit={handleSubmit} />
          <LeaveHistory requests={leaveRequests ?? []} />
        </div>
      </main>
    </div>
  );
}
