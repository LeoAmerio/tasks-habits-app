"use client"

import { useState, useRef } from "react"
import { type Task, useTaskContext } from "@/context/task-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import {
  CalendarIcon,
  Trash,
  MoreHorizontal,
  Sun,
  CalendarPlus2Icon as CalendarIcon2,
  Pin,
  Copy,
  FileText,
  MoveRight,
  Tag,
} from "lucide-react"

interface TaskDetailProps {
  task: Task
}

export function TaskDetail({ task }: TaskDetailProps) {
  const { updateTask, deleteTask, lists, pinTask, setTaskDueDate, convertTaskType } = useTaskContext()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate)
  const [listId, setListId] = useState(task.listId)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const handleSave = () => {
    updateTask(task.id, {
      title,
      description,
      dueDate,
      listId,
    })
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id)
    }
  }

  const handlePin = () => {
    pinTask(task.id, !task.pinned)
  }

  const handleSetDueDate = (type: "today" | "tomorrow" | "next-week" | "custom", customDate?: Date) => {
    setTaskDueDate(task.id, type, customDate)
    if (type === "custom" && customDate) {
      setDueDate(customDate)
    } else if (type === "today") {
      setDueDate(new Date())
    } else if (type === "tomorrow") {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setDueDate(tomorrow)
    } else if (type === "next-week") {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      setDueDate(nextWeek)
    }
  }

  const handleConvertToNote = () => {
    convertTaskType(task.id, "note")
  }

  const handleConvertToTask = () => {
    convertTaskType(task.id, "task")
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Task Details</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleSetDueDate("today")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Today</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetDueDate("tomorrow")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Tomorrow</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetDueDate("next-week")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Next Week</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCalendarOpen(true)}>
                <CalendarIcon2 className="mr-2 h-4 w-4" />
                <span>Pick a date</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handlePin}>
                <Pin className="mr-2 h-4 w-4" />
                <span>{task.pinned ? "Unpin" : "Pin"}</span>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <MoveRight className="mr-2 h-4 w-4" />
                <span>Move to</span>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Tag className="mr-2 h-4 w-4" />
                <span>Tags</span>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplicate</span>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Link</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {task.type === "task" ? (
                <DropdownMenuItem onClick={handleConvertToNote}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Convert to Note</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleConvertToTask}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Convert to Task</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <label className="text-sm font-medium mb-1 block">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">List</label>
          <Select
            value={listId}
            onValueChange={(value) => {
              setListId(value)
              updateTask(task.id, { listId: value })
            }}
          >
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

        <div>
          <label className="text-sm font-medium mb-1 block">Due Date</label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "MMM d, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" ref={calendarRef}>
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  handleSetDueDate("custom", date)
                  setIsCalendarOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {task.images && task.images.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1 block">Images</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {task.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Task image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
