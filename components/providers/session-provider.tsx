"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { UserRole } from "@/lib/types"

export type SessionUser = {
  _id: string
  name: string
  email: string
  role: UserRole
  department?: string | null
  position?: string | null
  joinDate?: string | null
}

type SessionContextValue = {
  user: SessionUser | null
  setUser: (user: SessionUser | null) => void
  clearUser: () => void
  hydrated: boolean
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)
const STORAGE_KEY = "timetrack:user"

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to parse stored session", error)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const value = useMemo(
    () => ({
      user,
      hydrated,
      setUser,
      clearUser: () => setUser(null),
    }),
    [hydrated, user],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
