"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useTaskContext } from "@/context/task-context"
import { List, LayoutGrid, Calendar } from "lucide-react"

interface AddListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const colorOptions = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#EF4444", label: "Red" },
  { value: "#F59E0B", label: "Orange" },
  { value: "#F8BD1C", label: "Yellow" },
  { value: "#84CC16", label: "Lime" },
  { value: "#10B981", label: "Green" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
]

export function AddListDialog({ open, onOpenChange }: AddListDialogProps) {
  const { addList } = useTaskContext()
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3B82F6")
  const [view, setView] = useState<"list" | "board" | "calendar">("list")
  const [folder, setFolder] = useState("None")
  const [hideInSmartList, setHideInSmartList] = useState(false)

  const handleSubmit = () => {
    if (name.trim()) {
      addList({
        name,
        color,
        view,
        folder: folder !== "None" ? folder : undefined,
        type: "Task List",
      })
      resetForm()
      onOpenChange(false)
    }
  }

  const resetForm = () => {
    setName("")
    setColor("#3B82F6")
    setView("list")
    setFolder("None")
    setHideInSmartList(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add List</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="List name" />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Color</Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === colorOption.value ? "border-black dark:border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  onClick={() => setColor(colorOption.value)}
                  aria-label={`Select ${colorOption.label} color`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">View</Label>
            <div className="col-span-3">
              <RadioGroup
                value={view}
                onValueChange={(value) => setView(value as "list" | "board" | "calendar")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="list" id="view-list" />
                  <Label htmlFor="view-list" className="flex items-center gap-1">
                    <List className="h-4 w-4" />
                    List
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="board" id="view-board" />
                  <Label htmlFor="view-board" className="flex items-center gap-1">
                    <LayoutGrid className="h-4 w-4" />
                    Board
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="calendar" id="view-calendar" />
                  <Label htmlFor="view-calendar" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folder" className="text-right">
              Folder
            </Label>
            <div className="col-span-3">
              <Select value={folder} onValueChange={setFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Projects">Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <div className="col-span-3">
              <Select defaultValue="Task List" disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Task List">Task List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div></div>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="hide-smart-list"
                checked={hideInSmartList}
                onCheckedChange={(checked) => setHideInSmartList(checked as boolean)}
              />
              <Label htmlFor="hide-smart-list">Do not show in Smart List</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
