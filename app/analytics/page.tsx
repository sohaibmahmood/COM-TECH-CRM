import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { AnalyticsMetrics } from "@/components/analytics-metrics";
import { FeeAnalytics } from "@/components/fee-analytics";
import { createClient } from "@/lib/supabase/server";

async function getAnalyticsData() {
  const supabase = await createClient();

  // Get students data
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("*");

  // Get receipts data with student info
  const { data: receipts, error: receiptsError } = await supabase.from(
    "fee_receipts"
  ).select(`
      *,
      students (
        student_name,
        roll_number,
        class,
        course
      )
    `);

  // Get classes data
  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select("*");

  if (studentsError || receiptsError || classesError) {
    console.error("Error fetching analytics data:", {
      studentsError,
      receiptsError,
      classesError,
    });
    return {
      students: [],
      receipts: [],
      classes: [],
    };
  }

  return {
    students: students || [],
    receipts: receipts || [],
    classes: classes || [],
  };
}

export default async function AnalyticsPage() {
  const { students, receipts, classes } = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Analytics Dashboard"
        description="Insights and trends for Comtech Academy"
      />

      <div className="px-6 space-y-8">
        <Suspense fallback={<div>Loading metrics...</div>}>
          <AnalyticsMetrics
            students={students}
            receipts={receipts}
            classes={classes}
          />
        </Suspense>

        <Suspense fallback={<div>Loading charts...</div>}>
          <AnalyticsCharts
            students={students}
            receipts={receipts}
            classes={classes}
          />
        </Suspense>

        <Suspense fallback={<div>Loading fee analytics...</div>}>
          <FeeAnalytics />
        </Suspense>
      </div>
    </div>
  );
}
