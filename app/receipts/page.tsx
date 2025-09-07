import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { ReceiptsTable } from "@/components/receipts-table";
import { CreateReceiptDialog } from "@/components/create-receipt-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function getReceipts() {
  const supabase = await createClient();
  const { data: receipts, error } = await supabase
    .from("fee_receipts")
    .select(
      `
      *,
      students (
        student_name,
        roll_number,
        class,
        course,
        parent_phone,
        parent_email,
        joining_date
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching receipts:", error);
    return [];
  }

  return receipts || [];
}

async function getStudents() {
  const supabase = await createClient();
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .order("student_name");

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }

  return students || [];
}

async function getClasses() {
  const supabase = await createClient();
  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .order("class_name");

  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }

  return classes || [];
}

export default async function ReceiptsPage() {
  const [receipts, students, classes] = await Promise.all([
    getReceipts(),
    getStudents(),
    getClasses(),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Fee Receipts"
        description="Manage student fee payments and generate receipts"
      />

      <div className="px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">All Receipts</h2>
            <p className="text-sm text-muted-foreground">
              Total {receipts.length} receipts generated
            </p>
          </div>
          <CreateReceiptDialog students={students} classes={classes}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Generate Receipt
            </Button>
          </CreateReceiptDialog>
        </div>

        <Suspense fallback={<div>Loading receipts...</div>}>
          <ReceiptsTable receipts={receipts} students={students} />
        </Suspense>
      </div>
    </div>
  );
}
