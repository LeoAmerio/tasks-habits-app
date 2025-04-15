import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { TaskProvider } from "@/context/task-context"
import { Sidebar } from "@/components/sidebar"
// Importar el HabitProvider
import { HabitProvider } from "@/context/habit-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tasks & Habit Tracker",
  description: "A comprehensive task, habit, and routine tracker application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Modificar el return para incluir el HabitProvider
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <TaskProvider>
            <HabitProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </HabitProvider>
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'