"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LeaveRequestForm } from "@/components/employee/leave-request-form"
import { LeaveHistory } from "@/components/employee/leave-history"
import { ArrowLeft } from "lucide-react"
import { useSession } from "@/components/providers/session-provider"
import type { LeaveRequestDoc } from "@/lib/types"
import type { Id } from "@/convex/_generated/dataModel"

export default function LeaveRequestsPage() {
  const router = useRouter()
  const { user, hydrated } = useSession()
  const leaveRequests = useQuery(
    api.leaveRequests.listForEmployee,
    user ? { employeeId: user._id as Id<"users"> } : undefined,
  ) as LeaveRequestDoc[] | undefined
  const createLeaveRequest = useMutation(api.leaveRequests.create)

  useEffect(() => {
    if (!hydrated) return
    if (!user || user.role !== "employee") {
      router.replace("/")
    }
  }, [hydrated, router, user])

  const handleSubmit = async ({
    type,
    startDate,
    endDate,
    reason,
  }: {
    type: "sick" | "vacation" | "personal" | "unpaid"
    startDate: string
    endDate: string
    reason: string
  }) => {
    if (!user) return
    await createLeaveRequest({
      employeeId: user._id as Id<"users">,
      type,
      startDate,
      endDate,
      reason,
    })
  }

  if (!hydrated || !user || user.role !== "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        Loading leave requests...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Leave Requests</h1>
            <p className="text-sm text-slate-400">Manage your leave</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeaveRequestForm onSubmit={handleSubmit} />
          <LeaveHistory requests={leaveRequests ?? []} />
        </div>
      </main>
    </div>
  )
}
