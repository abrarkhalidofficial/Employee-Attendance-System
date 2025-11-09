"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { mockAdminUser } from "@/lib/mock-data"
import { LogIn, Lock } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (adminEmail === mockAdminUser.email && adminPassword === mockAdminUser.password) {
      router.push("/admin/dashboard")
    } else {
      setLoginError("Invalid email or password")
    }
  }

  if (showAdminLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="border-slate-700 bg-slate-800 w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-50 flex items-center justify-center gap-2 mb-2">
              <Lock className="w-8 h-8 text-blue-400" />
              Admin Login
            </h1>
            <p className="text-slate-400">Access the admin dashboard</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-blue-500"
                placeholder="admin@gmail.com"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </form>

          <button
            onClick={() => {
              setShowAdminLogin(false)
              setAdminEmail("")
              setAdminPassword("")
              setLoginError("")
            }}
            className="w-full text-sm text-slate-400 hover:text-slate-300 transition"
          >
            Back to Role Selection
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-50">TimeTrack</h1>
            <p className="text-slate-400">Employee Time & Leave Management</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/employee/dashboard")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Employee Dashboard
            </Button>
            <Button
              onClick={() => setShowAdminLogin(true)}
              variant="outline"
              className="w-full border-slate-600 text-slate-50 hover:bg-slate-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">Demo version with mock data. Select a role to continue.</p>
        </div>
      </Card>
    </div>
  )
}
