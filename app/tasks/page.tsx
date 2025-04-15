"use client"
import { useState } from "react"
import { useTaskContext } from "@/context/task-context"
import { TaskList } from "@/components/task-list"
import { TaskDetail } from "@/components/task-detail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { CreateTaskDialog } from "@/components/create-task-dialog"

export default function TasksPage() {
  const { tasks, lists, selectedTask, selectedListId, filter, selectTask } = useTaskContext()
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")

  // Filter tasks based on selected list and filter
  const filteredTasks = tasks.filter((task) => {
    // First apply list filter if a list is selected
    if (selectedListId && task.listId !== selectedListId) {
      return false
    }

    // Then apply time filter
    switch (filter) {
      case "today":
        // Show tasks due today
        if (!task.dueDate) return false
        const today = new Date()
        return task.dueDate.toDateString() === today.toDateString()
      case "week":
        // Show tasks due in the next 7 days
        if (!task.dueDate) return false
        const now = new Date()
        const weekLater = new Date()
        weekLater.setDate(now.getDate() + 7)
        return task.dueDate >= now && task.dueDate <= weekLater
      case "completed":
        return task.completed
      case "trash":
        // In a real app, you might have a 'deleted' flag instead
        return false // For now, we don't have a trash feature
      default:
        return !task.completed // By default show incomplete tasks
    }
  })

  // Group tasks by section
  const pinnedTasks = filteredTasks.filter((task) => task.pinned)
  const unpinnedTasks = filteredTasks.filter((task) => !task.pinned)

  // Get the current list name
  const currentListName = selectedListId
    ? lists.find((list) => list.id === selectedListId)?.name
    : filter === "today"
      ? "Today"
      : filter === "week"
        ? "Next 7 Days"
        : filter === "completed"
          ? "Completed"
          : filter === "trash"
            ? "Trash"
            : "All Tasks"

  return (
    <div className="flex h-full">
      {/* Middle column - Task list */}
      <div className="flex-1 border-r h-full overflow-auto">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">{currentListName}</h1>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Add task, press Enter to save."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTaskTitle.trim()) {
                  setIsCreateTaskOpen(true)
                }
              }}
            />
            <Button size="icon" onClick={() => setIsCreateTaskOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TaskList title="Pinned" tasks={pinnedTasks} collapsible={true} showCount={true} />

        <TaskList
          title="Getting Start"
          tasks={unpinnedTasks.filter((task) => task.section === "getting-start")}
          collapsible={true}
          showCount={true}
        />

        <TaskList
          title="Feature Modules"
          tasks={unpinnedTasks.filter((task) => task.section === "feature-modules")}
          collapsible={true}
          showCount={true}
        />

        <TaskList
          title="Explore More"
          tasks={unpinnedTasks.filter((task) => task.section === "explore-more")}
          collapsible={true}
          showCount={true}
        />

        <TaskList title="Other Tasks" tasks={unpinnedTasks.filter((task) => !task.section)} collapsible={false} />
      </div>

      {/* Right column - Task details */}
      <div className="w-1/2 h-full overflow-auto">
        {selectedTask ? (
          <TaskDetail task={selectedTask} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a task to view details
          </div>
        )}
      </div>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        initialTitle={newTaskTitle}
        onSuccess={() => setNewTaskTitle("")}
      />
    </div>
  )
}
