"use client"

import type { ReactNode } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

if (!convexUrl) {
  console.warn("NEXT_PUBLIC_CONVEX_URL is not defined. Convex queries will fail until it is set.")
}

const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexClient) {
    return children
  }

  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
}
