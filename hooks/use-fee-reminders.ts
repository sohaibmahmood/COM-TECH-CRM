"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getStudentsWithOverdueInfo,
  getReminderStats,
  scheduleReminder,
  markReminderAsSent,
  generateReminderMessage,
  type StudentWithOverdue
} from "@/lib/fee-reminders";

interface ReminderStats {
  totalOverdue: number;
  pendingReminders: number;
  sentToday: number;
  totalOverdueAmount: number;
}

interface UseFeeRemindersReturn {
  students: StudentWithOverdue[];
  stats: ReminderStats | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  sendReminder: (studentId: string, receiptId: string, method: 'whatsapp' | 'email' | 'sms') => Promise<void>;
  scheduleNewReminder: (studentId: string, receiptId: string, intervalDays?: number) => Promise<void>;
  generateMessage: (studentName: string, remainingDue: number, daysOverdue: number, course?: string) => Promise<string>;
}

export function useFeeReminders(gracePeriodDays: number = 30): UseFeeRemindersReturn {
  const [students, setStudents] = useState<StudentWithOverdue[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentsData, statsData] = await Promise.all([
        getStudentsWithOverdueInfo(gracePeriodDays),
        getReminderStats()
      ]);

      setStudents(studentsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching fee reminder data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [gracePeriodDays]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const sendReminder = useCallback(async (
    studentId: string,
    receiptId: string,
    method: 'whatsapp' | 'email' | 'sms'
  ) => {
    try {
      // First, schedule a reminder to get the reminder ID
      const reminderId = await scheduleReminder(studentId, receiptId, 0); // 0 days = immediate
      
      // Mark it as sent
      await markReminderAsSent(reminderId, method, `Sent via ${method}`);
      
      // Refresh data to update UI
      await refreshData();
    } catch (err) {
      console.error('Error sending reminder:', err);
      throw err;
    }
  }, [refreshData]);

  const scheduleNewReminder = useCallback(async (
    studentId: string,
    receiptId: string,
    intervalDays: number = 6
  ) => {
    try {
      await scheduleReminder(studentId, receiptId, intervalDays);
      await refreshData();
    } catch (err) {
      console.error('Error scheduling reminder:', err);
      throw err;
    }
  }, [refreshData]);

  const generateMessage = useCallback(async (
    studentName: string,
    remainingDue: number,
    daysOverdue: number,
    course?: string
  ): Promise<string> => {
    try {
      return await generateReminderMessage(studentName, remainingDue, daysOverdue, course);
    } catch (err) {
      console.error('Error generating message:', err);
      // Fallback message
      return `Dear ${studentName}, your fee payment of PKR ${remainingDue} is ${daysOverdue} days overdue. Please pay your student fees. Thank you.`;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    students,
    stats,
    loading,
    error,
    refreshData,
    sendReminder,
    scheduleNewReminder,
    generateMessage
  };
}

// Hook for getting reminder statistics only
export function useReminderStats() {
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await getReminderStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching reminder stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
}
