"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatPKR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingDown,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  RefreshCw,
  BarChart3,
} from "lucide-react";

interface FeeAnalytics {
  total_students: number;
  students_with_discounts: number;
  average_discount_percentage: number;
  total_standard_revenue: number;
  total_actual_revenue: number;
  total_discount_amount: number;
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "success" | "warning" | "destructive";
  trend?: "up" | "down" | "neutral";
}) => {
  const variantStyles = {
    default: "border-border",
    success: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    destructive: "border-red-200 bg-red-50",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    success: "text-green-600",
    warning: "text-yellow-600",
    destructive: "text-red-600",
  };

  return (
    <Card className={`card-animate ${variantStyles[variant]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconStyles[variant]}`} />
          {trend &&
            (trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export function FeeAnalytics() {
  const [analytics, setAnalytics] = useState<FeeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // Try to use the database function first
      let data, functionError;
      try {
        const result = await supabase.rpc("get_fee_structure_analytics");
        data = result.data;
        functionError = result.error;
      } catch (error) {
        functionError = error;
      }

      if (functionError || !data || data.length === 0) {
        // Fallback to manual calculation
        let students, studentsError;
        try {
          const result = await supabase.from("students").select(`
              final_fee_amount,
              standard_fee_amount,
              discount_amount,
              discount_percentage,
              class
            `);
          students = result.data;
          studentsError = result.error;
        } catch (error) {
          // If fee structure columns don't exist, use basic query
          const result = await supabase.from("students").select("class");
          students = result.data;
          studentsError = result.error;
        }

        if (studentsError) throw studentsError;

        // Calculate analytics manually
        const totalStudents = students?.length || 0;
        const studentsWithDiscounts =
          students?.filter(
            (s) => s.discount_percentage && s.discount_percentage > 0
          ).length || 0;
        const averageDiscountPercentage = students?.length
          ? students.reduce((sum, s) => sum + (s.discount_percentage || 0), 0) /
            students.length
          : 0;
        const totalStandardRevenue =
          students?.reduce((sum, s) => sum + (s.standard_fee_amount || 0), 0) ||
          0;
        const totalActualRevenue =
          students?.reduce((sum, s) => sum + (s.final_fee_amount || 0), 0) || 0;
        const totalDiscountAmount =
          students?.reduce((sum, s) => sum + (s.discount_amount || 0), 0) || 0;

        setAnalytics({
          total_students: totalStudents,
          students_with_discounts: studentsWithDiscounts,
          average_discount_percentage: averageDiscountPercentage,
          total_standard_revenue: totalStandardRevenue,
          total_actual_revenue: totalActualRevenue,
          total_discount_amount: totalDiscountAmount,
        });
      } else {
        setAnalytics(data[0]);
      }
    } catch (err) {
      console.error("Error fetching fee analytics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics"
      );
      toast({
        title: "Error",
        description: "Failed to load fee analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fee Structure Analytics
          </CardTitle>
          <CardDescription>Loading fee analytics...</CardDescription>
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

  if (error || !analytics) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">
            Error Loading Analytics
          </CardTitle>
          <CardDescription className="text-red-600">
            {error || "Failed to load fee analytics"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const discountRate =
    analytics.total_students > 0
      ? (analytics.students_with_discounts / analytics.total_students) * 100
      : 0;

  const revenueImpact =
    analytics.total_standard_revenue > 0
      ? ((analytics.total_standard_revenue - analytics.total_actual_revenue) /
          analytics.total_standard_revenue) *
        100
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Fee Structure Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Analysis of pricing flexibility and discount impact
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={analytics.total_students}
          description="Students enrolled in the system"
          icon={Users}
          variant="default"
        />

        <StatCard
          title="Students with Discounts"
          value={`${analytics.students_with_discounts} (${discountRate.toFixed(
            1
          )}%)`}
          description="Students receiving fee discounts"
          icon={Percent}
          variant={
            analytics.students_with_discounts > 0 ? "warning" : "default"
          }
        />

        <StatCard
          title="Average Discount"
          value={`${analytics.average_discount_percentage.toFixed(1)}%`}
          description="Average discount percentage given"
          icon={TrendingDown}
          variant={
            analytics.average_discount_percentage > 0 ? "warning" : "success"
          }
        />

        <StatCard
          title="Revenue Impact"
          value={`-${revenueImpact.toFixed(1)}%`}
          description="Revenue reduction due to discounts"
          icon={DollarSign}
          variant={
            revenueImpact > 5
              ? "destructive"
              : revenueImpact > 0
              ? "warning"
              : "success"
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Comparison</CardTitle>
            <CardDescription>Standard vs Actual revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Standard Revenue:
              </span>
              <span className="font-medium">
                {formatPKR(analytics.total_standard_revenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Actual Revenue:
              </span>
              <span className="font-medium text-green-600">
                {formatPKR(analytics.total_actual_revenue)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm font-medium">Total Discounts:</span>
              <span className="font-medium text-red-600">
                -{formatPKR(analytics.total_discount_amount)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing Strategy</CardTitle>
            <CardDescription>Fee negotiation insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Standard Pricing:</span>
                <Badge variant="outline">
                  {analytics.total_students - analytics.students_with_discounts}{" "}
                  students
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Negotiated Pricing:</span>
                <Badge variant="secondary">
                  {analytics.students_with_discounts} students
                </Badge>
              </div>
            </div>

            {analytics.students_with_discounts > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 <strong>Insight:</strong> {discountRate.toFixed(1)}% of
                  students have negotiated fees, with an average discount of{" "}
                  {analytics.average_discount_percentage.toFixed(1)}%.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
