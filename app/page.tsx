"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogIn, Lock, UserRound } from "lucide-react"
import { useSession } from "@/components/providers/session-provider"

type LoginMode = "choice" | "admin" | "employee"

export default function Home() {
  const router = useRouter()
  const { setUser } = useSession()
  const loginMutation = useMutation(api.users.login)
  const [mode, setMode] = useState<LoginMode>("choice")
  const [adminEmail, setAdminEmail] = useState("admin@gmail.com")
  const [adminPassword, setAdminPassword] = useState("")
  const [employeeEmail, setEmployeeEmail] = useState("")
  const [employeePassword, setEmployeePassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loadingRole, setLoadingRole] = useState<null | "admin" | "employee">(null)

  const resetState = () => {
    setMode("choice")
    setLoginError("")
    setLoadingRole(null)
  }

  const handleLogin = async (role: "admin" | "employee", event: React.FormEvent) => {
    event.preventDefault()
    setLoginError("")
    setLoadingRole(role)
    const email = role === "admin" ? adminEmail : employeeEmail
    const password = role === "admin" ? adminPassword : employeePassword

    try {
      const user = await loginMutation({ email, password, role })
      setUser({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department ?? "",
        position: user.position ?? "",
        joinDate: user.joinDate ?? "",
      })
      router.push(role === "admin" ? "/admin/dashboard" : "/employee/dashboard")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed. Check your credentials and try again."
      setLoginError(message)
    } finally {
      setLoadingRole(null)
    }
  }

  const renderLoginForm = (role: "admin" | "employee") => {
    const isAdmin = role === "admin"
    const email = isAdmin ? adminEmail : employeeEmail
    const password = isAdmin ? adminPassword : employeePassword
    const setEmail = isAdmin ? setAdminEmail : setEmployeeEmail
    const setPassword = isAdmin ? setAdminPassword : setEmployeePassword

    return (
      <Card className="border-slate-700 bg-slate-800 w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-50 flex items-center justify-center gap-2 mb-2">
            {isAdmin ? <Lock className="w-8 h-8 text-blue-400" /> : <UserRound className="w-8 h-8 text-green-400" />}
            {isAdmin ? "Admin Login" : "Employee Login"}
          </h1>
          <p className="text-slate-400">
            {isAdmin ? "Manage company-wide data" : "Track your time and leave in real time"}
          </p>
        </div>

        {loginError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-400">{loginError}</p>
          </div>
        )}

        <form onSubmit={(event) => handleLogin(role, event)} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-blue-500"
              placeholder={isAdmin ? "admin@company.com" : "you@company.com"}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loadingRole !== null}>
            <LogIn className="w-4 h-4 mr-2" />
            {loadingRole === role ? "Signing in..." : "Login"}
          </Button>
        </form>

        <button onClick={resetState} className="w-full text-sm text-slate-400 hover:text-slate-300 transition">
          Back to Role Selection
        </button>
      </Card>
    )
  }

  if (mode !== "choice") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        {renderLoginForm(mode)}
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
            <Button onClick={() => setMode("employee")} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Employee Login
            </Button>
            <Button
              onClick={() => setMode("admin")}
              variant="outline"
              className="w-full border-slate-600 text-slate-50 hover:bg-slate-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Connects directly to your Convex deployment for live attendance data.
          </p>
        </div>
      </Card>
    </div>
  )
}
