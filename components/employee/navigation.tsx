"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Settings, LogOut } from "lucide-react"

export function EmployeeNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => router.push("/employee/settings")}
        variant={pathname === "/employee/settings" ? "default" : "ghost"}
        className={pathname === "/employee/settings" ? "bg-blue-600" : "text-slate-50"}
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
      <Button
        onClick={() => router.push("/")}
        variant="outline"
        className="border-slate-600 text-slate-50 hover:bg-slate-700"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Back
      </Button>
    </div>
  )
}
