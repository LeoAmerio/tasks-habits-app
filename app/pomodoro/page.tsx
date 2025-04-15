"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw } from "lucide-react"

export default function PomodoroPage() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work")
  const [cycles, setCycles] = useState(0)

  const [workDuration, setWorkDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            clearInterval(interval!)
            setIsActive(false)
            playNotification()
            handleTimerComplete()
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, minutes, seconds])

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.error("Error playing audio:", e))
    }
  }

  const handleTimerComplete = () => {
    if (mode === "work") {
      // After work session
      if (cycles === 3) {
        // After 4 work sessions (0-indexed), take a long break
        setMode("longBreak")
        setMinutes(longBreakDuration)
        setCycles(0)
      } else {
        // Take a short break
        setMode("shortBreak")
        setMinutes(shortBreakDuration)
        setCycles(cycles + 1)
      }
    } else {
      // After any break, go back to work
      setMode("work")
      setMinutes(workDuration)
    }
    setSeconds(0)
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    if (mode === "work") {
      setMinutes(workDuration)
    } else if (mode === "shortBreak") {
      setMinutes(shortBreakDuration)
    } else {
      setMinutes(longBreakDuration)
    }
    setSeconds(0)
  }

  const switchMode = (newMode: "work" | "shortBreak" | "longBreak") => {
    setIsActive(false)
    setMode(newMode)
    if (newMode === "work") {
      setMinutes(workDuration)
    } else if (newMode === "shortBreak") {
      setMinutes(shortBreakDuration)
    } else {
      setMinutes(longBreakDuration)
    }
    setSeconds(0)
  }

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressColor = () => {
    switch (mode) {
      case "work":
        return "bg-red-500"
      case "shortBreak":
        return "bg-green-500"
      case "longBreak":
        return "bg-blue-500"
    }
  }

  const calculateProgress = () => {
    let totalSeconds
    let currentSeconds

    if (mode === "work") {
      totalSeconds = workDuration * 60
      currentSeconds = minutes * 60 + seconds
    } else if (mode === "shortBreak") {
      totalSeconds = shortBreakDuration * 60
      currentSeconds = minutes * 60 + seconds
    } else {
      totalSeconds = longBreakDuration * 60
      currentSeconds = minutes * 60 + seconds
    }

    return ((totalSeconds - currentSeconds) / totalSeconds) * 100
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pomodoro Timer</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <div className="text-6xl font-bold tabular-nums">{formatTime(minutes, seconds)}</div>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
            <div
              className={`h-2 rounded-full ${getProgressColor()}`}
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            <Button variant={mode === "work" ? "default" : "outline"} onClick={() => switchMode("work")}>
              Work
            </Button>
            <Button variant={mode === "shortBreak" ? "default" : "outline"} onClick={() => switchMode("shortBreak")}>
              Short Break
            </Button>
            <Button variant={mode === "longBreak" ? "default" : "outline"} onClick={() => switchMode("longBreak")}>
              Long Break
            </Button>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={toggleTimer} size="lg">
              {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" onClick={resetTimer} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Work Duration: {workDuration} minutes</label>
              <Slider
                value={[workDuration]}
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => {
                  setWorkDuration(value[0])
                  if (mode === "work" && !isActive) {
                    setMinutes(value[0])
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Short Break: {shortBreakDuration} minutes</label>
              <Slider
                value={[shortBreakDuration]}
                min={1}
                max={15}
                step={1}
                onValueChange={(value) => {
                  setShortBreakDuration(value[0])
                  if (mode === "shortBreak" && !isActive) {
                    setMinutes(value[0])
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Long Break: {longBreakDuration} minutes</label>
              <Slider
                value={[longBreakDuration]}
                min={5}
                max={30}
                step={5}
                onValueChange={(value) => {
                  setLongBreakDuration(value[0])
                  if (mode === "longBreak" && !isActive) {
                    setMinutes(value[0])
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
