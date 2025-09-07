import { DashboardSkeleton } from "@/components/loading-skeleton"

export default function StudentsLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
      </div>
      <DashboardSkeleton />
    </div>
  )
}
