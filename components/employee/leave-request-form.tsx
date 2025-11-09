"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CalendarDays, FileText } from "lucide-react"

type LeaveType = "sick" | "vacation" | "personal" | "unpaid"

interface LeaveRequestFormProps {
  onSubmit?: (data: {
    type: LeaveType
    startDate: string
    endDate: string
    reason: string
  }) => void
}

export function LeaveRequestForm({ onSubmit }: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    type: "vacation" as LeaveType,
    startDate: "",
    endDate: "",
    reason: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setFormData({
      type: "vacation",
      startDate: "",
      endDate: "",
      reason: "",
    })
  }

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-slate-50">Request Leave</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-50 mb-2">Leave Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveType })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 hover:border-slate-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-50 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 hover:border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-50 mb-2">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 hover:border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-50 mb-2">Reason</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
            rows={4}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 hover:border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Enter reason for leave..."
          />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <FileText className="w-4 h-4 mr-2" />
          Submit Request
        </Button>

        {submitted && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
            Leave request submitted successfully!
          </div>
        )}
      </form>
    </Card>
  )
}
