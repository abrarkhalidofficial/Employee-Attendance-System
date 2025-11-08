import type { ReactNode } from "react"
import { ResponsiveSidebar } from "@/components/responsive-sidebar"

const employeeNav = (
  <nav className="p-6 space-y-4">
    <h2 className="text-lg font-bold text-sidebar-foreground">Employee Portal</h2>
    <ul className="space-y-2">
      <li>
        <a
          href="/employee/dashboard"
          className="block px-3 py-2 rounded hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition"
        >
          Dashboard
        </a>
      </li>
      <li>
        <a
          href="/employee/working-hours"
          className="block px-3 py-2 rounded hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition"
        >
          Working Hours
        </a>
      </li>
      <li>
        <a
          href="/employee/leaves"
          className="block px-3 py-2 rounded hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition"
        >
          Leave Requests
        </a>
      </li>
      <li>
        <a
          href="/employee/analytics"
          className="block px-3 py-2 rounded hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition"
        >
          Analytics
        </a>
      </li>
    </ul>
  </nav>
)

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return <ResponsiveSidebar nav={employeeNav}>{children}</ResponsiveSidebar>
}
