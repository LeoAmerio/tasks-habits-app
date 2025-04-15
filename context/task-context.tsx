"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

export type TaskPriority = "urgent-important" | "not-urgent-important" | "urgent-unimportant" | "not-urgent-unimportant"
export type TaskType = "task" | "note"
export type TaskSection = "getting-start" | "feature-modules" | "explore-more" | null

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  listId: string
  createdAt: Date
  dueDate?: Date
  priority: TaskPriority
  images?: string[]
  pinned?: boolean
  type: TaskType
  section?: TaskSection
}

export interface TaskList {
  id: string
  name: string
  color: string
  view: "list" | "board" | "calendar"
  folder?: string
  type: "Task List"
}

interface TaskContextType {
  tasks: Task[]
  lists: TaskList[]
  selectedTask: Task | null
  selectedListId: string | null
  filter: "today" | "week" | "all" | "completed" | "trash"
  addTask: (task: Omit<Task, "id" | "createdAt" | "type">) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  addList: (list: Omit<TaskList, "id">) => void
  updateList: (id: string, list: Partial<TaskList>) => void
  deleteList: (id: string) => void
  selectTask: (id: string | null) => void
  selectList: (id: string | null) => void
  setFilter: (filter: "today" | "week" | "all" | "completed" | "trash") => void
  updateTaskPriority: (id: string, priority: TaskPriority) => void
  pinTask: (id: string, pinned: boolean) => void
  setTaskDueDate: (id: string, type: "today" | "tomorrow" | "next-week" | "custom", customDate?: Date) => void
  convertTaskType: (id: string, type: TaskType) => void
  setTaskSection: (id: string, section: TaskSection) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

const defaultLists: TaskList[] = [
  { id: "welcome", name: "Welcome", color: "#F8BD1C", view: "list", type: "Task List" },
  { id: "study", name: "Study", color: "#3B82F6", view: "list", type: "Task List" },
  { id: "exercise", name: "Exercise", color: "#10B981", view: "list", type: "Task List" },
  { id: "wishlist", name: "Wishlist", color: "#8B5CF6", view: "list", type: "Task List" },
  { id: "memo", name: "Memo", color: "#EC4899", view: "list", type: "Task List" },
  { id: "work", name: "Work", color: "#F59E0B", view: "list", type: "Task List" },
]

const defaultTasks: Task[] = [
  {
    id: "task1",
    title: "Kanban, Timeline View: Visual management",
    description: "Efficiently switch between list views for better task management.",
    completed: false,
    listId: "welcome",
    createdAt: new Date(),
    priority: "urgent-important",
    type: "task",
    section: "getting-start",
  },
  {
    id: "task2",
    title: "Sticky Note: Record ideas at any time",
    description: "Quickly capture your thoughts and ideas.",
    completed: false,
    listId: "welcome",
    createdAt: new Date(),
    priority: "not-urgent-important",
    type: "note",
    section: "explore-more",
  },
  {
    id: "task3",
    title: "Subscription Calendar: Never miss events",
    description:
      "Tired of the constant back-and-forth between calendar apps for schedule checks? Consider trying out the Calendar Subscription feature—effortlessly subscribe to calendars including Google, Outlook, Exchange, iCloud, and more.",
    completed: false,
    listId: "welcome",
    createdAt: new Date(),
    priority: "not-urgent-unimportant",
    type: "note",
    section: "explore-more",
    dueDate: new Date(2025, 3, 22), // April 22, 2025
  },
  {
    id: "task4",
    title: "More unique features",
    description: "Discover more productivity tools in our app.",
    completed: false,
    listId: "welcome",
    createdAt: new Date(),
    priority: "not-urgent-unimportant",
    type: "task",
    pinned: true,
  },
  {
    id: "task5",
    title: "Premium",
    description: "Upgrade to premium for more features.",
    completed: false,
    listId: "welcome",
    createdAt: new Date(),
    priority: "not-urgent-unimportant",
    type: "task",
    section: "explore-more",
  },
  {
    id: "task6",
    title: "Follow Us",
    description: "Follow us on social media for updates.",
    completed: false,
    listId: "welcome",
    createdAt: new Date(),
    priority: "not-urgent-unimportant",
    type: "task",
    section: "explore-more",
  },
  {
    id: "task7",
    title: "Eisenhower Matrix: Prioritize tasks",
    description: "Use the Eisenhower Matrix to prioritize your tasks effectively.",
    completed: false,
    listId: "welcome",
    createdAt: new Date(),
    priority: "urgent-unimportant",
    type: "task",
    section: "feature-modules",
  },
  {
    id: "task8",
    title: "Pomodoro: Rescue from procrastination",
    description: "Use the Pomodoro technique to stay focused and productive.",
    completed: false,
    listId: "welcome",
    createdAt: new Date(),
    priority: "not-urgent-unimportant",
    type: "task",
    section: "feature-modules",
  },
  {
    id: "task9",
    title: "Habit: Visualize your efforts",
    description: "Track your habits and visualize your progress over time.",
    completed: false,
    listId: "welcome",
    createdAt: new Date(),
    priority: "not-urgent-unimportant",
    type: "task",
    section: "feature-modules",
  },
]

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks)
  const [lists, setLists] = useState<TaskList[]>(defaultLists)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"today" | "week" | "all" | "completed" | "trash">("all")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    const savedLists = localStorage.getItem("lists")

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks)
        // Convert string dates back to Date objects
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }))
        setTasks(tasksWithDates)
      } catch (e) {
        console.error("Error parsing tasks from localStorage", e)
      }
    }

    if (savedLists) {
      try {
        setLists(JSON.parse(savedLists))
      } catch (e) {
        console.error("Error parsing lists from localStorage", e)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    localStorage.setItem("lists", JSON.stringify(lists))
  }, [tasks, lists])

  const addTask = (task: Omit<Task, "id" | "createdAt" | "type">) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date(),
      type: "task",
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updatedFields } : task)))

    // Update selected task if it's the one being updated
    if (selectedTask?.id === id) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updatedFields } : null))
    }
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
    if (selectedTask?.id === id) {
      setSelectedTask(null)
    }
  }

  const completeTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const addList = (list: Omit<TaskList, "id">) => {
    const newList: TaskList = {
      ...list,
      id: uuidv4(),
    }
    setLists([...lists, newList])
  }

  const updateList = (id: string, updatedFields: Partial<TaskList>) => {
    setLists(lists.map((list) => (list.id === id ? { ...list, ...updatedFields } : list)))
  }

  const deleteList = (id: string) => {
    setLists(lists.filter((list) => list.id !== id))
    // Also delete or reassign tasks in this list
    setTasks(tasks.filter((task) => task.listId !== id))
    if (selectedListId === id) {
      setSelectedListId(null)
    }
  }

  const selectTask = (id: string | null) => {
    if (id === null) {
      setSelectedTask(null)
    } else {
      const task = tasks.find((t) => t.id === id) || null
      setSelectedTask(task)
    }
  }

  const selectList = (id: string | null) => {
    setSelectedListId(id)
  }

  const updateTaskPriority = (id: string, priority: TaskPriority) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, priority } : task)))
  }

  const pinTask = (id: string, pinned: boolean) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, pinned } : task)))
  }

  const setTaskDueDate = (id: string, type: "today" | "tomorrow" | "next-week" | "custom", customDate?: Date) => {
    const today = new Date()
    let dueDate: Date | undefined

    switch (type) {
      case "today":
        dueDate = today
        break
      case "tomorrow":
        dueDate = new Date(today)
        dueDate.setDate(today.getDate() + 1)
        break
      case "next-week":
        dueDate = new Date(today)
        dueDate.setDate(today.getDate() + 7)
        break
      case "custom":
        dueDate = customDate
        break
      default:
        dueDate = undefined
    }

    setTasks(tasks.map((task) => (task.id === id ? { ...task, dueDate } : task)))
  }

  const convertTaskType = (id: string, type: TaskType) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, type } : task)))
  }

  const setTaskSection = (id: string, section: TaskSection) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, section } : task)))
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        lists,
        selectedTask,
        selectedListId,
        filter,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        addList,
        updateList,
        deleteList,
        selectTask,
        selectList,
        setFilter,
        updateTaskPriority,
        pinTask,
        setTaskDueDate,
        convertTaskType,
        setTaskSection,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider")
  }
  return context
}
