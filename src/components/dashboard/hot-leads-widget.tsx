import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TemperatureBadge } from "@/components/leads/lead-metrics";
import { getLeadStatusLabel, type Lead } from "@/lib/types/database";
import { Flame } from "lucide-react";

async function getHotLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id, customer_name, phone, status, temperature, conversion_probability, created_at")
    .eq("temperature", "hot")
    .neq("status", "converted")
    .order("conversion_probability", { ascending: false })
    .limit(8);

  return (data as Lead[]) ?? [];
}

export async function HotLeadsWidget() {
  const hotLeads = await getHotLeads();

  return (
    <Card className="border-red-100 bg-gradient-to-b from-red-50/80 to-white lg:sticky lg:top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
            <Flame className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-900">Priority — Hot Leads</h2>
            <p className="text-xs text-stone-500">{hotLeads.length} active hot lead(s)</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {hotLeads.length === 0 ? (
          <p className="py-6 text-center text-sm text-stone-400">
            No hot leads right now. Mark leads as Hot on the Kanban board.
          </p>
        ) : (
          hotLeads.map((lead) => (
            <Link
              key={lead.id}
              href="/leads"
              className="block rounded-lg border border-red-100 bg-white p-3 transition-colors hover:border-red-200 hover:bg-red-50/30"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-medium text-stone-900">{lead.customer_name}</p>
                <TemperatureBadge temperature="hot" />
              </div>
              <p className="mt-1 text-xs text-stone-500">{lead.phone}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-stone-400">{getLeadStatusLabel(lead.status)}</span>
                <span className="font-semibold text-red-700">
                  {lead.conversion_probability ?? 0}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${lead.conversion_probability ?? 0}%` }}
                />
              </div>
            </Link>
          ))
        )}
        <Link
          href="/leads"
          className="block pt-2 text-center text-sm font-medium text-amber-700 hover:underline"
        >
          View all leads →
        </Link>
      </CardContent>
    </Card>
  );
}
