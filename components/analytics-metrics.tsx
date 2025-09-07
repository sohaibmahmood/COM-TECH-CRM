"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatPKR } from "@/lib/utils";

// Custom SVG icons
const UsersIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const ReceiptIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5l-5-5-5 5V7a2 2 0 012-2h6a2 2 0 012 2v14z"
    />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const AlertCircleIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CreditCardIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const GraduationCapIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
  </svg>
);

const TargetIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const DollarSignIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

interface Student {
  id: string;
  student_name: string;
  roll_number: string;
  class: string;
  course: string;
  joining_date: string;
  created_at: string;
}

interface ReceiptData {
  id: string;
  payment_date: string;
  payment_method: string;
  total_fee: number;
  paid_amount: number;
  remaining_due: number;
  students: {
    student_name: string;
    roll_number: string;
    class: string;
    course: string;
  };
}

interface Class {
  id: string;
  class_name: string;
  course_name: string;
  fee_amount: number;
}

interface AnalyticsMetricsProps {
  students: Student[];
  receipts: ReceiptData[];
  classes: Class[];
}

export function AnalyticsMetrics({
  students,
  receipts,
  classes,
}: AnalyticsMetricsProps) {
  // Calculate metrics
  const totalStudents = students.length;
  const totalCollection = receipts.reduce(
    (sum, receipt) => sum + receipt.paid_amount,
    0
  );
  const totalDue = receipts.reduce(
    (sum, receipt) => sum + receipt.remaining_due,
    0
  );
  const totalExpected = receipts.reduce(
    (sum, receipt) => sum + receipt.total_fee,
    0
  );
  const collectionRate =
    totalExpected > 0 ? (totalCollection / totalExpected) * 100 : 0;

  // Monthly growth calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthStudents = students.filter((student) => {
    const joinDate = new Date(student.joining_date);
    return (
      joinDate.getMonth() === currentMonth &&
      joinDate.getFullYear() === currentYear
    );
  }).length;

  const lastMonthStudents = students.filter((student) => {
    const joinDate = new Date(student.joining_date);
    return (
      joinDate.getMonth() === lastMonth &&
      joinDate.getFullYear() === lastMonthYear
    );
  }).length;

  const studentGrowth =
    lastMonthStudents > 0
      ? ((currentMonthStudents - lastMonthStudents) / lastMonthStudents) * 100
      : 0;

  // Class distribution
  const classDistribution = students.reduce((acc, student) => {
    acc[student.class] = (acc[student.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopularClass =
    Object.entries(classDistribution).length > 0
      ? Object.entries(classDistribution).reduce((a, b) =>
          classDistribution[a[0]] > classDistribution[b[0]] ? a : b
        )?.[0] || "N/A"
      : "N/A";

  // Payment method analysis
  const paymentMethods = receipts.reduce((acc, receipt) => {
    acc[receipt.payment_method] = (acc[receipt.payment_method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedPaymentMethod =
    Object.entries(paymentMethods).length > 0
      ? Object.entries(paymentMethods).reduce((a, b) =>
          paymentMethods[a[0]] > paymentMethods[b[0]] ? a : b
        )?.[0] || "N/A"
      : "N/A";

  // Students with pending dues
  const studentsWithDues = receipts.filter(
    (receipt) => receipt.remaining_due > 0
  ).length;

  // Advanced analytics calculations
  // Retention rate calculation (students who paid in last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentPayments = receipts.filter(
    (receipt) => new Date(receipt.payment_date) >= threeMonthsAgo
  );
  const activeStudents = new Set(
    recentPayments.map((r) => r.students.roll_number)
  ).size;
  const retentionRate =
    totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

  // Average payment time analysis
  const paymentTimes = receipts.map((receipt) => {
    const paymentDate = new Date(receipt.payment_date);
    const monthStart = new Date(
      paymentDate.getFullYear(),
      paymentDate.getMonth(),
      1
    );
    return Math.ceil(
      (paymentDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
    );
  });
  const avgPaymentDay =
    paymentTimes.length > 0
      ? Math.round(
          paymentTimes.reduce((sum, day) => sum + day, 0) / paymentTimes.length
        )
      : 0;

  // Course popularity analysis
  const courseDistribution = students.reduce((acc, student) => {
    acc[student.course] = (acc[student.course] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopularCourse =
    Object.entries(courseDistribution).length > 0
      ? Object.entries(courseDistribution).reduce((a, b) =>
          courseDistribution[a[0]] > courseDistribution[b[0]] ? a : b
        )?.[0] || "N/A"
      : "N/A";

  // Revenue per student
  const revenuePerStudent =
    totalStudents > 0 ? totalCollection / totalStudents : 0;

  // Collection efficiency (payments received vs expected this month)
  const thisMonthReceipts = receipts.filter((receipt) => {
    const date = new Date(receipt.payment_date);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });
  const thisMonthCollection = thisMonthReceipts.reduce(
    (sum, r) => sum + r.paid_amount,
    0
  );
  const thisMonthExpected = thisMonthReceipts.reduce(
    (sum, r) => sum + r.total_fee,
    0
  );
  const monthlyEfficiency =
    thisMonthExpected > 0 ? (thisMonthCollection / thisMonthExpected) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <UsersIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              {studentGrowth >= 0 ? "+" : ""}
              {studentGrowth.toFixed(1)}% from last month
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Most popular: {mostPopularClass}
              </Badge>
            </div>
            <Progress
              value={Math.min((totalStudents / 100) * 100, 100)}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        {/* Fee Collection */}
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collection
            </CardTitle>
            <ReceiptIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatPKR(totalCollection)}
            </div>
            <p className="text-xs text-muted-foreground">
              {receipts.length} receipts generated
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Avg:{" "}
                {formatPKR(
                  receipts.length > 0
                    ? Math.round(totalCollection / receipts.length)
                    : 0
                )}
              </Badge>
            </div>
            <Progress
              value={Math.min(collectionRate, 100)}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Rate
            </CardTitle>
            <TrendingUpIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {collectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPKR(totalExpected)} expected
            </p>
            <div className="mt-2">
              <Progress value={Math.min(collectionRate, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Dues */}
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <AlertCircleIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatPKR(totalDue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {studentsWithDues} students pending
            </p>
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                {((studentsWithDues / totalStudents) * 100).toFixed(1)}% of
                students
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Student Retention */}
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Student Retention
            </CardTitle>
            <TargetIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {retentionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {activeStudents} active in 3 months
            </p>
            <div className="mt-2">
              <Progress value={retentionRate} className="h-2" />
            </div>
            <div className="mt-2">
              <Badge
                variant={retentionRate >= 80 ? "default" : "secondary"}
                className="text-xs"
              >
                {retentionRate >= 80
                  ? "Excellent"
                  : retentionRate >= 60
                  ? "Good"
                  : "Needs Attention"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Revenue per Student */}
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue per Student
            </CardTitle>
            <DollarSignIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatPKR(Math.round(revenuePerStudent))}
            </div>
            <p className="text-xs text-muted-foreground">
              Average revenue generated
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Target:</span>
                <span className="font-medium">
                  {formatPKR(Math.round(totalExpected / totalStudents))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Timing */}
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Payment Day
            </CardTitle>
            <ClockIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {avgPaymentDay}
            </div>
            <p className="text-xs text-muted-foreground">
              Day of month (average)
            </p>
            <div className="mt-2">
              <Badge
                variant={avgPaymentDay <= 15 ? "default" : "secondary"}
                className="text-xs"
              >
                {avgPaymentDay <= 10
                  ? "Early Payers"
                  : avgPaymentDay <= 20
                  ? "On Time"
                  : "Late Payers"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Efficiency */}
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CalendarIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {monthlyEfficiency.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Collection efficiency
            </p>
            <div className="mt-2">
              <Progress value={monthlyEfficiency} className="h-2" />
            </div>
            <div className="mt-2">
              <Badge
                variant={monthlyEfficiency >= 80 ? "default" : "secondary"}
                className="text-xs"
              >
                {formatPKR(thisMonthCollection)} collected
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course & Class Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Popular Course
            </CardTitle>
            <GraduationCapIcon />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">
              {mostPopularCourse}
            </div>
            <p className="text-xs text-muted-foreground">
              {courseDistribution[mostPopularCourse] || 0} students enrolled
            </p>
            <div className="mt-2 space-y-1">
              {Object.entries(courseDistribution)
                .slice(0, 2)
                .map(([course, count]) => (
                  <div key={course} className="flex justify-between text-xs">
                    <span className="truncate">{course}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payment Methods
            </CardTitle>
            <CreditCardIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {Object.keys(paymentMethods).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Payment options used
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Most used: {mostUsedPaymentMethod}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Classes Offered
            </CardTitle>
            <GraduationCapIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {classes.length}
            </div>
            <p className="text-xs text-muted-foreground">Active class levels</p>
            <div className="mt-2 space-y-1">
              {Object.entries(classDistribution)
                .slice(0, 2)
                .map(([className, count]) => (
                  <div key={className} className="flex justify-between text-xs">
                    <span>{className}:</span>
                    <span className="font-medium">{count} students</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
            <TargetIcon />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatPKR(
                classes.length > 0
                  ? Math.round(
                      classes.reduce((sum, cls) => sum + cls.fee_amount, 0) /
                        classes.length
                    )
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Highest:</span>
                <span className="font-medium">
                  {formatPKR(Math.max(...classes.map((c) => c.fee_amount)))}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Lowest:</span>
                <span className="font-medium">
                  {formatPKR(Math.min(...classes.map((c) => c.fee_amount)))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
