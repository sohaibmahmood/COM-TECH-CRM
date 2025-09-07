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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Phone, Mail, MapPin, FileText, GraduationCap } from "lucide-react"

interface Student {
  id: string
  student_name: string
  roll_number: string
  class: string
  course: string
  joining_date: string
  parent_phone: string
  parent_email: string
  address: string
  notes: string
  created_at: string
}

interface ViewStudentDialogProps {
  children: React.ReactNode
  student: Student
}

export function ViewStudentDialog({ children, student }: ViewStudentDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>Complete information for {student.student_name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                  <p className="text-lg font-semibold">{student.student_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {student.roll_number}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Class</p>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-base px-3 py-1">
                    {student.class}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Course</p>
                  <p className="font-medium">{student.course}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {student.parent_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Parent Phone</p>
                    <p className="font-medium">{student.parent_phone}</p>
                  </div>
                </div>
              )}

              {student.parent_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Parent Email</p>
                    <p className="font-medium">{student.parent_email}</p>
                  </div>
                </div>
              )}

              {student.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="font-medium">{student.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joining Date</p>
                  <p className="font-medium">{new Date(student.joining_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Record Created</p>
                  <p className="font-medium">{new Date(student.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {student.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p className="font-medium">{student.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
