"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LeadCard } from "@/components/leads/lead-card";
import type { Lead, Profile } from "@/lib/types/database";

interface SortableLeadCardProps {
  lead: Lead;
  agents: Profile[];
  orderId?: string | null;
  onAssign: (leadId: string, agentId: string | null) => void;
  onOpen: (lead: Lead) => void;
}

export function SortableLeadCard({ lead, agents, orderId, onAssign, onOpen }: SortableLeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} agents={agents} orderId={orderId} onAssign={onAssign} onOpen={onOpen} />
    </div>
  );
}
