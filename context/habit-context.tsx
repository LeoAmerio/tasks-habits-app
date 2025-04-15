"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { isSameDay } from "date-fns"

export type HabitFrequency = "daily" | "weekly" | "monthly" | "custom"
export type HabitGoal = "achieve-it-all" | "achieve-some" | "avoid-it-all"
export type HabitSection = string

export interface HabitCheckIn {
  date: Date
  status: "completed" | "failed" | "none"
  notes?: string
}

export interface Habit {
  id: string
  name: string
  section: HabitSection
  frequency: HabitFrequency
  selectedDays?: number[] // 0 = Sunday, 1 = Monday, etc.
  goal: HabitGoal
  startDate: Date
  endDate?: Date
  checkIns: HabitCheckIn[]
  reminderTime?: string
  autoPopup: boolean
  createdAt: Date
  archived: boolean
}

export interface Section {
  id: string
  name: string
}

interface HabitContextType {
  habits: Habit[]
  sections: Section[]
  selectedHabit: Habit | null
  addHabit: (habit: Omit<Habit, "id" | "checkIns" | "createdAt" | "archived">) => void
  updateHabit: (id: string, habit: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  archiveHabit: (id: string) => void
  selectHabit: (id: string | null) => void
  checkInHabit: (id: string, date: Date, status: "completed" | "failed" | "none") => void
  getHabitsBySection: (section: HabitSection) => Habit[]
  getHabitStreak: (habit: Habit) => number
  getMonthlyCheckInRate: (habit: Habit) => number
  getMonthlyCheckIns: (habit: Habit) => number
  getTotalCheckIns: (habit: Habit) => number
  addSection: (name: string) => void
}

const HabitContext = createContext<HabitContextType | undefined>(undefined)

const defaultSections: Section[] = [
  { id: "english", name: "English" },
  { id: "sports", name: "Sports" },
  { id: "courses", name: "Courses" },
  { id: "morning", name: "Morning" },
  { id: "afternoon", name: "Afternoon" },
  { id: "night", name: "Night" },
]

const defaultHabits: Habit[] = [
  {
    id: "habit1",
    name: "OpenEnglish",
    section: "english",
    frequency: "daily",
    goal: "achieve-it-all",
    startDate: new Date(2025, 3, 1), // April 1, 2025
    checkIns: [],
    autoPopup: false,
    createdAt: new Date(),
    archived: false,
  },
  {
    id: "habit2",
    name: "Gym",
    section: "sports",
    frequency: "daily",
    goal: "achieve-it-all",
    startDate: new Date(2025, 3, 1), // April 1, 2025
    checkIns: [],
    autoPopup: false,
    createdAt: new Date(),
    archived: false,
  },
  {
    id: "habit3",
    name: "Natación",
    section: "sports",
    frequency: "weekly",
    selectedDays: [3], // Wednesday
    goal: "achieve-it-all",
    startDate: new Date(2025, 3, 1), // April 1, 2025
    checkIns: [
      { date: new Date(2025, 3, 9), status: "completed" }, // April 9, 2025
      { date: new Date(2025, 3, 16), status: "completed" }, // April 16, 2025
    ],
    autoPopup: false,
    createdAt: new Date(),
    archived: false,
  },
  {
    id: "habit4",
    name: "Coder DataScience & AWS",
    section: "courses",
    frequency: "daily",
    goal: "achieve-it-all",
    startDate: new Date(2025, 3, 1), // April 1, 2025
    checkIns: [
      { date: new Date(2025, 3, 6), status: "completed" }, // April 6, 2025
      { date: new Date(2025, 3, 7), status: "completed" }, // April 7, 2025
      { date: new Date(2025, 3, 8), status: "completed" }, // April 8, 2025
      { date: new Date(2025, 3, 9), status: "completed" }, // April 9, 2025
      { date: new Date(2025, 3, 10), status: "completed" }, // April 10, 2025
      { date: new Date(2025, 3, 11), status: "completed" }, // April 11, 2025
      { date: new Date(2025, 3, 12), status: "completed" }, // April 12, 2025
    ],
    autoPopup: false,
    createdAt: new Date(),
    archived: false,
  },
]

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits)
  const [sections, setSections] = useState<Section[]>(defaultSections)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits")
    const savedSections = localStorage.getItem("habit-sections")

    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits)
        // Convert string dates back to Date objects
        const habitsWithDates = parsedHabits.map((habit: any) => ({
          ...habit,
          startDate: new Date(habit.startDate),
          endDate: habit.endDate ? new Date(habit.endDate) : undefined,
          createdAt: new Date(habit.createdAt),
          checkIns: habit.checkIns.map((checkIn: any) => ({
            ...checkIn,
            date: new Date(checkIn.date),
          })),
        }))
        setHabits(habitsWithDates)
      } catch (e) {
        console.error("Error parsing habits from localStorage", e)
      }
    }

    if (savedSections) {
      try {
        setSections(JSON.parse(savedSections))
      } catch (e) {
        console.error("Error parsing sections from localStorage", e)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem("habit-sections", JSON.stringify(sections))
  }, [sections])

  const addHabit = (habit: Omit<Habit, "id" | "checkIns" | "createdAt" | "archived">) => {
    const newHabit: Habit = {
      ...habit,
      id: uuidv4(),
      checkIns: [],
      createdAt: new Date(),
      archived: false,
    }
    setHabits([...habits, newHabit])
  }

  const updateHabit = (id: string, updatedFields: Partial<Habit>) => {
    setHabits(habits.map((habit) => (habit.id === id ? { ...habit, ...updatedFields } : habit)))

    // Update selected habit if it's the one being updated
    if (selectedHabit?.id === id) {
      setSelectedHabit((prev) => (prev ? { ...prev, ...updatedFields } : null))
    }
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id))
    if (selectedHabit?.id === id) {
      setSelectedHabit(null)
    }
  }

  const archiveHabit = (id: string) => {
    setHabits(habits.map((habit) => (habit.id === id ? { ...habit, archived: true } : habit)))
    if (selectedHabit?.id === id) {
      setSelectedHabit(null)
    }
  }

  const selectHabit = (id: string | null) => {
    if (id === null) {
      setSelectedHabit(null)
    } else {
      const habit = habits.find((h) => h.id === id) || null
      setSelectedHabit(habit)
    }
  }

  const checkInHabit = (id: string, date: Date, status: "completed" | "failed" | "none") => {
    setHabits(
      habits.map((habit) => {
        if (habit.id !== id) return habit

        // Check if there's already a check-in for this date
        const existingCheckInIndex = habit.checkIns.findIndex((checkIn) => isSameDay(checkIn.date, date))

        let updatedCheckIns
        if (existingCheckInIndex >= 0) {
          // Update existing check-in
          updatedCheckIns = [...habit.checkIns]
          if (status === "none") {
            // Remove the check-in if status is "none"
            updatedCheckIns.splice(existingCheckInIndex, 1)
          } else {
            updatedCheckIns[existingCheckInIndex] = {
              date,
              status,
            }
          }
        } else if (status !== "none") {
          // Add new check-in only if status is not "none"
          updatedCheckIns = [...habit.checkIns, { date, status }]
        } else {
          // No change if there's no existing check-in and status is "none"
          updatedCheckIns = habit.checkIns
        }

        return {
          ...habit,
          checkIns: updatedCheckIns,
        }
      }),
    )
  }

  const getHabitsBySection = (section: HabitSection) => {
    return habits.filter((habit) => habit.section === section && !habit.archived)
  }

  const getHabitStreak = (habit: Habit) => {
    if (habit.checkIns.length === 0) return 0

    // Sort check-ins by date (most recent first)
    const sortedCheckIns = [...habit.checkIns]
      .filter((checkIn) => checkIn.status === "completed")
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    if (sortedCheckIns.length === 0) return 0

    // Calculate streak
    let streak = 1
    const today = new Date()

    // If the most recent check-in is not today or yesterday, streak is broken
    if (!isSameDay(sortedCheckIns[0].date, today) && sortedCheckIns[0].date.getTime() < today.getTime() - 86400000) {
      return 0
    }

    // Count consecutive days
    for (let i = 0; i < sortedCheckIns.length - 1; i++) {
      const current = sortedCheckIns[i].date
      const next = sortedCheckIns[i + 1].date

      // Check if dates are consecutive
      const diffTime = current.getTime() - next.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      if (Math.round(diffDays) === 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const getMonthlyCheckInRate = (habit: Habit) => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const daysPassed = Math.min(today.getDate(), daysInMonth)

    const monthlyCheckIns = habit.checkIns.filter(
      (checkIn) => checkIn.date >= startOfMonth && checkIn.date <= today && checkIn.status === "completed",
    )

    return Math.round((monthlyCheckIns.length / daysPassed) * 100)
  }

  const getMonthlyCheckIns = (habit: Habit) => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return habit.checkIns.filter(
      (checkIn) => checkIn.date >= startOfMonth && checkIn.date <= endOfMonth && checkIn.status === "completed",
    ).length
  }

  const getTotalCheckIns = (habit: Habit) => {
    return habit.checkIns.filter((checkIn) => checkIn.status === "completed").length
  }

  const addSection = (name: string) => {
    if (name.trim() === "") return

    // Check if section already exists
    if (sections.some((section) => section.name.toLowerCase() === name.toLowerCase())) return

    const newSection: Section = {
      id: uuidv4(),
      name: name.trim(),
    }

    setSections([...sections, newSection])
  }

  return (
    <HabitContext.Provider
      value={{
        habits,
        sections,
        selectedHabit,
        addHabit,
        updateHabit,
        deleteHabit,
        archiveHabit,
        selectHabit,
        checkInHabit,
        getHabitsBySection,
        getHabitStreak,
        getMonthlyCheckInRate,
        getMonthlyCheckIns,
        getTotalCheckIns,
        addSection,
      }}
    >
      {children}
    </HabitContext.Provider>
  )
}

export const useHabitContext = () => {
  const context = useContext(HabitContext)
  if (context === undefined) {
    throw new Error("useHabitContext must be used within a HabitProvider")
  }
  return context
}
