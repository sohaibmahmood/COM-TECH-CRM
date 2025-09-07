"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Download,
  Search,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
} from "lucide-react";
import { ViewReceiptDialog } from "@/components/view-receipt-dialog";
import { EditReceiptDialog } from "@/components/edit-receipt-dialog";
import { DeleteReceiptDialog } from "@/components/delete-receipt-dialog";
import { formatPKR } from "@/lib/utils";

interface Receipt {
  id: string;
  receipt_number: string;
  payment_date: string;
  payment_method: string;
  total_fee: number;
  paid_amount: number;
  remaining_due: number;
  description: string;
  notes: string;
  created_at: string;
  students: {
    student_name: string;
    roll_number: string;
    class: string;
    course: string;
    parent_phone: string;
    parent_email: string;
    joining_date: string;
  };
}

interface Student {
  id: string;
  student_name: string;
  roll_number: string;
  class: string;
  course: string;
}

interface ReceiptsTableProps {
  receipts: Receipt[];
  students: Student[];
}

export function ReceiptsTable({ receipts, students }: ReceiptsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [sortBy, setSortBy] = useState<
    "date" | "amount" | "student" | "status"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredAndSortedReceipts = receipts
    .filter((receipt) => {
      // Enhanced search - check multiple fields and handle null/undefined values
      const searchLower = searchTerm.toLowerCase().trim();
      if (!searchLower) return true; // Show all if no search term

      const matchesSearch = [
        receipt.receipt_number,
        receipt.students?.student_name,
        receipt.students?.roll_number,
        receipt.students?.class,
        receipt.students?.course,
        receipt.payment_method,
        receipt.description,
        receipt.notes,
      ]
        .filter(Boolean) // Remove null/undefined values
        .some((field) => field.toLowerCase().includes(searchLower));

      const matchesMethod =
        selectedMethod === "all" || receipt.payment_method === selectedMethod;

      return matchesSearch && matchesMethod;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.payment_date).getTime() -
            new Date(b.payment_date).getTime();
          break;
        case "amount":
          comparison = a.paid_amount - b.paid_amount;
          break;
        case "student":
          comparison = a.students.student_name.localeCompare(
            b.students.student_name
          );
          break;
        case "status":
          comparison =
            (a.remaining_due > 0 ? 1 : 0) - (b.remaining_due > 0 ? 1 : 0);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalCollection = receipts.reduce(
    (sum, receipt) => sum + receipt.paid_amount,
    0
  );
  const totalDue = receipts.reduce(
    (sum, receipt) => sum + receipt.remaining_due,
    0
  );

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-animate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Collection
                </p>
                <p className="text-xl font-bold text-accent">
                  {formatPKR(totalCollection)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Due
                </p>
                <p className="text-xl font-bold text-destructive">
                  {formatPKR(totalDue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Receipts
                </p>
                <p className="text-xl font-bold text-primary">
                  {receipts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receipts Table */}
      <Card className="card-animate">
        <CardHeader>
          <CardTitle>Fee Receipts</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt number, student name, or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-animate"
              />
            </div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm hover:border-primary transition-colors"
            >
              <option value="all">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Online">Online</option>
              <option value="Cheque">Cheque</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-") as [
                  typeof sortBy,
                  typeof sortOrder
                ];
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm hover:border-primary transition-colors"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="student-asc">Student A-Z</option>
              <option value="student-desc">Student Z-A</option>
              <option value="status-asc">Paid First</option>
              <option value="status-desc">Due First</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("student")}
                  >
                    Student{" "}
                    {sortBy === "student" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("amount")}
                  >
                    Amount{" "}
                    {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    Date{" "}
                    {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    Status{" "}
                    {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No receipts found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedReceipts.map((receipt) => (
                    <TableRow
                      key={receipt.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <Badge
                          variant="outline"
                          className="bg-primary/5 border-primary/20 text-primary font-mono"
                        >
                          {receipt.receipt_number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {receipt.students.student_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Roll: {receipt.students.roll_number} •{" "}
                            {receipt.students.class}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-accent">
                            {formatPKR(receipt.paid_amount)}
                          </p>
                          {receipt.remaining_due > 0 && (
                            <p className="text-sm text-destructive">
                              Due: {formatPKR(receipt.remaining_due)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                        >
                          {receipt.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(receipt.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            receipt.remaining_due > 0
                              ? "destructive"
                              : "default"
                          }
                          className={
                            receipt.remaining_due > 0
                              ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                              : "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                          }
                        >
                          {receipt.remaining_due > 0 ? "Partial" : "Paid"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ViewReceiptDialog receipt={receipt}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="btn-animate h-8 w-8"
                              title="View Receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </ViewReceiptDialog>

                          <EditReceiptDialog
                            receipt={receipt}
                            students={students}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="btn-animate h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Edit Receipt"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </EditReceiptDialog>

                          <DeleteReceiptDialog receipt={receipt}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="btn-animate h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Receipt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DeleteReceiptDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
