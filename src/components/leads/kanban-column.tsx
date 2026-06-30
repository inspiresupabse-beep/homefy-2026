"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { SortableLeadCard } from "@/components/leads/sortable-lead-card";
import type { Lead, LeadStatus, Profile } from "@/lib/types/database";

interface KanbanColumnProps {
  status: { value: LeadStatus; label: string; color: string };
  leads: Lead[];
  agents: Profile[];
  orderByLeadId: Map<string, string>;
  onAssign: (leadId: string, agentId: string | null) => void;
  onOpenLead: (lead: Lead) => void;
}

export function KanbanColumn({ status, leads, agents, orderByLeadId, onAssign, onOpenLead }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status.value });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[360px] flex-col rounded-xl border bg-stone-50/80 transition-colors sm:min-h-[480px]",
        isOver ? "border-amber-400 bg-amber-50/50" : "border-stone-200"
      )}
    >
      <div className="flex items-center justify-between border-b border-stone-200 px-3 py-2.5 sm:px-4 sm:py-3">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium sm:text-xs", status.color)}>
          {status.label}
        </span>
        <span className="text-xs font-medium text-stone-400">{leads.length}</span>
      </div>
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {leads.map((lead) => (
            <SortableLeadCard
              key={lead.id}
              lead={lead}
              agents={agents}
              orderId={orderByLeadId.get(lead.id)}
              onAssign={onAssign}
              onOpen={onOpenLead}
            />
          ))}
          {leads.length === 0 && (
            <p className="py-8 text-center text-xs text-stone-400">Drop leads here</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
