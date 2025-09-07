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

interface Class {
  id: string;
  class_name: string;
  course_name: string;
  fee_amount: number;
}

interface AddStudentDialogProps {
  children: React.ReactNode;
  classes: Class[];
}

export function AddStudentDialog({ children, classes }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student_name: "",
    roll_number: "",
    class: "",
    course: "",
    joining_date: new Date().toISOString().split("T")[0],
    parent_phone: "",
    parent_email: "",
    address: "",
    notes: "",
    final_fee_amount: "",
  });

  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleClassChange = (className: string) => {
    const selectedClassData = classes.find((c) => c.class_name === className);
    setSelectedClass(selectedClassData || null);
    setFormData((prev) => ({
      ...prev,
      class: className,
      course: selectedClassData?.course_name || "",
      final_fee_amount: selectedClassData?.fee_amount.toString() || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🚀 Form submitted with data:", formData);

    // Simple validation
    if (!formData.student_name || !formData.roll_number || !formData.class) {
      alert("Please fill in all required fields!");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Creating Supabase client...");
      const supabase = createClient();

      // Prepare data with final fee amount as number
      const studentData = {
        ...formData,
        final_fee_amount: formData.final_fee_amount
          ? Number(formData.final_fee_amount)
          : null,
      };

      console.log("📝 Inserting student:", studentData);
      const { data, error } = await supabase
        .from("students")
        .insert([studentData])
        .select();

      console.log("✅ Insert result:", { data, error });

      if (error) {
        console.error("❌ Supabase error:", error);
        alert(`Database error: ${error.message}`);
        return;
      }

      alert("✅ Student added successfully!");
      setOpen(false);

      // Reset form
      setFormData({
        student_name: "",
        roll_number: "",
        class: "",
        course: "",
        joining_date: new Date().toISOString().split("T")[0],
        parent_phone: "",
        parent_email: "",
        address: "",
        notes: "",
        final_fee_amount: "",
      });
      setSelectedClass(null);

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("💥 Catch error:", error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student's information to add them to the system.
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
              <Label htmlFor="final_fee_amount">
                Final Fee Amount (PKR) *
                {selectedClass && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (Standard: PKR {selectedClass.fee_amount.toLocaleString()})
                  </span>
                )}
              </Label>
              <Input
                id="final_fee_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.final_fee_amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    final_fee_amount: e.target.value,
                  }))
                }
                placeholder="Enter negotiated fee amount"
                required
              />
              {selectedClass && formData.final_fee_amount && (
                <div className="text-xs text-muted-foreground">
                  {Number(formData.final_fee_amount) <
                  selectedClass.fee_amount ? (
                    <span className="text-green-600">
                      💰 Discount: PKR{" "}
                      {(
                        selectedClass.fee_amount -
                        Number(formData.final_fee_amount)
                      ).toLocaleString()}
                      (
                      {(
                        ((selectedClass.fee_amount -
                          Number(formData.final_fee_amount)) /
                          selectedClass.fee_amount) *
                        100
                      ).toFixed(1)}
                      % off)
                    </span>
                  ) : Number(formData.final_fee_amount) >
                    selectedClass.fee_amount ? (
                    <span className="text-blue-600">
                      📈 Premium: PKR{" "}
                      {(
                        Number(formData.final_fee_amount) -
                        selectedClass.fee_amount
                      ).toLocaleString()}{" "}
                      extra
                    </span>
                  ) : (
                    <span className="text-gray-600">
                      ✅ Standard pricing (no discount)
                    </span>
                  )}
                </div>
              )}
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
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
