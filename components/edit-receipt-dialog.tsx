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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface Student {
  id: string
  student_name: string
  roll_number: string
  class: string
  course: string
}

interface Receipt {
  id: string
  receipt_number: string
  student_id: string
  payment_date: string
  payment_method: string
  total_fee: number
  paid_amount: number
  remaining_due: number
  description: string
  notes: string
  students: {
    student_name: string
    roll_number: string
    class: string
    course: string
  }
}

interface EditReceiptDialogProps {
  children: React.ReactNode
  receipt: Receipt
  students: Student[]
}

export function EditReceiptDialog({ children, receipt, students }: EditReceiptDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    student_id: receipt.student_id,
    payment_date: receipt.payment_date,
    payment_method: receipt.payment_method,
    total_fee: receipt.total_fee.toString(),
    paid_amount: receipt.paid_amount.toString(),
    remaining_due: receipt.remaining_due.toString(),
    description: receipt.description,
    notes: receipt.notes,
  })

  const handleStudentChange = (studentId: string) => {
    setFormData((prev) => ({ ...prev, student_id: studentId }))
  }

  const calculateRemainingDue = (total: string, paid: string) => {
    const totalAmount = parseFloat(total) || 0
    const paidAmount = parseFloat(paid) || 0
    return Math.max(0, totalAmount - paidAmount).toString()
  }

  const handleTotalFeeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      total_fee: value,
      remaining_due: calculateRemainingDue(value, prev.paid_amount),
    }))
  }

  const handlePaidAmountChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      paid_amount: value,
      remaining_due: calculateRemainingDue(prev.total_fee, value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const receiptData = {
        student_id: formData.student_id,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        total_fee: parseFloat(formData.total_fee),
        paid_amount: parseFloat(formData.paid_amount),
        remaining_due: parseFloat(formData.remaining_due),
        description: formData.description,
        notes: formData.notes,
      }

      const { error } = await supabase
        .from("fee_receipts")
        .update(receiptData)
        .eq("id", receipt.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Receipt updated successfully!",
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating receipt:", error)
      toast({
        title: "Error",
        description: "Failed to update receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Receipt - {receipt.receipt_number}</DialogTitle>
          <DialogDescription>
            Update the receipt details for {receipt.students.student_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="student_id">Select Student *</Label>
              <Select value={formData.student_id} onValueChange={handleStudentChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.student_name} - Roll: {student.roll_number} ({student.class})
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
                onChange={(e) => setFormData((prev) => ({ ...prev, payment_date: e.target.value }))}
                required
                className="input-animate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, payment_method: value }))}
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
              <Label htmlFor="total_fee">Total Fee (PKR) *</Label>
              <Input
                id="total_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_fee}
                onChange={(e) => handleTotalFeeChange(e.target.value)}
                required
                className="input-animate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_amount">Paid Amount (PKR) *</Label>
              <Input
                id="paid_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.paid_amount}
                onChange={(e) => handlePaidAmountChange(e.target.value)}
                required
                className="input-animate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining_due">Remaining Due (PKR)</Label>
              <Input
                id="remaining_due"
                type="number"
                step="0.01"
                value={formData.remaining_due}
                readOnly
                className="bg-muted input-animate"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Course Fee, Exam Fee, etc."
                required
                className="input-animate"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes..."
                rows={3}
                className="input-animate"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="btn-animate"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-animate">
              {loading ? "Updating..." : "Update Receipt"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
