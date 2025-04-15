"use client"

import { useState } from "react"
import { useHabitContext } from "@/context/habit-context"
import { HabitSection } from "@/components/habit-section"
import { HabitDetail } from "@/components/habit-detail"
import { Button } from "@/components/ui/button"
import { CreateHabitDialog } from "@/components/create-habit-dialog"
import { LayoutGrid, List, Plus, Calendar } from "lucide-react"
import { format, startOfWeek, eachDayOfInterval, addDays } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HabitsPage() {
  const { sections, selectedHabit } = useHabitContext()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false)

  // Get the current week
  const today = new Date()
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }) // 0 = Sunday
  const weekDays = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: addDays(startOfCurrentWeek, 6),
  })

  return (
    <div className="flex h-full">
      {/* Left column - Habit list */}
      <div className="flex-1 border-r h-full overflow-auto bg-muted/10">
        <div className="p-4 border-b bg-background sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Habits</h1>
          </div>
          <div className="flex items-center gap-2">
            <Tabs defaultValue="grid" className="w-auto">
              <TabsList className="grid w-[120px] grid-cols-2">
                <TabsTrigger value="list" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="grid" onClick={() => setViewMode("grid")}>
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="icon" onClick={() => setIsCreateHabitOpen(true)} className="rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="m-4 bg-white dark:bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between">
              {weekDays.map((day) => {
                const isToday =
                  day.getDate() === today.getDate() &&
                  day.getMonth() === today.getMonth() &&
                  day.getFullYear() === today.getFullYear()

                return (
                  <div key={day.toISOString()} className="flex flex-col items-center">
                    <div className="text-xs font-medium text-muted-foreground">{format(day, "EEE")}</div>
                    <div className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{format(day, "d")}</div>
                    <div
                      className={`w-7 h-7 mt-1 rounded-full border ${isToday ? "border-primary" : "border-muted"}`}
                    ></div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="p-4">
          {sections.map((section) => (
            <HabitSection key={section.id} sectionId={section.id} sectionName={section.name} />
          ))}
        </div>
      </div>

      {/* Right column - Habit details */}
      <div className="w-1/2 h-full overflow-auto bg-background">
        {selectedHabit ? (
          <HabitDetail habit={selectedHabit} />
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-4 p-8 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-xl font-medium">Select a habit to view details</h3>
            <p className="text-muted-foreground max-w-md">
              Click on any habit from the list to view detailed statistics, check-in history, and manage your habit.
            </p>
            <Button onClick={() => setIsCreateHabitOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create New Habit
            </Button>
          </div>
        )}
      </div>

      <CreateHabitDialog open={isCreateHabitOpen} onOpenChange={setIsCreateHabitOpen} />
    </div>
  )
}
