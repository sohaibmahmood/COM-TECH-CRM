import { DashboardHeader } from "@/components/dashboard-header"
import { ImportExportTabs } from "@/components/import-export-tabs"
import { createClient } from "@/lib/supabase/server"

async function getImportExportData() {
  const supabase = await createClient()

  // Get students count
  const { count: studentsCount } = await supabase.from("students").select("*", { count: "exact", head: true })

  // Get receipts count
  const { count: receiptsCount } = await supabase.from("fee_receipts").select("*", { count: "exact", head: true })

  // Get classes for reference
  const { data: classes } = await supabase.from("classes").select("*").order("class_name")

  return {
    studentsCount: studentsCount || 0,
    receiptsCount: receiptsCount || 0,
    classes: classes || [],
  }
}

export default async function ImportExportPage() {
  const { studentsCount, receiptsCount, classes } = await getImportExportData()

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Import / Export"
        description="Bulk import student data or export records for backup and analysis"
      />

      <div className="px-6">
        <ImportExportTabs studentsCount={studentsCount} receiptsCount={receiptsCount} classes={classes} />
      </div>
    </div>
  )
}
