"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface Student {
  id: string;
  student_name: string;
  roll_number: string;
  class: string;
  course: string;
  joining_date: string;
  parent_phone: string;
  parent_email: string;
  address: string;
  notes: string;
}

interface Class {
  id: string;
  class_name: string;
  course_name: string;
  fee_amount: number;
}

interface EditStudentDialogProps {
  children: React.ReactNode;
  student: Student;
  classes: Class[];
}

export function EditStudentDialog({
  children,
  student,
  classes,
}: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student_name: student.student_name,
    roll_number: student.roll_number,
    class: student.class,
    course: student.course,
    joining_date: student.joining_date,
    parent_phone: student.parent_phone || "",
    parent_email: student.parent_email || "",
    address: student.address || "",
    notes: student.notes || "",
  });

  const handleClassChange = (className: string) => {
    const selectedClass = classes.find((c) => c.class_name === className);
    setFormData((prev) => ({
      ...prev,
      class: className,
      course: selectedClass?.course_name || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("students")
        .update(formData)
        .eq("id", student.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student updated successfully!",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update the student's information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student_name">Student Name *</Label>
              <Input
                id="student_name"
                value={formData.student_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    student_name: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roll_number">Roll Number *</Label>
              <Input
                id="roll_number"
                value={formData.roll_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    roll_number: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select
                value={formData.class}
                onValueChange={handleClassChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="Class 1">Class 1</SelectItem>
                  <SelectItem value="Class 2">Class 2</SelectItem>
                  <SelectItem value="Class 3">Class 3</SelectItem>
                  <SelectItem value="Class 4">Class 4</SelectItem>
                  <SelectItem value="Class 5">Class 5</SelectItem>
                  <SelectItem value="Class 6">Class 6</SelectItem>
                  <SelectItem value="Class 7">Class 7</SelectItem>
                  <SelectItem value="Class 8">Class 8</SelectItem>
                  <SelectItem value="Class 9">Class 9</SelectItem>
                  <SelectItem value="Class 10">Class 10</SelectItem>
                  <SelectItem value="Class 11 (1st Year)">
                    Class 11 (1st Year)
                  </SelectItem>
                  <SelectItem value="Class 12 (2nd Year)">
                    Class 12 (2nd Year)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={formData.course}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, course: e.target.value }))
                }
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="joining_date">Joining Date *</Label>
              <Input
                id="joining_date"
                type="date"
                value={formData.joining_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    joining_date: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_phone">Parent Phone</Label>
              <Input
                id="parent_phone"
                value={formData.parent_phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    parent_phone: e.target.value,
                  }))
                }
                placeholder="03001234567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_email">Parent Email</Label>
            <Input
              id="parent_email"
              type="email"
              value={formData.parent_email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  parent_email: e.target.value,
                }))
              }
              placeholder="parent@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Student's address"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes about the student"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
