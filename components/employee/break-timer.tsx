"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Coffee, Play, Stamp as Stop } from "lucide-react"

interface BreakTimerProps {
  onBreakStart?: () => void
  onBreakEnd?: () => void
}

export function BreakTimer({ onBreakStart, onBreakEnd }: BreakTimerProps) {
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [breakSeconds, setBreakSeconds] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isOnBreak) {
      interval = setInterval(() => {
        setBreakSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isOnBreak])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const handleBreakStart = () => {
    setIsOnBreak(true)
    setBreakSeconds(0)
    onBreakStart?.()
  }

  const handleBreakEnd = () => {
    setIsOnBreak(false)
    onBreakEnd?.()
  }

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-slate-50">Break Time</h3>
        </div>

        <div className="bg-slate-900 rounded-lg p-6 text-center">
          <div className="text-4xl font-mono font-bold text-amber-400">{formatTime(breakSeconds)}</div>
        </div>

        {isOnBreak ? (
          <Button onClick={handleBreakEnd} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
            <Stop className="w-4 h-4 mr-2" />
            End Break
          </Button>
        ) : (
          <Button
            onClick={handleBreakStart}
            variant="outline"
            className="w-full border-slate-600 text-slate-50 hover:bg-slate-700 bg-transparent"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Break
          </Button>
        )}
      </div>
    </Card>
  )
}
