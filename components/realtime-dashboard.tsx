"use client"

import { useRealtimeData } from "@/hooks/use-realtime-data"
import { AnalyticsMetrics } from "@/components/analytics-metrics"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { DashboardSkeleton, FullScreenLoader } from "@/components/loading-skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function RealtimeDashboard() {
  const { students, receipts, classes, metrics, loading, error, refreshData } = useRealtimeData()

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard data: {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Real-time Metrics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Real-time insights and analytics for Comtech Academy
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={refreshData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Metrics Cards */}
      <AnalyticsMetrics students={students} receipts={receipts} classes={classes} />

      {/* Charts */}
      <AnalyticsCharts students={students} receipts={receipts} classes={classes} />

      {/* Real-time Status Indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live data - Updates automatically
        </div>
      </div>
    </div>
  )
}

// Enhanced metrics display with real-time indicators
export function RealtimeMetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  trend = "neutral"
}: {
  title: string
  value: string | number
  change?: string
  icon: any
  trend?: "up" | "down" | "neutral"
}) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600", 
    neutral: "text-muted-foreground"
  }

  return (
    <div className="bg-card rounded-lg border p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-xs ${trendColors[trend]} flex items-center gap-1`}>
                {trend === "up" && "↗"}
                {trend === "down" && "↘"}
                {change}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        {/* Real-time indicator */}
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
