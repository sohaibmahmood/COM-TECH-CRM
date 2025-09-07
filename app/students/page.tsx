import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { StudentsTable } from "@/components/students-table";
import { AddStudentDialog } from "@/components/add-student-dialog";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TableSkeleton } from "@/components/loading-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

async function getStudents() {
  const supabase = await createClient();
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

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

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([getStudents(), getClasses()]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Student Management"
        description="Manage student records and information"
      />

      <div className="px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">All Students</h2>
            <p className="text-sm text-muted-foreground">
              Total {students.length} students enrolled
            </p>
          </div>
          <AddStudentDialog classes={classes}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </AddStudentDialog>
        </div>

        <Suspense fallback={<TableSkeleton rows={8} />}>
          {students.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No students found. Add your first student to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <StudentsTable students={students} classes={classes} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
