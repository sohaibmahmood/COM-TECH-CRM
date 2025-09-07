"use client";

import { useRealtimeData } from "@/hooks/use-realtime-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatPKR } from "@/lib/utils";
import { Users, Receipt, AlertCircle, TrendingUp } from "lucide-react";
import { MetricsSkeleton } from "@/components/loading-skeleton";

export function QuickOverview() {
  const { students, receipts, metrics, loading, error } = useRealtimeData();

  if (loading) {
    return <MetricsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metrics.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.monthlyGrowth > 0 ? "+" : ""}
              {metrics.monthlyGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        {/* Fee Collection */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fee Collection
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPKR(metrics.totalCollection)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalReceipts} receipts processed
            </p>
          </CardContent>
        </Card>

        {/* Pending Fees */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatPKR(metrics.totalDue)}
            </div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>

        {/* Collection Rate */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {metrics.collectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Payment efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
            <CardDescription>
              Latest students enrolled this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.slice(0, 3).map((student, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student.student_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Class {student.class}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(student.joining_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent admissions
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest fee payments received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receipts.slice(0, 3).map((receipt, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {receipt.students?.student_name || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {receipt.payment_method}
                    </p>
                  </div>
                  <p className="font-medium text-accent">
                    {formatPKR(receipt.paid_amount)}
                  </p>
                </div>
              ))}
              {receipts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent payments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
