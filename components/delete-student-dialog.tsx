"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle } from "lucide-react"

interface Student {
  id: string
  student_name: string
  roll_number: string
  class: string
}

interface DeleteStudentDialogProps {
  children: React.ReactNode
  student: Student
}

export function DeleteStudentDialog({ children, student }: DeleteStudentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("students").delete().eq("id", student.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Student deleted successfully!",
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Student
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this student? This action cannot be undone and will also delete all
            associated fee receipts.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg">
          <p className="font-medium">{student.student_name}</p>
          <p className="text-sm text-muted-foreground">
            Roll No: {student.roll_number} • Class: {student.class}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Student"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
