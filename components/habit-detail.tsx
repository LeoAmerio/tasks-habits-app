"use client"

import { useState, useEffect } from "react"
import { useHabitContext, type Habit } from "@/context/habit-context"
import { Button } from "@/components/ui/button"
import { Check, ChevronLeft, ChevronRight, MoreHorizontal, X, Award, Flame, Calendar, BarChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditHabitDialog } from "@/components/edit-habit-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface HabitDetailProps {
  habit: Habit
}

export function HabitDetail({ habit }: HabitDetailProps) {
  const {
    checkInHabit,
    getHabitStreak,
    getMonthlyCheckInRate,
    getMonthlyCheckIns,
    getTotalCheckIns,
    deleteHabit,
    archiveHabit,
  } = useHabitContext()
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [, forceUpdate] = useState({})

  // Force update when habit changes to ensure calendar reflects latest check-ins
  useEffect(() => {
    forceUpdate({})
  }, [habit, habit.checkIns])

  const streak = getHabitStreak(habit)
  const monthlyRate = getMonthlyCheckInRate(habit)
  const monthlyCheckIns = getMonthlyCheckIns(habit)
  const totalCheckIns = getTotalCheckIns(habit)

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDayClick = (date: Date) => {
    const existingCheckIn = habit.checkIns.find((checkIn) => isSameDay(checkIn.date, date))

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
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("habit-icon bg-gradient-to-br", getHabitColor(habit.name))}>
            <span>{getHabitEmoji(habit.name)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{habit.name}</h2>
            <p className="text-sm text-muted-foreground">
              {habit.frequency === "daily"
                ? "Daily habit"
                : habit.frequency === "weekly"
                  ? "Weekly habit"
                  : habit.frequency === "monthly"
                    ? "Monthly habit"
                    : "Custom habit"}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => archiveHabit(habit.id)}>Archive</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                if (confirm("Are you sure you want to delete this habit?")) {
                  deleteHabit(habit.id)
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="stat-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-500" />
              </div>
              <span>Monthly check-ins</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{monthlyCheckIns}</span>
              <span className="text-sm ml-1 text-muted-foreground">Days</span>
            </div>
            <Progress value={monthlyRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Award className="h-3 w-3 text-blue-500" />
              </div>
              <span>Total check-ins</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{totalCheckIns}</span>
              <span className="text-sm ml-1 text-muted-foreground">Days</span>
            </div>
            <Progress value={totalCheckIns > 0 ? 100 : 0} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <BarChart className="h-3 w-3 text-orange-500" />
              </div>
              <span>Monthly check-in rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{monthlyRate}</span>
              <span className="text-sm ml-1 text-muted-foreground">%</span>
            </div>
            <Progress value={monthlyRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <Flame className="h-3 w-3 text-red-500" />
              </div>
              <span>Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{streak}</span>
              <span className="text-sm ml-1 text-muted-foreground">Days</span>
            </div>
            <Progress value={streak > 0 ? 100 : 0} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 mb-6">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{format(currentMonth, "MMMM yyyy")}</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={i} className="text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            <CalendarView currentMonth={currentMonth} habit={habit} onDayClick={handleDayClick} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg font-medium">Habit Log on {format(new Date(), "MMMM")}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {habit.checkIns.length > 0 ? (
            <div className="space-y-2">
              {habit.checkIns
                .filter((checkIn) => isSameDay(checkIn.date, new Date()) || checkIn.date < new Date())
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 5)
                .map((checkIn, index) => (
                  <div key={index} className="flex items-center gap-2 py-1 border-b last:border-0">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        checkIn.status === "completed" ? "bg-green-500" : "bg-red-500",
                      )}
                    />
                    <span className="font-medium">{format(checkIn.date, "MMM d, yyyy")}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {checkIn.status === "completed" ? "Completed" : "Failed"}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No check-in thoughts to share this month yet</p>
          )}
        </CardContent>
      </Card>

      <EditHabitDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} habit={habit} />
    </div>
  )
}

interface CalendarViewProps {
  currentMonth: Date
  habit: Habit
  onDayClick: (date: Date) => void
}

function CalendarView({ currentMonth, habit, onDayClick }: CalendarViewProps) {
  const today = new Date()
  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = getDay(firstDayOfMonth)

  // Create an array of dates for the current month view
  const dates = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })

  // Create array with empty slots for days before the first day of the month
  const calendarDays = [...Array(firstDayOfWeek).fill(null), ...dates]

  return (
    <>
      {calendarDays.map((date, index) => {
        if (!date) {
          return <div key={`empty-${index}`} className="h-10 w-10 mx-auto" />
        }

        const isToday = isSameDay(date, today)
        const checkIn = habit.checkIns.find((c) => isSameDay(c.date, date))
        const status = checkIn?.status || "none"

        return (
          <div key={date.toISOString()} className="text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center mx-auto text-sm transition-all duration-200",
                      isToday && status === "none" && "border-2 border-primary",
                      status === "completed" && "bg-primary text-white shadow-sm",
                      status === "failed" && "bg-destructive text-white shadow-sm",
                      status === "none" && !isToday && "hover:bg-muted",
                    )}
                    onClick={() => onDayClick(date)}
                  >
                    {date.getDate()}
                    {status === "completed" && <Check className="h-3 w-3 absolute" />}
                    {status === "failed" && <X className="h-3 w-3 absolute" />}
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
    </>
  )
}
