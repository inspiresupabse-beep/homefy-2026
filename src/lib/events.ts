export const OPEN_LEAD_EVENT = "homefy:open-lead";

export function dispatchOpenLead(leadId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_EVENT, { detail: { leadId } }));
}
