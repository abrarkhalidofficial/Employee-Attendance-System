"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Plus } from "lucide-react"

interface CreateEmployeeDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (employee: { name: string; email: string; password: string; department: string; position: string }) => void
}

const DEPARTMENTS = ["Engineering", "Product", "Sales", "Marketing", "HR", "Finance"]
const POSITIONS = [
  "Senior Developer",
  "Junior Developer",
  "Product Manager",
  "Sales Director",
  "Marketing Specialist",
  "HR Manager",
]

export function CreateEmployeeDialog({ isOpen, onClose, onCreate }: CreateEmployeeDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "Engineering",
    position: "Junior Developer",
  })

  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required")
      return
    }
    if (!formData.email.includes("@")) {
      setError("Valid email is required")
      return
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    onCreate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      position: formData.position,
    })

    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "Engineering",
      position: "Junior Developer",
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
      <Card className="border-slate-700 bg-slate-800 w-full max-w-md max-h-96 overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Create New Employee
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 text-sm focus:outline-none focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 text-sm focus:outline-none focus:border-blue-500"
                placeholder="john@company.com"
              />
            </div>

            {/* Department */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 text-sm focus:outline-none focus:border-blue-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-900">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 text-sm focus:outline-none focus:border-blue-500"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos} className="bg-slate-900">
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 text-sm focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 text-sm focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-50 hover:bg-slate-700 bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Create Employee
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
