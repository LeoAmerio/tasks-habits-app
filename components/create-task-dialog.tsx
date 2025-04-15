"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useTaskContext, type TaskSection } from "@/context/task-context"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTitle?: string
  onSuccess?: () => void
}

export function CreateTaskDialog({ open, onOpenChange, initialTitle = "", onSuccess }: CreateTaskDialogProps) {
  const { addTask, lists, selectedListId } = useTaskContext()
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [listId, setListId] = useState(selectedListId || lists[0]?.id || "")
  const [section, setSection] = useState<TaskSection>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(initialTitle)
      setDescription("")
      setDueDate(undefined)
      setListId(selectedListId || lists[0]?.id || "")
      setSection(null)
    }
  }, [open, initialTitle, selectedListId, lists])

  const handleSubmit = () => {
    if (title.trim()) {
      addTask({
        title,
        description,
        completed: false,
        listId,
        dueDate,
        priority: "not-urgent-unimportant", // Default priority
        section,
      })
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" autoFocus />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">List</label>
            <Select value={listId} onValueChange={setListId}>
              <SelectTrigger>
                <SelectValue placeholder="Select list" />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: list.color }} />
                      {list.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Section</label>
            <Select value={section || ""} onValueChange={(value) => setSection(value as TaskSection)}>
              <SelectTrigger>
                <SelectValue placeholder="Select section (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="getting-start">Getting Start</SelectItem>
                <SelectItem value="feature-modules">Feature Modules</SelectItem>
                <SelectItem value="explore-more">Explore More</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Due Date</label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date (optional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date)
                    setIsCalendarOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
