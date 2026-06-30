import { createClient } from "@/lib/supabase/server";
import { STAFF_ROLES } from "@/lib/roles";
import { formatStaffPower, getStaffPower } from "@/lib/permissions";
import type { StaffPerformanceRow } from "@/lib/types/database";

export async function getStaffPerformanceData(): Promise<StaffPerformanceRow[]> {
  const supabase = await createClient();

  const [{ data: leads }, { data: profiles }, { data: orders }] = await Promise.all([
    supabase.from("leads").select("id, assigned_staff, assigned_to, interaction_type, visit_status, status"),
    supabase.from("profiles").select("id, full_name, role, staff_power").in("role", STAFF_ROLES),
    supabase.from("orders").select("id, assigned_staff, total, status"),
  ]);

  const staffList = profiles ?? [];

  return staffList.map((staff) => {
    const staffLeads = (leads ?? []).filter(
      (l) => l.assigned_staff === staff.id || l.assigned_to === staff.id
    );

    let siteVisits = 0;
    let shopVisits = 0;
    let conversions = 0;
    let activeLeads = 0;

    for (const lead of staffLeads) {
      if (lead.status !== "converted") activeLeads += 1;
      if (lead.status === "converted") conversions += 1;
      if (lead.visit_status === "completed") {
        if (lead.interaction_type === "site") siteVisits += 1;
        if (lead.interaction_type === "shop") shopVisits += 1;
      }
    }

    const staffOrders = (orders ?? []).filter((o) => o.assigned_staff === staff.id);
    const totalSales = staffOrders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + Number(o.total), 0);

    const totalVisits = siteVisits + shopVisits;
    const power = getStaffPower(staff);

    return {
      staffId: staff.id,
      staffName: staff.full_name,
      role: staff.role,
      staffPower: power,
      staffPowerLabel: formatStaffPower(power),
      siteVisits,
      shopVisits,
      totalVisits,
      conversions,
      activeLeads,
      totalOrders: staffOrders.length,
      totalSales,
      efficiency: totalVisits > 0 ? Math.round((conversions / totalVisits) * 100) : 0,
    };
  }).sort((a, b) => b.conversions - a.conversions || b.totalVisits - a.totalVisits);
}
