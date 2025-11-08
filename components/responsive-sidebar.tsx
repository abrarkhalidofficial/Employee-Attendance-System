"use client"

import type React from "react"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResponsiveSidebarProps {
  children: React.ReactNode
  nav: React.ReactNode
}

export function ResponsiveSidebar({ children, nav }: ResponsiveSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border z-40`}
      >
        {nav}
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>
    </div>
  )
}
