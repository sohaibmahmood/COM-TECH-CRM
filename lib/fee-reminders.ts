import { createClient } from "@/lib/supabase/client";

export interface OverduePayment {
  student_id: string;
  student_name: string;
  roll_number: string;
  class: string;
  course: string;
  parent_phone: string;
  parent_email: string;
  receipt_id: string;
  receipt_number: string;
  payment_date: string;
  total_fee: number;
  paid_amount: number;
  remaining_due: number;
  days_overdue: number;
  last_reminder_date: string | null;
}

export interface FeeReminder {
  id: string;
  student_id: string;
  receipt_id: string;
  reminder_type: string;
  reminder_date: string;
  due_amount: number;
  days_overdue: number;
  message_template: string;
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
  sent_via: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentWithOverdue extends OverduePayment {
  nextReminderDate: string | null;
  reminderCount: number;
  urgencyLevel: "gentle" | "moderate" | "urgent";
}

/**
 * Get all students with overdue payments
 */
export async function getOverduePayments(
  gracePeriodDays: number = 30
): Promise<OverduePayment[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("get_overdue_payments", {
      grace_period_days: gracePeriodDays,
    });

    if (error) {
      console.error("Error fetching overdue payments:", error);
      // If the function doesn't exist, fall back to manual query
      if (
        error.message?.includes("function") ||
        error.message?.includes("does not exist")
      ) {
        return await getOverduePaymentsFallback(gracePeriodDays);
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getOverduePayments:", error);
    // Try fallback method
    return await getOverduePaymentsFallback(gracePeriodDays);
  }
}

/**
 * Fallback method to get overdue payments when database function doesn't exist
 */
async function getOverduePaymentsFallback(
  gracePeriodDays: number = 30
): Promise<OverduePayment[]> {
  const supabase = createClient();

  try {
    // Calculate the cutoff date (payment_date + grace_period_days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays);
    const cutoffDateString = cutoffDate.toISOString().split("T")[0];

    const { data: receipts, error } = await supabase
      .from("fee_receipts")
      .select(
        `
        id,
        receipt_number,
        payment_date,
        total_fee,
        paid_amount,
        remaining_due,
        students (
          id,
          student_name,
          roll_number,
          class,
          course,
          parent_phone,
          parent_email,
          final_fee_amount,
          standard_fee_amount
        )
      `
      )
      .gt("remaining_due", 0)
      .lt("payment_date", cutoffDateString);

    if (error) {
      console.error("Error in fallback query:", error);
      return [];
    }

    if (!receipts) return [];

    return receipts
      .map((receipt) => {
        const paymentDate = new Date(receipt.payment_date);
        const dueDate = new Date(paymentDate);
        dueDate.setDate(dueDate.getDate() + gracePeriodDays);
        const today = new Date();
        const daysOverdue = Math.floor(
          (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          student_id: receipt.students.id,
          student_name: receipt.students.student_name,
          roll_number: receipt.students.roll_number,
          class: receipt.students.class,
          course: receipt.students.course,
          parent_phone: receipt.students.parent_phone || "",
          parent_email: receipt.students.parent_email || "",
          receipt_id: receipt.id,
          receipt_number: receipt.receipt_number,
          payment_date: receipt.payment_date,
          total_fee: receipt.total_fee,
          paid_amount: receipt.paid_amount,
          remaining_due: receipt.remaining_due,
          days_overdue: Math.max(0, daysOverdue),
          last_reminder_date: null,
        };
      })
      .filter((payment) => payment.days_overdue > 0);
  } catch (error) {
    console.error("Error in fallback method:", error);
    return [];
  }
}

/**
 * Get reminder history for a specific student or receipt
 */
export async function getReminderHistory(
  studentId?: string,
  receiptId?: string
): Promise<FeeReminder[]> {
  const supabase = createClient();

  let query = supabase
    .from("fee_reminders")
    .select("*")
    .order("created_at", { ascending: false });

  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  if (receiptId) {
    query = query.eq("receipt_id", receiptId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching reminder history:", error);
    throw error;
  }

  return data || [];
}

/**
 * Calculate urgency level based on days overdue
 */
export function calculateUrgencyLevel(
  daysOverdue: number
): "gentle" | "moderate" | "urgent" {
  if (daysOverdue <= 7) return "gentle";
  if (daysOverdue <= 30) return "moderate";
  return "urgent";
}

/**
 * Calculate next reminder date based on last reminder and interval
 */
export function calculateNextReminderDate(
  lastReminderDate: string | null,
  intervalDays: number = 6
): string | null {
  if (!lastReminderDate) {
    // If no previous reminder, schedule for today
    return new Date().toISOString().split("T")[0];
  }

  const lastDate = new Date(lastReminderDate);
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If next reminder date is in the past or today, return today
  if (nextDate <= today) {
    return new Date().toISOString().split("T")[0];
  }

  return nextDate.toISOString().split("T")[0];
}

/**
 * Generate reminder message for a student
 */
export async function generateReminderMessage(
  studentName: string,
  remainingDue: number,
  daysOverdue: number,
  course?: string
): Promise<string> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("generate_reminder_message", {
      student_name_param: studentName,
      remaining_due_param: remainingDue,
      days_overdue_param: daysOverdue,
      course_param: course || null,
    });

    if (error) {
      console.error("Error generating reminder message:", error);
      // If function doesn't exist, use fallback
      if (
        error.message?.includes("function") ||
        error.message?.includes("does not exist")
      ) {
        return generateReminderMessageFallback(
          studentName,
          remainingDue,
          daysOverdue,
          course
        );
      }
      throw error;
    }

    return (
      data ||
      generateReminderMessageFallback(
        studentName,
        remainingDue,
        daysOverdue,
        course
      )
    );
  } catch (error) {
    console.error("Error in generateReminderMessage:", error);
    return generateReminderMessageFallback(
      studentName,
      remainingDue,
      daysOverdue,
      course
    );
  }
}

/**
 * Fallback message generation when database function doesn't exist
 */
function generateReminderMessageFallback(
  studentName: string,
  remainingDue: number,
  daysOverdue: number,
  course?: string
): string {
  let urgencyLevel: "gentle" | "moderate" | "urgent";

  if (daysOverdue <= 7) {
    urgencyLevel = "gentle";
  } else if (daysOverdue <= 30) {
    urgencyLevel = "moderate";
  } else {
    urgencyLevel = "urgent";
  }

  const formattedAmount = `PKR ${remainingDue.toLocaleString()}`;

  switch (urgencyLevel) {
    case "gentle":
      return `🎓 *COM-TECH ACADEMY - Fee Reminder*

Dear ${studentName},

This is a friendly reminder that your course fee payment is pending.

💰 *Outstanding Amount:* ${formattedAmount}
📅 *Days Overdue:* ${daysOverdue} days
${course ? `📚 *Course:* ${course}\n` : ""}
Please make your payment at your earliest convenience to continue your studies without interruption.

Thank you for your attention to this matter.

*COM-TECH ACADEMY - Digital Skills*
For payment assistance, please contact us.`;

    case "moderate":
      return `⚠️ *COM-TECH ACADEMY - Payment Reminder*

Dear ${studentName},

Your course fee payment is now overdue and requires immediate attention.

💰 *Outstanding Amount:* ${formattedAmount}
📅 *Days Overdue:* ${daysOverdue} days
${course ? `📚 *Course:* ${course}\n` : ""}
Please settle your outstanding balance to avoid any disruption to your studies.

*Payment is required within the next 7 days.*

*COM-TECH ACADEMY - Digital Skills*
Contact us immediately for payment arrangements.`;

    case "urgent":
      return `🚨 *COM-TECH ACADEMY - URGENT Payment Notice*

Dear ${studentName},

Your course fee payment is significantly overdue and requires IMMEDIATE action.

💰 *Outstanding Amount:* ${formattedAmount}
📅 *Days Overdue:* ${daysOverdue} days
${course ? `📚 *Course:* ${course}\n` : ""}
⚠️ *IMPORTANT:* Your enrollment may be suspended if payment is not received within 3 days.

Please contact us IMMEDIATELY to resolve this matter.

*COM-TECH ACADEMY - Digital Skills*
URGENT: Call us now for immediate assistance.`;
  }
}

/**
 * Schedule a new reminder for a student
 */
export async function scheduleReminder(
  studentId: string,
  receiptId: string,
  intervalDays: number = 6
): Promise<string> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("schedule_next_reminder", {
      student_id_param: studentId,
      receipt_id_param: receiptId,
      interval_days: intervalDays,
    });

    if (error) {
      console.error("Error scheduling reminder:", error);
      // If function doesn't exist, use fallback
      if (
        error.message?.includes("function") ||
        error.message?.includes("does not exist")
      ) {
        return await scheduleReminderFallback(
          studentId,
          receiptId,
          intervalDays
        );
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in scheduleReminder:", error);
    return await scheduleReminderFallback(studentId, receiptId, intervalDays);
  }
}

/**
 * Fallback method to schedule reminder when database function doesn't exist
 */
async function scheduleReminderFallback(
  studentId: string,
  receiptId: string,
  intervalDays: number = 6
): Promise<string> {
  const supabase = createClient();

  try {
    // Get student and receipt data
    const { data: receiptData, error: receiptError } = await supabase
      .from("fee_receipts")
      .select(
        `
        payment_date,
        remaining_due,
        students (
          student_name,
          course
        )
      `
      )
      .eq("id", receiptId)
      .eq("student_id", studentId)
      .single();

    if (receiptError || !receiptData) {
      throw new Error("Failed to get receipt data");
    }

    // Calculate days overdue
    const paymentDate = new Date(receiptData.payment_date);
    const dueDate = new Date(paymentDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days grace period
    const today = new Date();
    const daysOverdue = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate message
    const message = generateReminderMessageFallback(
      receiptData.students.student_name,
      receiptData.remaining_due,
      Math.max(0, daysOverdue),
      receiptData.students.course
    );

    // Calculate reminder date
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + intervalDays);

    // Insert reminder record
    const { data: reminderData, error: insertError } = await supabase
      .from("fee_reminders")
      .insert({
        student_id: studentId,
        receipt_id: receiptId,
        reminder_type: "overdue_payment",
        reminder_date: reminderDate.toISOString().split("T")[0],
        due_amount: receiptData.remaining_due,
        days_overdue: Math.max(0, daysOverdue),
        message_template: message,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    return reminderData.id;
  } catch (error) {
    console.error("Error in scheduleReminderFallback:", error);
    // Return a dummy ID if all else fails
    return "fallback-" + Date.now();
  }
}

/**
 * Mark a reminder as sent
 */
export async function markReminderAsSent(
  reminderId: string,
  sentVia: "whatsapp" | "email" | "sms",
  notes?: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("fee_reminders")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_via: sentVia,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reminderId);

  if (error) {
    console.error("Error marking reminder as sent:", error);
    throw error;
  }
}

/**
 * Get students with enhanced overdue information including reminder scheduling
 */
export async function getStudentsWithOverdueInfo(
  gracePeriodDays: number = 30
): Promise<StudentWithOverdue[]> {
  const overduePayments = await getOverduePayments(gracePeriodDays);

  const studentsWithInfo: StudentWithOverdue[] = [];

  for (const payment of overduePayments) {
    const reminderHistory = await getReminderHistory(
      payment.student_id,
      payment.receipt_id
    );
    const urgencyLevel = calculateUrgencyLevel(payment.days_overdue);
    const nextReminderDate = calculateNextReminderDate(
      payment.last_reminder_date
    );

    studentsWithInfo.push({
      ...payment,
      nextReminderDate,
      reminderCount: reminderHistory.length,
      urgencyLevel,
    });
  }

  return studentsWithInfo.sort((a, b) => b.days_overdue - a.days_overdue);
}

/**
 * Get reminder statistics
 */
export async function getReminderStats(): Promise<{
  totalOverdue: number;
  pendingReminders: number;
  sentToday: number;
  totalOverdueAmount: number;
}> {
  const supabase = createClient();

  try {
    // Get overdue payments count and total amount
    const overduePayments = await getOverduePayments();
    const totalOverdue = overduePayments.length;
    const totalOverdueAmount = overduePayments.reduce(
      (sum, payment) => sum + payment.remaining_due,
      0
    );

    // Get pending reminders count (with fallback)
    let pendingReminders = 0;
    try {
      const { data: pendingData } = await supabase
        .from("fee_reminders")
        .select("id")
        .eq("status", "pending");
      pendingReminders = pendingData?.length || 0;
    } catch (error) {
      console.log("fee_reminders table not available, using fallback");
      pendingReminders = 0;
    }

    // Get reminders sent today (with fallback)
    let sentToday = 0;
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: sentTodayData } = await supabase
        .from("fee_reminders")
        .select("id")
        .eq("status", "sent")
        .gte("sent_at", `${today}T00:00:00.000Z`)
        .lt("sent_at", `${today}T23:59:59.999Z`);
      sentToday = sentTodayData?.length || 0;
    } catch (error) {
      console.log("fee_reminders table not available, using fallback");
      sentToday = 0;
    }

    return {
      totalOverdue,
      pendingReminders,
      sentToday,
      totalOverdueAmount,
    };
  } catch (error) {
    console.error("Error in getReminderStats:", error);
    // Return default stats if everything fails
    return {
      totalOverdue: 0,
      pendingReminders: 0,
      sentToday: 0,
      totalOverdueAmount: 0,
    };
  }
}
