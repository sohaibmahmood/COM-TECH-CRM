"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import { useReminderStats } from "@/hooks/use-fee-reminders";
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "warning" | "success" | "destructive";
}) => {
  const variantStyles = {
    default: "border-border",
    warning: "border-yellow-200 bg-yellow-50",
    success: "border-green-200 bg-green-50",
    destructive: "border-red-200 bg-red-50",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    warning: "text-yellow-600",
    success: "text-green-600",
    destructive: "text-red-600",
  };

  return (
    <Card className={`card-animate ${variantStyles[variant]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export function FeeReminderStats() {
  const { stats, loading, error } = useReminderStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-animate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Setup Required
            </CardTitle>
            <CardDescription className="text-yellow-600">
              Database functions not available
            </CardDescription>
          </CardHeader>
        </Card>

        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-500 flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-300 rounded" />
                Data Unavailable
              </CardTitle>
              <CardDescription className="text-gray-500">
                Run migration scripts
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Overdue Students"
        value={stats.totalOverdue}
        description={
          stats.totalOverdue === 0
            ? "All payments up to date!"
            : "Students with pending fees"
        }
        icon={AlertTriangle}
        variant={stats.totalOverdue > 0 ? "warning" : "success"}
      />

      <StatCard
        title="Total Amount Due"
        value={formatPKR(stats.totalOverdueAmount)}
        description="Outstanding fee payments"
        icon={DollarSign}
        variant={stats.totalOverdueAmount > 0 ? "destructive" : "success"}
      />

      <StatCard
        title="Pending Reminders"
        value={stats.pendingReminders}
        description="Scheduled but not sent"
        icon={Clock}
        variant={stats.pendingReminders > 0 ? "warning" : "default"}
      />

      <StatCard
        title="Sent Today"
        value={stats.sentToday}
        description="Reminders sent today"
        icon={MessageSquare}
        variant={stats.sentToday > 0 ? "success" : "default"}
      />
    </div>
  );
}

export function FeeReminderStatsDetailed() {
  const { stats, loading, error } = useReminderStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reminder Statistics</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
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

  if (error || !stats) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">
            Error Loading Statistics
          </CardTitle>
          <CardDescription className="text-red-600">
            {error || "Failed to load reminder statistics"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = (count: number) => {
    if (count === 0) return "bg-green-100 text-green-800";
    if (count <= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Fee Reminder Overview
        </CardTitle>
        <CardDescription>
          Current status of fee reminders and overdue payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Students with Overdue Fees
                </span>
                <Badge className={getStatusColor(stats.totalOverdue)}>
                  {stats.totalOverdue}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Total Amount Outstanding
                </span>
                <span className="text-sm font-semibold text-red-600">
                  {formatPKR(stats.totalOverdueAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Reminders</span>
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200"
                >
                  {stats.pendingReminders}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Reminders Sent Today
                </span>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {stats.sentToday}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="border-t pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">
                  {stats.totalOverdue === 0
                    ? "All payments are up to date"
                    : "Some payments are overdue"}
                </span>
              </div>

              {stats.pendingReminders > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">
                    {stats.pendingReminders} reminder
                    {stats.pendingReminders !== 1 ? "s" : ""} scheduled to be
                    sent
                  </span>
                </div>
              )}

              {stats.sentToday > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">
                    {stats.sentToday} reminder{stats.sentToday !== 1 ? "s" : ""}{" "}
                    sent today
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Recommendations */}
          {stats.totalOverdue > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Review overdue students and send personalized reminders
                </li>
                <li>
                  • Contact students with critical overdue amounts directly
                </li>
                <li>
                  • Schedule follow-up reminders for non-responsive students
                </li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
