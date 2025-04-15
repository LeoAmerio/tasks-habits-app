"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useHabitContext, type HabitFrequency, type HabitGoal } from "@/context/habit-context"

interface CreateHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateHabitDialog({ open, onOpenChange }: CreateHabitDialogProps) {
  const { addHabit, sections, addSection } = useHabitContext()
  const [name, setName] = useState("")
  const [frequency, setFrequency] = useState<HabitFrequency>("daily")
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]) // All days selected by default
  const [goal, setGoal] = useState<HabitGoal>("achieve-it-all")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [section, setSection] = useState<string>("others")
  const [autoPopup, setAutoPopup] = useState(false)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false)

  const handleSubmit = () => {
    if (name.trim()) {
      addHabit({
        name,
        frequency,
        selectedDays: frequency === "custom" ? selectedDays : undefined,
        goal,
        startDate,
        endDate,
        section,
        autoPopup,
      })
      resetForm()
      onOpenChange(false)
    }
  }

  const resetForm = () => {
    setName("")
    setFrequency("daily")
    setSelectedDays([0, 1, 2, 3, 4, 5, 6])
    setGoal("achieve-it-all")
    setStartDate(new Date())
    setEndDate(undefined)
    setSection("others")
    setAutoPopup(false)
    setNewSectionName("")
    setIsAddingSectionOpen(false)
  }

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      addSection(newSectionName)
      setSection(newSectionName)
      setIsAddingSectionOpen(false)
      setNewSectionName("")
    }
  }

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day)
      } else {
        return [...prev, day].sort()
      }
    })
  }

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Habit</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-300 flex items-center justify-center">
              <span className="text-yellow-600">😃</span>
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Daily check-in"
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="frequency" className="text-right text-sm">
              Frequency
            </label>
            <div className="col-span-3">
              <Popover open={isFrequencyOpen} onOpenChange={setIsFrequencyOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {frequency === "daily"
                      ? "Daily"
                      : frequency === "weekly"
                        ? "Weekly"
                        : frequency === "monthly"
                          ? "Monthly"
                          : "Custom"}
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Select
                        value={frequency}
                        onValueChange={(value) => {
                          setFrequency(value as HabitFrequency)
                          if (value === "custom") {
                            // Keep the popover open for custom selection
                          } else {
                            setIsFrequencyOpen(false)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {frequency === "custom" && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Pick Days</p>
                        <div className="flex gap-1">
                          {dayLabels.map((day, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleDayToggle(index)}
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                                selectedDays.includes(index)
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 hover:bg-gray-200",
                              )}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button onClick={() => setIsFrequencyOpen(false)} className="w-20">
                            OK
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="goal" className="text-right text-sm">
              Goal
            </label>
            <div className="col-span-3">
              <Select value={goal} onValueChange={(value) => setGoal(value as HabitGoal)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="achieve-it-all">Achieve it all</SelectItem>
                  <SelectItem value="achieve-some">Achieve some</SelectItem>
                  <SelectItem value="avoid-it-all">Avoid it all</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="startDate" className="text-right text-sm">
              Start Date
            </label>
            <div className="col-span-3">
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date)
                        setIsStartDateOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="goalDays" className="text-right text-sm">
              Goal Days
            </label>
            <div className="col-span-3">
              <Select defaultValue="forever">
                <SelectTrigger>
                  <SelectValue placeholder="Select goal days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forever">Forever</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="section" className="text-right text-sm">
              Section
            </label>
            <div className="col-span-3">
              <Popover open={isAddingSectionOpen} onOpenChange={setIsAddingSectionOpen}>
                <Select
                  value={section}
                  onValueChange={(value) => {
                    if (value === "add-section") {
                      setIsAddingSectionOpen(true)
                    } else {
                      setSection(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="add-section" className="text-blue-500">
                      Add Section
                    </SelectItem>
                  </SelectContent>
                </Select>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    <Input
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="New Section"
                      className="w-full"
                    />
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setIsAddingSectionOpen(false)} className="w-20">
                        Cancel
                      </Button>
                      <Button onClick={handleAddSection} className="w-20" disabled={!newSectionName.trim()}>
                        OK
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="reminder" className="text-right text-sm">
              Reminder
            </label>
            <div className="col-span-3">
              <Button variant="outline" size="icon">
                <span className="text-lg">+</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div></div>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox id="auto-popup" checked={autoPopup} onCheckedChange={(checked) => setAutoPopup(!!checked)} />
              <label htmlFor="auto-popup" className="text-sm">
                Auto pop-up of habit log
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
