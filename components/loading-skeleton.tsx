"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Enhanced loading animation with gradient shimmer
const shimmerClass =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className={`h-4 bg-muted rounded ${shimmerClass}`}></div>
          </CardHeader>
          <CardContent>
            <div className={`h-8 bg-muted rounded mb-2 ${shimmerClass}`}></div>
            <div className={`h-3 bg-muted rounded w-3/4 ${shimmerClass}`}></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        {/* Inner ring */}
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin animate-reverse"></div>
        {/* Center dot */}
        <div className="absolute top-6 left-6 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export function FullScreenLoader({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <PageLoader />
        <p className="text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse"
        >
          <div
            className={`h-10 w-10 bg-muted rounded-full ${shimmerClass}`}
          ></div>
          <div className="flex-1 space-y-2">
            <div className={`h-4 bg-muted rounded ${shimmerClass}`}></div>
            <div className={`h-3 bg-muted rounded w-3/4 ${shimmerClass}`}></div>
          </div>
          <div className={`h-8 w-20 bg-muted rounded ${shimmerClass}`}></div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className={`h-8 bg-muted rounded w-1/3 ${shimmerClass}`}></div>
        <div className={`h-4 bg-muted rounded w-1/2 ${shimmerClass}`}></div>
      </div>

      {/* Metrics skeleton */}
      <MetricsSkeleton />

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

export function ButtonSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-10 bg-muted rounded-md animate-pulse ${shimmerClass} ${className}`}
    ></div>
  );
}

export function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-muted rounded-full animate-pulse ${shimmerClass}`}
    ></div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className={`h-6 bg-muted rounded ${shimmerClass}`}></div>
        <div className={`h-4 bg-muted rounded w-2/3 ${shimmerClass}`}></div>
      </CardHeader>
      <CardContent>
        <div className={`h-64 bg-muted rounded ${shimmerClass}`}></div>
      </CardContent>
    </Card>
  );
}
