"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, CheckSquare, Home, Inbox, Menu, Plus, Trash, X, Clock, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTaskContext } from "@/context/task-context"
import { AddListDialog } from "@/components/add-list-dialog"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [isAddListOpen, setIsAddListOpen] = useState(false)
  const pathname = usePathname()
  const { lists, selectList, setFilter } = useTaskContext()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleFilterClick = (filter: "today" | "week" | "all" | "completed" | "trash") => {
    setFilter(filter)
    selectList(null)
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300",
          isOpen ? "w-64" : "w-16",
        )}
      >
        <div className="flex h-14 items-center px-4 border-b">
          {isOpen ? (
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-semibold">Tasks & Habits</h2>
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mx-auto">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <Link
              href="/tasks"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === "/tasks" && "bg-accent",
              )}
              onClick={() => handleFilterClick("all")}
            >
              <Home className="h-5 w-5" />
              {isOpen && <span>Today</span>}
            </Link>
            <Link
              href="/tasks"
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent")}
              onClick={() => handleFilterClick("week")}
            >
              <Calendar className="h-5 w-5" />
              {isOpen && <span>Next 7 Days</span>}
            </Link>
            <Link
              href="/tasks"
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent")}
            >
              <Inbox className="h-5 w-5" />
              {isOpen && <span>Inbox</span>}
            </Link>

            {isOpen && (
              <div className="mt-6 px-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Lists</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsAddListOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-2">
              {lists.map((list) => (
                <Link
                  key={list.id}
                  href="/tasks"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                    pathname === `/tasks/${list.id}` && "bg-accent",
                  )}
                  onClick={() => selectList(list.id)}
                >
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: list.color }} />
                  {isOpen && <span>{list.name}</span>}
                </Link>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/tasks"
                className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent")}
                onClick={() => handleFilterClick("completed")}
              >
                <CheckSquare className="h-5 w-5" />
                {isOpen && <span>Completed</span>}
              </Link>
              <Link
                href="/tasks"
                className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent")}
                onClick={() => handleFilterClick("trash")}
              >
                <Trash className="h-5 w-5" />
                {isOpen && <span>Trash</span>}
              </Link>
            </div>

            <div className="mt-6">
              <Link
                href="/eisenhower"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === "/eisenhower" && "bg-accent",
                )}
              >
                <LayoutGrid className="h-5 w-5" />
                {isOpen && <span>Eisenhower Matrix</span>}
              </Link>
              <Link
                href="/pomodoro"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === "/pomodoro" && "bg-accent",
                )}
              >
                <Clock className="h-5 w-5" />
                {isOpen && <span>Pomodoro Timer</span>}
              </Link>
              <Link
                href="/habits"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === "/habits" && "bg-accent",
                )}
              >
                <Calendar className="h-5 w-5" />
                {isOpen && <span>Habits</span>}
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {!isOpen && <div className="fixed inset-0 z-40 bg-black/80" onClick={toggleSidebar} />}

      <div className={cn("pl-16 transition-all duration-300", isOpen && "pl-64")}>
        {/* This div ensures content is pushed to the right of the sidebar */}
      </div>

      <AddListDialog open={isAddListOpen} onOpenChange={setIsAddListOpen} />
    </>
  )
}
