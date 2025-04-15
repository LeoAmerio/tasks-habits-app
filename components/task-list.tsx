"use client"

import { useState } from "react"
import { useTaskContext, type Task } from "@/context/task-context"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronDown } from "lucide-react"
import { format } from "date-fns"

interface TaskListProps {
  tasks: Task[]
  title?: string
  collapsible?: boolean
  showCount?: boolean
}

export function TaskList({ tasks, title, collapsible = false, showCount = false }: TaskListProps) {
  const { selectTask, selectedTask, completeTask } = useTaskContext()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (tasks.length === 0 && title) {
    return null
  }

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div className="divide-y">
      {title && (
        <div
          className={cn("flex items-center gap-2 p-3 hover:bg-accent/30", collapsible && "cursor-pointer")}
          onClick={toggleCollapse}
        >
          {collapsible && (
            <div className="text-muted-foreground">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          )}
          <h3 className="font-medium">{title}</h3>
          {showCount && <span className="text-muted-foreground text-sm">{tasks.length}</span>}
        </div>
      )}

      {!isCollapsed &&
        (tasks.length === 0
          ? !title && <div className="p-8 text-center text-muted-foreground">No tasks found</div>
          : tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-3 p-4 hover:bg-accent/50 cursor-pointer",
                  selectedTask?.id === task.id && "bg-accent",
                )}
                onClick={() => selectTask(task.id)}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => completeTask(task.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium truncate", task.completed && "line-through text-muted-foreground")}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground truncate mt-1">{task.description}</p>
                  )}
                </div>
                {task.dueDate && (
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{format(task.dueDate, "MMM d")}</div>
                )}
                {task.dueDate && new Date().toDateString() === task.dueDate.toDateString() && (
                  <div className="text-xs text-muted-foreground whitespace-nowrap">Today</div>
                )}
                {task.dueDate &&
                  new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() ===
                    task.dueDate.toDateString() && (
                    <div className="text-xs text-muted-foreground whitespace-nowrap">Tomorrow</div>
                  )}
              </div>
            )))}
    </div>
  )
}
