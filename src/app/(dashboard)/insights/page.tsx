import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminStaffPerformancePanel } from "@/components/dashboard/admin-staff-performance";
import { PageHeader } from "@/components/layout/page-header";
import { getStaffPerformanceData } from "@/lib/insights/staff-performance";

export default async function InsightsPage() {
  await requireAdmin();
  const rows = await getStaffPerformanceData();

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Insights"
        description="Detailed staff performance breakdown"
      />
      <AdminStaffPerformancePanel
        rows={rows}
        title="Conversion Insights"
        description="Site & shop visits vs conversions by assigned staff"
      />
    </div>
  );
}
