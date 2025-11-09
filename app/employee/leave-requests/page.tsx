"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LeaveRequestForm } from "@/components/employee/leave-request-form"
import { LeaveHistory } from "@/components/employee/leave-history"
import { mockLeaveRequests, mockEmployees } from "@/lib/mock-data"
import { ArrowLeft } from "lucide-react"

export default function LeaveRequestsPage() {
  const router = useRouter()
  const [requests] = useState(mockLeaveRequests)
  const currentEmployee = mockEmployees[0]

  const employeeRequests = requests.filter((r) => r.employeeId === currentEmployee.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeaveRequestForm />
          <LeaveHistory requests={employeeRequests} employees={mockEmployees} />
        </div>
      </main>
    </div>
  )
}
