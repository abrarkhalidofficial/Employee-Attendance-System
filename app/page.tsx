"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogIn, Lock, UserRound } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";

type LoginMode = "choice" | "admin" | "employee";

export default function Home() {
  const router = useRouter();
  const { setUser } = useSession();
  const loginMutation = useMutation(api.users.login);
  const [mode, setMode] = useState<LoginMode>("choice");
  const [adminEmail, setAdminEmail] = useState("admin@gmail.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingRole, setLoadingRole] = useState<null | "admin" | "employee">(
    null
  );

  const resetState = () => {
    setMode("choice");
    setLoginError("");
    setLoadingRole(null);
  };

  const handleLogin = async (
    role: "admin" | "employee",
    event: React.FormEvent
  ) => {
    event.preventDefault();
    setLoginError("");
    setLoadingRole(role);
    const email = role === "admin" ? adminEmail : employeeEmail;
    const password = role === "admin" ? adminPassword : employeePassword;

    try {
      const user = await loginMutation({ email, password, role });
      setUser({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department ?? "",
        position: user.position ?? "",
        joinDate: user.joinDate ?? "",
      });
      router.push(
        role === "admin" ? "/admin/dashboard" : "/employee/dashboard"
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Check your credentials and try again.";
      setLoginError(message);
    } finally {
      setLoadingRole(null);
    }
  };

  const renderLoginForm = (role: "admin" | "employee") => {
    const isAdmin = role === "admin";
    const email = isAdmin ? adminEmail : employeeEmail;
    const password = isAdmin ? adminPassword : employeePassword;
    const setEmail = isAdmin ? setAdminEmail : setEmployeeEmail;
    const setPassword = isAdmin ? setAdminPassword : setEmployeePassword;

    return (
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2 mb-2">
            {isAdmin ? (
              <Lock className="w-8 h-8 text-primary" />
            ) : (
              <UserRound className="w-8 h-8 text-green-600 dark:text-green-400" />
            )}
            {isAdmin ? "Admin Login" : "Employee Login"}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage company-wide data"
              : "Track your time and leave in real time"}
          </p>
        </div>

        {loginError && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-400">
              {loginError}
            </p>
          </div>
        )}

        <form
          onSubmit={(event) => handleLogin(role, event)}
          className="space-y-4"
        >
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={isAdmin ? "admin@company.com" : "you@company.com"}
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loadingRole !== null}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loadingRole === role ? "Signing in..." : "Login"}
          </Button>
        </form>

        <button
          onClick={resetState}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition"
        >
          Back to Role Selection
        </button>
      </Card>
    );
  };

  if (mode !== "choice") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {renderLoginForm(mode)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">TimeTrack</h1>
            <p className="text-muted-foreground">
              Employee Time & Leave Management
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={() => setMode("employee")} className="w-full">
              Employee Login
            </Button>
            <Button
              onClick={() => setMode("admin")}
              variant="outline"
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </div>

          <p className="text-xs text-muted-foreground/60 text-center">
            Connects directly to your Convex deployment for live attendance
            data.
          </p>
        </div>
      </Card>
    </div>
  );
}
