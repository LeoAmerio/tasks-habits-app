"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  // Redirect to tasks page after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/tasks")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Tasks & Habit Tracker</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Your comprehensive solution for managing tasks, tracking habits, and boosting productivity.
      </p>
      <Button size="lg" onClick={() => router.push("/tasks")}>
        Get Started <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
