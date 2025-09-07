"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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

interface Class {
  id: string;
  class_name: string;
  course_name: string;
  fee_amount: number;
}

interface DashboardMetrics {
  totalStudents: number;
  totalCollection: number;
  totalDue: number;
  totalReceipts: number;
  monthlyGrowth: number;
  collectionRate: number;
}

export function useRealtimeData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStudents: 0,
    totalCollection: 0,
    totalDue: 0,
    totalReceipts: 0,
    monthlyGrowth: 0,
    collectionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Calculate metrics from data
  const calculateMetrics = (
    studentsData: Student[],
    receiptsData: Receipt[]
  ): DashboardMetrics => {
    const totalStudents = studentsData.length;
    const totalCollection = receiptsData.reduce(
      (sum, receipt) => sum + receipt.paid_amount,
      0
    );
    const totalDue = receiptsData.reduce(
      (sum, receipt) => sum + receipt.remaining_due,
      0
    );
    const totalExpected = receiptsData.reduce(
      (sum, receipt) => sum + receipt.total_fee,
      0
    );
    const collectionRate =
      totalExpected > 0 ? (totalCollection / totalExpected) * 100 : 0;

    // Calculate monthly growth
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthStudents = studentsData.filter((student) => {
      const joinDate = new Date(student.joining_date);
      return (
        joinDate.getMonth() === currentMonth &&
        joinDate.getFullYear() === currentYear
      );
    }).length;

    const lastMonthStudents = studentsData.filter((student) => {
      const joinDate = new Date(student.joining_date);
      return (
        joinDate.getMonth() === lastMonth &&
        joinDate.getFullYear() === lastMonthYear
      );
    }).length;

    const monthlyGrowth =
      lastMonthStudents > 0
        ? ((currentMonthStudents - lastMonthStudents) / lastMonthStudents) * 100
        : 0;

    return {
      totalStudents,
      totalCollection,
      totalDue,
      totalReceipts: receiptsData.length,
      monthlyGrowth,
      collectionRate,
    };
  };

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch students (with optional fee information)
      let studentsData;
      let studentsError;

      // Try to fetch with new fee fields first
      try {
        const result = await supabase
          .from("students")
          .select(
            `
            *,
            final_fee_amount,
            standard_fee_amount,
            discount_amount,
            discount_percentage
          `
          )
          .order("created_at", { ascending: false });

        studentsData = result.data;
        studentsError = result.error;
      } catch (error) {
        // If new columns don't exist, fall back to basic query
        console.log("Fee structure columns not found, using basic query");
        const result = await supabase
          .from("students")
          .select("*")
          .order("created_at", { ascending: false });

        studentsData = result.data;
        studentsError = result.error;
      }

      if (studentsError) throw studentsError;

      // Fetch receipts with student data
      const { data: receiptsData, error: receiptsError } = await supabase
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

      if (receiptsError) throw receiptsError;

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .order("class_name");

      if (classesError) throw classesError;

      setStudents(studentsData || []);
      setReceipts(receiptsData || []);
      setClasses(classesData || []);
      setMetrics(calculateMetrics(studentsData || [], receiptsData || []));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Set up real-time subscriptions
    const studentsChannel = supabase
      .channel("students-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "students",
        },
        (payload) => {
          console.log("Students change received:", payload);
          fetchInitialData(); // Refetch all data for simplicity
        }
      )
      .subscribe();

    const receiptsChannel = supabase
      .channel("receipts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fee_receipts",
        },
        (payload) => {
          console.log("Receipts change received:", payload);
          fetchInitialData(); // Refetch all data for simplicity
        }
      )
      .subscribe();

    const classesChannel = supabase
      .channel("classes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "classes",
        },
        (payload) => {
          console.log("Classes change received:", payload);
          fetchInitialData(); // Refetch all data for simplicity
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(receiptsChannel);
      supabase.removeChannel(classesChannel);
    };
  }, []);

  // Refresh data manually
  const refreshData = () => {
    fetchInitialData();
  };

  return {
    students,
    receipts,
    classes,
    metrics,
    loading,
    error,
    refreshData,
  };
}
