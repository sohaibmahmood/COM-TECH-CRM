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
  Edit,
  Trash2,
  Eye,
  Search,
  Phone,
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { EditStudentDialog } from "@/components/edit-student-dialog";
import { DeleteStudentDialog } from "@/components/delete-student-dialog";
import { ViewStudentDialog } from "@/components/view-student-dialog";

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
  final_fee_amount: number | null;
  standard_fee_amount: number | null;
  discount_amount: number | null;
  discount_percentage: number | null;
  created_at: string;
}

interface Class {
  id: string;
  class_name: string;
  course_name: string;
  fee_amount: number;
}

interface StudentsTableProps {
  students: Student[];
  classes: Class[];
}

export function StudentsTable({ students, classes }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "roll" | "class" | "date">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Handle column sorting
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const filteredAndSortedStudents = students
    .filter((student) => {
      // Enhanced search - check multiple fields and handle null/undefined values
      const searchLower = searchTerm.toLowerCase().trim();
      if (!searchLower) return true; // Show all if no search term

      const matchesSearch = [
        student.student_name,
        student.roll_number,
        student.class,
        student.course,
        student.parent_phone,
        student.parent_email,
        student.address,
      ]
        .filter(Boolean) // Remove null/undefined values
        .some((field) => field.toLowerCase().includes(searchLower));

      const matchesClass =
        selectedClass === "all" || student.class === selectedClass;

      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.student_name.localeCompare(b.student_name);
          break;
        case "roll":
          comparison = a.roll_number.localeCompare(b.roll_number);
          break;
        case "class":
          comparison = a.class.localeCompare(b.class);
          break;
        case "date":
          comparison =
            new Date(a.joining_date).getTime() -
            new Date(b.joining_date).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  return (
    <Card className="card-animate">
      <CardHeader>
        <CardTitle>Students Directory</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, roll number, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-animate"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm hover:border-primary transition-colors"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.class_name}>
                {cls.class_name}
              </option>
            ))}
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
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="roll-asc">Roll Number ↑</option>
            <option value="roll-desc">Roll Number ↓</option>
            <option value="class-asc">Class A-Z</option>
            <option value="class-desc">Class Z-A</option>
            <option value="date-desc">Latest Joined</option>
            <option value="date-asc">Oldest Joined</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort("roll")}
                >
                  <div className="flex items-center gap-2">
                    Roll No. {getSortIcon("roll")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Student Name {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort("class")}
                >
                  <div className="flex items-center gap-2">
                    Class {getSortIcon("class")}
                  </div>
                </TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Fee Amount</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-2">
                    Joining Date {getSortIcon("date")}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No students found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Badge
                        variant="outline"
                        className="bg-accent/5 border-accent/20 text-accent font-mono"
                      >
                        {student.roll_number}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.student_name}</p>
                        {student.address && (
                          <p className="text-sm text-muted-foreground truncate max-w-32">
                            {student.address}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30"
                      >
                        {student.class}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-32">
                      <p className="text-sm truncate">{student.course}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {student.final_fee_amount !== undefined &&
                        student.final_fee_amount !== null ? (
                          <>
                            <div className="font-medium text-sm">
                              PKR {student.final_fee_amount.toLocaleString()}
                            </div>
                            {student.discount_percentage &&
                            student.discount_percentage > 0 ? (
                              <div className="text-xs text-green-600">
                                {student.discount_percentage.toFixed(1)}%
                                discount
                              </div>
                            ) : student.final_fee_amount !==
                              (classes.find(
                                (c) => c.class_name === student.class
                              )?.fee_amount || 0) ? (
                              <div className="text-xs text-blue-600">
                                Custom pricing
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">
                                Standard rate
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            PKR{" "}
                            {(
                              classes.find(
                                (c) => c.class_name === student.class
                              )?.fee_amount || 0
                            ).toLocaleString()}
                            <div className="text-xs">Standard rate</div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {student.parent_phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span className="truncate max-w-24">
                              {student.parent_phone}
                            </span>
                          </div>
                        )}
                        {student.parent_email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-24">
                              {student.parent_email}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(student.joining_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ViewStudentDialog student={student}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="btn-animate"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </ViewStudentDialog>
                        <EditStudentDialog student={student} classes={classes}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="btn-animate"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </EditStudentDialog>
                        <DeleteStudentDialog student={student}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive btn-animate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteStudentDialog>
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
  );
}
