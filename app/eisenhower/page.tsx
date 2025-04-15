"use client"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { type Task, type TaskPriority, useTaskContext } from "@/context/task-context"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// Define the item type for drag and drop
const ItemTypes = {
  TASK: "task",
}

// Component for a draggable task
function DraggableTask({ task }: { task: Task }) {
  const { completeTask, updateTaskPriority } = useTaskContext()

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={cn(
        "flex items-start gap-3 p-3 bg-background rounded-md border mb-2 cursor-move",
        isDragging && "opacity-50",
      )}
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
        {task.description && <p className="text-sm text-muted-foreground truncate mt-1">{task.description}</p>}
      </div>
    </div>
  )
}

// Component for a quadrant that can receive tasks
function Quadrant({
  title,
  color,
  priority,
  tasks,
}: {
  title: string
  color: string
  priority: TaskPriority
  tasks: Task[]
}) {
  const { updateTaskPriority } = useTaskContext()

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { id: string }) => {
      updateTaskPriority(item.id, priority)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div ref={drop} className={cn("border rounded-lg p-4 h-full overflow-auto", isOver && "bg-accent/50")}>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ color }}>
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
        <h3 className="font-semibold">{title}</h3>
      </div>

      <div>
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

export default function EisenhowerMatrixPage() {
  const { tasks } = useTaskContext()

  // Filter tasks by priority
  const urgentImportant = tasks.filter((task) => task.priority === "urgent-important")
  const notUrgentImportant = tasks.filter((task) => task.priority === "not-urgent-important")
  const urgentUnimportant = tasks.filter((task) => task.priority === "urgent-unimportant")
  const notUrgentUnimportant = tasks.filter((task) => task.priority === "not-urgent-unimportant")

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 h-full">
        <h1 className="text-2xl font-bold mb-6">Eisenhower Matrix</h1>

        <div className="grid grid-cols-2 gap-6 h-[calc(100%-4rem)]">
          <Quadrant title="Urgent & Important" color="#ef4444" priority="urgent-important" tasks={urgentImportant} />
          <Quadrant
            title="Not Urgent & Important"
            color="#f59e0b"
            priority="not-urgent-important"
            tasks={notUrgentImportant}
          />
          <Quadrant
            title="Urgent & Unimportant"
            color="#3b82f6"
            priority="urgent-unimportant"
            tasks={urgentUnimportant}
          />
          <Quadrant
            title="Not Urgent & Unimportant"
            color="#10b981"
            priority="not-urgent-unimportant"
            tasks={notUrgentUnimportant}
          />
        </div>
      </div>
    </DndProvider>
  )
}
