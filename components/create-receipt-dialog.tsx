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
  parent_phone: string;
  parent_email: string;
  joining_date: string;
  final_fee_amount: number | null;
  standard_fee_amount: number | null;
  discount_amount: number | null;
  discount_percentage: number | null;
}

interface Class {
  id: string;
  class_name: string;
  course_name: string;
  fee_amount: number;
}

interface CreateReceiptDialogProps {
  children: React.ReactNode;
  students: Student[];
  classes: Class[];
}

export function CreateReceiptDialog({
  children,
  students,
  classes,
}: CreateReceiptDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student_id: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "Cash",
    total_fee: "",
    paid_amount: "",
    remaining_due: "",
    description: "Course Fee",
    notes: "",
  });

  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      const studentClass = classes.find((c) => c.class_name === student.class);
      // Use student's final fee amount if available, otherwise use class fee
      const totalFee =
        (student.final_fee_amount !== undefined && student.final_fee_amount !== null)
          ? student.final_fee_amount
          : studentClass?.fee_amount || 0;

      setFormData((prev) => ({
        ...prev,
        student_id: studentId,
        total_fee: totalFee.toString(),
        remaining_due: totalFee.toString(),
      }));
    }
  };

  const handlePaidAmountChange = (paidAmount: string) => {
    const paid = Number.parseFloat(paidAmount) || 0;
    const total = Number.parseFloat(formData.total_fee) || 0;
    const remaining = Math.max(0, total - paid);

    setFormData((prev) => ({
      ...prev,
      paid_amount: paidAmount,
      remaining_due: remaining.toString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const receiptData = {
        student_id: formData.student_id,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        total_fee: Number.parseFloat(formData.total_fee),
        paid_amount: Number.parseFloat(formData.paid_amount),
        remaining_due: Number.parseFloat(formData.remaining_due),
        description: formData.description,
        notes: formData.notes,
      };

      const { error } = await supabase
        .from("fee_receipts")
        .insert([receiptData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Receipt generated successfully!",
      });
      setOpen(false);
      setFormData({
        student_id: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "Cash",
        total_fee: "",
        paid_amount: "",
        remaining_due: "",
        description: "Course Fee",
        notes: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Error creating receipt:", error);
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please try again.",
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
          <DialogTitle>Generate Fee Receipt</DialogTitle>
          <DialogDescription>
            Create a new fee receipt for a student payment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="student_id">Select Student *</Label>
              <Select
                value={formData.student_id}
                onValueChange={handleStudentChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.student_name} - Roll: {student.roll_number} (
                      {student.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    payment_date: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, payment_method: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_fee">Total Fee *</Label>
              <Input
                id="total_fee"
                type="number"
                step="0.01"
                value={formData.total_fee}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    total_fee: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_amount">Paid Amount *</Label>
              <Input
                id="paid_amount"
                type="number"
                step="0.01"
                value={formData.paid_amount}
                onChange={(e) => handlePaidAmountChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining_due">Remaining Due</Label>
              <Input
                id="remaining_due"
                type="number"
                step="0.01"
                value={formData.remaining_due}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Course Fee"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes about the payment"
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
              {loading ? "Generating..." : "Generate Receipt"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
