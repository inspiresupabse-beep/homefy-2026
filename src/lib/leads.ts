import type {
  InteractionType,
  Lead,
  VisitStatus,
} from "@/lib/types/database";

/** Site or Shop visits require completed status before conversion */
export function canConvertLeadToOrder(lead: Lead): boolean {
  if (lead.status === "converted") return false;

  if (lead.interaction_type === "site" || lead.interaction_type === "shop") {
    return lead.visit_status === "completed";
  }

  return true;
}

export function getConvertBlockedReason(lead: Lead): string | null {
  if (lead.status === "converted") return "This lead is already converted.";

  if (
    (lead.interaction_type === "site" || lead.interaction_type === "shop") &&
    lead.visit_status !== "completed"
  ) {
    return "Complete the site or shop visit before converting to an order.";
  }

  return null;
}

export function requiresVisitCompletion(interaction: InteractionType): boolean {
  return interaction === "site" || interaction === "shop";
}

export function defaultVisitStatusForInteraction(
  interaction: InteractionType
): VisitStatus {
  return requiresVisitCompletion(interaction) ? "pending" : "not_applicable";
}

export function getInteractionIcon(interaction: InteractionType): string {
  switch (interaction) {
    case "site":
      return "🏠";
    case "shop":
      return "🛒";
    case "phone":
      return "📞";
    case "online":
      return "💻";
    default:
      return "📋";
  }
}
