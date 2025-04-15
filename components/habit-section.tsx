"use client"

import { useState } from "react"
import { useHabitContext, type HabitSection as HabitSectionType } from "@/context/habit-context"
import { HabitItem } from "@/components/habit-item"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitSectionProps {
  sectionId: HabitSectionType
  sectionName: string
}

export function HabitSection({ sectionId, sectionName }: HabitSectionProps) {
  const { getHabitsBySection } = useHabitContext()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const habits = getHabitsBySection(sectionId)

  if (habits.length === 0) {
    return null
  }

  // Get section color based on section name
  const getSectionColor = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("english")) return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
    if (lowerName.includes("sports")) return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    if (lowerName.includes("courses")) return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
    if (lowerName.includes("morning")) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    if (lowerName.includes("afternoon")) return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    if (lowerName.includes("night")) return "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
    return "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
  }

  return (
    <div className="mb-6">
      <div
        className="flex items-center gap-2 py-2 px-2 cursor-pointer hover:bg-accent/30 rounded-lg transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="text-muted-foreground">
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        <h3 className="font-medium text-lg">{sectionName}</h3>
        <div className={cn("ml-2 px-2 py-0.5 rounded-full text-xs font-medium", getSectionColor(sectionName))}>
          {habits.length}
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-4 mt-2 pl-7">
          {habits.map((habit) => (
            <HabitItem key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  )
}
