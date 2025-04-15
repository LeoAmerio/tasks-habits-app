"use client"

import type React from "react"

import { useState } from "react"
import { useHabitContext, type Habit } from "@/context/habit-context"
import { cn } from "@/lib/utils"
import { format, startOfWeek, eachDayOfInterval, addDays, isSameDay } from "date-fns"
import { Check, MoreHorizontal, Pencil, Play, Archive, Trash2, X, Award, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditHabitDialog } from "@/components/edit-habit-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface HabitItemProps {
  habit: Habit
  isSelected?: boolean
}

export function HabitItem({ habit, isSelected = false }: HabitItemProps) {
  const { selectHabit, checkInHabit, deleteHabit, archiveHabit, getTotalCheckIns, getHabitStreak } = useHabitContext()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Get the current week
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }) // 0 = Sunday
  const weekDays = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: addDays(startOfCurrentWeek, 6),
  })

  // Check if a day has a check-in
  const getDayCheckIn = (date: Date) => {
    return habit.checkIns.find((checkIn) => isSameDay(checkIn.date, date))
  }

  // Handle check-in toggle
  const handleCheckInToggle = (date: Date, event: React.MouseEvent) => {
    event.stopPropagation()
    const existingCheckIn = getDayCheckIn(date)

    if (!existingCheckIn) {
      // If no check-in exists, mark as completed
      checkInHabit(habit.id, date, "completed")
    } else if (existingCheckIn.status === "completed") {
      // If already completed, mark as failed
      checkInHabit(habit.id, date, "failed")
    } else if (existingCheckIn.status === "failed") {
      // If failed, remove check-in
      checkInHabit(habit.id, date, "none")
    }
  }

  const totalCheckIns = getTotalCheckIns(habit)
  const streak = getHabitStreak(habit)

  // Get emoji based on habit name
  const getHabitEmoji = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("gym") || lowerName.includes("exercise")) return "💪"
    if (lowerName.includes("swim") || lowerName.includes("natación")) return "🏊‍♂️"
    if (lowerName.includes("english") || lowerName.includes("language")) return "🗣️"
    if (lowerName.includes("code") || lowerName.includes("program")) return "💻"
    if (lowerName.includes("read")) return "📚"
    if (lowerName.includes("meditate")) return "🧘‍♂️"
    if (lowerName.includes("water") || lowerName.includes("drink")) return "💧"
    return "✨"
  }

  // Get background color based on habit name
  const getHabitColor = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("gym") || lowerName.includes("exercise")) return "from-green-400 to-green-600"
    if (lowerName.includes("swim") || lowerName.includes("natación")) return "from-blue-400 to-blue-600"
    if (lowerName.includes("english") || lowerName.includes("language")) return "from-indigo-400 to-indigo-600"
    if (lowerName.includes("code") || lowerName.includes("program")) return "from-purple-400 to-purple-600"
    if (lowerName.includes("read")) return "from-yellow-400 to-yellow-600"
    if (lowerName.includes("meditate")) return "from-teal-400 to-teal-600"
    if (lowerName.includes("water") || lowerName.includes("drink")) return "from-cyan-400 to-cyan-600"
    return "from-primary-400 to-primary-600"
  }

  return (
    <div
      className={cn("habit-card mb-4", isSelected && "ring-2 ring-primary ring-offset-2")}
      onClick={() => selectHabit(habit.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("habit-icon bg-gradient-to-br", getHabitColor(habit.name))}>
            <span>{getHabitEmoji(habit.name)}</span>
          </div>
          <div>
            <h4 className="font-semibold text-lg">{habit.name}</h4>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                <span>{totalCheckIns} days</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>{streak} streak</span>
              </Badge>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setIsEditDialogOpen(true)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Play className="mr-2 h-4 w-4" />
              <span>Start</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                archiveHabit(habit.id)
              }}
            >
              <Archive className="mr-2 h-4 w-4" />
              <span>Archive</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm("Are you sure you want to delete this habit?")) {
                  deleteHabit(habit.id)
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 flex justify-between">
        {weekDays.map((day) => {
          const checkIn = getDayCheckIn(day)
          const status = checkIn?.status || "none"
          const isToday = isSameDay(day, today)
          const isPast = day < today

          return (
            <div key={day.toISOString()} className="flex flex-col items-center">
              <div className="text-xs font-medium text-muted-foreground">{format(day, "EEE")}</div>
              <div className="text-xs font-medium">{format(day, "d")}</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "day-button mt-1",
                        status === "completed" && "day-button-completed",
                        status === "failed" && "day-button-failed",
                        status === "none" && "day-button-empty",
                        isToday && status === "none" && "day-button-today",
                      )}
                      onClick={(e) => handleCheckInToggle(day, e)}
                    >
                      {status === "completed" && <Check className="h-4 w-4" />}
                      {status === "failed" && <X className="h-4 w-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {status === "completed" ? "Completed" : status === "failed" ? "Failed" : "Not marked"}
                    <br />
                    Click to change status
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        })}
      </div>

      <EditHabitDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} habit={habit} />
    </div>
  )
}
