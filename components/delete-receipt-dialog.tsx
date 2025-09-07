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
import { formatPKR } from "@/lib/utils"

interface Receipt {
  id: string
  receipt_number: string
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

interface DeleteReceiptDialogProps {
  children: React.ReactNode
  receipt: Receipt
}

export function DeleteReceiptDialog({ children, receipt }: DeleteReceiptDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("fee_receipts")
        .delete()
        .eq("id", receipt.id)

      if (error) throw error

      toast({
        title: "Receipt Deleted",
        description: `Receipt ${receipt.receipt_number} has been deleted successfully.`,
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error deleting receipt:", error)
      toast({
        title: "Error",
        description: "Failed to delete receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Receipt
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this receipt? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Receipt Number:</span>
              <span>{receipt.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Student:</span>
              <span>{receipt.students.student_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount:</span>
              <span className="font-semibold text-accent">{formatPKR(receipt.paid_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{new Date(receipt.payment_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Method:</span>
              <span>{receipt.payment_method}</span>
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Warning: This will permanently delete the receipt and cannot be recovered.
            </p>
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
            <Button
              onClick={handleDelete}
              disabled={loading}
              variant="destructive"
              className="btn-animate"
            >
              {loading ? "Deleting..." : "Delete Receipt"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
