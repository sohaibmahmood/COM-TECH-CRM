"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Download,
  FileText,
  Users,
  Receipt,
  AlertCircle,
  CheckCircle,
  Info,
  FileSpreadsheet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Class {
  id: string;
  class_name: string;
  course_name: string;
  fee_amount: number;
}

interface ImportExportTabsProps {
  studentsCount: number;
  receiptsCount: number;
  classes: Class[];
}

export function ImportExportTabs({
  studentsCount: initialStudentsCount,
  receiptsCount: initialReceiptsCount,
  classes: initialClasses,
}: ImportExportTabsProps) {
  // Real-time state
  const [studentsCount, setStudentsCount] = useState(initialStudentsCount);
  const [receiptsCount, setReceiptsCount] = useState(initialReceiptsCount);
  const [classes, setClasses] = useState(initialClasses);

  const [importProgress, setImportProgress] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  // Fetch real-time data
  const fetchRealTimeData = async () => {
    try {
      const supabase = createClient();

      // Get students count
      const { count: newStudentsCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      // Get receipts count
      const { count: newReceiptsCount } = await supabase
        .from("fee_receipts")
        .select("*", { count: "exact", head: true });

      // Get classes with real-time data
      const { data: newClasses } = await supabase
        .from("classes")
        .select("*")
        .order("class_name");

      setStudentsCount(newStudentsCount || 0);
      setReceiptsCount(newReceiptsCount || 0);
      setClasses(newClasses || []);
    } catch (error) {
      console.error("Error fetching real-time data:", error);
    }
  };

  // Fetch data on component mount and set up interval
  useEffect(() => {
    fetchRealTimeData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);

    return () => clearInterval(interval);
  }, []);

  const downloadTemplate = (type: "students" | "receipts") => {
    let csvContent = "";
    let filename = "";

    if (type === "students") {
      csvContent = [
        "student_name,roll_number,class,course,joining_date,parent_phone,parent_email,address,notes",
        "Muhammad Ali,01,9th,Computer Science Fundamentals,2024-03-22,03074065110,ali.parent@email.com,Lahore Pakistan,Sample student record",
        "Fatima Khan,02,10th,Advanced Computer Science,2024-01-15,03001234567,fatima.parent@email.com,Karachi Pakistan,Another sample record",
      ].join("\n");
      filename = "students_template.csv";
    } else {
      csvContent = [
        "student_roll_number,payment_date,payment_method,total_fee,paid_amount,description,notes",
        "01,2025-09-07,Cash,1000.00,900.00,Course Fee,Partial payment",
        "02,2025-09-06,Bank Transfer,1200.00,1200.00,Course Fee,Full payment",
      ].join("\n");
      filename = "receipts_template.csv";
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStudentImport = async (file: File) => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());
      const dataLines = lines.slice(1);

      const supabase = createClient();
      const results = { success: 0, errors: [] as string[] };

      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i]
          .split(",")
          .map((v) => v.trim().replace(/"/g, ""));

        if (values.length !== headers.length) {
          results.errors.push(`Row ${i + 2}: Invalid number of columns`);
          continue;
        }

        const studentData = {
          student_name: values[0],
          roll_number: values[1],
          class: values[2],
          course: values[3],
          joining_date: values[4],
          parent_phone: values[5] || null,
          parent_email: values[6] || null,
          address: values[7] || null,
          notes: values[8] || null,
        };

        // Validate required fields
        if (
          !studentData.student_name ||
          !studentData.roll_number ||
          !studentData.class
        ) {
          results.errors.push(
            `Row ${
              i + 2
            }: Missing required fields (name, roll number, or class)`
          );
          continue;
        }

        // Check if roll number already exists
        const { data: existing } = await supabase
          .from("students")
          .select("roll_number")
          .eq("roll_number", studentData.roll_number)
          .single();

        if (existing) {
          results.errors.push(
            `Row ${i + 2}: Roll number ${
              studentData.roll_number
            } already exists`
          );
          continue;
        }

        const { error } = await supabase.from("students").insert([studentData]);

        if (error) {
          results.errors.push(`Row ${i + 2}: ${error.message}`);
        } else {
          results.success++;
        }

        setImportProgress(((i + 1) / dataLines.length) * 100);
      }

      setImportResults(results);

      if (results.success > 0) {
        toast({
          title: "Success",
          description: `Successfully imported ${results.success} students`,
        });
      }

      if (results.errors.length > 0) {
        toast({
          title: "Import Errors",
          description: `${results.errors.length} errors occurred during import`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: "Failed to import file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async (type: "students" | "receipts") => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const supabase = createClient();
      let csvContent = "";
      let filename = "";

      if (type === "students") {
        const { data: students } = await supabase
          .from("students")
          .select("*")
          .order("created_at");

        if (students) {
          const headers = [
            "student_name",
            "roll_number",
            "class",
            "course",
            "joining_date",
            "parent_phone",
            "parent_email",
            "address",
            "notes",
            "created_at",
          ];

          csvContent = [
            headers.join(","),
            ...students.map((student) =>
              headers.map((header) => `"${student[header] || ""}"`).join(",")
            ),
          ].join("\n");

          filename = `students_export_${
            new Date().toISOString().split("T")[0]
          }.csv`;
        }
      } else {
        const { data: receipts } = await supabase
          .from("fee_receipts")
          .select(
            `
            *,
            students (
              student_name,
              roll_number,
              class
            )
          `
          )
          .order("created_at");

        if (receipts) {
          const headers = [
            "receipt_number",
            "student_name",
            "student_roll_number",
            "student_class",
            "payment_date",
            "payment_method",
            "total_fee",
            "paid_amount",
            "remaining_due",
            "description",
            "notes",
            "created_at",
          ];

          csvContent = [
            headers.join(","),
            ...receipts.map((receipt) =>
              [
                `"${receipt.receipt_number}"`,
                `"${receipt.students?.student_name || ""}"`,
                `"${receipt.students?.roll_number || ""}"`,
                `"${receipt.students?.class || ""}"`,
                `"${receipt.payment_date}"`,
                `"${receipt.payment_method}"`,
                `"${receipt.total_fee}"`,
                `"${receipt.paid_amount}"`,
                `"${receipt.remaining_due}"`,
                `"${receipt.description || ""}"`,
                `"${receipt.notes || ""}"`,
                `"${receipt.created_at}"`,
              ].join(",")
            ),
          ].join("\n");

          filename = `receipts_export_${
            new Date().toISOString().split("T")[0]
          }.csv`;
        }
      }

      setExportProgress(100);

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${
          type === "students" ? "Students" : "Receipts"
        } exported successfully`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <Tabs defaultValue="import" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="import">Import Data</TabsTrigger>
        <TabsTrigger value="export">Export Data</TabsTrigger>
      </TabsList>

      <TabsContent value="import" className="space-y-6">
        {/* Import Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Students
            </CardTitle>
            <CardDescription>
              Upload a CSV file to bulk import student records. Download the
              template first to ensure proper formatting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Make sure your CSV file includes the required columns:
                student_name, roll_number, class, course, joining_date. Optional
                columns: parent_phone, parent_email, address, notes.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => downloadTemplate("students")}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Badge variant="outline">Current Students: {studentsCount}</Badge>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label htmlFor="student-file">Select CSV File</Label>
                <Input
                  id="student-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleStudentImport(file);
                    }
                  }}
                  disabled={isImporting}
                />
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Importing students...</span>
                    <span className="text-sm">
                      {Math.round(importProgress)}%
                    </span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}

              {importResults && (
                <Alert
                  className={
                    importResults.errors.length > 0
                      ? "border-yellow-500"
                      : "border-green-500"
                  }
                >
                  {importResults.errors.length > 0 ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        <strong>Import completed:</strong>{" "}
                        {importResults.success} students imported successfully
                      </p>
                      {importResults.errors.length > 0 && (
                        <div>
                          <p className="font-medium">
                            Errors ({importResults.errors.length}):
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1 max-h-32 overflow-y-auto">
                            {importResults.errors
                              .slice(0, 10)
                              .map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            {importResults.errors.length > 10 && (
                              <li>
                                ... and {importResults.errors.length - 10} more
                                errors
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Classes Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Classes
            </CardTitle>
            <CardDescription>
              Reference for valid class names when importing students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {classes.map((cls) => (
                <div key={cls.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{cls.class_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {cls.course_name}
                  </p>
                  <p className="text-sm text-accent">
                    PKR {cls.fee_amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="export" className="space-y-6">
        {/* Export Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Export Students
            </CardTitle>
            <CardDescription>
              Download all student records as a CSV file for backup or external
              analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Student Records</p>
                <p className="text-sm text-muted-foreground">
                  {studentsCount} students available for export
                </p>
              </div>
              <Button
                onClick={() => handleExport("students")}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Students
              </Button>
            </div>

            {isExporting && exportProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Exporting students...</span>
                  <span className="text-sm">{Math.round(exportProgress)}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Receipts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Export Fee Receipts
            </CardTitle>
            <CardDescription>
              Download all fee receipt records with student information as a CSV
              file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fee Receipt Records</p>
                <p className="text-sm text-muted-foreground">
                  {receiptsCount} receipts available for export
                </p>
              </div>
              <Button
                onClick={() => handleExport("receipts")}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Receipts
              </Button>
            </div>

            {isExporting && exportProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Exporting receipts...</span>
                  <span className="text-sm">{Math.round(exportProgress)}%</span>
                </div>
                <Progress value={exportProgress} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Export Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Student Export includes:</p>
                <ul className="list-disc list-inside text-muted-foreground ml-4">
                  <li>Basic information (name, roll number, class, course)</li>
                  <li>Contact details (parent phone, email, address)</li>
                  <li>Enrollment date and additional notes</li>
                  <li>Record creation timestamp</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Receipt Export includes:</p>
                <ul className="list-disc list-inside text-muted-foreground ml-4">
                  <li>Receipt details (number, date, payment method)</li>
                  <li>Student information (name, roll number, class)</li>
                  <li>Payment amounts (total, paid, remaining due)</li>
                  <li>Description and notes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
