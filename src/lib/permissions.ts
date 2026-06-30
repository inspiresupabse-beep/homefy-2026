import type { Profile, StaffPower, UserRole } from "@/lib/types/database";

export const STAFF_POWER_OPTIONS: {
  value: StaffPower;
  label: string;
  description: string;
}[] = [
  {
    value: "full_access",
    label: "Full Access",
    description: "Leads, orders, convert, and logistics",
  },
  {
    value: "leads_and_orders",
    label: "Sales Power",
    description: "Manage leads and orders",
  },
  {
    value: "leads_only",
    label: "Leads Only",
    description: "Pipeline and site visits only",
  },
  {
    value: "orders_only",
    label: "Orders Only",
    description: "Orders and logistics only",
  },
  {
    value: "view_only",
    label: "View Only",
    description: "Read-only — no edits",
  },
];

export function getStaffPower(profile: Pick<Profile, "role" | "staff_power">): StaffPower {
  if (profile.role === "admin") return "full_access";
  return profile.staff_power ?? "leads_and_orders";
}

export function formatStaffPower(power: StaffPower): string {
  return STAFF_POWER_OPTIONS.find((p) => p.value === power)?.label ?? power;
}

export function canAccessLeads(profile: Pick<Profile, "role" | "staff_power">): boolean {
  const power = getStaffPower(profile);
  return power !== "orders_only";
}

export function canAccessOrders(profile: Pick<Profile, "role" | "staff_power">): boolean {
  const power = getStaffPower(profile);
  return ["full_access", "leads_and_orders", "orders_only", "view_only"].includes(power);
}

export function canEditData(profile: Pick<Profile, "role" | "staff_power">): boolean {
  if (profile.role === "admin") return true;
  return getStaffPower(profile) !== "view_only";
}

export function canManageUsers(role: UserRole): boolean {
  return role === "admin";
}
