"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SettingsForm } from "@/components/common/settings-form"
import { ArrowLeft, LogOut } from "lucide-react"

export default function AdminSettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Settings</h1>
            <p className="text-sm text-slate-400">Administrator Settings</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Admin Profile */}
        <Card className="border-slate-700 bg-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">Admin Profile</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Name</p>
              <p className="text-lg font-medium text-slate-50">Administrator</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Role</p>
              <p className="text-lg font-medium text-slate-50">System Administrator</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Access Level</p>
              <p className="text-lg font-medium text-slate-50">Full Access</p>
            </div>
          </div>
        </Card>

        {/* Settings Form */}
        <SettingsForm userType="admin" />

        {/* System Settings */}
        <Card className="border-slate-700 bg-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-50 mb-4">System Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-900 border-slate-700" />
              <span className="text-sm text-slate-300">Allow employee self-service leave requests</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-900 border-slate-700" />
              <span className="text-sm text-slate-300">Require two-factor authentication</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded bg-slate-900 border-slate-700" />
              <span className="text-sm text-slate-300">Enable time tracking geolocation</span>
            </label>
          </div>
        </Card>

        {/* Logout Button */}
        <Button onClick={() => router.push("/")} className="w-full bg-red-600 hover:bg-red-700 text-white">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </main>
    </div>
  )
}
