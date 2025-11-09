"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Play, Pause, LogOut } from "lucide-react"

interface WorkTimerProps {
  onCheckIn?: () => void
  onCheckOut?: () => void
}

export function WorkTimer({ onCheckIn, onCheckOut }: WorkTimerProps) {
  const [isWorking, setIsWorking] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [checkInTime, setCheckInTime] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isWorking) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isWorking])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const handleCheckIn = () => {
    setIsWorking(true)
    setElapsedSeconds(0)
    setCheckInTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    onCheckIn?.()
  }

  const handleCheckOut = () => {
    setIsWorking(false)
    onCheckOut?.()
  }

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-50">Work Timer</h3>
        </div>

        <div className="bg-slate-900 rounded-lg p-8 text-center space-y-4">
          <div className="text-5xl font-mono font-bold text-blue-400">{formatTime(elapsedSeconds)}</div>
          {checkInTime && <p className="text-sm text-slate-400">Checked in at {checkInTime}</p>}
        </div>

        <div className="flex gap-3">
          {!isWorking ? (
            <Button onClick={handleCheckIn} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Play className="w-4 h-4 mr-2" />
              Check In
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsWorking(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-50 hover:bg-slate-700"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button onClick={handleCheckOut} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Check Out
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
