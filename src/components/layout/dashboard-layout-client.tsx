import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { Profile } from "@/lib/types/database";

export function DashboardLayoutClient({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
