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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatPKR } from "@/lib/utils";
import { useFeeReminders } from "@/hooks/use-fee-reminders";
import { FeeReminderDialog } from "./fee-reminder-dialog";
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  RefreshCw,
} from "lucide-react";
import type { StudentWithOverdue } from "@/lib/fee-reminders";

const UrgencyIcon = ({
  level,
}: {
  level: "gentle" | "moderate" | "urgent";
}) => {
  switch (level) {
    case "gentle":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "moderate":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "urgent":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
};

const UrgencyBadge = ({
  level,
}: {
  level: "gentle" | "moderate" | "urgent";
}) => {
  const variants = {
    gentle: "bg-blue-50 text-blue-700 border-blue-200",
    moderate: "bg-yellow-50 text-yellow-700 border-yellow-200",
    urgent: "bg-red-50 text-red-700 border-red-200",
  };

  const labels = {
    gentle: "Due Soon",
    moderate: "Overdue",
    urgent: "Critical",
  };

  return (
    <Badge variant="outline" className={variants[level]}>
      <UrgencyIcon level={level} />
      <span className="ml-1">{labels[level]}</span>
    </Badge>
  );
};

interface FeeRemindersTableProps {
  gracePeriodDays?: number;
}

export function FeeRemindersTable({
  gracePeriodDays = 30,
}: FeeRemindersTableProps) {
  const { students, loading, error, refreshData, sendReminder } =
    useFeeReminders(gracePeriodDays);
  const { toast } = useToast();
  const [sendingReminders, setSendingReminders] = useState<Set<string>>(
    new Set()
  );

  const handleSendReminder = async (
    student: StudentWithOverdue,
    method: "whatsapp" | "email" | "sms"
  ) => {
    const key = `${student.student_id}-${student.receipt_id}`;
    setSendingReminders((prev) => new Set(prev).add(key));

    try {
      await sendReminder(student.student_id, student.receipt_id, method);

      toast({
        title: "Reminder Sent",
        description: `Reminder sent to ${student.student_name} via ${method}`,
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        title: "Error",
        description: "Failed to send reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReminders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Reminders</CardTitle>
          <CardDescription>Loading overdue payments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Reminders</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fee Reminders</CardTitle>
            <CardDescription>
              {error
                ? "Unable to load reminder data"
                : "No overdue payments found"}
            </CardDescription>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {error ? (
              <>
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-yellow-600 font-medium">
                  No reminder data available
                </p>
                <p className="text-muted-foreground mb-4">
                  This could be because the database functions haven't been set
                  up yet.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Setup Required:
                  </h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Run the database migration scripts</li>
                    <li>
                      2. Execute:{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        scripts/003_fee_reminders_schema.sql
                      </code>
                    </li>
                    <li>
                      3. Execute:{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        scripts/004_fix_reminder_logic.sql
                      </code>
                    </li>
                    <li>4. Refresh this page</li>
                  </ol>
                </div>
              </>
            ) : (
              <>
                <Clock className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 font-medium">
                  All payments are up to date!
                </p>
                <p className="text-muted-foreground">
                  No students have overdue fees at this time.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fee Reminders</CardTitle>
          <CardDescription>
            {students.length} student{students.length !== 1 ? "s" : ""} with
            overdue payments
          </CardDescription>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Reminder</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const key = `${student.student_id}-${student.receipt_id}`;
                const isSending = sendingReminders.has(key);

                return (
                  <TableRow key={key}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {student.student_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {student.roll_number} • {student.class}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.course}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {student.parent_phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {student.parent_phone}
                          </div>
                        )}
                        {student.parent_email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {student.parent_email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-red-600">
                        {formatPKR(student.remaining_due)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {formatPKR(student.total_fee)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {student.days_overdue} days
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due:{" "}
                        {new Date(student.payment_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <UrgencyBadge level={student.urgencyLevel} />
                      {student.reminderCount > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {student.reminderCount} reminder
                          {student.reminderCount !== 1 ? "s" : ""} sent
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.last_reminder_date ? (
                        <div className="text-sm">
                          {new Date(
                            student.last_reminder_date
                          ).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Never
                        </div>
                      )}
                      {student.nextReminderDate && (
                        <div className="text-xs text-muted-foreground">
                          Next:{" "}
                          {new Date(
                            student.nextReminderDate
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <FeeReminderDialog student={student}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSending}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                        </FeeReminderDialog>

                        {student.parent_phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSendReminder(student, "whatsapp")
                            }
                            disabled={isSending}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          >
                            {isSending ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <MessageSquare className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
