"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  Line,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";

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

interface AnalyticsChartsProps {
  students: Student[];
  receipts: ReceiptData[];
  classes: Class[];
}

const COLORS = [
  "#001F3F",
  "#FFD700",
  "#6B7280",
  "#FBBF24",
  "#34D399",
  "#F87171",
  "#A78BFA",
  "#FB7185",
];

export function AnalyticsCharts({
  students,
  receipts,
  classes,
}: AnalyticsChartsProps) {
  // Class distribution data
  const classDistribution = students.reduce((acc, student) => {
    acc[student.class] = (acc[student.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const classData = Object.entries(classDistribution).map(
    ([className, count]) => ({
      class: className,
      students: count,
      fill: COLORS[
        Object.keys(classDistribution).indexOf(className) % COLORS.length
      ],
    })
  );

  // Monthly enrollment trend
  const monthlyEnrollment = students.reduce((acc, student) => {
    const date = new Date(student.joining_date);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const enrollmentData = Object.entries(monthlyEnrollment)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([month, count]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      enrollments: count,
    }));

  // Payment method distribution
  const paymentMethods = receipts.reduce((acc, receipt) => {
    acc[receipt.payment_method] = (acc[receipt.payment_method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentMethods).map(([method, count]) => ({
    method,
    count,
    fill: COLORS[Object.keys(paymentMethods).indexOf(method) % COLORS.length],
  }));

  // Monthly collection trend
  const monthlyCollection = receipts.reduce((acc, receipt) => {
    const date = new Date(receipt.payment_date);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    acc[monthYear] = (acc[monthYear] || 0) + receipt.paid_amount;
    return acc;
  }, {} as Record<string, number>);

  const collectionData = Object.entries(monthlyCollection)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([month, amount]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      collection: amount,
    }));

  // Fee structure by class
  const feeStructureData = classes.map((cls) => ({
    class: cls.class_name,
    fee: cls.fee_amount,
    students: classDistribution[cls.class_name] || 0,
  }));

  // Collection vs Due comparison
  const collectionVsDueData = Object.entries(monthlyCollection)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, collected]) => {
      const monthDue = receipts
        .filter((r) => {
          const date = new Date(r.payment_date);
          const monthYear = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          return monthYear === month;
        })
        .reduce((sum, r) => sum + r.remaining_due, 0);

      return {
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        collected,
        due: monthDue,
        total: collected + monthDue,
      };
    });

  // Student retention over time
  const retentionData = enrollmentData.map((item, index) => {
    const totalStudentsAtTime = enrollmentData
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.enrollments, 0);
    const activeStudents = Math.max(
      0,
      totalStudentsAtTime - Math.floor(totalStudentsAtTime * 0.1)
    ); // Assume 10% dropout
    const retentionRate =
      totalStudentsAtTime > 0
        ? (activeStudents / totalStudentsAtTime) * 100
        : 100;

    return {
      ...item,
      retention: retentionRate,
      active: activeStudents,
      total: totalStudentsAtTime,
    };
  });

  // Course performance analysis
  const coursePerformance = Object.entries(
    students.reduce((acc, student) => {
      if (!acc[student.course]) {
        acc[student.course] = { students: 0, revenue: 0, avgFee: 0 };
      }
      acc[student.course].students += 1;

      const studentReceipts = receipts.filter(
        (r) => r.students.roll_number === student.roll_number
      );
      const studentRevenue = studentReceipts.reduce(
        (sum, r) => sum + r.paid_amount,
        0
      );
      acc[student.course].revenue += studentRevenue;

      return acc;
    }, {} as Record<string, { students: number; revenue: number; avgFee: number }>)
  ).map(([course, data]) => ({
    course: course.length > 15 ? course.substring(0, 15) + "..." : course,
    students: data.students,
    revenue: data.revenue,
    avgRevenue:
      data.students > 0 ? Math.round(data.revenue / data.students) : 0,
  }));

  // Payment timing analysis
  const paymentTimingData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const paymentsOnDay = receipts.filter((r) => {
      const paymentDate = new Date(r.payment_date);
      return paymentDate.getDate() === day;
    }).length;

    return {
      day: day.toString(),
      payments: paymentsOnDay,
      amount: receipts
        .filter((r) => new Date(r.payment_date).getDate() === day)
        .reduce((sum, r) => sum + r.paid_amount, 0),
    };
  }).filter((d) => d.payments > 0);

  return (
    <div className="space-y-6">
      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Class Distribution */}
        <Card className="card-animate">
          <CardHeader>
            <CardTitle>Student Distribution by Class</CardTitle>
            <CardDescription>
              Number of students in each class with revenue insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                students: {
                  label: "Students",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ class: className, students }) =>
                      `${className}: ${students}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                  >
                    {classData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 flex flex-wrap gap-2">
              {classData.slice(0, 3).map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item.class}: {item.students}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collection vs Due Trend */}
        <Card className="card-animate">
          <CardHeader>
            <CardTitle>Collection vs Outstanding</CardTitle>
            <CardDescription>
              Monthly collection performance and pending amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                collected: {
                  label: "Collected (PKR)",
                  color: "hsl(var(--chart-1))",
                },
                due: {
                  label: "Outstanding (PKR)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={collectionVsDueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      `PKR ${Number(value).toLocaleString("en-PK")}`,
                      name === "collected" ? "Collected" : "Outstanding",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="collected"
                    fill="var(--color-chart-1)"
                    name="Collected"
                  />
                  <Bar
                    dataKey="due"
                    fill="var(--color-chart-3)"
                    name="Outstanding"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Retention Trend */}
        <Card className="card-animate">
          <CardHeader>
            <CardTitle>Student Retention Analysis</CardTitle>
            <CardDescription>
              Enrollment growth and retention rates over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                enrollments: {
                  label: "New Enrollments",
                  color: "hsl(var(--chart-1))",
                },
                retention: {
                  label: "Retention Rate (%)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="enrollments"
                    fill="var(--color-chart-1)"
                    name="New Enrollments"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="retention"
                    stroke="var(--color-chart-2)"
                    name="Retention %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Course Performance */}
        <Card className="card-animate">
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Revenue and enrollment by course</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                students: {
                  label: "Students",
                  color: "hsl(var(--chart-1))",
                },
                avgRevenue: {
                  label: "Avg Revenue (PKR)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      name === "avgRevenue"
                        ? `PKR ${Number(value).toLocaleString("en-PK")}`
                        : value,
                      name === "students" ? "Students" : "Avg Revenue",
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="students"
                    fill="var(--color-chart-1)"
                    name="Students"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgRevenue"
                    stroke="var(--color-chart-2)"
                    name="Avg Revenue"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Timing Analysis */}
        <Card className="card-animate">
          <CardHeader>
            <CardTitle>Payment Timing Pattern</CardTitle>
            <CardDescription>
              When students typically make payments during the month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                payments: {
                  label: "Number of Payments",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paymentTimingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="payments"
                    stroke="var(--color-chart-2)"
                    fill="var(--color-chart-2)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm font-medium">Early Month</div>
                <div className="text-xs text-muted-foreground">
                  {paymentTimingData
                    .filter((d) => Number.parseInt(d.day) <= 10)
                    .reduce((sum, d) => sum + d.payments, 0)}{" "}
                  payments
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Mid Month</div>
                <div className="text-xs text-muted-foreground">
                  {paymentTimingData
                    .filter(
                      (d) =>
                        Number.parseInt(d.day) > 10 &&
                        Number.parseInt(d.day) <= 20
                    )
                    .reduce((sum, d) => sum + d.payments, 0)}{" "}
                  payments
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Late Month</div>
                <div className="text-xs text-muted-foreground">
                  {paymentTimingData
                    .filter((d) => Number.parseInt(d.day) > 20)
                    .reduce((sum, d) => sum + d.payments, 0)}{" "}
                  payments
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Payment Methods */}
        <Card className="card-animate">
          <CardHeader>
            <CardTitle>Payment Method Analysis</CardTitle>
            <CardDescription>
              Distribution and trends of payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Transactions",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="method" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-chart-2)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {paymentData.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.method}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.count} transactions
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {((item.count / receipts.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structure Analysis - Full Width */}
      <Card className="card-animate">
        <CardHeader>
          <CardTitle>
            Comprehensive Fee Structure & Enrollment Analysis
          </CardTitle>
          <CardDescription>
            Detailed view of fee amounts, student enrollment, and revenue
            potential by class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              fee: {
                label: "Fee Amount (PKR)",
                color: "hsl(var(--chart-1))",
              },
              students: {
                label: "Students",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={feeStructureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === "fee"
                      ? `PKR ${Number(value).toLocaleString("en-PK")}`
                      : value,
                    name === "fee" ? "Fee Amount" : "Students",
                  ]}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="fee"
                  fill="var(--color-chart-1)"
                  name="Fee Amount (PKR)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="students"
                  fill="var(--color-chart-2)"
                  name="Students"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                PKR{" "}
                {feeStructureData
                  .reduce((sum, item) => sum + item.fee * item.students, 0)
                  .toLocaleString("en-PK")}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Revenue Potential
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">
                {feeStructureData.reduce((sum, item) => sum + item.students, 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Students
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                PKR{" "}
                {Math.round(
                  feeStructureData.reduce((sum, item) => sum + item.fee, 0) /
                    feeStructureData.length
                ).toLocaleString("en-PK")}
              </div>
              <div className="text-xs text-muted-foreground">Average Fee</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">
                {Math.round(
                  feeStructureData.reduce(
                    (sum, item) => sum + item.students,
                    0
                  ) / feeStructureData.length
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Avg Students/Class
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
